#!/bin/bash

# Set the working directory to the location of the script
cd "$(dirname "$0")"

# Source the constants from the ini file
source ../config/config.ini

script_name=$(basename $0)
pwd

echo $(date -u +"%Y-%m-%d %H:%M:%S.%3NZ") - $script_name started

# Fetch the refresh token
response=$(curl -X POST -H "Content-Type: application/json" -d '{"platform":"OUTLOOK"}' "$CLASSIFIER_RESQL/get-token")
refresh_token=$(echo $response | grep -oP '"token":"\K[^"]+')

if [ -z "$refresh_token" ]; then
  echo "No refresh token found"
  exit 1
fi

# Request a new access token using the refresh token
access_token_response=$(curl -X POST \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=$OUTLOOK_CLIENT_ID&scope=$OUTLOOK_SCOPE&refresh_token=$refresh_token&grant_type=refresh_token&client_secret=$OUTLOOK_SECRET_KEY" \
  https://login.microsoftonline.com/common/oauth2/v2.0/token)

new_refresh_token=$(echo $access_token_response | grep -oP '"refresh_token":"\K[^"]+')

if [ -z "$new_refresh_token" ]; then
  echo "Failed to get a new refresh token"
  exit 1
fi

# Function to save the new refresh token
save_refresh_token() {
  new_refresh_token="$1"
  curl -s -X POST -H "Content-Type: application/json" -d '{"platform":"OUTLOOK", "token":"'"$new_refresh_token"'"}' "$CLASSIFIER_RESQL/save-outlook-token"
}

# Call the function to save the new refresh token
save_refresh_token "$new_refresh_token"

# Print the new refresh token
echo "New refresh token: $new_refresh_token"

echo $(date -u +"%Y-%m-%d %H:%M:%S.%3NZ") - $script_name finished
