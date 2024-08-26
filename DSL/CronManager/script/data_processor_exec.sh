#!/bin/bash

# Print the files in the current directory
echo "Listing files in the current directory:"
ls -la

# VENV_DIR="/home/cronmanager/clsenv"
# REQUIREMENTS="dataset_processor/requirements.txt"
# PYTHON_SCRIPT="dataset_processor/invoke_dataset_processor.py"

# is_package_installed() {
#     package=$1
#     pip show "$package" > /dev/null 2>&1
# }

# if [ -d "$VENV_DIR" ]; then
#     echo "Virtual environment already exists. Activating..."
# else
#     echo "Virtual environment does not exist. Creating..."
#     python3.12 -m venv $VENV_DIR
# fi

# . $VENV_DIR/bin/activate

# echo "Python executable in use: $(which python3)"

# if [ -f "$REQUIREMENTS" ]; then
#     echo "Checking if required packages are installed..."
    
#     while IFS= read -r requirement || [ -n "$requirement" ]; do
#         package_name=$(echo "$requirement" | cut -d '=' -f 1 | tr -d '[:space:]')
        
#         if is_package_installed "$package_name"; then
#             echo "Package '$package_name' is already installed."
#         else
#             echo "Package '$package_name' is not installed. Installing..."
#             pip install "$requirement"
#         fi
#     done < "$REQUIREMENTS"
# else
#     echo "Requirements file not found: $REQUIREMENTS"
# fi

# # Check if the Python script exists
# if [ -f "$PYTHON_SCRIPT" ]; then
#     echo "Running the Python script: $PYTHON_SCRIPT"
#     python "$PYTHON_SCRIPT"
# else
#     echo "Python script not found: $PYTHON_SCRIPT"
# fi


echo "Started Shell Script to process"
# Ensure required environment variables are set
if [ -z "$dgId" ] || [ -z "$newDgId" ] || [ -z "$cookie" ] || [ -z "$updateType" ] || [ -z "$savedFilePath" ] || [ -z "$patchPayload" ] || [ -z "$sessionId" ]; then
  echo "One or more environment variables are missing."
  echo "Please set dgId, newDgId, cookie, updateType, savedFilePath, patchPayload, and sessionId."
  exit 1
fi

# Construct the payload using here document
payload=$(cat <<EOF
{
  "dgId": "$dgId",
  "newDgId": "$newDgId",
  "updateType": "$updateType",
  "savedFilePath": "$savedFilePath",
  "patchPayload": "$patchPayload",
  "cookie": "$cookie",
  "sessionId": "$sessionId"
}
EOF
)

# Set the forward URL
forward_url="http://dataset-processor:8001/init-dataset-process"

# Send the request
response=$(curl -s -w "\nHTTP_STATUS_CODE:%{http_code}" -X POST "$forward_url" \
  -H "Content-Type: application/json" \
  -H "Cookie: $cookie" \
  -d "$payload")

# Extract the HTTP status code from the response
http_status=$(echo "$response" | grep "HTTP_STATUS_CODE" | awk -F: '{print $2}' | tr -d '[:space:]')

# Extract the body from the response
http_body=$(echo "$response" | grep -v "HTTP_STATUS_CODE")

# Check if the request was successful
if [ "$http_status" -ge 200 ] && [ "$http_status" -lt 300 ]; then
  echo "Request successful."
  echo "Response: $http_body"
else
  echo "Request failed with status code $http_status."
  echo "Response: $http_body"
  exit