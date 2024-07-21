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