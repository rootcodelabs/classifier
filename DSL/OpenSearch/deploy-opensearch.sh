#!/bin/bash

URL=$1
AUTH=$2
MOCK_ALLOWED=${3:-false}

if [[ -z $URL || -z $AUTH ]]; then
  echo "Url and Auth are required"
  exit 1
fi

# dataset_group_progress
curl -XDELETE "$URL/dataset_group_progress?ignore_unavailable=true" -u "$AUTH" --insecure
curl -H "Content-Type: application/x-ndjson" -X PUT "$URL/dataset_group_progress" -ku "$AUTH" --data-binary "@fieldMappings/dataset_group_progress.json"
if $MOCK_ALLOWED; then curl -H "Content-Type: application/x-ndjson" -X PUT "$URL/dataset_group_progress/_bulk" -ku "$AUTH" --data-binary "@mock/dataset_group_progress.json"; fi