import os
# Constants for return payloads
SUCCESSFUL_OPERATION = {
    "operation_status": 200,
    "operation_successful": True
}

FAILED_TO_SAVE_CHUNKED_DATA = {
    "operation_status": 500,
    "operation_successful": False,
    "reason": "Failed to save chunked data into S3"
}

FAILED_TO_COPY_CHUNKED_DATA = {
    "operation_status": 500,
    "operation_successful": False,
    "reason": "Failed to copy existing chunked data in S3"
}

FAILED_TO_CHUNK_CLEANED_DATA = {
    "operation_status": 500,
    "operation_successful": False,
    "reason": "Failed to chunk the cleaned data"
}

FAILED_TO_REMOVE_STOP_WORDS = {
    "operation_status": 500,
    "operation_successful": False,
    "reason": "Failed to remove stop words from enriched data"
}

FAILED_TO_GET_STOP_WORDS = {
    "operation_status": 500,
    "operation_successful": False,
    "reason": "Failed to get stop words"
}

FAILED_TO_ENRICH_DATA = {
    "operation_status": 500,
    "operation_successful": False,
    "reason": "Failed to enrich data"
}

FAILED_TO_GET_SELECTED_FIELDS = {
    "operation_status": 500,
    "operation_successful": False,
    "reason": "Failed to get selected data fields to enrich"
}

FAILED_TO_CHECK_AND_CONVERT = {
    "operation_status": 500,
    "operation_successful": False,
    "reason": "Failed to check and convert dataset structure"
}

FAILED_TO_GET_DATASET = {
    "operation_status": 500,
    "operation_successful": False,
    "reason": "Failed to get dataset"
}

FAILED_TO_GET_MINOR_UPDATE_DATASET = {
    "operation_status": 500,
    "operation_successful": False,
    "reason": "Failed to get minor update dataset"
}

FAILED_TO_GET_AGGREGATED_DATASET = {
    "operation_status": 500,
    "operation_successful": False,
    "reason": "Failed to get aggregated dataset"
}

FAILED_TO_GET_PAGE_COUNT = {
    "operation_status": 500,
    "operation_successful": False,
    "reason": "Failed to get page count"
}

FAILED_TO_SAVE_AGGREGATED_DATA = {
    "operation_status": 500,
    "operation_successful": False,
    "reason": "Failed to save aggregated dataset"
}

FAILED_TO_DOWNLOAD_CHUNK = {
    "operation_status": 500,
    "operation_successful": False,
    "reason": "Failed to download chunk"
}

FAILED_TO_HANDLE_DELETED_ROWS = {
    "operation_status": 500,
    "operation_successful": False,
    "reason": "Failed to handle deleted rows"
}

FAILED_TO_UPDATE_DATASET = {
    "operation_status": 500,
    "operation_successful": False,
    "reason": "Failed to update dataset after deleting rows"
}

# URLs
GET_DATAGROUP_METADATA_URL = os.getenv("GET_DATAGROUP_METADATA_URL")
CREATE_PROGRESS_SESSION_URL = os.getenv("CREATE_PROGRESS_SESSION_URL")
UPDATE_PROGRESS_SESSION_URL = os.getenv("UPDATE_PROGRESS_SESSION_URL")
GET_PROGRESS_SESSIONS_URL = os.getenv("GET_PROGRESS_SESSIONS_URL")
UPDATE_PROGRESS_SESSION_URL = os.getenv("UPDATE_PROGRESS_SESSION_URL")
GET_DATAGROUP_METADATA_URL = os.getenv("GET_DATAGROUP_METADATA_URL")
CREATE_PROGRESS_SESSION_URL = os.getenv("CREATE_PROGRESS_SESSION_URL")
PARAPHRASE_API_URL = os.getenv("PARAPHRASE_API_URL")
GET_VALIDATION_SCHEMA = os.getenv("GET_VALIDATION_SCHEMA")
FILE_HANDLER_DOWNLOAD_JSON_URL = os.getenv("FILE_HANDLER_DOWNLOAD_JSON_URL")
GET_STOPWORDS_URL = os.getenv("GET_STOPWORDS_URL")
FILE_HANDLER_IMPORT_CHUNKS_URL = os.getenv("FILE_HANDLER_IMPORT_CHUNKS_URL")
FILE_HANDLER_DOWNLOAD_LOCATION_JSON_URL = os.getenv("FILE_HANDLER_DOWNLOAD_LOCATION_JSON_URL")
GET_PAGE_COUNT_URL = os.getenv("GET_PAGE_COUNT_URL")
SAVE_JSON_AGGREGRATED_DATA_URL = os.getenv("SAVE_JSON_AGGREGRATED_DATA_URL")
DOWNLOAD_CHUNK_URL = os.getenv("DOWNLOAD_CHUNK_URL")
STATUS_UPDATE_URL = os.getenv("STATUS_UPDATE_URL")
FILE_HANDLER_COPY_CHUNKS_URL = os.getenv("FILE_HANDLER_COPY_CHUNKS_URL")

