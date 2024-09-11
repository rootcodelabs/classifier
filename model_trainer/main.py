print("test1")
print("*********")
# import subprocess

# result = subprocess.run(['pip', 'list'], stdout=subprocess.PIPE, text=True)
# print(result.stdout)

import os
print("*********")
from loguru import logger
print("*********")
# from model_trainer import ModelTrainer
from constants import TRAINING_LOGS_PATH
print("*********")
import json
print("*********")

logger.add(sink=TRAINING_LOGS_PATH)
print("*********")
logger.info("* Started MAIN.PY")
print("*********")

# try:
#     cookie = str(os.environ.get('cookie'))
#     new_model_id = int(os.environ.get('newModelId'))
#     old_model_id = int(os.environ.get('modelId'))
#     update_type = str(os.environ.get('updateType'))
#     prev_deployment_env = str(os.environ.get('previousDeploymentEnv'))
#     progress_session_id = int(os.environ.get('progressSessionId'))
#     deployment_env = str(os.environ.get('deploymentEnv'))
#     model_details = json.loads(os.environ.get('modelDetails'))
# except Exception as e:
#     logger.info(f"Error in MAIN.PY : {e}")

# logger.info(f"COOKIE - {cookie}")
# logger.info(f"OLD MODEL ID {old_model_id}")
# logger.info(f"NEW MODEL ID - {new_model_id}")
# logger.info(f"UPDATE TYPE  - {update_type}")
# logger.info(f"PREVIOUSE DEPLOYMENT ENV - {prev_deployment_env}")
# logger.info(f"PROGRESS SESSION ID - {progress_session_id}")
# logger.info(f"MODEL DETAILS - {model_details}")
# logger.info(type(model_details))

# logger.info(f"ENTERING MODEL TRAINER SCRIPT FOR MODEL ID  - {old_model_id}")


# # trainer = ModelTrainer(cookie=cookie,new_model_id=new_model_id,
# #                        old_model_id=old_model_id, prev_deployment_env=prev_deployment_env,
# #                        update_type=update_type, progress_session_id=progress_session_id, 
# #                        current_deployment_platform=deployment_env, model_details=model_details)
# # trainer.train()

# logger.info("TRAINING SCRIPT COMPLETED")

