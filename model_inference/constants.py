from pydantic import BaseModel
from typing import List, Optional

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
    inputId:str
    inputText:str
    finalFolderId:str
    mailId:str

class JiraInferenceRequest(BaseModel):
    inputId:str
    inputText:str
    finalLabels:Optional[List[str]] = None