# Messages
MSG_PROCESS_HANDLER_STARTED = "Process handler started with updateType: {}"
MSG_PAGE_COUNT = "Page Count : {}"
MSG_CLEANING_PROCESSING = "Preprocessing operations on dataset"
MSG_GENERATING_DATA = "Generating synthetic data to increase dataset volume"
MSG_CHUNKING_UPLOADING = "Chunking and uploading dataset"
MSG_SUCCESS = "Dataset processed and Uploaded Successfully"
MSG_FAIL = "Failed to process dataset"
MSG_PROCESS_COMPLETE = "Process complete"

# Progress percentages
PROGRESS_CLEANING_PROCESSING = 50
PROGRESS_GENERATING_DATA = 70
PROGRESS_CHUNKING_UPLOADING = 80
PROGRESS_SUCCESS = 100
PROGRESS_FAIL = 100

# Messages
MSG_INIT_VALIDATION = "Validation Initiated"
MSG_VALIDATION_IN_PROGRESS = "Running validation criteria across dataset"
MSG_VALIDATION_SUCCESS = "Validation successful"
MSG_VALIDATION_FAIL = "Validation failed"
MSG_MISSING_FIELD = "Missing field: {}"
MSG_VALIDATION_FIELD_FAIL = "Validation failed for field '{}' in row {}"
MSG_VALIDATION_FIELDS_SUCCESS = "Fields validation successful"
MSG_CLASS_HIERARCHY_FAIL = "Values missing in {}: {}"
MSG_CLASS_HIERARCHY_SUCCESS = "Class hierarchy validation successful"
MSG_PATCH_UPDATE_SUCCESS = "Patch update processed successfully"
MSG_INTERNAL_ERROR = "Internal error: {}"
MSG_REQUEST_FAILED = "{} request failed"
MSG_GENERATING_RESPONSE = "Generating response: success={}, message={}"
MSG_PROCESS_REQUEST_STARTED = "Process request started"
MSG_HANDLING_MINOR_UPDATE = "Handling minor update"
MSG_HANDLING_PATCH_UPDATE = "Handling patch update"
MSG_DOWNLOADING_DATASET = "Downloading dataset by location"
MSG_FETCHING_VALIDATION_CRITERIA = "Fetching validation criteria"
MSG_VALIDATING_FIELDS = "Validating fields"
MSG_VALIDATING_CLASS_HIERARCHY = "Validating class hierarchy"
MSG_EXTRACTING_HIERARCHY_VALUES = "Extracting hierarchy values"
MSG_EXTRACTING_DATA_CLASS_VALUES = "Extracting data class values"

# Progress percentages
PROGRESS_INITIATING = 0
PROGRESS_VALIDATION_IN_PROGRESS = 34
PROGRESS_VALIDATION_COMPLETE = 40
PROGRESS_FAIL = 100

# Messages for validation progress updates
MSG_INIT_VALIDATION = "Initializing dataset processing"
MSG_VALIDATION_SUCCESS = "Validation successful"
MSG_VALIDATION_FAILED = "Validation failed"
MSG_PROCESSING_STARTED = "Processing the dataset"
MSG_PROCESSING_COMPLETED = "Dataset Processing Completed"

#Status Messages for progress
STATUS_MSG_VALIDATION_INIT = 'Initiating Validation'
STATUS_MSG_VALIDATION_INPROGRESS = 'Validation In-Progress'
STATUS_MSG_CLEANING_DATASET = 'Cleaning Dataset'
STATUS_MSG_GENERATING_DATA = 'Generating Data'
STATUS_MSG_SUCCESS = 'Success'
STATUS_MSG_FAIL = 'Fail'
