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
