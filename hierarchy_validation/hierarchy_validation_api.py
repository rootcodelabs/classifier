from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
import os
import requests
from constants import HierarchyCheckRequest, FlattenedFolderHierarchy, FolderHierarchyRequest, CorrectedFolderRequest
from utils import build_folder_hierarchy, validate_hierarchy, find_folder_id, get_corrected_folder_hierarchy,get_outlook_access_token

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins = ["*"],
    allow_credentials = True,
    allow_methods = ["GET", "POST"],
    allow_headers = ["*"],
)

RUUTER_PRIVATE_URL = os.getenv("RUUTER_PRIVATE_URL")

@app.post("/folder-hierarchy")
async def get_folder_hierarchy(request: Request, modelData:FolderHierarchyRequest):
    try:
        outlook_access_token = get_outlook_access_token(model_id=modelData.modelId)
        hierarchy = await build_folder_hierarchy(outlook_access_token=outlook_access_token)
        return hierarchy
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch folder hierarchy: {str(e)}")

@app.post("/check-folder-hierarchy")
async def check_folder_hierarchy(request: Request, hierarchyData: HierarchyCheckRequest): 
    try:
        outlook_access_token = get_outlook_access_token(model_id=HierarchyCheckRequest.modelId)
        result = await validate_hierarchy(class_hierarchies=hierarchyData.classHierarchies, outlook_access_token=outlook_access_token)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to validate folder hierarchy: {str(e)}")

@app.post("/find-folder-id")
async def get_folder_id(request: Request, flattened_hierarchy: FlattenedFolderHierarchy):
    try:
        outlook_access_token = get_outlook_access_token(model_id=flattened_hierarchy.modelId)
        hierarchy = await build_folder_hierarchy(outlook_access_token=outlook_access_token)
        folder_id = find_folder_id(hierarchy, flattened_hierarchy.hierarchy)
        return {"folder_id": folder_id}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
    
@app.post("/corrected-folder-hierarchy")
async def get_hierarchy(request: Request, correctedData:CorrectedFolderRequest ):
    try:
        outlook_access_token = get_outlook_access_token(model_id=correctedData.modelId)
        hierarchy = await build_folder_hierarchy(outlook_access_token=outlook_access_token)
        folder_path = get_corrected_folder_hierarchy(hierarchy, correctedData.folderId)
        return {"folder_hierarchy": folder_path}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")