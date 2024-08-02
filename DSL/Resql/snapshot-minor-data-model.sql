INSERT INTO models_metadata (
    model_group_key,
    model_name,
    major_version,
    minor_version,
    latest,
    maturity_label,
    deployment_env,
    training_status,
    base_models,
    last_trained_timestamp,
    created_timestamp,
    connected_dg_id,
    connected_dg_name,
    model_s3_location,
    inference_routes,
    training_results
)
SELECT
    model_group_key,
    model_name,
    major_version,
  (
        SELECT COALESCE(MAX(minor_version), 0) + 1
        FROM dataset_group_metadata
        WHERE group_key = :group_key AND major_version = :major_version
    ) AS minor_version,
    true AS latest,
    'development'::Maturity_Label AS maturity_label,
    :deployment_env::Deployment_Env,
    'not trained'::Training_Status AS training_status,
    ARRAY [:base_models]::Base_Models[],
    last_trained_timestamp,
    created_timestamp,
    connected_dg_id,
    connected_dg_name,
    model_s3_location,
    NULL,
    NULL
FROM models_metadata
WHERE id = :id
RETURNING id;
