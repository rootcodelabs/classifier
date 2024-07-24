#!/bin/bash

# Set the working directory to the location of the script
cd "$(dirname "$0")"

# Source the constants from the ini file
source ../config/config.ini

echo "dgID $dgId"
# echo "cookie $cookie"
echo "API $INIT_DATESET_PROCESSOR_API"
