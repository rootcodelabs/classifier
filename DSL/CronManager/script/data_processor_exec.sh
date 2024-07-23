#!/bin/bash

# Set the working directory to the location of the script
cd "$(dirname "$0")"

# Source the constants from the ini file
source ../config/config.ini

# Create JSON payload
json_payload=$(jq -n \
                  --arg dgID "$dgId" \
                  --arg authCookie "$customJwtCookie" \
                  '{dgID: $dgID|tonumber, authCookie: $authCookie}')

# Send POST request
response=$(curl -s -X POST "$INIT_DATESET_PROCESSOR_API" \
                 -H "Content-Type: application/json" \
                 -b "customJwtCookie=$customJwtCookie" \
                 -d "$json_payload")

# Print response
echo "Response from API: $response"
