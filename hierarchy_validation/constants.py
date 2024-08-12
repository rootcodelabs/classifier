from pydantic import BaseModel
from typing import List


GRAPH_API_BASE_URL = "https://graph.microsoft.com/v1.0"

class ClassHierarchy(BaseModel):
    class_name: str
    subclasses: List['ClassHierarchy'] = []


class Folder(BaseModel):
    id: str
    displayName: str
    childFolders: List['Folder'] = []


class HierarchyCheckRequest(BaseModel):
    classHierarchies: List[ClassHierarchy]


class FlattenedFolderHierarchy(BaseModel):
    hierarchy:List[str]