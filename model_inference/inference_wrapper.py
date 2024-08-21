from typing import List
class Inference:
    def __init__(self) -> None:
        pass
    
    def predict(text:str):
        pass
    
    def user_corrected_probabilities(text:str, corrected_labels:List[str]):
        pass

class InferenceWrapper:
    
    def __init__(self) -> None:
        self.active_jira_model = None
        self.active_outlook_model = None
        self.active_jira_model_id = None
        self.active_outlook_model_id = None

    def model_swapping(self, model_path:str, best_performing_model:str, deployment_platform:str, class_hierarchy:list, model_id:int):
        try:

            if(deployment_platform == "jira"):
                temp_jira_model = Inference(model_path, best_performing_model, class_hierarchy)
                self.active_jira_model = temp_jira_model
                self.active_jira_model_id = model_id
                return True
            
            elif(deployment_platform == "outlook"):
                temp_outlook_model = Inference(model_path, best_performing_model, class_hierarchy)
                self.active_outlook_model = temp_outlook_model
                self.active_outlook_model_id = model_id
                return True
                
        except Exception as e:
            raise Exception(f"Failed to instantiate the Inference Pipeline. Reason: {e}")

    def inference(self, text:str, deployment_platform:str):
        try:
            predicted_labels = None
            probabilities = None
            if(deployment_platform == "jira" and self.active_jira_model):
                predicted_labels, probabilities = self.active_jira_model.predict(text)

            if(deployment_platform == "outlook" and self.active_outlook_model):
                predicted_labels, probabilities = self.active_outlook_model.predict(text)
                
            return predicted_labels, probabilities
        
        except Exception as e:
            raise Exception(f"Failed to call the inference. Reason: {e}") 
    
    def stop_model(self,deployment_platform:str):
        if(deployment_platform == "jira"):
            self.active_jira_model = None
            self.active_jira_model_id = None
        if(deployment_platform == "outlook"):
            self.active_outlook_model = None
            self.active_outlook_model_id = None
            
            
    def get_model_id(self, deployment_platform:str):
        model_id = None
        if(deployment_platform == "jira" and self.active_jira_model):
            model_id = self.active_jira_model_id

        if(deployment_platform == "outlook" and self.active_outlook_model):
            model_id = self.active_outlook_model_id
            
        return model_id
    
    
    def get_corrected_probabilities(self, text:str, corrected_labels:List[str] , deployment_platform:str):
        try:
            corrected_probabilities = None
            if(deployment_platform == "jira" and self.active_jira_model):
                corrected_probabilities = self.active_jira_model.user_corrected_probabilities(text, corrected_labels)

            if(deployment_platform == "outlook" and self.active_outlook_model):
                corrected_probabilities = self.active_outlook_model.user_corrected_probabilities(text, corrected_labels)
                
            return corrected_probabilities
        
        except Exception as e:
            raise Exception(f"Failed to retrieve corrected probabilities from the inference pipeline. Reason: {e}")     