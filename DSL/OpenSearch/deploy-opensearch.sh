#!/bin/bash

URL=$1
AUTH=$2
MOCK_ALLOWED=${3:-false}

if [[ -z $URL || -z $AUTH ]]; then
  echo "Url and Auth are required"
  exit 1
fi

# ddataset_progress_sessions
curl -XDELETE "$URL/dataset_progress_sessions?ignore_unavailable=true" -u "$AUTH" --insecure
curl -H "Content-Type: application/x-ndjson" -X PUT "$URL/dataset_progress_sessions" -ku "$AUTH" --data-binary "@fieldMappings/dataset_progress_sessions.json"
if $MOCK_ALLOWED; then curl -H "Content-Type: application/x-ndjson" -X PUT "$URL/dataset_progress_sessions/_bulk" -ku "$AUTH" --data-binary "@mock/dataset_progress_sessions.json"; fi