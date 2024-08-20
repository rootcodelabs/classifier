from pydantic import BaseModel
from typing import List

S3_DOWNLOAD_FAILED = {
    "upload_status": 500,
    "operation_successful": False,
    "saved_file_path": None,
    "reason": "Failed to download from S3"
}

class UpdateRequest(BaseModel):
    modelId: int
    replaceDeployment:bool
    replaceDeploymentPlatform:str
    bestBaseModel:str

class OutlookInferenceRequest(BaseModel):
    inputId:int
    inputText:str
    finalFolderId:int
    mailId:str

class JiraInferenceRequest(BaseModel):
    inputId:int
    inputText:str
    finalLabels:List[str]