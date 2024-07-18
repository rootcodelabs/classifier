SELECT  dt.id as dg_id,
        dt.group_name,
       dt.major_version,
       dt.minor_version,
       dt.patch_version,
       dt.latest,
       dt.is_enabled,
       dt.created_timestamp,
       dt.last_updated_timestamp,
       dt.last_used_for_training,
       dt.validation_status,
       CEIL(COUNT(*) OVER() / :page_size::DECIMAL) AS total_pages
FROM "dataset_group_metadata" dt
WHERE
    (:major_version = -1 OR dt.major_version = :major_version)
    AND (:minor_version = -1 OR dt.minor_version = :minor_version)
    AND (:patch_version = -1 OR dt.patch_version = :patch_version)
    AND (:validation_status = 'all' OR dt.validation_status = :validation_status::Validation_Status)
    AND (:group_name = 'all' OR dt.group_name = :group_name)
ORDER BY
    CASE WHEN :sorting = 'asc' THEN dt.group_name END ASC,
    CASE WHEN :sorting = 'dsc' THEN dt.group_name END DESC
OFFSET ((GREATEST(:page, 1) - 1) * :page_size) LIMIT :page_size;
