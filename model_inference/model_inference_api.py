from fastapi import FastAPI,HTTPException, Request, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from s3_ferry import S3Ferry
from utils import unzip_file, clear_folder_contents, calculate_average_predicted_class_probability, get_inference_create_payload, get_inference_update_payload
from constants import S3_DOWNLOAD_FAILED, JiraInferenceRequest, OutlookInferenceRequest, UpdateRequest
from inference_wrapper import InferenceWrapper
from model_inference import ModelInference

app = FastAPI()
modelInference = ModelInference()

app.add_middleware(
    CORSMiddleware,
    allow_origins = ["*"],
    allow_credentials = True,
    allow_methods = ["GET", "POST"],
    allow_headers = ["*"],
)

inference_obj = InferenceWrapper()

S3_FERRY_URL = os.getenv("S3_FERRY_URL")
s3_ferry = S3Ferry(S3_FERRY_URL)
RUUTER_PRIVATE_URL = os.getenv("RUUTER_PRIVATE_URL")
JIRA_MODEL_DOWNLOAD_DIRECTORY = os.getenv("JIRA_MODEL_DOWNLOAD_DIRECTORY", "/shared/models/jira")
OUTLOOK_MODEL_DOWNLOAD_DIRECTORY = os.getenv("OUTLOOK_MODEL_DOWNLOAD_DIRECTORY", "/shared/models/outlook")

if not os.path.exists(JIRA_MODEL_DOWNLOAD_DIRECTORY):
    os.makedirs(JIRA_MODEL_DOWNLOAD_DIRECTORY)   
    
if not os.path.exists(OUTLOOK_MODEL_DOWNLOAD_DIRECTORY):
    os.makedirs(OUTLOOK_MODEL_DOWNLOAD_DIRECTORY) 


@app.post("/classifier/deployment/outlook/update")
async def download_outlook_model(request: Request, modelData:UpdateRequest, backgroundTasks: BackgroundTasks):
    
    saveLocation = f"/models/{modelData.modelId}/{modelData.modelId}.zip"
    
    try:  
        local_file_name = f"{modelData.modelId}.zip"
        local_file_path = f"/models/outlook/{local_file_name}"
        
        ## Get class hierarchy and validate it
        is_valid, class_hierarchy = modelInference.get_class_hierarchy_and_validate(modelData.modelId)
        
        if(is_valid and class_hierarchy):

            # 1. Clear the current content inside the folder
            folder_path = os.path.join("..", "shared", "models", "outlook")
            clear_folder_contents(folder_path)  
        
            # 2. Download the new Model
            response = s3_ferry.transfer_file(local_file_path, "FS", saveLocation, "S3")
            if response.status_code != 201:
                raise HTTPException(status_code = 500, detail = S3_DOWNLOAD_FAILED)
        
            zip_file_path = os.path.join("..", "shared/models/outlook", local_file_name)
            extract_file_path = os.path.join("..", "shared/models/outlook")
         
            # 3. Unzip  Model Content 
            unzip_file(zip_path=zip_file_path, extract_to=extract_file_path)
        
            backgroundTasks.add_task(os.remove, zip_file_path)  
        
            # 3. Replace the content in other folder if it a replacement 
            if(modelData.replaceDeployment):
                folder_path = os.path.join("..", "shared", "models", {modelData.replaceDeploymentPlatform})
                clear_folder_contents(folder_path)
                inference_obj.stop_model(deployment_platform=modelData.replaceDeploymentPlatform)
        
            # 4. Instantiate Inference Model
            model_path = f"shared/models/outlook/{modelData.modelId}"
            best_model = modelData.bestBaseModel
            
            model_initiate = inference_obj.model_swapping(model_path, best_model, deployment_platform="outlook", class_hierarchy=class_hierarchy, model_id=modelData.modelId)
        
            if(model_initiate):
                return JSONResponse(status_code=200, content={"replacementStatus": 200})
            else:
                raise HTTPException(status_code = 500, detail = "Failed to initiate inference object")
        
        else:
            raise HTTPException(status_code = 500, detail = "Error in obtaining the class hierarchy or class hierarchy is invalid")
        
    except Exception as e:
        raise HTTPException(status_code = 500, detail=str(e))
    
    

