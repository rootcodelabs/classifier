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
    --arg trainingResults '{}' \
    --arg inferenceRoutes '{}' \
    '{modelId: $modelId, trainingStatus: $trainingStatus, modelS3Location: $modelS3Location, trainingResults: $trainingResults, inferenceRoutes:$inferenceRoutes}')

echo "PAYLOAD FOR UPDATING TRAINING STATUS"
echo $newModelId
echo $trainingStatus
echo $payload

echo "SENDING REQUEST TO UPDATE_MODEL_METADATA_TRAINING_STATUS_ENDPOINT "
response=$(curl -s -X POST "$UPDATE_MODEL_METADATA_TRAINING_STATUS_ENDPOINT" \
    -H "Content-Type: application/json" \
    -H "Cookie: customJwtCookie=$cookie" \
    -d "$payload")


echo $response

operation_status=$(echo "$response" | jq -r '.response.operationSuccessful')

if [ "$operation_status" = "true" ]; then
    echo "Model Metadata update successful"
else
    echo "Failed to update model metadata. Exiting..."
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

echo "Payload for creating progress session: $payload"


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
trainingMessage="Initiating Training Session - In Training Queue"
progressPercentage=5
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
    #######################
    # Constructing progress update payload to show the error
    sessionId=$progressSessionId
    trainingStatus="Training Failed"
    trainingMessage="Training Failed During Progress session update"
    progressPercentage=100
    processComplete=true

    payload=$(jq -n \
        --argjson sessionId $sessionId \
        --arg trainingStatus "$trainingStatus" \
        --arg trainingMessage "$trainingMessage" \
        --argjson progressPercentage $progressPercentage \
        --argjson processComplete $processComplete \
        '{sessionId: $sessionId, trainingStatus: $trainingStatus, trainingMessage: $trainingMessage, progressPercentage: $progressPercentage, processComplete: $processComplete}')


    echo "UPDATE PROGRESS SESSION WITH ERROR PAYLOAD"
    echo $payload

    # Send POST request to update progress session and set an initial percentage of 10

    response=$(curl -s -X POST "$UPDATE_TRAINING_PROGRESS_SESSION_ENDPOINT" \
        -H "Content-Type: application/json" \
        -H "Cookie: customJwtCookie=$cookie" \
        -d "$payload")


    echo "ERROR PROGRESS UPDATE RESPONSE"
    echo $response
    #######################
    exit 1
fi


export progressSessionId




editedModelDetails=$(echo "$modelDetails" | sed 's/"/\\"/g')

payload=$(cat <<EOF
{
  "cookie": "$cookie",
  "old_model_id": "$modelId",
  "new_model_id": "$newModelId",
  "update_type": "$updateType",
  "previous_deployment_env": "$previousDeploymentEnv",
  "progress_session_id":$progressSessionId,
  "deployment_env": "$deploymentEnv",
  "model_details": "$editedModelDetails"
}
EOF
)

echo "payload - $payload"
forward_url="http://trainer-queue:8901/add_session"


# Send HTTP POST request to model_trainer
response=$(curl -s -w "\nHTTP_STATUS_CODE:%{http_code}" -X POST "$forward_url" \
  -H "Content-Type: application/json" \
  -H "Cookie: $cookie" \
  -d "$payload")

# Output the response
echo "Response from model_trainer:"
echo "$response"