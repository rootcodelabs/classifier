from typing import List, Dict

class Inference:   
    def __init__(self) -> None:
        pass
    
    def predict(text:str):
        pass
    
    def user_corrected_probabilities(text:str, corrected_labels:List[str]):
        pass
    

class TestInferenceWrapper:
    def __init__(self) -> None:
        self.model_dictionary: Dict[int, Inference] = {}

    def model_initiate(self, model_id: int, model_path: str, best_performing_model: str, class_hierarchy: list) -> bool:
        try:
            new_model = Inference(model_path, best_performing_model, class_hierarchy)
            self.model_dictionary[model_id] = new_model
            return True
        except Exception as e:
            raise Exception(f"Failed to instantiate the Inference Pipeline. Reason: {e}")

    def inference(self, text: str, model_id: int):
        try:
            if model_id in self.model_dictionary:
                predicted_labels = None
                probabilities = None
                model = self.model_dictionary[model_id]
                predicted_labels, probabilities = model.predict(text)
                return predicted_labels, probabilities
            else:
                raise Exception(f"Model with ID {model_id} not found")
        except Exception as e:
            raise Exception(f"Failed to call the inference. Reason: {e}")
    
    def stop_model(self, model_id: int) -> None:
        if model_id in self.models:
            del self.models[model_id]
