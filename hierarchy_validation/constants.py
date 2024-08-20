from pydantic import BaseModel, Field
from typing import List


GRAPH_API_BASE_URL = "https://graph.microsoft.com/v1.0"

class ClassHierarchy(BaseModel):
    class_name: str = Field(..., alias="class")
    subclasses: List['ClassHierarchy'] = []

class Folder(BaseModel):
    id: str
    displayName: str
    childFolders: List['Folder'] = []

class HierarchyCheckRequest(BaseModel):
    modelId:int
    classHierarchies: List[ClassHierarchy]
    
class FolderHierarchyRequest(BaseModel):
    modelId:int

class FlattenedFolderHierarchy(BaseModel):
    hierarchy:List[str]
    modelId:int
    
class CorrectedFolderRequest(BaseModel):
    folderId:str
    modelId:int