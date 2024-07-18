import os
import json
import yaml
import pandas as pd

class FileConverter:
    def __init__(self):
        pass
    
    def _detect_file_type(self, file_path):
        if file_path.endswith('.json'):
            return 'json'
        elif file_path.endswith('.yaml') or file_path.endswith('.yml'):
            return 'yaml'
        elif file_path.endswith('.xlsx'):
            return 'xlsx'
        else:
            return None
    
    def convert_to_json(self, file_path):
        file_type = self._detect_file_type(file_path)
        if file_type is None:
            print(f"Error: Unsupported file type for '{file_path}'")
            return (False, {})
        
        try:
            if file_type == 'json':
                return self._load_json(file_path)
            elif file_type == 'yaml':
                return self._convert_yaml_to_json(file_path)
            elif file_type == 'xlsx':
                return self._convert_xlsx_to_json(file_path)
        except Exception as e:
            print(f"Error processing '{file_path}': {e}")
            return (False, {})
    
    def _load_json(self, file_path):
        try:
            with open(file_path, 'r') as file:
                data = json.load(file)
            return (True, data)
        except Exception as e:
            print(f"Error loading JSON file '{file_path}': {e}")
            return (False, {})
    
    def _convert_yaml_to_json(self, file_path):
        try:
            with open(file_path, 'r') as file:
                data = yaml.safe_load(file)
            return (True, data)
        except Exception as e:
            print(f"Error converting YAML file '{file_path}' to JSON: {e}")
            return (False, {})
    
    def _convert_xlsx_to_json(self, file_path):
        try:
            data = pd.read_excel(file_path, sheet_name=None)
            json_data = {sheet: data[sheet].to_dict(orient='records') for sheet in data}
            return (True, json_data)
        except Exception as e:
            print(f"Error converting XLSX file '{file_path}' to JSON: {e}")
            return (False, {})
    
    def convert_json_to_xlsx(self, json_data, output_path):
        try:
            with pd.ExcelWriter(output_path) as writer:
                for sheet_name, data in json_data.items():
                    df = pd.DataFrame(data)
                    df.to_excel(writer, sheet_name=sheet_name, index=False)
            print(f"JSON data successfully converted to XLSX and saved at '{output_path}'")
            return True
        except Exception as e:
            print(f"Error converting JSON to XLSX: {e}")
            return False
    
    def convert_json_to_yaml(self, json_data, output_path):
        try:
            with open(output_path, 'w') as file:
                yaml.dump(json_data, file)
            print(f"JSON data successfully converted to YAML and saved at '{output_path}'")
            return True
        except Exception as e:
            print(f"Error converting JSON to YAML: {e}")
            return False

if __name__ == "__main__":
    converter = FileConverter()
    
    # Convert files to JSON
    file_paths = ['example.json', 'example.yaml', 'example.xlsx', 'example.txt']
    for file_path in file_paths:
        success, json_data = converter.convert_to_json(file_path)
        if success:
            print(f"JSON data for '{file_path}':\n{json.dumps(json_data, indent=4)}\n")
    
    if json_data:
        converter.convert_json_to_xlsx(json_data, 'output.xlsx')
        converter.convert_json_to_yaml(json_data, 'output.yaml')
