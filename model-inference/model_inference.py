import requests
import os
from loguru import logger
from constants import INFERENCE_LOGS_PATH
import urllib.parse

logger.add(sink=INFERENCE_LOGS_PATH)

GET_INFERENCE_DATASET_EXIST_URL = os.getenv("GET_INFERENCE_DATASET_EXIST_URL")
CREATE_INFERENCE_URL=os.getenv("CREATE_INFERENCE_URL")
UPDATE_INFERENCE_URL=os.getenv("UPDATE_INFERENCE_URL")
CLASS_HIERARCHY_VALIDATION_URL=os.getenv("CLASS_HIERARCHY_VALIDATION_URL")
OUTLOOK_ACCESS_TOKEN_API_URL=os.getenv("OUTLOOK_ACCESS_TOKEN_API_URL")
BUILD_CORRECTED_FOLDER_HIERARCHY_URL = os.getenv("BUILD_CORRECTED_FOLDER_HIERARCHY_URL")
FIND_FINAL_FOLDER_ID_URL = os.getenv("FIND_FINAL_FOLDER_ID_URL")

class ModelInference:
    def __init__(self):
        pass
    
    def get_class_hierarchy_by_model_id(self, model_id):
        
        try:
            outlook_access_token_url = OUTLOOK_ACCESS_TOKEN_API_URL


            response = requests.post(outlook_access_token_url, json={"modelId": model_id})
            data = response.json()

            logger.info(f"DATA OF get_class_hierarchy_by_model_id FUNCTION {data} ")

            class_hierarchy = data["response"]["class_hierarchy"]
            return class_hierarchy
        
        except Exception as e:
            logger.error(f"Failed to retrieve the class hierarchy Reason: {e}")
            raise RuntimeError(f"Failed to retrieve the class hierarchy Reason: {e}")    
    

        
    def validate_class_hierarchy(self, class_hierarchy, model_id):

        logger.info(f"CLASS HIERARCHY -  {class_hierarchy}")
        logger.info(f"MODEL ID - {model_id}")

        try:
            validate_class_hierarchy_url = CLASS_HIERARCHY_VALIDATION_URL

            logger.info(f"INCOMING URL - {validate_class_hierarchy_url}")
            
            response = requests.post(validate_class_hierarchy_url,  json={"classHierarchies": class_hierarchy, "modelId": model_id})
            data = response.json()
            
            logger.info(f"check_folder_hierarchy API CALL REPONSE  {data}")

            is_valid = data["isValid"]
            return is_valid
        
        except requests.exceptions.RequestException as e:
            
            logger.error(f"Failed to validate the class hierarchy. Reason: {e}")
            raise Exception(f"Failed to validate the class hierarchy. Reason: {e}")
        
        

    def get_class_hierarchy_and_validate(self, model_id):
        try:
            class_hierarchy = self.get_class_hierarchy_by_model_id(model_id)
            if class_hierarchy:
                is_valid = self.validate_class_hierarchy(class_hierarchy, model_id)
                return is_valid, class_hierarchy
            
            return False, None
                
        except requests.exceptions.RequestException as e:
            raise Exception(f"Failed to retrieve and validate the class hierarchy. Reason: {e}")
        
        
    
    def check_inference_data_exists(self, input_id):
        
        logger.info("Check Inference Data Exists Function Calling")
        logger.info(f"Input ID : {input_id}")
        try:

            check_inference_data_exists_url = GET_INFERENCE_DATASET_EXIST_URL
            logger.info(f"Check Inference URL : {check_inference_data_exists_url}")

            payload = {}
            payload["inputId"] = input_id
            response = requests.post(check_inference_data_exists_url,json=payload)
            data = response.json()
        
            logger.info(f"Response from  check_inference_data_exists: {data}")

            is_exist = data["response"]["exist"]
            return is_exist
        except Exception as e:
            logger.info(f"Failed to validate the class hierarchy. Reason: {e}")
            raise Exception(f"Failed to validate the class hierarchy. Reason: {e}")
        

    def build_corrected_folder_hierarchy(self, final_folder_id, model_id):
        try:
            build_corrected_folder_hierarchy_url = BUILD_CORRECTED_FOLDER_HIERARCHY_URL
            response = requests.post(build_corrected_folder_hierarchy_url, json={"folderId": final_folder_id, "modelId": model_id})
            
            logger.info(f"build_corrected_folder_hierarchy response status code {response.status_code}")

            response.raise_for_status()
            data = response.json()

            logger.info(f"build_corrected_folder_hierarchy response status code {data}")

            folder_hierarchy = data["folder_hierarchy"]

            logger.info(f"build_corrected_folder_hierarchy folder hierarchy - {data}")

            return folder_hierarchy
        except Exception as e:
            logger.info(f"EXCEPTION IN build_corrected_folder_hierarchy - {e}")
            raise RuntimeError(f"Failed to validate the class hierarchy. Reason: {e}")

        
    def find_final_folder_id(self, flattened_folder_hierarchy, model_id):
        try:
            find_final_folder_id_url = FIND_FINAL_FOLDER_ID_URL

            logger.info(f"FIND FINAL FOLDER ID URL - {find_final_folder_id_url}")
            logger.info(f"FLATTENED FOLDER HIERARCHY - {flattened_folder_hierarchy}")
            logger.info(f"MODEL ID - {model_id}")

            response = requests.post(find_final_folder_id_url, json={"hierarchy":flattened_folder_hierarchy , "modelId": model_id})
            data = response.json()

            logger.info(f"RETURNED DATA - {data}")
            logger.info(f"RETURNED STATUS - {response.status_code}")

            final_folder_id = data["folder_id"]
            return final_folder_id
        except Exception as e:

            logger.info(f"Failed to validate the class hierarchy. Reason: {e}")
            raise Exception(f"Failed to validate the class hierarchy. Reason: {e}")  
        
        
    
    def update_inference(self, payload):
        try:
            
            logger.info(f"PAYLOAD IN update_inference  - {payload}")

            update_inference_url = UPDATE_INFERENCE_URL
            response = requests.post(update_inference_url, json=payload)

            data = response.json()
            
            logger.info(f"DATA IN UPDATE INFERENCE - {data}")
            is_success = data["response"]["operationSuccessful"]
            return is_success

        except Exception as e:

            logger.info(f"Failed to call update inference. Reason: {e}")
            raise RuntimeError(f"Failed to call update inference. Reason: {e}")
        

    def create_inference(self, payload):
        
        try:

            logger.info(f"PAYLOAD - {payload}")
            create_inference_url = CREATE_INFERENCE_URL
            response = requests.post(create_inference_url, json=payload)

            data = response.json()

            logger.info(f"DATA IN create_inference - {data}")

            is_success = data["response"]["operationSuccessful"]
            return is_success
        
        except Exception as e:

            logger.info(f"Failed to call create inference. Reason: {e}")
            raise Exception(f"Failed to call create inference. Reason: {e}")


        
