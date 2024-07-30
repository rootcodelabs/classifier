#!/bin/bash

# Set the working directory to the location of the script
cd "$(dirname "$0")"

# Source the constants from the ini file
source ../config/config.ini

script_name=$(basename $0)
pwd

echo $(date -u +"%Y-%m-%d %H:%M:%S.%3NZ") - $script_name started

delete_dataset_progress_sessions() {
  delete_response=$(curl -s -X DELETE "$CLASSIFIER_RESQL/delete-completed-dataset-progress-sessions")
  if echo "$delete_response" | grep -q '"success":true'; then
    echo "Data deletion successful"
  else
    echo "Data deletion failed: $delete_response"
    exit 1
  fi
}

delete_dataset_progress_sessions

echo $(date -u +"%Y-%m-%d %H:%M:%S.%3NZ") - $script_name finished