@app.post("/classifier/datamodel/deployment/jira/update")
async def download_jira_model(request: Request, modelData:UpdateRequest, backgroundTasks: BackgroundTasks):
    
    saveLocation = f"/models/{modelData.modelId}/{modelData.modelId}.zip"
    
    try:
        local_file_name = f"{modelData.modelId}.zip"
        local_file_path = f"/models/jira/{local_file_name}"
        
        # 1. Clear the current content inside the folder
        folder_path = os.path.join("..", "shared", "models", "jira")
        clear_folder_contents(folder_path)  
        
        # 2. Download the new Model
        response = s3_ferry.transfer_file(local_file_path, "FS", saveLocation, "S3")
        if response.status_code != 201:
            raise HTTPException(status_code = 500, detail = S3_DOWNLOAD_FAILED)
        
        zip_file_path = os.path.join("..", "shared/models/jira", local_file_name)
        extract_file_path = os.path.join("..", "shared/models/jira")
         
        # 3. Unzip  Model Content 
        unzip_file(zip_path=zip_file_path, extract_to=extract_file_path)
        
        backgroundTasks.add_task(os.remove, zip_file_path)  
        
        
        #3. Replace the content in other folder if it a replacement --> Call the delete endpoint
        if(modelData.replaceDeployment):
            folder_path = os.path.join("..", "shared", "models", {modelData.replaceDeploymentPlatform})
            clear_folder_contents(folder_path)
        
            inference_obj.stop_model(deployment_platform=modelData.replaceDeploymentPlatform)
        
        # 4. Instantiate Inference Model
        class_hierarchy = modelInference.get_class_hierarchy_by_model_id(modelData.modelId)
        if(class_hierarchy):
            
            model_path = f"shared/models/jira/{modelData.modelId}"
            best_model = modelData.bestBaseModel
            model_initiate = inference_obj.model_swapping(model_path, best_model, deployment_platform="jira", class_hierarchy=class_hierarchy, model_id=modelData.modelId)
            
            if(model_initiate):
                return JSONResponse(status_code=200, content={"replacementStatus": 200})
            else:
                raise HTTPException(status_code = 500, detail = "Failed to initiate inference object")
        else:
            raise HTTPException(status_code = 500, detail = "Error in obtaining the class hierarchy")
        
    except Exception as e:
        raise HTTPException(status_code = 500, detail=str(e))
    
    
@app.post("/classifier/datamodel/deployment/jira/delete")
async def delete_folder_content(request:Request):
    try:
        folder_path = os.path.join("..", "shared", "models", "jira")
        clear_folder_contents(folder_path)  
        
        # Stop the model
        inference_obj.stop_model(deployment_platform="jira")
        
        delete_success = {"message" : "Model Deleted Successfully!"}
        return JSONResponse(status_code = 200, content = delete_success)                        
    
    except Exception as e:
        raise HTTPException(status_code = 500, detail=str(e))
 
    
@app.post("/classifier/datamodel/deployment/outlook/delete")
async def delete_folder_content(request:Request):
    try:
        folder_path = os.path.join("..", "shared", "models", "outlook")
        clear_folder_contents(folder_path)  
        
        # Stop the model
        inference_obj.stop_model(deployment_platform="outlook")
        
        delete_success = {"message" : "Model Deleted Successfully!"}
        return JSONResponse(status_code = 200, content = delete_success)                        
    
    except Exception as e:
        raise HTTPException(status_code = 500, detail=str(e)) 

   
