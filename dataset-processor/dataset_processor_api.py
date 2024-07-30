from fastapi import FastAPI, HTTPException, Request, Response, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi.responses import JSONResponse
from dataset_processor import DatasetProcessor
import requests
import os

app = FastAPI()
processor = DatasetProcessor()
RUUTER_PRIVATE_URL = os.getenv("RUUTER_PRIVATE_URL")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ProcessHandlerRequest(BaseModel):
    dgID: int
    cookie: str
    updateType: str
    savedFilePath: str
    patchPayload: dict

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
async def process_handler_endpoint(request: Request):
    print("in init dataset")
    payload = await request.json()
    print(payload)
    await authenticate_user(request)

    authCookie = payload["cookie"]
    result = processor.process_handler(int(payload["dgID"]), authCookie, payload["updateType"], payload["savedFilePath"], payload["patchPayload"])
    if result:
        return result
    else:
        raise HTTPException(status_code=500, detail="An unknown error occurred")

@app.post("/datasetgroup/update/validation/status")
async def forward_request(request: Request, response: Response):
    try:
        payload = await request.json()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid JSON payload: {str(e)}")
    

    headers = {
            'cookie': payload["cookie"],
            'Content-Type': 'application/json'
        }

    print(payload)
    payload2 = {}
    payload2["dgId"] = int(payload["dgId"])
    payload2["updateType"] = payload["updateType"]
    payload2["patchPayload"] = payload["patchPayload"]
    payload2["savedFilePath"] = payload["savedFilePath"]
    payload2["validationStatus"] = "success"
    payload2["validationErrors"] = []

    cookie = payload["cookie"]

    forward_url = "http://ruuter-private:8088/classifier/datasetgroup/update/validation/status"

    try:
        print("8")
        forward_response = requests.post(forward_url, json=payload2, headers=headers)
        print(headers)
        print("9")
        forward_response.raise_for_status()
        print("10")
        return JSONResponse(content=forward_response.json(), status_code=forward_response.status_code)
    except requests.HTTPError as e:
        print("11")
        print(e)
        raise HTTPException(status_code=e.response.status_code, detail=e.response.text)
    except Exception as e:
        print("12")
        print(e)
        raise HTTPException(status_code=500, detail=str(e))