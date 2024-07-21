import os
import json
import yaml
import pandas as pd

class FileConverter:
    def __init__(self):
        pass
    
    def _detect_file_type(self, filePath):
        if filePath.endswith('.json'):
            return 'json'
        elif filePath.endswith('.yaml') or filePath.endswith('.yml'):
            return 'yaml'
        elif filePath.endswith('.xlsx'):
            return 'xlsx'
        else:
            return None
    
    def convert_to_json(self, filePath):
        fileType = self._detect_file_type(filePath)
        if fileType is None:
            print(f"Error: Unsupported file type for '{filePath}'")
            return (False, {})
        
        try:
            if fileType == 'json':
                return self._load_json(filePath)
            elif fileType == 'yaml':
                return self._convert_yaml_to_json(filePath)
            elif fileType == 'xlsx':
                return self._convert_xlsx_to_json(filePath)
        except Exception as e:
            print(f"Error processing '{filePath}': {e}")
            return (False, {})
    
    def _load_json(self, filePath):
        try:
            with open(filePath, 'r') as file:
                data = json.load(file)
            return (True, data)
        except Exception as e:
            print(f"Error loading JSON file '{filePath}': {e}")
            return (False, {})
    
    def _convert_yaml_to_json(self, filePath):
        try:
            with open(filePath, 'r') as file:
                data = yaml.safe_load(file)
            return (True, data)
        except Exception as e:
            print(f"Error converting YAML file '{filePath}' to JSON: {e}")
            return (False, {})
    
    def _convert_xlsx_to_json(self, filePath):
        try:
            data = pd.read_excel(filePath, sheet_name=None)
            jsonData = {sheet: data[sheet].to_dict(orient='records') for sheet in data}
            return (True, jsonData)
        except Exception as e:
            print(f"Error converting XLSX file '{filePath}' to JSON: {e}")
            return (False, {})
    
    def convert_json_to_xlsx(self, jsonData, outputPath):
        try:
            with pd.ExcelWriter(outputPath) as writer:
                for sheetName, data in jsonData.items():
                    df = pd.DataFrame(data)
                    df.to_excel(writer, sheet_name=sheetName, index=False)
            print(f"JSON data successfully converted to XLSX and saved at '{outputPath}'")
            return True
        except Exception as e:
            print(f"Error converting JSON to XLSX: {e}")
            return False
    
    def convert_json_to_yaml(self, jsonData, outputPath):
        try:
            with open(outputPath, 'w') as file:
                yaml.dump(jsonData, file)
            print(f"JSON data successfully converted to YAML and saved at '{outputPath}'")
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
