from fastapi import FastAPI, File, UploadFile, HTTPException, Form, Request, BackgroundTasks
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

UPLOAD_DIRECTORY = os.getenv("UPLOAD_DIRECTORY", "/shared")
CHUNK_UPLOAD_DIRECTORY = os.getenv("CHUNK_UPLOAD_DIRECTORY", "/shared/chunks")
RUUTER_PRIVATE_URL = os.getenv("RUUTER_PRIVATE_URL")
S3_FERRY_URL = os.getenv("S3_FERRY_URL")
s3_ferry = S3Ferry(S3_FERRY_URL)

class ExportFile(BaseModel):
    dgId: int
    version: str
    exportType: str

class ImportChunks(BaseModel):
    dg_id: int
    chunks: list
    exsistingChunks: int

class ImportJsonMajor(BaseModel):
    dgId: int
    dataset: dict

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

    fileConverter = FileConverter()
    file_type = fileConverter._detect_file_type(dataFile.filename)
    fileName = f"{uuid.uuid4()}.{file_type}"
    fileLocation = os.path.join(UPLOAD_DIRECTORY, fileName)
    
    with open(fileLocation, "wb") as f:
        f.write(dataFile.file.read())

    success, convertedData = fileConverter.convert_to_json(fileLocation)
    if not success:
        upload_failed = UPLOAD_FAILED.copy()
        upload_failed["reason"] = "Json file convert failed."
        raise HTTPException(status_code=500, detail=upload_failed)
    
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
        upload_success = UPLOAD_SUCCESS.copy()
        upload_success["saved_file_path"] = saveLocation
        return JSONResponse(status_code=200, content=upload_success)
    else:
        raise HTTPException(status_code=500, detail=S3_UPLOAD_FAILED)

@app.post("/datasetgroup/data/download")
async def download_and_convert(request: Request, exportData: ExportFile, background_tasks: BackgroundTasks):
    await authenticate_user(request)
    dgId = exportData.dgId
    version = exportData.version
    exportType = exportData.exportType

    if exportType not in ["xlsx", "yaml", "json"]:
        raise HTTPException(status_code=500, detail=EXPORT_TYPE_ERROR)

    if version == "minor":
        saveLocation = f"/dataset/{dgId}/minor_update_temp/minor_update_{JSON_EXT}"
        localFileName = f"group_{dgId}minor_update"
    elif version == "major":
        saveLocation = f"/dataset/{dgId}/primary_dataset/dataset_{dgId}_aggregated{JSON_EXT}"
        localFileName = f"group_{dgId}_aggregated"
    else:
        raise HTTPException(status_code=500, detail=IMPORT_TYPE_ERROR)

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

    background_tasks.add_task(os.remove, jsonFilePath)
    if outputFile != jsonFilePath:
        background_tasks.add_task(os.remove, outputFile)

    return FileResponse(outputFile, filename=os.path.basename(outputFile))

@app.get("/datasetgroup/data/download/json")
async def download_and_convert(request: Request, dgId: int, background_tasks: BackgroundTasks):
    await authenticate_user(request)

    saveLocation = f"/dataset/{dgId}/primary_dataset/dataset_{dgId}_aggregated{JSON_EXT}"
    localFileName = f"group_{dgId}_aggregated"

    response = s3_ferry.transfer_file(f"{localFileName}{JSON_EXT}", "FS", saveLocation, "S3")
    if response.status_code != 201:
        raise HTTPException(status_code=500, detail=S3_DOWNLOAD_FAILED)

    jsonFilePath = os.path.join('..', 'shared', f"{localFileName}{JSON_EXT}")

    with open(f"{jsonFilePath}", 'r') as jsonFile:
        jsonData = json.load(jsonFile)

    background_tasks.add_task(os.remove, jsonFilePath)

    return jsonData

@app.get("/datasetgroup/data/download/json/location")
async def download_and_convert(request: Request, saveLocation:str, background_tasks: BackgroundTasks):
    await authenticate_user(request)

    localFileName = saveLocation.split("/")["-1"]

    response = s3_ferry.transfer_file(f"{localFileName}", "FS", saveLocation, "S3")
    if response.status_code != 201:
        raise HTTPException(status_code=500, detail=S3_DOWNLOAD_FAILED)

    jsonFilePath = os.path.join('..', 'shared', f"{localFileName}")

    with open(f"{jsonFilePath}", 'r') as jsonFile:
        jsonData = json.load(jsonFile)

    background_tasks.add_task(os.remove, jsonFilePath)

    return jsonData

@app.post("/datasetgroup/data/import/chunk")
async def upload_and_copy(request: Request, import_chunks: ImportChunks):
    await authenticate_user(request)

    dgID = import_chunks.dg_id
    chunks = import_chunks.chunks
    exsisting_chunks = import_chunks.exsistingChunks
    
    for index, chunk in enumerate(chunks, start=1):
        fileLocation = os.path.join(CHUNK_UPLOAD_DIRECTORY, f"{exsisting_chunks+index}.json")
        with open(fileLocation, 'w') as jsonFile:
            json.dump(chunk, jsonFile, indent=4)

        saveLocation = f"/dataset/{dgID}/chunks/{exsisting_chunks+index}{JSON_EXT}"
    
        response = s3_ferry.transfer_file(saveLocation, "S3", fileLocation, "FS")
        if response.status_code == 201:
            os.remove(fileLocation)
        else:
            raise HTTPException(status_code=500, detail=S3_UPLOAD_FAILED)
    else:
        return True

@app.get("/datasetgroup/data/download/chunk")
async def download_and_convert(request: Request, dgId: int, pageId: int, background_tasks: BackgroundTasks):
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

    background_tasks.add_task(os.remove, jsonFilePath)

    return jsonData

@app.post("/datasetgroup/data/import/json")
async def upload_and_copy(request: Request, importData: ImportJsonMajor):
    await authenticate_user(request)

    fileName = f"{uuid.uuid4()}.{JSON_EXT}"
    fileLocation = os.path.join(UPLOAD_DIRECTORY, fileName)
    
    with open(fileLocation, 'w') as jsonFile:
        json.dump(importData.dataset, jsonFile, indent=4)

    saveLocation = f"/dataset/{importData.dgId}/primary_dataset/dataset_{importData.dgId}_aggregated{JSON_EXT}"
    sourceFilePath = fileName.replace(YML_EXT, JSON_EXT).replace(XLSX_EXT, JSON_EXT)
    
    response = s3_ferry.transfer_file(saveLocation, "S3", sourceFilePath, "FS")
    if response.status_code == 201:
        os.remove(fileLocation)
        upload_success = UPLOAD_SUCCESS.copy()
        upload_success["saved_file_path"] = saveLocation
        return JSONResponse(status_code=200, content=upload_success)
    else:
        raise HTTPException(status_code=500, detail=S3_UPLOAD_FAILED)