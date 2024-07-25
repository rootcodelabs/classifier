import re
import os
import json
import requests
# from data_enrichment.data_enrichment import DataEnrichment
from constants import *
from s3_mock import S3FileCounter

RUUTER_PRIVATE_URL = os.getenv("RUUTER_PRIVATE_URL")
FILE_HANDLER_DOWNLOAD_JSON_URL = os.getenv("FILE_HANDLER_DOWNLOAD_JSON_URL")
FILE_HANDLER_STOPWORDS_URL = os.getenv("FILE_HANDLER_STOPWORDS_URL")
FILE_HANDLER_IMPORT_CHUNKS_URL = os.getenv("FILE_HANDLER_IMPORT_CHUNKS_URL")
FILE_HANDLER_DOWNLOAD_LOCATION_JSON_URL = os.getenv("FILE_HANDLER_DOWNLOAD_LOCATION_JSON_URL")
GET_PAGE_COUNT_URL = os.getenv("GET_PAGE_COUNT_URL")
SAVE_JSON_AGGREGRATED_DATA_URL = os.getenv("SAVE_JSON_AGGREGRATED_DATA_URL")
DOWNLOAD_CHUNK_URL = os.getenv("DOWNLOAD_CHUNK_URL")

class DatasetProcessor:
    def __init__(self):
        self.s3_file_counter = S3FileCounter()

    def check_and_convert(self, data):
        print(data)
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

    def _is_single_sheet_structure(self,data):
        if isinstance(data, list):
            for item in data:
                if not isinstance(item, dict) or len(item) <= 1:
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
    
    def enrich_data(self, data, selected_fields, record_count):
        try:
            enriched_data = []
            for entry in data:
                enriched_entry = {}
                for key, value in entry.items():
                    if isinstance(value, str) and (key in selected_fields):
                        # enriched_value = self.data_enricher.enrich_data(value, num_return_sequences=1, language_id='en')
                        enriched_value = ["enrichupdate"]
                        enriched_entry[key] = enriched_value[0] if enriched_value else value
                    else:
                        enriched_entry[key] = value
                record_count = record_count+1
                enriched_entry["rowID"] = record_count
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

        for index, chunk in enumerate(chunked_data):
            print("%$%$")
            print(chunk)
            payload = {
                "dg_id": dgID,
                "chunks": chunk,
                "exsistingChunks": exsistingChunks+index+1
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
            return ["Subject","Body"]
            # data_dict = self.get_validation_data(dgID)
            # validation_rules = data_dict.get("response", {}).get("validationCriteria", {}).get("validationRules", {})
            # text_fields = []
            # for field, rules in validation_rules.items():
            #     if rules.get("type") == "text" and rules.get("isDataClass")!=True:
            #         text_fields.append(field)
            # return text_fields
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
        # params = {'dgId': dg_id}
        # headers = {
        #     'cookie': f'customJwtCookie={custom_jwt_cookie}'
        # }

        # try:
        #     response = requests.get(FILE_HANDLER_STOPWORDS_URL, params=params, headers=headers)
        #     response.raise_for_status()
        #     return response.json()
        try:
            return {"is","her","okay"}
        except requests.exceptions.RequestException as e:
            print(f"An error occurred: {e}")
            return None
        
    def get_page_count(self, dg_id, custom_jwt_cookie):
        # params = {'dgId': dg_id}
        # headers = {
        #     'cookie': f'customJwtCookie={custom_jwt_cookie}'
        # }

        # try:
        #     page_count_url = GET_PAGE_COUNT_URL.replace("{dgif}",str(dg_id))
        #     response = requests.get(page_count_url, headers=headers)
        #     response.raise_for_status()
        #     data = response.json()
        #     page_count = data["numpages"]
        #     return page_count
        try:
            folder_path = f'data/dataset/{dg_id}/chunks/'
            file_count = self.s3_file_counter.count_files_in_folder(folder_path)
            return file_count
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

    def download_chunk(self, dgID, cookie, pageId):
        params = {'dgId': dgID, 'pageId': pageId}
        headers = {
            'cookie': f'customJwtCookie={cookie}'
        }

        try:

            response = requests.get(DOWNLOAD_CHUNK_URL, params=params, headers=headers)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"An error occurred while downloading chunk: {e}")
            return None
        
    def add_row_id(self, structured_data, max_row_id):
        try:
            processed_data = []
            for data in structured_data:
                max_row_id = max_row_id + 1
                data["rowID"] = max_row_id
                processed_data.append(data)
            return processed_data
        except Exception as e:
            print(e)
            return None
        
    def process_handler(self, dgID, cookie, updateType, savedFilePath, patchPayload):
        print(f"Process handler started with updateType: {updateType}")
        
        if updateType == "Major":
            print("Handling Major update")
            dataset = self.get_dataset(dgID, cookie)
            if dataset is not None:
                print("Dataset retrieved successfully")
                structured_data = self.check_and_convert(dataset)
                if structured_data is not None:
                    print("Dataset converted successfully")
                    selected_data_fields_to_enrich = self.get_selected_data_fields(dgID)
                    if selected_data_fields_to_enrich is not None:
                        print("Selected data fields to enrich retrieved successfully")
                        max_row_id = max(item["rowID"] for item in structured_data)
                        enriched_data = self.enrich_data(structured_data, selected_data_fields_to_enrich, max_row_id)

                        agregated_dataset = structured_data + enriched_data
                        
                        if enriched_data is not None:
                            print("Data enrichment successful")
                            stop_words = self.get_stopwords(dgID, cookie)
                            if stop_words is not None:
                                print("Stop words retrieved successfully")
                                print(agregated_dataset)
                                cleaned_data = self.remove_stop_words(agregated_dataset, stop_words)
                                if cleaned_data is not None:
                                    print("Stop words removed successfully")
                                    print(cleaned_data)
                                    chunked_data = self.chunk_data(cleaned_data)
                                    if chunked_data is not None:
                                        print("Data chunking successful")
                                        print(chunked_data)
                                        operation_result = self.save_chunked_data(chunked_data, cookie, dgID, 0)
                                        if operation_result:
                                            print("Chunked data saved successfully")
                                            agregated_dataset_operation = self.save_aggregrated_data(dgID, cookie, cleaned_data)
                                            if agregated_dataset_operation != None:
                                                return SUCCESSFUL_OPERATION
                                            else:
                                                print("Failed to save aggregated dataset for minor update")
                                                return FAILED_TO_SAVE_AGGREGATED_DATA
                                        else:
                                            print("Failed to save chunked data")
                                            return FAILED_TO_SAVE_CHUNKED_DATA
                                    else:
                                        print("Failed to chunk cleaned data")
                                        return FAILED_TO_CHUNK_CLEANED_DATA
                                else:
                                    print("Failed to remove stop words")
                                    return FAILED_TO_REMOVE_STOP_WORDS
                            else:
                                print("Failed to retrieve stop words")
                                return FAILED_TO_GET_STOP_WORDS
                        else:
                            print("Failed to enrich data")
                            return FAILED_TO_ENRICH_DATA
                    else:
                        print("Failed to get selected data fields to enrich")
                        return FAILED_TO_GET_SELECTED_FIELDS
                else:
                    print("Failed to convert dataset")
                    return FAILED_TO_CHECK_AND_CONVERT
            else:
                print("Failed to retrieve dataset")
                return FAILED_TO_GET_DATASET
        elif updateType == "Minor":
            print("Handling Minor update")
            agregated_dataset = self.get_dataset(dgID, cookie)
            max_row_id = max(item["rowID"] for item in agregated_dataset)
            if agregated_dataset is not None:
                print("Aggregated dataset retrieved successfully")
                minor_update_dataset = self.get_dataset_by_location(savedFilePath, cookie)
                if minor_update_dataset is not None:
                    print("Minor update dataset retrieved successfully")
                    structured_data = self.check_and_convert(minor_update_dataset)
                    structured_data = self.add_row_id(structured_data, max_row_id)
                    print(structured_data[-1])
                    if structured_data is not None:
                        print("Minor update dataset converted successfully")
                        selected_data_fields_to_enrich = self.get_selected_data_fields(dgID)
                        if selected_data_fields_to_enrich is not None:
                            print("Selected data fields to enrich for minor update retrieved successfully")
                            max_row_id = max(item["rowID"] for item in structured_data)
                            enriched_data = self.enrich_data(structured_data, selected_data_fields_to_enrich, max_row_id)
                            if enriched_data is not None:
                                print("Minor update data enrichment successful")
                                stop_words = self.get_stopwords(dgID, cookie)
                                if stop_words is not None:
                                    combined_new_dataset = structured_data + enriched_data
                                    print("Stop words for minor update retrieved successfully")
                                    cleaned_data = self.remove_stop_words(combined_new_dataset, stop_words)
                                    if cleaned_data is not None:
                                        print("Stop words for minor update removed successfully")
                                        chunked_data = self.chunk_data(cleaned_data)
                                        if chunked_data is not None:
                                            print("Minor update data chunking successful")
                                            page_count = self.get_page_count(dgID, cookie)
                                            if page_count is not None:
                                                print(f"Page count retrieved successfully: {page_count}")
                                                print(chunked_data)
                                                operation_result = self.save_chunked_data(chunked_data, cookie, dgID, page_count)
                                                if operation_result is not None:
                                                    print("Chunked data for minor update saved successfully")
                                                    agregated_dataset += cleaned_data
                                                    agregated_dataset_operation = self.save_aggregrated_data(dgID, cookie, agregated_dataset)
                                                    if agregated_dataset_operation:
                                                        print("Aggregated dataset for minor update saved successfully")
                                                        return SUCCESSFUL_OPERATION
                                                    else:
                                                        print("Failed to save aggregated dataset for minor update")
                                                        return FAILED_TO_SAVE_AGGREGATED_DATA
                                                else:
                                                    print("Failed to save chunked data for minor update")
                                                    return FAILED_TO_SAVE_CHUNKED_DATA
                                            else:
                                                print("Failed to get page count")
                                                return FAILED_TO_GET_PAGE_COUNT
                                        else:
                                            print("Failed to chunk cleaned data for minor update")
                                            return FAILED_TO_CHUNK_CLEANED_DATA
                                    else:
                                        print("Failed to remove stop words for minor update")
                                        return FAILED_TO_REMOVE_STOP_WORDS
                                else:
                                    print("Failed to retrieve stop words for minor update")
                                    return FAILED_TO_GET_STOP_WORDS
                            else:
                                print("Failed to enrich data for minor update")
                                return FAILED_TO_ENRICH_DATA
                        else:
                            print("Failed to get selected data fields to enrich for minor update")
                            return FAILED_TO_GET_SELECTED_FIELDS
                    else:
                        print("Failed to convert minor update dataset")
                        return FAILED_TO_CHECK_AND_CONVERT
                else:
                    print("Failed to retrieve minor update dataset")
                    return FAILED_TO_GET_MINOR_UPDATE_DATASET
            else:
                print("Failed to retrieve aggregated dataset for minor update")
                return FAILED_TO_GET_AGGREGATED_DATASET
        elif updateType == "Patch":
            print("Handling Patch update")
            stop_words = self.get_stopwords(dgID, cookie)
            if stop_words is not None:
                print("Stop words for patch update retrieved successfully")
                cleaned_patch_payload = self.remove_stop_words(patchPayload, stop_words)
                if cleaned_patch_payload is not None:
                    print("Stop words for patch update removed successfully")
                    page_count = self.get_page_count(dgID, cookie)
                    if page_count is not None:
                        print(f"Page count for patch update retrieved successfully: {page_count}")
                        chunk_updates = {}
                        for entry in cleaned_patch_payload:
                            rowID = entry.get("rowID")
                            chunkNum = (rowID - 1) // 5 + 1
                            if chunkNum not in chunk_updates:
                                chunk_updates[chunkNum] = []
                            chunk_updates[chunkNum].append(entry)
                        print(f"Chunk updates prepared: {chunk_updates}")
                        for chunkNum, entries in chunk_updates.items():
                            chunk_data = self.download_chunk(dgID, cookie, chunkNum)
                            if chunk_data is not None:
                                print(f"Chunk {chunkNum} downloaded successfully")
                                for entry in entries:
                                    rowID = entry.get("rowID")
                                    for idx, chunk_entry in enumerate(chunk_data):
                                        if chunk_entry.get("rowID") == rowID:
                                            chunk_data[idx] = entry
                                            break
                                
                                chunk_save_operation = self.save_chunked_data([chunk_data], cookie, dgID, chunkNum-1)
                                if chunk_save_operation == None:
                                    print(f"Failed to save chunk {chunkNum}")
                                    return FAILED_TO_SAVE_CHUNKED_DATA
                            else:
                                print(f"Failed to download chunk {chunkNum}")
                                return FAILED_TO_DOWNLOAD_CHUNK
                        agregated_dataset = self.get_dataset(dgID, cookie)
                        if agregated_dataset is not None:
                            print("Aggregated dataset for patch update retrieved successfully")
                            for entry in cleaned_patch_payload:
                                rowID = entry.get("rowID")
                                for index, item in enumerate(agregated_dataset):
                                    if item.get("rowID") == rowID:
                                        agregated_dataset[index] = entry
                                        break

                            save_result = self.save_aggregrated_data(dgID, cookie, agregated_dataset)
                            if save_result:
                                print("Aggregated dataset for patch update saved successfully")
                                return SUCCESSFUL_OPERATION
                            else:
                                print("Failed to save aggregated dataset for patch update")
                                return FAILED_TO_SAVE_AGGREGATED_DATA
                        else:
                            print("Failed to retrieve aggregated dataset for patch update")
                            return FAILED_TO_GET_AGGREGATED_DATASET
                    else:
                        print("Failed to get page count for patch update")
                        return FAILED_TO_GET_PAGE_COUNT
                else:
                    print("Failed to remove stop words for patch update")
                    return FAILED_TO_REMOVE_STOP_WORDS
            else:
                print("Failed to retrieve stop words for patch update")
                return FAILED_TO_GET_STOP_WORDS

