import zipfile
import os
import shutil
from typing import List, Optional

def unzip_file(zip_path, extract_to):
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(extract_to)


def clear_folder_contents(folder_path: str):
    try:
        for filename in os.listdir(folder_path):
            file_path = os.path.join(folder_path, filename)
            if os.path.isfile(file_path) or os.path.islink(file_path):
                os.unlink(file_path)  
            elif os.path.isdir(file_path):
                shutil.rmtree(file_path)  
    except Exception as e:
        raise Exception(f"Failed to delete contents in {folder_path}. Reason: {e}")
    
def get_s3_payload(destinationFilePath:str, destinationStorageType:str, sourceFilePath:str, sourceStorageType:str):
    S3_FERRY_PAYLOAD = {
            "destinationFilePath": destinationFilePath,
            "destinationStorageType": destinationStorageType,
            "sourceFilePath": sourceFilePath,
            "sourceStorageType": sourceStorageType
        }
    return S3_FERRY_PAYLOAD

def get_inference_create_payload(inferenceInputId:str, inferenceText:str, predictedLabels:list, averagePredictedClassesProbability:int, platform:str, primaryFolderId: Optional[str] = None, mailId : Optional[str] = None ):   
    INFERENCE_CREATE_PAYLOAD = {       
        "inputId": inferenceInputId,
        "inferenceText": inferenceText,
        "predictedLabels": predictedLabels,
        "averagePredictedClassesProbability": averagePredictedClassesProbability,
        "platform": platform,
        "primaryFolderId": primaryFolderId,
        "mailId":mailId
    }
    
    return INFERENCE_CREATE_PAYLOAD


def get_inference_update_payload(inferenceInputId:str, isCorrected:bool, correctedLabels:list, averagePredictedClassesProbability:int, platform:str, primaryFolderId: Optional[str] = None ):   
    INFERENCE_UPDATE_PAYLOAD = {       
        "inferenceId": inferenceInputId,
        "isCorrected": isCorrected,
        "correctedLabels": correctedLabels,
        "averageCorrectedClassesProbability": averagePredictedClassesProbability,
        "primaryFolderId": primaryFolderId,
        "platform": platform 
    }
    
    return INFERENCE_UPDATE_PAYLOAD
   

def calculate_average_predicted_class_probability(class_probabilities):
    
    total_probability = sum(class_probabilities)
    average_probability = total_probability / len(class_probabilities)
    
    return average_probability        
    