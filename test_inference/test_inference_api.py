from fastapi import FastAPI,HTTPException, Request, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from s3_ferry import S3Ferry
from utils import unzip_file, calculate_average_predicted_class_probability, get_inference_success_payload, delete_folder
from constants import S3_DOWNLOAD_FAILED, TestDeploymentRequest, TestInferenceRequest, DeleteTestRequest
from test_inference_wrapper import TestInferenceWrapper
from test_inference import TestModelInference

app = FastAPI()
testModelInference = TestModelInference()

app.add_middleware(
    CORSMiddleware,
    allow_origins = ["*"],
    allow_credentials = True,
    allow_methods = ["GET", "POST"],
    allow_headers = ["*"],
)

inference_obj = TestInferenceWrapper()

S3_FERRY_URL = os.getenv("S3_FERRY_URL")
s3_ferry = S3Ferry(S3_FERRY_URL)
RUUTER_PRIVATE_URL = os.getenv("RUUTER_PRIVATE_URL")
TEST_MODEL_DOWNLOAD_DIRECTORY = os.getenv("JIRA_MODEL_DOWNLOAD_DIRECTORY", "/shared/models/test")

if not os.path.exists(TEST_MODEL_DOWNLOAD_DIRECTORY):
    os.makedirs(TEST_MODEL_DOWNLOAD_DIRECTORY)   
    

@app.post("/classifier/datamodel/deployment/test/update")
async def download_test_model(request: Request, modelData:TestDeploymentRequest, backgroundTasks: BackgroundTasks):
    
    saveLocation = f"/models/{modelData.replacementModelId}/{modelData.replacementModelId}.zip"
    
    try:
        local_file_name = f"{modelData.replacementModelId}.zip"
        local_file_path = f"/models/test/{local_file_name}"
        
        # 1. Download the new Model
        response = s3_ferry.transfer_file(local_file_path, "FS", saveLocation, "S3")
        if response.status_code != 201:
            raise HTTPException(status_code = 500, detail = S3_DOWNLOAD_FAILED)
        
        zip_file_path = os.path.join("..", "shared/models/test", local_file_name)
        extract_file_path = os.path.join("..", "shared/models/test")
         
        # 2. Unzip  Model Content 
        unzip_file(zip_path=zip_file_path, extract_to=extract_file_path)
        
        backgroundTasks.add_task(os.remove, zip_file_path)  
        
        # 3. Instantiate Inference Model
        class_hierarchy = testModelInference.get_class_hierarchy_by_model_id(modelData.replacementModelId)
        if(class_hierarchy):
            
            model_path = f"shared/models/test/{modelData.replacementModelId}"
            best_model = modelData.bestBaseModel
            model_initiate = inference_obj.model_initiate(model_id=modelData.replacementModelId, model_path=model_path, best_performing_model=best_model, class_hierarchy=class_hierarchy)
            
            if(model_initiate):
                return JSONResponse(status_code=200, content={"replacementStatus": 200})
            else:
                raise HTTPException(status_code = 500, detail = "Failed to initiate inference object")
        else:
            raise HTTPException(status_code = 500, detail = "Error in obtaining the class hierarchy")
        
    except Exception as e:
        raise HTTPException(status_code = 500, detail=str(e))
    
    
@app.post("/classifier/datamodel/deployment/test/delete")
async def delete_folder_content(request:Request, modelData:DeleteTestRequest):
    try:
        folder_path = os.path.join("..", "shared", "models", "test", {modelData.deleteModelId})
        delete_folder(folder_path)  
        
        # Stop the model
        inference_obj.stop_model(model_id=modelData.deleteModelId)
        
        delete_success = {"message" : "Model Deleted Successfully!"}
        return JSONResponse(status_code = 200, content = delete_success)                        
    
    except Exception as e:
        raise HTTPException(status_code = 500, detail=str(e))
     


@app.post("/classifier/testmodel/test-data")
async def test_inference(request:Request, inferenceData:TestInferenceRequest):
    try:
                
        # Call Inference
        predicted_hierarchy, probabilities  = inference_obj.inference(model_id=inferenceData.modelId, text=inferenceData.text)
            
        if (probabilities and predicted_hierarchy):
                
            # Calculate Average Predicted Class Probability
            average_probability = calculate_average_predicted_class_probability(probabilities)
                
            # Build request payload for inference/create endpoint
            inference_succcess_payload = get_inference_success_payload(predictedClasses=predicted_hierarchy, averageConfidence=average_probability, predictedProbabilities=probabilities)                

            return JSONResponse(status_code=200, content={inference_succcess_payload})
  
            
        else:
            raise HTTPException(status_code = 500, detail="Failed to call inference")     
                               
    
    except Exception as e:
        raise HTTPException(status_code = 500, detail=str(e))