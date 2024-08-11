import os

# Status messages
UPLOAD_FAILED = {
    "upload_status": 500,
    "operation_successful": False,
    "saved_file_path": None,
    "reason": ""
}

UPLOAD_SUCCESS = {
    "upload_status": 200,
    "operation_successful": True,
    "saved_file_path": ""
}

EXPORT_TYPE_ERROR = {
    "upload_status": 500,
    "operation_successful": False,
    "saved_file_path": None,
    "reason": "export_type should be either json, xlsx or yaml."
}

IMPORT_TYPE_ERROR = {
    "upload_status": 500,
    "operation_successful": False,
    "saved_file_path": None,
    "reason": "import_type should be either minor or major."
}

S3_UPLOAD_FAILED = {
    "upload_status": 500,
    "operation_successful": False,
    "saved_file_path": None,
    "reason": "Failed to upload to S3"
}

S3_DOWNLOAD_FAILED = {
    "upload_status": 500,
    "operation_successful": False,
    "saved_file_path": None,
    "reason": "Failed to download from S3"
}

# File extensions
JSON_EXT = ".json"
YAML_EXT = ".yaml"
YML_EXT = ".yml"
XLSX_EXT = ".xlsx"

# S3 Ferry payload
def GET_S3_FERRY_PAYLOAD(destinationFilePath: str, destinationStorageType: str, sourceFilePath: str, sourceStorageType: str):
    S3_FERRY_PAYLOAD = {
        "destinationFilePath": destinationFilePath,
        "destinationStorageType": destinationStorageType,
        "sourceFilePath": sourceFilePath,
        "sourceStorageType": sourceStorageType
    }
    return S3_FERRY_PAYLOAD

# Directories
UPLOAD_DIRECTORY = os.getenv("UPLOAD_DIRECTORY", "/shared")
CHUNK_UPLOAD_DIRECTORY = os.getenv("CHUNK_UPLOAD_DIRECTORY", "/shared/chunks")
JSON_FILE_DIRECTORY = os.path.join("..", "shared")
TEMP_COPY_FILE = "temp_copy.json"

# URLs
RUUTER_PRIVATE_URL = os.getenv("RUUTER_PRIVATE_URL")
S3_FERRY_URL = os.getenv("S3_FERRY_URL")
IMPORT_STOPWORDS_URL = os.getenv("IMPORT_STOPWORDS_URL")
DELETE_STOPWORDS_URL = os.getenv("DELETE_STOPWORDS_URL")
DATAGROUP_DELETE_CONFIRMATION_URL = os.getenv("DATAGROUP_DELETE_CONFIRMATION_URL")
DATAMODEL_DELETE_CONFIRMATION_URL = os.getenv("DATAMODEL_DELETE_CONFIRMATION_URL")
