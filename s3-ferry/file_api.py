from fastapi import FastAPI, File, UploadFile, HTTPException, Form, Request
from fastapi.responses import FileResponse, JSONResponse
import os
import requests
from file_converter import FileConverter
import json
from pydantic import BaseModel
import uuid
from constants import UPLOAD_FAILED, UPLOAD_SUCCESS, EXPORT_TYPE_ERROR, IMPORT_TYPE_ERROR, S3_UPLOAD_FAILED, S3_DOWNLOAD_FAILED

app = FastAPI()

UPLOAD_DIRECTORY = os.getenv("UPLOAD_DIRECTORY", "/shared")
RUUTER_PRIVATE_URL = os.getenv("RUUTER_PRIVATE_URL")
S3_FERRY_URL = os.getenv("S3_FERRY_URL")

class ExportFile(BaseModel):
    dgId: int
    version: str
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
    await authenticate_user(request)
    fileName = f"{uuid.uuid4()}_{dataFile.filename}"
    fileLocation = os.path.join(UPLOAD_DIRECTORY, fileName)
    
    with open(fileLocation, "wb") as f:
        f.write(dataFile.file.read())

    fileConverter = FileConverter()
    success, convertedData = fileConverter.convert_to_json(fileLocation)
    if not success:
        upload_failed = UPLOAD_FAILED.copy()
        upload_failed["reason"] = "Json file convert failed."
        raise HTTPException(status_code=500, detail=upload_failed)
    
    jsonLocalFilePath = fileLocation.replace('.yaml', '.json').replace('.yml', '.json').replace('.xlsx', ".json")
    with open(jsonLocalFilePath, 'w') as jsonFile:
        json.dump(convertedData, jsonFile, indent=4)

    saveLocation = f"/dataset/{dgId}/primary_dataset/dataset_{dgId}_aggregated.json"
    sourceFilePath = fileName.replace('.yml', '.json').replace('.xlsx', ".json"),
    
    payload = {
        "destinationFilePath": saveLocation,
        "destinationStorageType": "S3",
        "sourceFilePath": sourceFilePath,
        "sourceStorageType": "FS"
    }

    response = requests.post(S3_FERRY_URL, json=payload)
    if response.status_code == 201:
        os.remove(fileLocation)
        if fileLocation != jsonLocalFilePath:
            os.remove(jsonLocalFilePath)
        upload_success = UPLOAD_SUCCESS.copy()
        upload_success["saved_file_path"] = saveLocation
        return JSONResponse(status_code=200, content=upload_success)
    else:
        raise HTTPException(status_code=500, detail=S3_UPLOAD_FAILED)


@app.post("/datasetgroup/data/download")
async def download_and_convert(request: Request, exportData: ExportFile):
    await authenticate_user(request)
    dgId = exportData.dgId
    version = exportData.version
    exportType = exportData.exportType

    if exportType not in ["xlsx", "yaml", "json"]:
        raise HTTPException(status_code=500, detail=EXPORT_TYPE_ERROR)

    if version == "minor":
        saveLocation = f"/dataset/{dgId}/minor_update_temp/minor_update_.json"
        localFileName = f"group_{dgId}minor_update"

    elif version == "major":
        saveLocation = f"/dataset/{dgId}/primary_dataset/dataset_{dgId}_aggregated.json"
        localFileName = f"group_{dgId}_aggregated"
    else:
        raise HTTPException(status_code=500, detail=IMPORT_TYPE_ERROR)

    payload = {
        "destinationFilePath": f"{localFileName}.json",
        "destinationStorageType": "FS",
        "sourceFilePath": saveLocation,
        "sourceStorageType": "S3"
    }

    response = requests.post(S3_FERRY_URL, json=payload)
    if response.status_code != 201:
        raise HTTPException(status_code=500, detail=S3_DOWNLOAD_FAILED)

    jsonFilePath = os.path.join('..', 'shared', f"{localFileName}.json")

    fileConverter = FileConverter()
    with open(f"{jsonFilePath}", 'r') as jsonFile:
        jsonData = json.load(jsonFile)
    
    if exportType == "xlsx":
        outputFile = f"{localFileName}.xlsx"
        fileConverter.convert_json_to_xlsx(jsonData, outputFile)
    elif exportType == "yaml":
        outputFile = f"{localFileName}.yaml"
        fileConverter.convert_json_to_yaml(jsonData, outputFile)
    elif exportType == "json":
        outputFile = f"{jsonFilePath}"
    else:
        raise HTTPException(status_code=500, detail=EXPORT_TYPE_ERROR)

    return FileResponse(outputFile, filename=os.path.basename(outputFile))
