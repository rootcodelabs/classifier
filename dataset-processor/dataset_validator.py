import os
import re
import json
import requests
import urllib.parse
import datetime

class DatasetValidator:
    def __init__(self):
        pass

    def process_request(self, dgId, cookie, updateType, savedFilePath, patchPayload=None):
        print("Process request started")
        print(f"dgId: {dgId}, updateType: {updateType}, savedFilePath: {savedFilePath}")
        if updateType == "minor":
            return self.handle_minor_update(dgId, cookie, savedFilePath)
        elif updateType == "patch":
            return self.handle_patch_update(dgId, cookie, patchPayload)
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

    def handle_patch_update(self, dgId, cookie, patchPayload):
        print("Handling patch update")
        min_label_value = 1

        try:
            validation_criteria, class_hierarchy = self.get_validation_criteria(dgId, cookie)
            if validation_criteria is None:
                return self.generate_response(False, "Failed to get validation criteria")

            if patchPayload is None:
                return self.generate_response(False, "No patch payload provided")

            decoded_patch_payload = urllib.parse.unquote(patchPayload)
            patch_payload_dict = json.loads(decoded_patch_payload)
            
            edited_data = patch_payload_dict.get("editedData", [])

            if edited_data:
                for row in edited_data:
                    row_id = row.pop("rowId", None)
                    if row_id is None:
                        return self.generate_response(False, "Missing rowId in edited data")
                    
                    for key, value in row.items():
                        if key not in validation_criteria['validationRules']:
                            return self.generate_response(False, f"Invalid field: {key}")

                        if not self.validate_value(value, validation_criteria['validationRules'][key]['type']):
                            return self.generate_response(False, f"Validation failed for field type '{key}' in row {row_id}")

                data_class_columns = [field for field, rules in validation_criteria['validationRules'].items() if rules.get('isDataClass', False)]
                hierarchy_values = self.extract_hierarchy_values(class_hierarchy)
                for row in edited_data:
                    for col in data_class_columns:
                        if row.get(col) and row[col] not in hierarchy_values:
                            return self.generate_response(False, f"New class '{row[col]}' does not exist in the schema hierarchy")

                aggregated_data = self.get_dataset_by_location(f"/dataset/{dgId}/primary_dataset/dataset_{dgId}_aggregated.json", cookie)
                if aggregated_data is None:
                    return self.generate_response(False, "Failed to download aggregated dataset")

                if not self.check_label_counts(aggregated_data, edited_data, data_class_columns, min_label_value):
                    return self.generate_response(False, "Editing this data will cause the dataset to have insufficient data examples for one or more labels.")

            deleted_data_rows = patch_payload_dict.get("deletedDataRows", [])
            if deleted_data_rows:
                if 'aggregated_data' not in locals():
                    aggregated_data = self.get_dataset_by_location(f"/dataset/{dgId}/primary_dataset/dataset_{dgId}_aggregated.json", cookie)
                    if aggregated_data is None:
                        return self.generate_response(False, "Failed to download aggregated dataset")

                if not self.check_label_counts_after_deletion(aggregated_data, deleted_data_rows, data_class_columns, min_label_value):
                    return self.generate_response(False, "Deleting this data will cause the dataset to have insufficient data examples for one or more labels.")

            return self.generate_response(True, "Patch update processed successfully")

        except Exception as e:
            print(f"Internal error: {e}")
            return self.generate_response(False, f"Internal error: {e}")

    def check_label_counts(self, aggregated_data, edited_data, data_class_columns, min_label_value):
        # Aggregate data class values from edited data
        edited_values = {col: set() for col in data_class_columns}
        for row in edited_data:
            for col in data_class_columns:
                if col in row:
                    edited_values[col].add(row[col])

        # Aggregate counts from the existing dataset
        class_counts = {col: {} for col in data_class_columns}
        for row in aggregated_data:
            for col in data_class_columns:
                value = row.get(col)
                if value:
                    class_counts[col][value] = class_counts[col].get(value, 0) + 1

        # Add counts from the edited data
        for col, values in edited_values.items():
            for value in values:
                class_counts[col][value] = class_counts[col].get(value, 0) + 1

        # Check the counts against min_label_value
        for col, counts in class_counts.items():
            for value, count in counts.items():
                if count < min_label_value:
                    return False
        return True

    def check_label_counts_after_deletion(self, aggregated_data, deleted_data_rows, data_class_columns, min_label_value):
        # Aggregate counts from the existing dataset
        class_counts = {col: {} for col in data_class_columns}
        for row in aggregated_data:
            for col in data_class_columns:
                value = row.get(col)
                if value:
                    class_counts[col][value] = class_counts[col].get(value, 0) + 1

        # Subtract counts from the deleted data
        for row_id in deleted_data_rows:
            for row in aggregated_data:
                if row.get('rowId') == row_id:
                    for col in data_class_columns:
                        value = row.get(col)
                        if value:
                            class_counts[col][value] = class_counts[col].get(value, 0) - 1

        # Check the counts against min_label_value
        for col, counts in class_counts.items():
            for value, count in counts.items():
                if count < min_label_value:
                    return False
        return True

    def generate_response(self, success, message):
        print(f"Generating response: success={success}, message={message}")
        return {
            'response': {
                'operationSuccessful': success,
                'message': message
            }
        }
