UPDATE dataset_group_metadata
SET
    validation_status = :validation_status::Validation_Status,
    validation_errors = :validation_errors::jsonb
WHERE id = :id;
