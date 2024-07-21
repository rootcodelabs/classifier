from fastapi import FastAPI, File, UploadFile, HTTPException, Form, Request
from fastapi.responses import FileResponse, JSONResponse
import os
import requests
from file_converter import FileConverter
import json
from pydantic import BaseModel

app = FastAPI()

UPLOAD_DIRECTORY = os.getenv("UPLOAD_DIRECTORY", "/shared")
RUUTER_PRIVATE_URL = os.getenv("RUUTER_PRIVATE_URL")
S3_FERRY_URL = os.getenv("S3_FERRY_URL")

class ExportFile(BaseModel):
    dg_id: int
    version: str
    export_type: str

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
async def upload_and_copy(request: Request, dg_id: int = Form(...), data_file: UploadFile = File(...)):
    await authenticate_user(request)
    file_location = os.path.join(UPLOAD_DIRECTORY, data_file.filename)
    file_name = data_file.filename
    with open(file_location, "wb") as f:
        f.write(data_file.file.read())

    file_converter = FileConverter()
    success, converted_data = file_converter.convert_to_json(file_location)
    if not success:
        raise HTTPException(
            status_code=500,
            detail={
                "upload_status": 500,
                "operation_successful": False,
                "saved_file_path": None,
                "reason" : "Json file convert failed."
            }
        )
    
    json_local_file_path = file_location.replace('.yaml', '.json').replace('.yml', '.json').replace('.xlsx', ".json")
    with open(json_local_file_path, 'w') as json_file:
        json.dump(converted_data, json_file, indent=4)

    save_location = f"/dataset/{dg_id}/primary_dataset/dataset_{dg_id}_aggregated.json"
    source_file_path = file_name.replace('.yml', '.json').replace('.xlsx', ".json"),
    
    payload = {
        "destinationFilePath": save_location,
        "destinationStorageType": "S3",
        "sourceFilePath": source_file_path,
        "sourceStorageType": "FS"
    }

    response = requests.post(S3_FERRY_URL, json=payload)
    if response.status_code == 201:
        os.remove(file_location)
        if(file_location!=json_local_file_path):
            os.remove(json_local_file_path)
        response_data = {
            "upload_status": 200,
            "operation_successful": True,
            "saved_file_path": save_location
        }
        return JSONResponse(status_code=200, content=response_data)
    else:
        raise HTTPException(
            status_code=500,
            detail={
                "upload_status": 500,
                "operation_successful": False,
                "saved_file_path": None,
                "reason" : "Failed to upload to S3"
            }
        )


@app.post("/datasetgroup/data/download")
async def download_and_convert(request: Request, export_data: ExportFile):
    await authenticate_user(request)
    dg_id = export_data.dg_id
    version = export_data.version
    export_type = export_data.export_type

    if export_type not in ["xlsx", "yaml", "json"]:
        raise HTTPException(
            status_code=500,
            detail={
                "upload_status": 500,
                "operation_successful": False,
                "saved_file_path": None,
                "reason": "export_type should be either json, xlsx or yaml."
            }
        )

    if version == "minor":
        save_location = f"/dataset/{dg_id}/minor_update_temp/minor_update_.json"
        local_file_name = f"group_{dg_id}minor_update"

    elif version == "major":
        save_location = f"/dataset/{dg_id}/primary_dataset/dataset_{dg_id}_aggregated.json"
        local_file_name = f"group_{dg_id}_aggregated"
    else:
        raise HTTPException(
            status_code=500,
            detail={
                "upload_status": 500,
                "operation_successful": False,
                "saved_file_path": None,
                "reason": "import_type should be either minor or major."
            }
        )

    payload = {
        "destinationFilePath": f"{local_file_name}.json",
        "destinationStorageType": "FS",
        "sourceFilePath": save_location,
        "sourceStorageType": "S3"
    }

    response = requests.post(S3_FERRY_URL, json=payload)
    if response.status_code != 201:
        raise HTTPException(
            status_code=500,
            detail={
                "upload_status": 500,
                "operation_successful": False,
                "saved_file_path": None,
                "reason": "Failed to download from S3"
            }
        )

    shared_directory = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'shared')
    json_file_path = os.path.join(shared_directory, f"{local_file_name}.json")

    json_file_path = os.path.join('..', 'shared', f"{local_file_name}.json")

    file_converter = FileConverter()
    with open(f"{json_file_path}", 'r') as json_file:
        json_data = json.load(json_file)
    
    if export_type == "xlsx":
        output_file = f"{local_file_name}.xlsx"
        file_converter.convert_json_to_xlsx(json_data, output_file)
    elif export_type == "yaml":
        output_file = f"{local_file_name}.yaml"
        file_converter.convert_json_to_yaml(json_data, output_file)
    elif export_type == "json":
        output_file = f"{json_file_path}"
    else:
        raise HTTPException(
            status_code=500,
            detail={
                "upload_status": 500,
                "operation_successful": False,
                "saved_file_path": None,
                "reason": "export_type should be either json, xlsx or yaml."
            }
        )

    return FileResponse(output_file, filename=os.path.basename(output_file))