@app.post("/classifier/deployment/outlook/inference")
async def outlook_inference(request:Request, inferenceData:OutlookInferenceRequest):
    try:        
        model_id = inference_obj.get_model_id(deployment_platform="outlook")
        
        if(model_id):
            # If there is a active model
        
            # 1 . Check whether the if the Inference Exists
            is_exist = modelInference.check_inference_data_exists(input_id=inferenceData.inputId)
            
            if(is_exist): # Update Inference Scenario
                #  Create Corrected Folder Hierarchy using the final folder id
                corrected_folder_hierarchy = modelInference.build_corrected_folder_hierarchy(final_folder_id=inferenceData.finalFolderId, model_id=model_id)
                
                # Call user_corrected_probablities
                corrected_probs = inference_obj.get_corrected_probabilities(text=inferenceData.inputText, corrected_labels=corrected_folder_hierarchy, deployment_platform="outlook")
                
                if(corrected_probs):
                    # Calculate Average Predicted Class Probability
                    average_probability = calculate_average_predicted_class_probability(corrected_probs)
                
                    # Build request payload for inference/update endpoint
                    inference_update_paylod = get_inference_update_payload(inferenceInputId=inferenceData.inputId,isCorrected=True, correctedLabels=corrected_folder_hierarchy,averagePredictedClassesProbability=average_probability, platform="OUTLOOK", primaryFolderId=inferenceData.finalFolderId)
                
                    # Call inference/update endpoint
                    is_success = modelInference.update_inference(payload=inference_update_paylod)
                    
                    if(is_success):
                        return JSONResponse(status_code=200, content={"operationSuccessful": True})
                    else:
                        raise HTTPException(status_code = 500, detail="Failed to call the update inference")  
                
                else:
                    raise HTTPException(status_code = 500, detail="Failed to retrieve the corrected class probabilities from the inference pipeline")
                
                    
            else: # Create Inference Scenario
                # Call Inference
                predicted_hierarchy, probabilities  = inference_obj.inference(inferenceData.inputText, deployment_platform="outlook")
                
                if (probabilities and predicted_hierarchy):
                    
                    # Calculate Average Predicted Class Probability
                    average_probability = calculate_average_predicted_class_probability(probabilities)
                    
                    # Get the final folder id of the predicted folder hierarchy
                    final_folder_id = modelInference.find_final_folder_id(flattened_folder_hierarchy=predicted_hierarchy, model_id=model_id)
                    
                    # Build request payload for inference/create endpoint
                    inference_create_payload = get_inference_create_payload(inferenceInputId=inferenceData.inputId,inferenceText=inferenceData.inputText,predictedLabels=predicted_hierarchy, averagePredictedClassesProbability=average_probability, platform="OUTLOOK", primaryFolderId=final_folder_id, mailId=inferenceData.mailId)
                    
                    # Call inference/create endpoint
                    is_success = modelInference.create_inference(payload=inference_create_payload)
                    
                    if(is_success):
                        return JSONResponse(status_code=200, content={"operationSuccessful": True})
                    else:
                        raise HTTPException(status_code = 500, detail="Failed to call the create inference")  
                
                else:
                    raise HTTPException(status_code = 500, detail="Failed to call inference")
        
        else:
            raise HTTPException(status_code = 500, detail="No active model currently exists for the Outlook inference")
            
                
        
                               
    except Exception as e:
        raise HTTPException(status_code = 500, detail=str(e))
    


@app.post("/classifier/deployment/jira/inference")
async def jira_inference(request:Request, inferenceData:JiraInferenceRequest):
    try:        
        # 1 . Check whether the if the Inference Exists
        is_exist = modelInference.check_inference_data_exists(input_id=inferenceData.inputId)
        
        if(is_exist): # Update Inference Scenario    
            # Call user_corrected_probablities
            corrected_probs = inference_obj.get_corrected_probabilities(text=inferenceData.inputText, corrected_labels=inferenceData.finalLabels, deployment_platform="outlook")
            
            if(corrected_probs):
                # Calculate Average Predicted Class Probability
                average_probability = calculate_average_predicted_class_probability(corrected_probs)
            
                # Build request payload for inference/update endpoint
                inference_update_paylod = get_inference_update_payload(inferenceInputId=inferenceData.inputId,isCorrected=True, correctedLabels=inferenceData.finalLabels, averagePredictedClassesProbability=average_probability, platform="JIRA", primaryFolderId=None)
             
                # Call inference/update endpoint
                is_success = modelInference.update_inference(payload=inference_update_paylod)
                
                if(is_success):
                   return JSONResponse(status_code=200, content={"operationSuccessful": True})
                else:
                   raise HTTPException(status_code = 500, detail="Failed to call the update inference")  
            
            else:
                raise HTTPException(status_code = 500, detail="Failed to retrieve the corrected class probabilities from the inference pipeline")
            
                
        else: # Create Inference Scenario
            # Call Inference
            predicted_hierarchy, probabilities  = inference_obj.inference(inferenceData.inputText, deployment_platform="jira")
            
            if (probabilities and predicted_hierarchy):
                
                # Calculate Average Predicted Class Probability
                average_probability = calculate_average_predicted_class_probability(probabilities)
                
                # Build request payload for inference/create endpoint
                inference_create_payload = get_inference_create_payload(inferenceInputId=inferenceData.inputId,inferenceText=inferenceData.inputText,predictedLabels=predicted_hierarchy, averagePredictedClassesProbability=average_probability, platform="JIRA", primaryFolderId=None, mailId=None)
                
                # Call inference/create endpoint
                is_success = modelInference.create_inference(payload=inference_create_payload)
                
                if(is_success):
                   return JSONResponse(status_code=200, content={"operationSuccessful": True})
                else:
                   raise HTTPException(status_code = 500, detail="Failed to call the create inference")  
            
            else:
                raise HTTPException(status_code = 500, detail="Failed to call inference")     
                               
    
    except Exception as e:
        raise HTTPException(status_code = 500, detail=str(e))