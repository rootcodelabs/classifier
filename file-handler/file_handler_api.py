from fastapi import FastAPI, File, UploadFile, HTTPException, Form, Request, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
import os
import json
import uuid
import requests
from pydantic import BaseModel
from file_converter import FileConverter
from constants import (
    UPLOAD_FAILED, UPLOAD_SUCCESS, EXPORT_TYPE_ERROR, IMPORT_TYPE_ERROR,
    S3_UPLOAD_FAILED, S3_DOWNLOAD_FAILED, JSON_EXT, YAML_EXT, YML_EXT, XLSX_EXT
)
from s3_ferry import S3Ferry

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "http://localhost:3002"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


UPLOAD_DIRECTORY = os.getenv("UPLOAD_DIRECTORY", "/shared")
RUUTER_PRIVATE_URL = os.getenv("RUUTER_PRIVATE_URL")
S3_FERRY_URL = os.getenv("S3_FERRY_URL")
s3_ferry = S3Ferry(S3_FERRY_URL)

class ExportFile(BaseModel):
    dgId: int
    exportType: str

if not os.path.exists(UPLOAD_DIRECTORY):
    os.makedirs(UPLOAD_DIRECTORY)

def get_ruuter_private_url():
    return os.getenv("RUUTER_PRIVATE_URL")

async def authenticate_user(request: Request):
    cookie = request.cookies.get("customJwtCookie")
    if not cookie:
        raise HTTPException(status_code=401, detail="No cookie found in the request")

    url = f"{RUUTER_PRIVATE_URL}/auth/jwt/userinfo"
    headers = {
        'cookie': f'customJwtCookie={cookie}'
    }

    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail="Authentication failed")

@app.post("/datasetgroup/data/import")
async def upload_and_copy(request: Request, dgId: int = Form(...), dataFile: UploadFile = File(...)):
    try:
        await authenticate_user(request)

        print(f"Received dgId: {dgId}")
        print(f"Received filename: {dataFile.filename}")

        fileConverter = FileConverter()
        fileType = fileConverter._detect_file_type(dataFile.filename)
        fileName = f"{uuid.uuid4()}.{fileType}"
        fileLocation = os.path.join(UPLOAD_DIRECTORY, fileName)
        
        with open(fileLocation, "wb") as f:
            f.write(dataFile.file.read())

        success, convertedData = fileConverter.convert_to_json(fileLocation)
        if not success:
            uploadFailed = UPLOAD_FAILED.copy()
            uploadFailed["reason"] = "Json file convert failed."
            raise HTTPException(status_code=500, detail=uploadFailed)
        
        jsonLocalFilePath = fileLocation.replace(YAML_EXT, JSON_EXT).replace(YML_EXT, JSON_EXT).replace(XLSX_EXT, JSON_EXT)
        with open(jsonLocalFilePath, 'w') as jsonFile:
            json.dump(convertedData, jsonFile, indent=4)

        saveLocation = f"/dataset/{dgId}/primary_dataset/dataset_{dgId}_aggregated{JSON_EXT}"
        sourceFilePath = fileName.replace(YML_EXT, JSON_EXT).replace(XLSX_EXT, JSON_EXT)
        
        response = s3_ferry.transfer_file(saveLocation, "S3", sourceFilePath, "FS")
        if response.status_code == 201:
            os.remove(fileLocation)
            if fileLocation != jsonLocalFilePath:
                os.remove(jsonLocalFilePath)
            uploadSuccess = UPLOAD_SUCCESS.copy()
            uploadSuccess["saved_file_path"] = saveLocation
            return JSONResponse(status_code=200, content=uploadSuccess)
        else:
            raise HTTPException(status_code=500, detail=S3_UPLOAD_FAILED)
    except Exception as e:
        print(f"Exception in data/import : {e}")
        raise HTTPException(status_code=500, detail=str(e)) 

@app.post("/datasetgroup/data/download")
async def download_and_convert(request: Request, exportData: ExportFile, backgroundTasks: BackgroundTasks):
    await authenticate_user(request)
    dgId = exportData.dgId
    exportType = exportData.exportType

    if exportType not in ["xlsx", "yaml", "json"]:
        raise HTTPException(status_code=500, detail=EXPORT_TYPE_ERROR)

    saveLocation = f"/dataset/{dgId}/primary_dataset/dataset_{dgId}_aggregated{JSON_EXT}"
    localFileName = f"group_{dgId}_aggregated"

    response = s3_ferry.transfer_file(f"{localFileName}{JSON_EXT}", "FS", saveLocation, "S3")
    if response.status_code != 201:
        raise HTTPException(status_code=500, detail=S3_DOWNLOAD_FAILED)

    jsonFilePath = os.path.join('..', 'shared', f"{localFileName}{JSON_EXT}")

    fileConverter = FileConverter()
    with open(f"{jsonFilePath}", 'r') as jsonFile:
        jsonData = json.load(jsonFile)
    
    if exportType == "xlsx":
        outputFile = f"{localFileName}{XLSX_EXT}"
        fileConverter.convert_json_to_xlsx(jsonData, outputFile)
    elif exportType == "yaml":
        outputFile = f"{localFileName}{YAML_EXT}"
        fileConverter.convert_json_to_yaml(jsonData, outputFile)
    elif exportType == "json":
        outputFile = f"{jsonFilePath}"
    else:
        raise HTTPException(status_code=500, detail=EXPORT_TYPE_ERROR)

    backgroundTasks.add_task(os.remove, jsonFilePath)
    if outputFile != jsonFilePath:
        backgroundTasks.add_task(os.remove, outputFile)

    return FileResponse(outputFile, filename=os.path.basename(outputFile))

@app.get("/datasetgroup/data/download/chunk")
async def download_and_convert(request: Request, dgId: int, pageId: int, backgroundTasks: BackgroundTasks):
    await authenticate_user(request)
    saveLocation = f"/dataset/{dgId}/chunks/{pageId}{JSON_EXT}"
    localFileName = f"group_{dgId}_chunk_{pageId}"

    response = s3_ferry.transfer_file(f"{localFileName}{JSON_EXT}", "FS", saveLocation, "S3")
    if response.status_code != 201:
        raise HTTPException(status_code=500, detail=S3_DOWNLOAD_FAILED)

    jsonFilePath = os.path.join('..', 'shared', f"{localFileName}{JSON_EXT}")

    with open(f"{jsonFilePath}", 'r') as jsonFile:
        jsonData = json.load(jsonFile)

    for index, item in enumerate(jsonData, start=1):
        item['rowID'] = index

    backgroundTasks.add_task(os.remove, jsonFilePath)

    return jsonData
