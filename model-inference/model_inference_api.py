from fastapi import FastAPI,HTTPException, Request, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from s3_ferry import S3Ferry
from utils import unzip_file, clear_folder_contents, calculate_average_predicted_class_probability, get_inference_create_payload, get_inference_update_payload
from constants import S3_DOWNLOAD_FAILED, INFERENCE_LOGS_PATH, JiraInferenceRequest, OutlookInferenceRequest, UpdateRequest
from inference_wrapper import InferenceWrapper
from model_inference import ModelInference
from loguru import logger
import json

logger.add(sink=INFERENCE_LOGS_PATH)

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


@app.post("/classifier/datamodel/deployment/outlook/update")
async def download_outlook_model(request: Request, model_data:UpdateRequest):
    
    save_location = f"/models/{model_data.modelId}/{model_data.modelId}.zip"

    logger.info(f"MODEL DATA PAYLOAD - {model_data}")
    
    try:  
        local_file_name = f"{model_data.modelId}.zip"
        local_file_path = f"/models/outlook/{local_file_name}"
        
        ## Get class hierarchy and validate it
        is_valid, class_hierarchy = modelInference.get_class_hierarchy_and_validate(model_data.modelId)

        logger.info(f"IS VALID VALUE : {is_valid}")
        logger.info(f"CLASS HIERARCHY VALUE : {class_hierarchy}")
        
        if(is_valid and class_hierarchy):

            # 1. Clear the current content inside the folder
            folder_path = os.path.join("..", "shared", "models", "outlook")
            clear_folder_contents(folder_path)  
        
            # 2. Download the new Model
            response = s3_ferry.transfer_file(local_file_path, "FS", save_location, "S3")
            if response.status_code != 201:
                raise HTTPException(status_code = 500, detail = S3_DOWNLOAD_FAILED)
        
            zip_file_path = os.path.join("..", "shared/models/outlook", local_file_name)
            extract_file_path = os.path.join("..", "shared/models/outlook")
         
            # 3. Unzip  Model Content 
            unzip_file(zip_path=zip_file_path, extract_to=extract_file_path)
        
            os.remove(zip_file_path)
            # 3. Replace the content in other folder if it a replacement 
            if(model_data.replaceDeployment):
                folder_path = os.path.join("..", "shared", "models", {model_data.replaceDeploymentPlatform})
                clear_folder_contents(folder_path)
                inference_obj.stop_model(deployment_platform=model_data.replaceDeploymentPlatform)
        
            # 4. Instantiate Inference Model
            model_path = "/shared/models/outlook"
            best_model = model_data.bestBaseModel

            data = {
                "model_path" : model_path,
                "best_model":best_model,
                "deployment_platform":"outlook",
                "class_hierarchy": class_hierarchy,
                "model_id": model_data.modelId
            }

            meta_data_save_location = '/shared/models/outlook/outlook_inference_metadata.json'
            with open(meta_data_save_location, 'w') as json_file:
                json.dump(data, json_file, indent=4)

            
            model_initiate = inference_obj.load_model(model_path, best_model, deployment_platform="outlook", class_hierarchy=class_hierarchy, model_id=model_data.modelId)
            
            logger.info(f"MODEL INITIATE - {model_initiate}")

            if(model_initiate):
                return JSONResponse(status_code=200, content={"replacementStatus": 200})
            else:
                raise HTTPException(status_code = 500, detail = "Failed to initiate inference object")
        
        else:
            raise HTTPException(status_code = 500, detail = "Error in obtaining the class hierarchy or class hierarchy is invalid")
        
    except Exception as e:
        raise HTTPException(status_code = 500, detail=str(e))
    
    

