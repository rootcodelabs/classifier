SELECT json_build_object(
    'modelNames', modelNames,
    'modelVersions', modelVersions,
    'datasetGroups', datasetGroups,
    'deploymentsEnvs', deploymentsEnvs,
    'trainingStatuses', trainingStatuses,
    'maturityLabels', maturityLabels
)
FROM (
    SELECT
        array_agg(DISTINCT model_name) AS modelNames,
        array_agg(DISTINCT
            major_version::TEXT || '.x'
        ) FILTER (WHERE major_version > 0) ||
        array_agg(DISTINCT
            'x.' || minor_version::TEXT
        ) FILTER (WHERE minor_version > 0) AS modelVersions,
        array_agg(DISTINCT connected_dg_name) AS datasetGroups,
        array_agg(DISTINCT deployment_env) AS deploymentsEnvs,
        array_agg(DISTINCT training_status) AS trainingStatuses,
        array_agg(DISTINCT maturity_label) AS maturityLabels
    FROM models_metadata
) AS subquery;