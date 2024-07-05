delete_user AS (
INSERT
INTO "user" (login, password_hash, first_name, last_name, id_code, display_name, status, created, csa_title, csa_email)
SELECT login,
       password_hash,
       first_name,
       last_name,
       id_code,
       display_name,
       'deleted',
       :created::timestamp with time zone,
       csa_title,
       csa_email
FROM "user"
WHERE id_code = :userIdCode
  AND status <> 'deleted'
  AND id IN (SELECT max(id) FROM "user" WHERE id_code = :userIdCode))
SELECT max(status) FROM "user" WHERE id_code = :userIdCode;
