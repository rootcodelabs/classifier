UPDATE models_metadata
SET
    connected_dg_name = null,
    connected_dg_id = null
WHERE connected_dg_id = :id;
