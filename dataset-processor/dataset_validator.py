import os
import re
import json
import requests
import urllib.parse
import datetime

class DatasetValidator:
    def __init__(self):
        pass

    def process_request(self, dgId, cookie, updateType, savedFilePath):
        print("Process request started")
        print(f"dgId: {dgId}, updateType: {updateType}, savedFilePath: {savedFilePath}")
        if updateType == "minor":
            return self.handle_minor_update(dgId, cookie, savedFilePath)
        elif updateType == "patch":
            return self.handle_patch_update()
        else:
            return self.generate_response(False, "Unknown update type")

    def handle_minor_update(self, dgId, cookie, savedFilePath):
        try:
            print("Handling minor update")
            data = self.get_dataset_by_location(savedFilePath, cookie)
            if data is None:
                print("Failed to download and load data")
                return self.generate_response(False, "Failed to download and load data")
            print("Data downloaded and loaded successfully")

            validation_criteria, class_hierarchy = self.get_validation_criteria(dgId, cookie)
            if validation_criteria is None:
                print("Failed to get validation criteria")
                return self.generate_response(False, "Failed to get validation criteria")
            print("Validation criteria retrieved successfully")

            field_validation_result = self.validate_fields(data, validation_criteria)
            if not field_validation_result['success']:
                print("Field validation failed")
                return self.generate_response(False, field_validation_result['message'])
            print("Field validation successful")

            hierarchy_validation_result = self.validate_class_hierarchy(data, validation_criteria, class_hierarchy)
            if not hierarchy_validation_result['success']:
                print("Class hierarchy validation failed")
                return self.generate_response(False, hierarchy_validation_result['message'])
            print("Class hierarchy validation successful")

            print("Minor update processed successfully")
            return self.generate_response(True, "Minor update processed successfully")

        except Exception as e:
            print(f"Internal error: {e}")
            return self.generate_response(False, f"Internal error: {e}")

    def handle_patch_update(self):
        print("Handling patch update")
        return self.generate_response(True, "Patch update processed successfully")

    def get_dataset_by_location(self, fileLocation, custom_jwt_cookie):
        print("Downloading dataset by location")
        params = {'saveLocation': fileLocation}
        headers = {'cookie': custom_jwt_cookie}
        try:
            response = requests.get(os.getenv("FILE_HANDLER_DOWNLOAD_LOCATION_JSON_URL"), params=params, headers=headers)
            response.raise_for_status()
            print("Dataset downloaded successfully")
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error downloading dataset: {e}")
            return None

    def get_validation_criteria(self, dgId, cookie):
        print("Fetching validation criteria")
        params = {'dgId': dgId}
        headers = {'cookie': cookie}
        try:
            response = requests.get(os.getenv("GET_VALIDATION_SCHEMA"), params=params, headers=headers)
            response.raise_for_status()
            print("Validation criteria fetched successfully")
            validation_criteria = response.json().get('response', {}).get('validationCriteria', {})
            class_hierarchy = response.json().get('response', {}).get('classHierarchy', {})
            return validation_criteria, class_hierarchy
        except requests.exceptions.RequestException as e:
            print(f"Error fetching validation criteria: {e}")
            return None

    def validate_fields(self, data, validation_criteria):
        print("Validating fields")
        try:
            fields = validation_criteria.get('fields', [])
            validation_rules = validation_criteria.get('validationRules', {})

            for field in fields:
                if field not in data[0]:
                    print(f"Missing field: {field}")
                    return {'success': False, 'message': f"Missing field: {field}"}

            for idx, row in enumerate(data):
                for field, rules in validation_rules.items():
                    if field in row:
                        value = row[field]
                        if not self.validate_value(value, rules['type']):
                            print(f"Validation failed for field '{field}' in row {idx + 1}")
                            return {'success': False, 'message': f"Validation failed for field '{field}' in row {idx + 1}"}
            print("Fields validation successful")
            return {'success': True, 'message': "Fields validation successful"}
        except Exception as e:
            print(f"Error validating fields: {e}")
            return {'success': False, 'message': f"Error validating fields: {e}"}

    def validate_value(self, value, value_type):
        if value_type == 'email':
            return re.match(r"[^@]+@[^@]+\.[^@]+", value) is not None
        elif value_type == 'text':
            return isinstance(value, str)
        elif value_type == 'int':
            return isinstance(value, int) or value.isdigit()
        elif value_type == 'float':
            try:
                float(value)
                return True
            except ValueError:
                return False
        elif value_type == 'datetime':
            try:
                datetime.datetime.fromisoformat(value)
                return True
            except ValueError:
                return False
        return False

    def validate_class_hierarchy(self, data, validation_criteria, class_hierarchy):
        print("Validating class hierarchy")
        try:
            data_class_columns = [field for field, rules in validation_criteria.get('validationRules', {}).items() if rules.get('isDataClass', False)]

            hierarchy_values = self.extract_hierarchy_values(class_hierarchy)
            data_values = self.extract_data_class_values(data, data_class_columns)

            missing_in_hierarchy = data_values - hierarchy_values
            missing_in_data = hierarchy_values - data_values

            if missing_in_hierarchy:
                print(f"Values missing in class hierarchy: {missing_in_hierarchy}")
                return {'success': False, 'message': f"Values missing in class hierarchy: {missing_in_hierarchy}"}
            if missing_in_data:
                print(f"Values missing in data class columns: {missing_in_data}")
                return {'success': False, 'message': f"Values missing in data class columns: {missing_in_data}"}

            print("Class hierarchy validation successful")
            return {'success': True, 'message': "Class hierarchy validation successful"}
        except Exception as e:
            print(f"Error validating class hierarchy: {e}")
            return {'success': False, 'message': f"Error validating class hierarchy: {e}"}

    def extract_hierarchy_values(self, hierarchy):
        print("Extracting hierarchy values")
        print(hierarchy)
        values = set()

        def traverse(node):
            if 'class' in node:
                values.add(node['class'])
            if 'subclasses' in node:
                for subclass in node['subclasses']:
                    traverse(subclass)

        for item in hierarchy:
            traverse(item)
        print(f"Hierarchy values extracted: {values}")
        return values

    def extract_data_class_values(self, data, columns):
        print("Extracting data class values")
        values = set()
        for row in data:
            for col in columns:
                values.add(row.get(col))
        print(f"Data class values extracted: {values}")
        return values

    def generate_response(self, success, message):
        print(f"Generating response: success={success}, message={message}")
        return {
            'response': {
                'operationSuccessful': success,
                'message': message
            }
        }
