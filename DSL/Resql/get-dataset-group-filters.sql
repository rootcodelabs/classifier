SELECT json_build_object(
    'dg_names', dg_names,
    'dg_versions', dg_versions,
    'dg_validation_statuses', dg_validation_statuses
)
FROM (
    SELECT
        array_agg(DISTINCT group_name) AS dg_names,
        array_agg(DISTINCT
            major_version::TEXT || '.x.x'
        ) FILTER (WHERE major_version > 0) ||
        array_agg(DISTINCT
            'x.' || minor_version::TEXT || '.x'
        ) FILTER (WHERE minor_version > 0) ||
        array_agg(DISTINCT
            'x.x.' || patch_version::TEXT
        ) FILTER (WHERE patch_version > 0) AS dg_versions,
        array_agg(DISTINCT validation_status) AS dg_validation_statuses
    FROM dataset_group_metadata
) AS subquery;