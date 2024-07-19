UPDATE dataset_group_metadata
SET
    minor_version = minor_version + 1,
    enable_allowed = false,
    validation_status = 'in-progress'::Validation_Status,
    is_enabled = false,
    raw_data_location = :s3_file_path
WHERE id = :id;
