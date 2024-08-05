UPDATE model_progress_sessions
SET
    training_progress_status = :training_progress_status::Training_Progress_Status,
    training_message = :training_message,
    progress_percentage = :progress_percentage
WHERE id = :id;