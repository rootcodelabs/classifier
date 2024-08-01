SELECT
    id AS model_id,
    model_name,
    major_version,
    minor_version,
    latest,
    maturity_label,
    deployment_env,
    training_status,
    base_models,
    connected_dg_id,
    connected_dg_name
FROM models_metadata
WHERE id = :id;
