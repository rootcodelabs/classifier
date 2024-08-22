from pydantic import BaseModel
from typing import List, Optional


INFERENCE_LOGS_PATH = "/app/inference_logs.log"

LABEL_ENCODERS_FOLDER = "label_encoders"

CLASSIFIER_LAYERS_FOLDER = "classifier_layers"

TRAINED_BASE_MODEL_LAYERS = "trained_base_model_layers"

MODEL_DETS_FILE = "models_dets.pkl"

DISTIL_BERT = "distil-bert"

ROBERTA = "roberta"

BERT = "bert"


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
    progressSessionId: int

class OutlookInferenceRequest(BaseModel):
    inputId:str
    inputText:str
    finalFolderId:str
    mailId:str

class JiraInferenceRequest(BaseModel):
    inputId:str
    inputText:str
    finalLabels:Optional[List[str]] = None