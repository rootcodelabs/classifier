SELECT u.login,
       u.first_name,
       u.last_name,
       u.id_code AS userIdCode,
       u.display_name,
       u.csa_title,
       u.csa_email,
       ua.authority_name AS authorities,
       CEIL(COUNT(*) OVER() / :page_size::DECIMAL) AS total_pages
FROM "user" u
LEFT JOIN (
    SELECT authority_name, user_id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY id DESC) AS rn
    FROM user_authority AS ua
    WHERE authority_name && ARRAY [ :roles ]::character varying array
      AND ua.id IN (
          SELECT max(id)
          FROM user_authority
          GROUP BY user_id
      )
) ua ON u.id_code = ua.user_id
WHERE u.status <> 'deleted'
  AND array_length(authority_name, 1) > 0
  AND u.id IN (
      SELECT max(id)
      FROM "user"
      GROUP BY id_code
  )
ORDER BY
   CASE WHEN :sorting = 'name asc' THEN u.first_name END ASC,
   CASE WHEN :sorting = 'name desc' THEN u.first_name END DESC,
   CASE WHEN :sorting = 'idCode asc' THEN u.id_code END ASC,
   CASE WHEN :sorting = 'idCode desc' THEN u.id_code END DESC,
   CASE WHEN :sorting = 'Role asc' THEN ua.authority_name END ASC,
   CASE WHEN :sorting = 'Role desc' THEN ua.authority_name END DESC,
   CASE WHEN :sorting = 'displayName asc' THEN u.display_name END ASC,
   CASE WHEN :sorting = 'displayName desc' THEN u.display_name END DESC,
   CASE WHEN :sorting = 'csaTitle asc' THEN u.csa_title END ASC,
   CASE WHEN :sorting = 'csaTitle desc' THEN u.csa_title END DESC,
   CASE WHEN :sorting = 'csaEmail asc' THEN u.csa_email END ASC,
   CASE WHEN :sorting = 'csaEmail desc' THEN u.csa_email END DESC
OFFSET ((GREATEST(:page, 1) - 1) * :page_size) LIMIT :page_size;
