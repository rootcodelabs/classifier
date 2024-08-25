import os
from loguru import logger
from model_trainer import ModelTrainer
from constants import TRAINING_LOGS_PATH

logger.add(sink=TRAINING_LOGS_PATH)

cookie = os.environ.get('cookie')
new_model_id = os.environ.get('newModelId')
old_model_id = os.environ.get('modelId')

logger.info(f"COOKIE - {cookie}")
logger.info(f"OLD MODEL ID {old_model_id}")
logger.info(f"NEW MODEL ID - {new_model_id}")

logger.info(f"ENTERING MODEL TRAINER SCRIPT FOR MODEL ID  - {old_model_id}")



trainer = ModelTrainer(cookie=cookie,new_model_id=new_model_id,old_model_id=old_model_id)
trainer.train()

logger.info("TRAINING SCRIPT COMPLETED")

