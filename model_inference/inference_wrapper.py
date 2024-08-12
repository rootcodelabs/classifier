class Inference:
    def __init__(self) -> None:
        pass
    
    def predict(text:str):
        pass

class InferenceWrapper:
    
    def __init__(self) -> None:
        self.active_jira_model = None
        self.active_outlook_model = None

    def model_swapping(self, model_path:str, best_performing_model:str, deployment_platform:str):
        try:

            if(deployment_platform == "jira"):
                temp_jira_model = Inference(model_path, best_performing_model)
                self.active_jira_model = temp_jira_model
                return True
            
            elif(deployment_platform == "outlook"):
                temp_outlook_model = Inference(model_path, best_performing_model)
                self.active_outlook_model = temp_outlook_model
                return True
                
        except Exception as e:
            raise Exception(f"Failed to instantiate the Inference Pipeline. Reason: {e}")

    def inference(self, text:str, deployment_platform:str):
        result = []
        if(deployment_platform == "jira" and self.active_jira_model):
            result = self.active_jira_model.predict(text)

        if(deployment_platform == "outlook" and self.active_outlook_model):
            result = self.active_outlook_model.predict(text)
            
        return result 
    
    def stop_model(self,deployment_platform:str):
        if(deployment_platform == "jira"):
            self.active_jira_model = None
        if(deployment_platform == "outlook"):
            self.active_outlook_model = None
    
    