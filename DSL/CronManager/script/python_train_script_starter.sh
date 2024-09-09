#!/bin/bash

#DEFINING ENDPOINTS

GET_MODEL_METADATA_ENDPOINT=http://ruuter-private:8088/classifier/datamodel/metadata
CREATE_TRAINING_PROGRESS_SESSION_ENDPOINT=http://ruuter-private:8088/classifier/datamodel/progress/create
UPDATE_TRAINING_PROGRESS_SESSION_ENDPOINT=http://ruuter-private:8088/classifier/datamodel/progress/update
UPDATE_MODEL_METADATA_TRAINING_STATUS_ENDPOINT=http://ruuter-private:8088/classifier/datamodel/update/training/status


# Send the request to the API and capture the output
MODEL_METADATA_ENDPOINT="$GET_MODEL_METADATA_ENDPOINT?modelId=$newModelId"

echo $GET_MODEL_METADATA_ENDPOINT

echo "cookie"
echo $cookie

api_response=$(curl -s -H "Cookie: customJwtCookie=$cookie" -X GET "$MODEL_METADATA_ENDPOINT")


echo $api_response

# Check if the API response is valid
if [ -z "$api_response" ]; then
  echo "API request failed to get the model metadata."
  exit 1
fi

deploymentEnv=$(echo $api_response | jq -r '.response.data[0].deploymentEnv')
modelDetails=$api_response
export deploymentEnv
export modelDetails

# Extract model details from the JSON response
modelName=$(echo "$modelDetails" | jq -r '.response.data[0].modelName')
majorVersion=$(echo "$modelDetails" | jq -r '.response.data[0].majorVersion')
minorVersion=$(echo "$modelDetails" | jq -r '.response.data[0].minorVersion')
latest=$(echo "$modelDetails" | jq -r '.response.data[0].latest')


# Construct payload to update training status

trainingStatus="training in-progress"

payload=$(jq -n \
    --argjson modelId $newModelId \
    --arg trainingStatus "$trainingStatus" \
    --arg modelS3Location "" \
    --argjson trainingResults '{}' \
    --argjson inferenceRoutes '{}' \
    '{modelId: $modelId, trainingStatus: $trainingStatus, modelS3Location: $modelS3Location, trainingResults: $trainingResults, inferenceRoutes:$inferenceRoutes}')

echo "PAYLOAD FOR UPDATING TRAINING STATUS"
echo $payload

echo "SENDING REQUEST TO UPDATE_MODEL_METADATA_TRAINING_STATUS_ENDPOINT "
response=$(curl -s -X POST "$UPDATE_MODEL_METADATA_TRAINING_STATUS_ENDPOINT" \
    -H "Content-Type: application/json" \
    -H "Cookie: customJwtCookie=$cookie" \
    -d "$payload")


echo $response

operation_status=$(echo "$response" | jq -r '.response.operationSuccessful')

if [ "$operation_status" = "true" ]; then
    progressSessionId=$(echo "$response" | jq -r '.response.sessionId')
    echo "Session ID: $progressSessionId"
else
    echo "Failed to create training progress session. Exiting..."
    exit 1
fi



# Construct the payload to create progress training session
payload=$(jq -n \
    --argjson modelId $newModelId \
    --arg modelName "$modelName" \
    --argjson majorVersion "$majorVersion" \
    --argjson minorVersion "$minorVersion" \
    --argjson latest "$latest" \
    '{modelId: $modelId, modelName: $modelName, majorVersion: $majorVersion, minorVersion: $minorVersion, latest: $latest}')

echo "Payload: $payload"


# Send the POST request to create the training progress session
response=$(curl -s -X POST "$CREATE_TRAINING_PROGRESS_SESSION_ENDPOINT" \
    -H "Content-Type: application/json" \
    -H "Cookie: customJwtCookie=$cookie" \
    -d "$payload")


echo "Response from create training progress session"
echo $response

# Check if the request was successful
operation_status=$(echo "$response" | jq -r '.response.operationSuccessful')

if [ "$operation_status" = "true" ]; then
    progressSessionId=$(echo "$response" | jq -r '.response.sessionId')
    echo "Session ID: $progressSessionId"
else
    echo "Failed to create training progress session. Exiting..."
    exit 1
fi


#### INITIATING REQUEST TO UPDATE TRAINING PROGRESS SESSION


# Constructing progress update payload

sessionId=$progressSessionId
trainingStatus="Training In-Progress"
trainingMessage="Initiating Training Session"
progressPercentage=10
processComplete=false

payload=$(jq -n \
    --argjson sessionId $sessionId \
    --arg trainingStatus "$trainingStatus" \
    --arg trainingMessage "$trainingMessage" \
    --argjson progressPercentage $progressPercentage \
    --argjson processComplete $processComplete \
    '{sessionId: $sessionId, trainingStatus: $trainingStatus, trainingMessage: $trainingMessage, progressPercentage: $progressPercentage, processComplete: $processComplete}')


echo "UPDATE PROGRESS SESSION PAYLOAD"
echo $payload

# Send POST request to update progress session and set an initial percentage of 10

response=$(curl -s -X POST "$UPDATE_TRAINING_PROGRESS_SESSION_ENDPOINT" \
    -H "Content-Type: application/json" \
    -H "Cookie: customJwtCookie=$cookie" \
    -d "$payload")


echo "PROGRESS UPDATE RESPONSE"
echo $response

operation_status=$(echo "$response" | jq -r '.response.operationSuccessful')

if [ "$operation_status" = "true" ]; then
    progressSessionId=$(echo "$response" | jq -r '.response.sessionId')
    echo "Session ID: $progressSessionId"
else
    echo "Failed to update training progress session. Exiting..."
    exit 1
fi


export progressSessionId

REQUIREMENTS_FILE="/app/model_trainer/model_trainer_requirements.txt"
PYTHON_SCRIPT="/app/model_trainer/main.py"

is_package_installed() {
    package=$1
    pip show "$package" > /dev/null 2>&1
}

echo "cookie - $cookie"
echo "old model id - $modelId"
echo "new model id  - $newModelId"
echo "update type - $updateType"
echo "previous deployment env - $previousDeploymentEnv"
echo "Deployment environment - $deploymentEnv"
echo "Model details - $modelDetails"

echo "Activating Python Environment"
source "/app/python_virtual_env/bin/activate"

echo "Python executable in use: $(which python3)"

if [ -f "$REQUIREMENTS_FILE" ]; then
    echo "Checking if required packages are installed..."

    while IFS= read -r requirement || [ -n "$requirement" ]; do
        package_name=$(echo "$requirement" | cut -d '=' -f 1 | tr -d '[:space:]')
        
        if is_package_installed "$package_name"; then
            echo "Package '$package_name' is already installed."
        else
            echo "Package '$package_name' is not installed. Installing..."
            pip install "$requirement"
        fi
    done < "$REQUIREMENTS_FILE"
else
    echo "Requirements file not found: $REQUIREMENTS_FILE"
fi

# Check if the Python script exists
if [ -f "$PYTHON_SCRIPT" ]; then
    echo "Running the Python script: $PYTHON_SCRIPT"
    python3 "$PYTHON_SCRIPT"
else
    echo "Python script not found: $PYTHON_SCRIPT"
fi
