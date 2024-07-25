from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
from dataset_processor import DatasetProcessor
import requests
import os

app = FastAPI()
processor = DatasetProcessor()
RUUTER_PRIVATE_URL = os.getenv("RUUTER_PRIVATE_URL")

class ProcessHandlerRequest(BaseModel):
    dgID: int
    cookie: str
    updateType: str
    savedFilePath: str
    patchPayload: list

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

@app.post("/init-dataset-process")
async def process_handler_endpoint(process_request: ProcessHandlerRequest):
    await authenticate_user(process_request)
    authCookie = process_request.cookies.get("customJwtCookie")
    result = processor.process_handler(process_request.dgID, authCookie, process_request.updateType, process_request.savedFilePath, process_request.patchPayload)
    if result:
        return result
    else:
        raise HTTPException(status_code=500, detail="An unknown error occurred")
