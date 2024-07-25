import re
import os
import json
import requests
from data_enrichment.data_enrichment import DataEnrichment
from constants import *

RUUTER_PRIVATE_URL = os.getenv("RUUTER_PRIVATE_URL")
FILE_HANDLER_DOWNLOAD_JSON_URL = os.getenv("FILE_HANDLER_DOWNLOAD_JSON_URL")
FILE_HANDLER_STOPWORDS_URL = os.getenv("FILE_HANDLER_STOPWORDS_URL")
FILE_HANDLER_IMPORT_CHUNKS_URL = os.getenv("FILE_HANDLER_IMPORT_CHUNKS_URL")
FILE_HANDLER_DOWNLOAD_LOCATION_JSON_URL = os.getenv("FILE_HANDLER_DOWNLOAD_LOCATION_JSON_URL")
GET_PAGE_COUNT_URL = os.getenv("GET_PAGE_COUNT_URL")
SAVE_JSON_AGGREGRATED_DATA_URL = os.getenv("SAVE_JSON_AGGREGRATED_DATA_URL")

class DatasetProcessor:
    def __init__(self):
        self.data_enricher = DataEnrichment()

    def check_and_convert(self, data):
        if self._is_multple_sheet_structure(data):
            return self._convert_to_single_sheet_structure(data)
        elif self._is_single_sheet_structure(data):
            return data
        else:
            print("The provided dictionary does not match the expected structures.")
            return None

    def _is_multple_sheet_structure(self, data):
        if isinstance(data, dict):
            for key, value in data.items():
                if not isinstance(key, str) or not isinstance(value, list):
                    return False
                for item in value:
                    if not isinstance(item, dict):
                        return False
            return True
        return False

    def _is_single_sheet_structure(self, data):
        if isinstance(data, list):
            for item in data:
                if not isinstance(item, dict) or len(item) != 1:
                    return False
            return True
        return False

    def _convert_to_single_sheet_structure(self, data):
        result = []
        for value in data.values():
            result.extend(value)
        return result

    def remove_stop_words(self, data, stop_words):
        try:
            stop_words_set = set(stop_words)
            stop_words_pattern = re.compile(r'\b(' + r'|'.join(re.escape(word) for word in stop_words_set) + r')\b', re.IGNORECASE)

            def clean_text(text):
                return stop_words_pattern.sub('', text).strip()

            cleaned_data = []
            for entry in data:
                cleaned_entry = {key: clean_text(value) if isinstance(value, str) else value for key, value in entry.items()}
                cleaned_data.append(cleaned_entry)

            return cleaned_data
        except Exception as e:
            print("Error while removing Stop Words")
            return None
    
    def enrich_data(self, data, selected_fields):
        try:
            enriched_data = []
            for entry in data:
                enriched_entry = {}
                for key, value in entry.items():
                    if isinstance(value, str) and (key in selected_fields):
                        enriched_value = self.data_enricher.enrich_data(value, num_return_sequences=1, language_id='en')
                        enriched_entry[key] = enriched_value[0] if enriched_value else value
                    else:
                        enriched_entry[key] = value
                enriched_data.append(enriched_entry)
            return enriched_data
        except Exception as e:
            print(f"Internal Error occured while data enrichment : {e}")
            return None
    
    def chunk_data(self, data, chunk_size=5):
        try:
            return [data[i:i + chunk_size] for i in range(0, len(data), chunk_size)]
        except Exception as e:
            print("Error while splitting data into chunks")
            return None
    
    def save_chunked_data(self, chunked_data, cookie, dgID, exsistingChunks=0):
        headers = {
            'cookie': f'customJwtCookie={cookie}',
            'Content-Type': 'application/json'
        }

        for chunk in chunked_data:
            payload = {
                "dg_id": dgID,
                "chunks": chunk,
                "exsistingChunks": exsistingChunks
            }
            try:
                response = requests.post(FILE_HANDLER_IMPORT_CHUNKS_URL, json=payload, headers=headers)
                response.raise_for_status()
            except requests.exceptions.RequestException as e:
                print(f"An error occurred while uploading chunk: {e}")
                return None
        
        return True

    def get_selected_data_fields(self, dgID:int):
        try:
            data_dict = self.get_validation_data(dgID)
            validation_rules = data_dict.get("response", {}).get("validationCriteria", {}).get("validationRules", {})
            text_fields = []
            for field, rules in validation_rules.items():
                if rules.get("type") == "text" and rules.get("isDataClass")!=True:
                    text_fields.append(field)
            return text_fields
        except Exception as e:
            print(e)
            return None
    
    def get_validation_data(self, dgID):
        try:
            params = {'dgId': dgID}
            response = requests.get(RUUTER_PRIVATE_URL, params=params)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"An error occurred: {e}")
            return None
        
    def get_dataset(self, dg_id, custom_jwt_cookie):
        params = {'dgId': dg_id}
        headers = {
            'cookie': f'customJwtCookie={custom_jwt_cookie}'
        }

        try:
            response = requests.get(FILE_HANDLER_DOWNLOAD_JSON_URL, params=params, headers=headers)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"An error occurred: {e}")
            return None
        
    def get_dataset_by_location(self, fileLocation, custom_jwt_cookie):
        params = {'saveLocation': fileLocation}
        headers = {
            'cookie': f'customJwtCookie={custom_jwt_cookie}'
        }

        try:
            response = requests.get(FILE_HANDLER_DOWNLOAD_LOCATION_JSON_URL, params=params, headers=headers)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"An error occurred: {e}")
            return None
        
    def get_stopwords(self, dg_id, custom_jwt_cookie):
        params = {'dgId': dg_id}
        headers = {
            'cookie': f'customJwtCookie={custom_jwt_cookie}'
        }

        try:
            response = requests.get(FILE_HANDLER_STOPWORDS_URL, params=params, headers=headers)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"An error occurred: {e}")
            return None
        
    def get_page_count(self, dg_id, custom_jwt_cookie):
        params = {'dgId': dg_id}
        headers = {
            'cookie': f'customJwtCookie={custom_jwt_cookie}'
        }

        try:
            page_count_url = GET_PAGE_COUNT_URL.replace("{dgif}",str(dg_id))
            response = requests.get(page_count_url, headers=headers)
            response.raise_for_status()
            data = response.json()
            page_count = data["numpages"]
            return page_count
        except requests.exceptions.RequestException as e:
            print(f"An error occurred: {e}")
            return None
    
    def save_aggregrated_data(self, dgID, cookie, aggregratedData):
        headers = {
            'cookie': f'customJwtCookie={cookie}',
            'Content-Type': 'application/json'
        }

        payload = {
            "dgId": dgID,
            "dataset": aggregratedData
        }
        try:
            response = requests.post(SAVE_JSON_AGGREGRATED_DATA_URL, json=payload, headers=headers)
            response.raise_for_status()
        except requests.exceptions.RequestException as e:
            print(f"An error occurred while uploading aggregrated dataset: {e}")
            return None
        
        return True
        
    def process_handler(self, dgID, cookie, updateType, savedFilePath, patchPayload):
        if updateType == "Major":
            dataset = self.get_dataset(dgID, cookie)
            if dataset is not None:
                structured_data = self.check_and_convert(dataset)
                if structured_data is not None:
                    selected_data_fields_to_enrich = self.get_selected_data_fields(dgID)
                    if selected_data_fields_to_enrich is not None:
                        enriched_data = self.enrich_data(structured_data, selected_data_fields_to_enrich)
                        if enriched_data is not None:
                            stop_words = self.get_stopwords(dgID, cookie)
                            if stop_words is not None:
                                cleaned_data = self.remove_stop_words(enriched_data, stop_words)
                                if cleaned_data is not None:
                                    chunked_data = self.chunk_data(cleaned_data)
                                    if chunked_data is not None:
                                        operation_result = self.save_chunked_data(chunked_data, cookie, dgID, 0)
                                        if operation_result:
                                            return SUCCESSFUL_OPERATION
                                        else:
                                            return FAILED_TO_SAVE_CHUNKED_DATA
                                    else:
                                        return FAILED_TO_CHUNK_CLEANED_DATA
                                else:
                                    return FAILED_TO_REMOVE_STOP_WORDS
                            else:
                                return FAILED_TO_GET_STOP_WORDS
                        else:
                            return FAILED_TO_ENRICH_DATA
                    else:
                        return FAILED_TO_GET_SELECTED_FIELDS
                else:
                    return FAILED_TO_CHECK_AND_CONVERT
            else:
                return FAILED_TO_GET_DATASET
        elif updateType == "Minor":
            agregated_dataset = self.get_dataset(dgID, cookie)
            if agregated_dataset is not None:
                minor_update_dataset = self.get_dataset_by_location(savedFilePath, cookie)
                if minor_update_dataset is not None:
                    structured_data = self.check_and_convert(minor_update_dataset)
                    if structured_data is not None:
                        selected_data_fields_to_enrich = self.get_selected_data_fields(dgID)
                        if selected_data_fields_to_enrich is not None:
                            enriched_data = self.enrich_data(structured_data, selected_data_fields_to_enrich)
                            if enriched_data is not None:
                                stop_words = self.get_stopwords(dgID, cookie)
                                if stop_words is not None:
                                    cleaned_data = self.remove_stop_words(enriched_data, stop_words)
                                    if cleaned_data is not None:
                                        chunked_data = self.chunk_data(cleaned_data)
                                        if chunked_data is not None:
                                            page_count = self.get_page_count(dgID, cookie)
                                            if page_count is not None:
                                                operation_result = self.save_chunked_data(chunked_data, cookie, dgID, page_count)
                                                if operation_result is not None:
                                                    agregated_dataset += cleaned_data
                                                    agregated_dataset_operation = self.save_aggregrated_data(dgID, cookie, agregated_dataset)
                                                    if agregated_dataset_operation:
                                                        return SUCCESSFUL_OPERATION
                                                    else:
                                                        return FAILED_TO_SAVE_AGGREGATED_DATA
                                                else:
                                                    return FAILED_TO_SAVE_CHUNKED_DATA
                                            else:
                                                return FAILED_TO_GET_PAGE_COUNT
                                        else:
                                            return FAILED_TO_CHUNK_CLEANED_DATA
                                    else:
                                        return FAILED_TO_REMOVE_STOP_WORDS
                                else:
                                    return FAILED_TO_GET_STOP_WORDS
                            else:
                                return FAILED_TO_ENRICH_DATA
                        else:
                            return FAILED_TO_GET_SELECTED_FIELDS
                    else:
                        return FAILED_TO_CHECK_AND_CONVERT
                else:
                    return FAILED_TO_GET_MINOR_UPDATE_DATASET
            else:
                return FAILED_TO_GET_AGGREGATED_DATASET

