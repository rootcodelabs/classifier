SELECT
    id,
    model_id,
    model_name,
    major_version,
    minor_version,
    latest,
    process_complete,
    progress_percentage,
    training_progress_status as training_status,
    training_message
FROM model_progress_sessions;
