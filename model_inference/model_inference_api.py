from fastapi import FastAPI,HTTPException, Request, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from s3_ferry import S3Ferry
from utils import unzip_file, clear_folder_contents
from pydantic import BaseModel
from constants import S3_DOWNLOAD_FAILED
import requests
from inference_wrapper import InferenceWrapper


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins = ["*"],
    allow_credentials = True,
    allow_methods = ["GET", "POST"],
    allow_headers = ["*"],
)

class UpdateRequest(BaseModel):
    modelId: str
    replaceDeployment:bool
    replaceDeploymentPlatform:str
    bestModelName:str

class OutlookInferenceRequest(BaseModel):
    inputId:int
    inputText:str
    isCorrected:bool
    finalFolderId:int

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

async def authenticate_user(request: Request):
    cookie = request.cookies.get("customJwtCookie")
    if not cookie:
        raise HTTPException(status_code=401, detail="No cookie found in the request")

    url = f"{RUUTER_PRIVATE_URL}/auth/jwt/userinfo"
    headers = {
        'cookie': f'customJwtCookie={cookie}'
    }

    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail="Authentication failed")

@app.post("/deployment/jira/update")
async def download_document(request: Request, modelData:UpdateRequest, backgroundTasks: BackgroundTasks):
    
    saveLocation = f"/models/{modelData.modelId}/{modelData.modelId}.zip"
    
    try:   
        await authenticate_user(request)
        local_file_name = f"{modelData.modelId}.zip"
        local_file_path = f"/models/jira/{local_file_name}"
        
        ## Get class hierarchy and validate it
        
            # Get group id from the model id
            # get class hierarchy using group id
        
        # 1. Clear the current content inside the folder
        folder_path = os.path.join("..", "shared", "models", "jira")
        clear_folder_contents(folder_path)  
        
        # 2. Download the new Model
        response = s3_ferry.transfer_file(local_file_path, "FS", saveLocation, "S3")
        if response.status_code != 201:
            raise HTTPException(status_code = 500, detail = S3_DOWNLOAD_FAILED)
        
        zip_file_path = os.path.join("..", f"shared/models/jira", local_file_name)
        extract_file_path = os.path.join("..", f"shared/models/jira")
         
        # 3. Unzip  Model Content 
        unzip_file(zip_path=zip_file_path, extract_to=extract_file_path)
        
        backgroundTasks.add_task(os.remove, zip_file_path)  
        
        
        #3. TODO : Replace the content in other folder if it a replacement --> Call the delete endpoint
        if(UpdateRequest.replaceDeployment):
            folder_path = os.path.join("..", "shared", "models", {UpdateRequest.replaceDeploymentPlatform})
            clear_folder_contents(folder_path)
        
            inference_obj.stop_model(deployment_platform=UpdateRequest.replaceDeploymentPlatform)
        
        # 4. TODO : Instantiate Munsif's Inference Model
        model_path = f"shared/models/jira/{UpdateRequest.modelId}"
        best_model = UpdateRequest.bestModelName
            
        model_initiate = inference_obj.model_swapping(model_path, best_model, deployment_platform="jira")
        
        if(model_initiate):
           return JSONResponse(status_code=200, content="Success")
        
    except Exception as e:
        raise HTTPException(status_code = 500, detail=str(e))
    
    

@app.post("/deployment/outlook/update")
async def download_document(request: Request, modelData:UpdateRequest, backgroundTasks: BackgroundTasks):
    
    saveLocation = f"/models/{modelData.modelId}/{modelData.modelId}.zip"
    
    try:   
        await authenticate_user(request)
        local_file_name = f"{modelData.modelId}.zip"
        local_file_path = f"/models/jira/{local_file_name}"
        
        # before all
        
        
        # 1. Clear the current content inside the folder
        folder_path = os.path.join("..", "shared", "models", "outlook")
        clear_folder_contents(folder_path)  
        
        # 2. Download the new Model
        response = s3_ferry.transfer_file(local_file_path, "FS", saveLocation, "S3")
        if response.status_code != 201:
            raise HTTPException(status_code = 500, detail = S3_DOWNLOAD_FAILED)
        
        zip_file_path = os.path.join("..", f"shared/models/outlook", local_file_name)
        extract_file_path = os.path.join("..", f"shared/models/outlook")
         
        # 3. Unzip  Model Content 
        unzip_file(zip_path=zip_file_path, extract_to=extract_file_path)
        
        backgroundTasks.add_task(os.remove, zip_file_path)  
        
        
        #3. TODO : Replace the content in other folder if it a replacement --> Call the delete endpoint
        if(UpdateRequest.replaceDeployment):
            folder_path = os.path.join("..", "shared", "models", {UpdateRequest.replaceDeploymentPlatform})
            clear_folder_contents(folder_path)
        
            inference_obj.stop_model(deployment_platform=UpdateRequest.replaceDeploymentPlatform)
        
        # 4. TODO : Instantiate Munsif's Inference Model
        model_path = f"shared/models/outlook/{UpdateRequest.modelId}"
        best_model = UpdateRequest.bestModelName
            
        model_initiate = inference_obj.model_swapping(model_path, best_model, deployment_platform="outlook")
        
        if(model_initiate):
           return JSONResponse(status_code=200, content="Success")
        
    except Exception as e:
        raise HTTPException(status_code = 500, detail=str(e))
    
    
    

@app.post("/deployment/jira/delete")
async def delete_folder_content(request:Request):
    try:
        await authenticate_user(request)
        folder_path = os.path.join("..", "shared", "models", "jira")
        clear_folder_contents(folder_path)  
        
        # TODO : Stop Server Functionality
        inference_obj.stop_model(deployment_platform="jira")
        
        delete_success = {"message" : "Model Deleted Successfully!"}
        return JSONResponse(status_code = 200, content = delete_success)                        
    
    except Exception as e:
        raise HTTPException(status_code = 500, detail=str(e))
 
    
@app.post("/deployment/outlook/delete")
async def delete_folder_content(request:Request):
    try:
        await authenticate_user(request)
        folder_path = os.path.join("..", "shared", "models", "outlook")
        clear_folder_contents(folder_path)  
        
        # TODO : Stop Server Functionality
        inference_obj.stop_model(deployment_platform="outlook")
        
        delete_success = {"message" : "Model Deleted Successfully!"}
        return JSONResponse(status_code = 200, content = delete_success)                        
    
    except Exception as e:
        raise HTTPException(status_code = 500, detail=str(e)) 

   
@app.post("/classifier/deployment/outlook/inference")
async def outlook_inference(request:Request, inferenceData:OutlookInferenceRequest):
    try:
        await authenticate_user(request)
        
        print(inferenceData)
        
        ## Check Whether this is a corrected email or not --> if(inferenceData. isCorrected)
       
        if(inferenceData.isCorrected):
            pass
            # No Inference
            ## TODO : What's the process in here?
            
        else: ## New Email
            # Call inference
            prediction = inference_obj.inference(inferenceData.inputText, deployment_platform="outlook")
            
            ## TODO : Call inference/create endpoint
            
            ## Call Kalsara's Outlook endpoint
        
                               
    
    except Exception as e:
        raise HTTPException(status_code = 500, detail=str(e))
    


@app.post("/classifier/deployment/jira/inference")
async def jira_inference(request:Request, inferenceData:OutlookInferenceRequest):
    try:
        await authenticate_user(request)
        
        print(inferenceData)
                               
    
    except Exception as e:
        raise HTTPException(status_code = 500, detail=str(e))