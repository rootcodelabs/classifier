import zipfile
from typing import List
import os
import shutil

def calculate_average_predicted_class_probability(class_probabilities:List[float]):
    
    total_probability = sum(class_probabilities)
    average_probability = total_probability / len(class_probabilities)
    
    return average_probability 

def get_s3_payload(destinationFilePath:str, destinationStorageType:str, sourceFilePath:str, sourceStorageType:str):
    S3_FERRY_PAYLOAD = {
            "destinationFilePath": destinationFilePath,
            "destinationStorageType": destinationStorageType,
            "sourceFilePath": sourceFilePath,
            "sourceStorageType": sourceStorageType
        }
    return S3_FERRY_PAYLOAD

def get_inference_success_payload(predictedClasses:List[str], averageConfidence:float, predictedProbabilities:List[float] ):   
    INFERENCE_SUCCESS_PAYLOAD = {
    "predictedClasses":predictedClasses,
    "averageConfidence":averageConfidence,
    "predictedProbabilities": predictedProbabilities
}
    
    return INFERENCE_SUCCESS_PAYLOAD

def unzip_file(zip_path, extract_to):
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(extract_to)

def delete_folder(folder_path: str):
    try:
        if os.path.isdir(folder_path):
            shutil.rmtree(folder_path)
        else:
            raise FileNotFoundError(f"The path {folder_path} is not a directory.")
    except Exception as e:
        raise Exception(f"Failed to delete the folder {folder_path}. Reason: {e}")