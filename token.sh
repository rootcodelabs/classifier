#!/bin/bash

# Define the path where the SQL file will be generated
SQL_FILE="DSL/Liquibase/data/update_refresh_token.sql"

# Read the OUTLOOK_REFRESH_KEY value from the INI file
OUTLOOK_REFRESH_KEY=$(awk -F '=' '/OUTLOOK_REFRESH_KEY/ {print $2}' constants.ini | xargs)

# Generate a SQL script with the extracted value
cat << EOF > "$SQL_FILE"
-- Update the refresh token in the database
UPDATE integration_status
SET token = '$OUTLOOK_REFRESH_KEY'
WHERE platform='OUTLOOK';
EOF
