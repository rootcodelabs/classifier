import requests
import os

GET_OUTLOOK_ACCESS_TOKEN_URL=os.getenv("GET_OUTLOOK_ACCESS_TOKEN_URL")

class TestModelInference:
    def __init__(self):
        pass
    
    def get_class_hierarchy_by_model_id(self, model_id):
        try:
            get_outlook_access_token_url = GET_OUTLOOK_ACCESS_TOKEN_URL
            response = requests.post(get_outlook_access_token_url, json={"modelId": model_id})
            response.raise_for_status()
            data = response.json()

            class_hierarchy = data["class_hierarchy"]
            return class_hierarchy
        except requests.exceptions.RequestException as e:
            raise Exception(f"Failed to retrieve the class hierarchy Reason: {e}")    
        


        
