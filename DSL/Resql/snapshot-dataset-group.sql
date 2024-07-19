INSERT INTO dataset_group_metadata (
    group_name, major_version, minor_version, patch_version, latest,
    is_enabled, enable_allowed, last_model_trained, created_timestamp,
    last_updated_timestamp, last_used_for_training, validation_status,
    validation_errors, processed_data_available, raw_data_available,
    num_samples, num_pages, raw_data_location, preprocess_data_location,
    validation_criteria, class_hierarchy, connected_models
)
SELECT
    group_name, major_version, minor_version, patch_version, latest,
    is_enabled, enable_allowed, last_model_trained, created_timestamp,
    last_updated_timestamp, last_used_for_training, validation_status,
    validation_errors, processed_data_available, raw_data_available,
    num_samples, num_pages, raw_data_location, preprocess_data_location,
    validation_criteria, class_hierarchy, connected_models
FROM dataset_group_metadata
WHERE id = :id;