# constants.py

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

JSON_EXT = ".json"
YAML_EXT = ".yaml"
YML_EXT = ".yml"
XLSX_EXT = ".xlsx"

SAVE_LOCATION_MINOR_UPDATE = "/dataset/{dgId}/minor_update_temp/minor_update_{}"
LOCAL_FILE_NAME_MINOR_UPDATE = "group_{dgId}minor_update"

SAVE_LOCATION_MAJOR_UPDATE = "/dataset/{dgId}/primary_dataset/dataset_{dgId}_aggregated{}"
LOCAL_FILE_NAME_MAJOR_UPDATE = "group_{dgId}_aggregated"

SAVE_LOCATION_AGGREGATED = "/dataset/{dgId}/primary_dataset/dataset_{dgId}_aggregated{}"
SAVE_LOCATION_CHUNK = "/dataset/{dgId}/chunks/{}{}"
LOCAL_FILE_NAME_CHUNK = "group_{dgId}_chunk_{}"
