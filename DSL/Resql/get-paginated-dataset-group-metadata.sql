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
ORDER BY CASE WHEN :sorting = 'name asc' THEN dt.group_name END ASC
OFFSET ((GREATEST(:page, 1) - 1) * :page_size) LIMIT :page_size;