@app.post("/classifier/datamodel/deployment/jira/update")
async def download_jira_model(request: Request, model_data:UpdateRequest):
    
    save_location = f"/models/{model_data.modelId}/{model_data.modelId}.zip"
    
    try:
        local_file_name = f"{model_data.modelId}.zip"
        local_file_path = f"/models/jira/{local_file_name}"
        
        logger.info(f"MODEL DATA - {model_data}")
        # 1. Clear the current content inside the folder
        folder_path = os.path.join("..", "shared", "models", "jira")
        clear_folder_contents(folder_path)
        
        # 2. Download the new Model
        response = s3_ferry.transfer_file(local_file_path, "FS", save_location, "S3")
        if response.status_code != 201:
            raise HTTPException(status_code = 500, detail = S3_DOWNLOAD_FAILED)
        
        zip_file_path = os.path.join("..", "shared/models/jira", local_file_name)
        extract_file_path = os.path.join("..", "shared/models/jira")
         
        # 3. Unzip  Model Content 
        unzip_file(zip_path=zip_file_path, extract_to=extract_file_path)
        
        os.remove(zip_file_path)
        
        #3. Replace the content in other folder if it a replacement --> Call the delete endpoint
        logger.info("JUST ABOUT TO ENTER   - if(model_data.replaceDeployment):")

        if(model_data.replaceDeployment):
            
            logger.info("INSIDE REPLACE DEPLOYMENT")

            folder_path = os.path.join("..", "shared", "models", {model_data.replaceDeploymentPlatform})
            clear_folder_contents(folder_path)
        
            inference_obj.stop_model(deployment_platform=model_data.replaceDeploymentPlatform)
        
        # 4. Instantiate Inference Model

        logger.info(f"JUST ABOUT TO ENTER get_class_hierarchy_by_model_id")

        class_hierarchy = modelInference.get_class_hierarchy_by_model_id(model_data.modelId)

        logger.info(f"JIRA UPDATE CLASS HIERARCHY - {class_hierarchy}")

        if(class_hierarchy):
        
            model_path = "/shared/models/jira"
            best_model = model_data.bestBaseModel

            data = {
                "model_path" : model_path,
                "best_model":best_model,
                "deployment_platform":"jira",
                "class_hierarchy": class_hierarchy,
                "model_id": model_data.modelId
            }

            meta_data_save_location = '/shared/models/jira/jira_inference_metadata.json'
            with open(meta_data_save_location, 'w') as json_file:
                json.dump(data, json_file, indent=4)

            model_initiate = inference_obj.load_model(model_path, best_model, deployment_platform="jira", class_hierarchy=class_hierarchy, model_id=model_data.modelId)
            
            if(model_initiate):
                logger.info(f"MODEL INITIATE - {model_initiate}")
                logger.info("JIRA DEPLOYMENT SUCCESSFUL")
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
async def outlook_inference(request:Request, inference_data:OutlookInferenceRequest):
    try:
        logger.info("Inference Endpoint Calling") 
        logger.info(f"Inference Data : {inference_data}")

        model_id = inference_obj.get_outlook_model_id()
        logger.info(f"Model Id : {model_id}")
        if(model_id):
            # If there is a active model
        
            # 1 . Check whether the if the Inference Exists
            is_exist, inference_id = modelInference.check_inference_data_exists(input_id=inference_data.inputId)

            logger.info(f"Inference Exists : {is_exist}")
            logger.info(f"Inference ID - {inference_id}")
            
            if(is_exist): # Update Inference Scenario
                #  Create Corrected Folder Hierarchy using the final folder id
                corrected_folder_hierarchy = modelInference.build_corrected_folder_hierarchy(final_folder_id=inference_data.finalFolderId, 
                                                                                             model_id=model_id)
                
                logger.info(f"CORRECTED FOLDER HIERARCHY - {corrected_folder_hierarchy}")
                # Call user_corrected_probablities
                corrected_probs = inference_obj.get_corrected_probabilities(text=inference_data.inputText, 
                                                                            corrected_labels=corrected_folder_hierarchy, 
                                                                            deployment_platform="outlook")
                
                logger.info(f"CORRECTED PROBABILITIES IN MODEL INFERENCE API - {corrected_probs}")

                if(corrected_probs):
                    # Calculate Average Predicted Class Probability
                    average_probability = calculate_average_predicted_class_probability(corrected_probs)

                    logger.info(f"AVERAGE PROBABILITY - {average_probability}")
                    # Build request payload for inference/update endpoint
                    inference_update_payload = get_inference_update_payload(inference_id=inference_id,is_corrected=True, 
                                                                            corrected_labels=corrected_folder_hierarchy,
                                                                            average_predicted_classes_probability=average_probability, 
                                                                            platform="OUTLOOK", 
                                                                            primary_folder_id=inference_data.finalFolderId)

                    logger.info(f"INFERENCE PAYLOAD - {inference_update_payload}")
                    # Call inference/update endpoint
                    is_success = modelInference.update_inference(payload=inference_update_payload)
                    
                    logger.info(f"IS SUCCESS - {is_success}")

                    if(is_success):
                        return JSONResponse(status_code=200, content={"operationSuccessful": True})
                    else:
                        raise HTTPException(status_code = 500, detail="Failed to call the update inference")  
                
                else:
                    raise HTTPException(status_code = 500, detail="Failed to retrieve the corrected class probabilities from the inference pipeline")
                
                    
            else: # Create Inference Scenario
                # Call Inference
                logger.info("CREATE INFERENCE SCENARIO OUTLOOK")
                predicted_hierarchy, probabilities  = inference_obj.inference(inference_data.inputText, deployment_platform="outlook")

                logger.info(f"PREDICTED HIERARCHIES AND PROBABILITIES {predicted_hierarchy}")
                logger.info(f"PROBABILITIES {probabilities}")
                
                if (probabilities and predicted_hierarchy):
                    
                    # Calculate Average Predicted Class Probability
                    average_probability = calculate_average_predicted_class_probability(probabilities)
                    logger.info(f"average probability - {average_probability}")

                    # Get the final folder id of the predicted folder hierarchy
                    final_folder_id = modelInference.find_final_folder_id(flattened_folder_hierarchy=predicted_hierarchy, model_id=model_id)
                    logger.info(f"final folder id - {final_folder_id}")

                    
                    # Build request payload for inference/create endpoint
                    inference_create_payload = get_inference_create_payload(inference_input_id=inference_data.inputId,inference_text=inference_data.inputText,predicted_labels=predicted_hierarchy, average_predicted_classes_probability=average_probability, platform="OUTLOOK", primary_folder_id=final_folder_id, mail_id=inference_data.mailId)
                    logger.info(f"INFERENCE CREATE PAYLOAD - {inference_create_payload}")
                    # Call inference/create endpoint
                    is_success = modelInference.create_inference(payload=inference_create_payload)
                    logger.info(f"IS SUCCESS - {is_success}")
                    
                    if(is_success):

                        logger.info("\n\n OPERATION SUCCESSFUL AND EMAIL SUCCESSFULLY UPDATED \n\n")
                        return JSONResponse(status_code=200, content={"operationSuccessful": True})
                    else:
                        raise HTTPException(status_code = 500, detail="Failed to call the create inference")  
                
                else:
                    
                    logger.info("probabilities and predicted_hierarchy are empty")
                    logger.info(f"probabilities - {probabilities}")
                    logger.info(f"predicted_hierarchy - {predicted_hierarchy}")

                    raise HTTPException(status_code = 500, detail="Failed to call inference")
        
        else:
            raise HTTPException(status_code = 500, detail="No active model currently exists for the Outlook inference")
            
                
        
                               
    except Exception as e:
        raise HTTPException(status_code = 500, detail=str(e))
    

