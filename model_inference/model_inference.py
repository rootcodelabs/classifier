import requests
import os

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
            response.raise_for_status()
            data = response.json()

            class_hierarchy = data["class_hierarchy"]
            return class_hierarchy
        except requests.exceptions.RequestException as e:
            raise Exception(f"Failed to retrieve the class hierarchy Reason: {e}")    
    

        
    def validate_class_hierarchy(self, class_hierarchy, model_id):
        try:
            validate_class_hierarchy_url = CLASS_HIERARCHY_VALIDATION_URL
            response = requests.post(validate_class_hierarchy_url,  json={"class_hierarchy": class_hierarchy, "modelId": model_id})
            response.raise_for_status()
            data = response.json()

            is_valid = data["isValid"]
            return is_valid
        except requests.exceptions.RequestException as e:
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
        try:
            check_inference_data_exists_url = GET_INFERENCE_DATASET_EXIST_URL.replace("inferenceInputId",str(input_id))
            response = requests.get(check_inference_data_exists_url)
            response.raise_for_status()
            data = response.json()

            is_exist = data["exist"]
            return is_exist
        except requests.exceptions.RequestException as e:
            raise Exception(f"Failed to validate the class hierarchy. Reason: {e}")
        

    def build_corrected_folder_hierarchy(self, final_folder_id, model_id):
        try:
            build_corrected_folder_hierarchy_url = BUILD_CORRECTED_FOLDER_HIERARCHY_URL
            response = requests.get(build_corrected_folder_hierarchy_url, json={"folderId": final_folder_id, "modelId": model_id})
            response.raise_for_status()
            data = response.json()

            folder_hierarchy = data["folder_hierarchy"]
            return folder_hierarchy
        except requests.exceptions.RequestException as e:
            raise Exception(f"Failed to validate the class hierarchy. Reason: {e}")  
        
        
    def find_final_folder_id(self, flattened_folder_hierarchy, model_id):
        try:
            find_final_folder_id_url = FIND_FINAL_FOLDER_ID_URL
            response = requests.get(find_final_folder_id_url, json={"hierarchy":flattened_folder_hierarchy , "modelId": model_id})
            response.raise_for_status()
            data = response.json()

            final_folder_id = data["folder_id"]
            return final_folder_id
        except requests.exceptions.RequestException as e:
            raise Exception(f"Failed to validate the class hierarchy. Reason: {e}")  
        
        
    
    def update_inference(self, payload):
        try:
            update_inference_url = UPDATE_INFERENCE_URL
            response = requests.get(update_inference_url, json=payload)
            response.raise_for_status()
            data = response.json()

            is_success = data["operationSuccessful"]
            return is_success
        except requests.exceptions.RequestException as e:
            raise Exception(f"Failed to call update inference. Reason: {e}")  
        

    def create_inference(self, payload):
        
        try:
            create_inference_url = CREATE_INFERENCE_URL
            response = requests.get(create_inference_url, json=payload)
            response.raise_for_status()
            data = response.json()

            is_success = data["operationSuccessful"]
            return is_success
        except requests.exceptions.RequestException as e:
            raise Exception(f"Failed to call create inference. Reason: {e}")  
        
        


        
