from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from model_trainer import ModelTrainer
import json
import os
from typing import List, Optional
from loguru import logger
from pydantic import BaseModel
import requests
from constants import TRAINING_LOGS_PATH
print("INIT STARTED MAIN.PY")
logger.add(sink=TRAINING_LOGS_PATH)
logger.info("INIT STARTED MAIN.PY")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust as necessary
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("INIT STARTED model_trainer_api.py - Log recorded")

logger.info("PROCESS STARTED model_trainer_api.py")
print("PROCESS STARTED model_trainer_api.py - Log recorded")


class SessionPayload(BaseModel):
    cookie: str
    old_model_id: str
    new_model_id: str
    update_type: str
    prev_deployment_env: Optional[str] = None
    progress_session_id: int
    deployment_env: str
    model_details: str

Training = False


@app.post("/model_trainer/")
async def model_train(payload: SessionPayload):
    try:
        print("I'm inside model_trainer")
        print("payload: ", payload)
        cookie = payload.cookie
        newModelId = payload.new_model_id
        oldModelId = payload.old_model_id
        prev_deployment_env = payload.prev_deployment_env
        update_type = payload.update_type
        progress_session_id = payload.progress_session_id
        model_details = payload.model_details
        model_details = json.loads(model_details)
        current_deployment_platform = payload.deployment_env
        trainer = ModelTrainer(cookie, newModelId, oldModelId, prev_deployment_env,update_type,progress_session_id, model_details, current_deployment_platform)
        Training = True
        trainer.train()
        Training = False
        response = requests.post("http://request-handler:8901/get_session")
        print(response)
        logger.info("TRAINING SCRIPT COMPLETED")
        print("TRAINING SCRIPT COMPLETED - Log recorded")

    except Exception as e:
        Training = False
        logger.info(f"Error in model_trainer_api.PY : {e}")
        print(f"Error in model_trainer_api.PY - Log recorded {e}")

@app.get("/model_checker/")
async def model_checker():
    print("I'm inside model_checker")
    print("Training: ", Training)
    return Training