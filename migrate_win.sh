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

# Function to parse ini file and extract the value for a given key
get_ini_value() {
    local file=$1
    local key=$2
    awk -F '=' -v key="$key" '$1 == key { gsub(/^[ \t]+|[ \t]+$/, "", $2); print $2; exit }' "$file"
}

# Get the values from constants.ini
INI_FILE="constants.ini"
DB_PASSWORD=$(get_ini_value "$INI_FILE" "DB_PASSWORD")

# Run the Liquibase update command using Docker
docker run --rm --network bykstack \
  -v "$(pwd)/DSL/Liquibase/changelog:/liquibase/changelog" \
  -v "$(pwd)/DSL/Liquibase/master.yml:/liquibase/master.yml" \
  -v "$(pwd)/DSL/Liquibase/data:/liquibase/data" \
  liquibase/liquibase \
  --defaultsFile=/liquibase/changelog/liquibase.properties \
  --changelog-file=master.yml \
  --url=jdbc:postgresql://users_db:5432/classifier?user=postgres \
  --password="$DB_PASSWORD" update
