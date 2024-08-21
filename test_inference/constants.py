from pydantic import BaseModel

class TestDeploymentRequest(BaseModel):
    replacementModelId:int
    bestBaseModel:str
    
class TestInferenceRequest(BaseModel):
    modelId:int
    text:str

class DeleteTestRequest(BaseModel):
    deleteModelId:int

S3_DOWNLOAD_FAILED = {
    "upload_status": 500,
    "operation_successful": False,
    "saved_file_path": None,
    "reason": "Failed to download from S3"
}

