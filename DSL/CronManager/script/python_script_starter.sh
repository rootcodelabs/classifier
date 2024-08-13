#!/bin/bash

VENV_DIR="/home/cronmanager/clsenv"
REQUIREMENTS="model_trainer/model_upload_requirements.txt"
PYTHON_SCRIPT="model_trainer/model_trainer.py"

is_package_installed() {
    package=$1
    pip show "$package" > /dev/null 2>&1
}

if [ -d "$VENV_DIR" ]; then
    echo "Virtual environment already exists. Activating..."
else
    echo "Virtual environment does not exist. Creating..."
    python3.12 -m venv $VENV_DIR
fi

. $VENV_DIR/bin/activate

echo "Python executable in use: $(which python3)"

if [ -f "$REQUIREMENTS" ]; then
    echo "Checking if required packages are installed..."
    
    while IFS= read -r requirement || [ -n "$requirement" ]; do
        package_name=$(echo "$requirement" | cut -d '=' -f 1 | tr -d '[:space:]')
        
        if is_package_installed "$package_name"; then
            echo "Package '$package_name' is already installed."
        else
            echo "Package '$package_name' is not installed. Installing..."
            pip install "$requirement"
        fi
    done < "$REQUIREMENTS"
else
    echo "Requirements file not found: $REQUIREMENTS"
fi

# Check if the Python script exists
if [ -f "$PYTHON_SCRIPT" ]; then
    echo "Running the Python script: $PYTHON_SCRIPT"
    python "$PYTHON_SCRIPT"
else
    echo "Python script not found: $PYTHON_SCRIPT"
fi
