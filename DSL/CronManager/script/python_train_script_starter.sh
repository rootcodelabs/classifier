#!/bin/bash

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
