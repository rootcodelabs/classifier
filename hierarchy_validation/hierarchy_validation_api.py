from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from constants import HierarchyCheckRequest, FlattenedFolderHierarchy
from utils import build_folder_hierarchy, validate_hierarchy, find_folder_id, get_corrected_folder_hierarchy

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins = ["*"],
    allow_credentials = True,
    allow_methods = ["GET", "POST"],
    allow_headers = ["*"],
)

@app.get("/api/folder-hierarchy")
async def get_folder_hierarchy():
    try:
        hierarchy = await build_folder_hierarchy()
        return hierarchy
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch folder hierarchy: {str(e)}")

@app.post("/api/check-folder-hierarchy")
async def check_folder_hierarchy(request: HierarchyCheckRequest):
    result = await validate_hierarchy(request.classHierarchies)
    return result

@app.post("/api/find-folder-id")
async def get_folder_id(flattened_hierarchy: FlattenedFolderHierarchy):
    try:
        hierarchy = await build_folder_hierarchy()
        folder_id = find_folder_id(hierarchy, flattened_hierarchy.hierarchy)
        return {"folder_id": folder_id}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
    
@app.get("/api/get-corrected-folder-hierarchy")
async def get_hierarchy(folderId: str):
    try:
        hierarchy = await build_folder_hierarchy()
        folder_path = get_corrected_folder_hierarchy(hierarchy, folderId)
        return {"folder_hierarchy": folder_path}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")