@app.post("/classifier/deployment/jira/inference")
async def jira_inference(request:Request, inferenceData:JiraInferenceRequest):
    try:


        logger.info(f"INFERENCE DATA IN JIRA INFERENCE - {inferenceData}")

        model_id = inference_obj.get_jira_model_id()

        
        if(model_id):        
            # 1 . Check whether the if the Inference Exists
            is_exist, inference_id = modelInference.check_inference_data_exists(input_id=inferenceData.inputId)
            
            logger.info(f"LOGGING IS EXIST IN JIRA IN JIRA UPDATE INFERENCE - {is_exist}")
            if(is_exist): # Update Inference Scenario
                # Call user_corrected_probablities
                corrected_probs = inference_obj.get_corrected_probabilities(text=inferenceData.inputText, corrected_labels=inferenceData.finalLabels, deployment_platform="outlook")
                
                logger.info(f"CORRECT PROBS IN JIRA UPDATE INFERENCE - {corrected_probs}")
                if(corrected_probs):
                    # Calculate Average Predicted Class Probability
                    average_probability = calculate_average_predicted_class_probability(corrected_probs)
                
                    # Build request payload for inference/update endpoint
                    inference_update_payload = get_inference_update_payload(inference_id=inference_id,is_corrected=True, corrected_labels=inferenceData.finalLabels, average_predicted_classes_probability=average_probability, platform="JIRA", primary_folder_id=None)

                    logger.info(f"INFERENCE UPDATE PAYLOAD - {inference_update_payload}")
                    # Call inference/update endpoint
                    is_success = modelInference.update_inference(payload=inference_update_payload)

                    logger.info(f"IS SUCCESS IN JIRA UPDATE INFERENCE - {is_success} ")
                    

                    if(is_success):

                        logger.info("JIRA UPDATE INFERENCE SUCCESSFUL")
                        return JSONResponse(status_code=200, content={"operationSuccessful": True})
                    else:
                        raise HTTPException(status_code = 500, detail="Failed to call the update inference")  
                
                else:
                    raise HTTPException(status_code = 500, detail="Failed to retrieve the corrected class probabilities from the inference pipeline")
                
                    
            else: # Create Inference Scenario
                # Call Inference
                predicted_hierarchy, probabilities  = inference_obj.inference(inferenceData.inputText, deployment_platform="jira")
                
                logger.info(f"JIRA PREDICTED HIERARCHY - {predicted_hierarchy}")
                logger.info(f"JIRA PROBABILITIES - {probabilities}")

                if (probabilities and predicted_hierarchy):
                    
                    # Calculate Average Predicted Class Probability
                    average_probability = calculate_average_predicted_class_probability(probabilities)
                    
                    # Build request payload for inference/create endpoint
                    inference_create_payload = get_inference_create_payload(inference_input_id=inferenceData.inputId,inference_text=inferenceData.inputText,predicted_labels=predicted_hierarchy, average_predicted_classes_probability=average_probability, platform="JIRA", primary_folder_id=None, mail_id=None)
                    
                    # Call inference/create endpoint
                    is_success = modelInference.create_inference(payload=inference_create_payload)
                    
                    logger.info(f"JIRA inference is_success - {is_success}")
                    if(is_success):
                        logger.info("JIRA CREATE INFERENCE SUCCESSFUL")
                        return JSONResponse(status_code=200, content={"operationSuccessful": True})
                    else:
                        raise HTTPException(status_code = 500, detail="Failed to call the create inference")  
                
                else:
                    raise HTTPException(status_code = 500, detail="Failed to call inference")   
        
        else:
             raise HTTPException(status_code = 500, detail="No active model currently exists for the Jira inference")
              
    except Exception as e:
        raise HTTPException(status_code = 500, detail=str(e))

