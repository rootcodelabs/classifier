import re
import os
import json
import urllib.parse
import requests
from constants import *

RUUTER_PRIVATE_URL = os.getenv("RUUTER_PRIVATE_URL")
GET_VALIDATION_SCHEMA = os.getenv("GET_VALIDATION_SCHEMA")
FILE_HANDLER_DOWNLOAD_JSON_URL = os.getenv("FILE_HANDLER_DOWNLOAD_JSON_URL")
GET_STOPWORDS_URL = os.getenv("GET_STOPWORDS_URL")
FILE_HANDLER_IMPORT_CHUNKS_URL = os.getenv("FILE_HANDLER_IMPORT_CHUNKS_URL")
FILE_HANDLER_DOWNLOAD_LOCATION_JSON_URL = os.getenv("FILE_HANDLER_DOWNLOAD_LOCATION_JSON_URL")
GET_PAGE_COUNT_URL = os.getenv("GET_PAGE_COUNT_URL")
SAVE_JSON_AGGREGRATED_DATA_URL = os.getenv("SAVE_JSON_AGGREGRATED_DATA_URL")
DOWNLOAD_CHUNK_URL = os.getenv("DOWNLOAD_CHUNK_URL")
STATUS_UPDATE_URL = os.getenv("STATUS_UPDATE_URL")
FILE_HANDLER_COPY_CHUNKS_URL = os.getenv("FILE_HANDLER_COPY_CHUNKS_URL")
PARAPHRASE_API_URL = os.getenv("PARAPHRASE_API_URL")

class DatasetProcessor:
    def __init__(self):
        pass

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

    def _is_single_sheet_structure(self, data):
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

    def enrich_data(self, data, selected_fields, record_count):
        try:
            enriched_data = []
            for entry in data:
                enriched_entry = {}
                enrich_server = True
                for key, value in entry.items():
                    if isinstance(value, str) and (key in selected_fields):
                        enriched_value = self._get_paraphrases(value)
                        if enriched_value != []:
                            enriched_entry[key] = enriched_value[0]
                        else:
                            enrich_server = False
                            break
                    else:
                        enriched_entry[key] = value
                if enrich_server:
                    record_count += 1
                    enriched_entry["rowId"] = record_count
                    enriched_data.append(enriched_entry)
            return enriched_data
        except Exception as e:
            print(f"Internal Error occurred while data enrichment : {e}")
            return None

    def _get_paraphrases(self, text):
        payload = {
            "text": text,
            "num_return_sequences": 1
        }
        try:
            response = requests.post(PARAPHRASE_API_URL, json=payload)
            if response.status_code == 200:
                paraphrases = response.json().get("paraphrases", [])
                return paraphrases
            else:
                print(f"Failed to get paraphrases: {response.status_code}, {response.text}")
                return []
        except Exception as e:
            print(f"Error calling paraphrase API: {e}")
            return []

    
    def chunk_data(self, data, chunk_size=5):
        try:
            return [data[i:i + chunk_size] for i in range(0, len(data), chunk_size)]
        except Exception as e:
            print("Error while splitting data into chunks")
            return None
        
    def copy_chunked_datafiles(self, dgId, newDgId, cookie, exsistingChunks=None):
        try:
            headers = {
                'cookie': f'customJwtCookie={cookie}',
                'Content-Type': 'application/json'
            }

            if exsistingChunks == None:
                exsistingChunks = self.get_page_count(dgId, cookie)
                if exsistingChunks == None:
                    exsistingChunks = 0

            file_locations = []
            for filenumber in range(1, exsistingChunks+1):
                file_locations.append(f"chunks/{filenumber}.json")

            payload = {
                "dgId": dgId,
                "newDgId": newDgId,
                "fileLocations": file_locations
            }

            response = requests.post(FILE_HANDLER_COPY_CHUNKS_URL, json=payload, headers=headers)
            response.raise_for_status()
            return True
        except requests.exceptions.RequestException as e:
            print(f"An error occurred while coping chunk and calling the service to copy: {e}")
            return None
        except Exception as e2:
            print(f"An error occurred while coping chunk: {e}")
            return None
    
    def save_chunked_data(self, chunked_data, cookie, dgId, exsistingChunks=0):
        headers = {
            'cookie': f'customJwtCookie={cookie}',
            'Content-Type': 'application/json'
        }

        for index, chunk in enumerate(chunked_data):
            print("%$%$")
            print(chunk)
            payload = {
                "dg_id": dgId,
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

    def get_selected_data_fields(self, dgId:int, cookie:str):
        try:
            data_dict = self.get_validation_data(dgId, cookie)
            validation_rules = data_dict.get("response", {}).get("validationCriteria", {}).get("validationRules", {})
            text_fields = []
            for field, rules in validation_rules.items():
                if rules.get("type") == "text" and rules.get("isDataClass")!=True:
                    text_fields.append(field)
            return text_fields
        except Exception as e:
            print(e)
            return None
    
    def get_validation_data(self, dgId, custom_jwt_cookie):
        try:
            params = {'dgId': dgId}
            headers = {
            'cookie': custom_jwt_cookie
            }
            response = requests.get(GET_VALIDATION_SCHEMA, params=params, headers=headers)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"An error occurred: {e}")
            return None
        
    def get_dataset(self, dg_id, custom_jwt_cookie):
        params = {'dgId': dg_id}
        headers = {
            'cookie': custom_jwt_cookie
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
            'cookie': custom_jwt_cookie
        }

        try:
            response = requests.get(FILE_HANDLER_DOWNLOAD_LOCATION_JSON_URL, params=params, headers=headers)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"An error occurred: {e}")
            return None
        
    def get_stopwords(self, custom_jwt_cookie):
        headers = {
            'Cookie': f'customJwtCookie={custom_jwt_cookie}'
        }

        try:
            response = requests.get(self.GET_STOPWORDS_URL, headers=headers)
            response.raise_for_status()
            response_data = response.json()
            if response_data.get("operationSuccessful", False):
                return response_data.get("stopwords", [])
            else:
                return []
        except requests.exceptions.RequestException as e:
            print(f"An error occurred: {e}")
            return []

        
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
            print(f"Error while removing Stop Words : {e}")
            return None
        
    def get_page_count(self, dg_id, custom_jwt_cookie):
        headers = {
            'cookie': custom_jwt_cookie
        }

        try:
            page_count_url = GET_PAGE_COUNT_URL.replace("dgId",str(dg_id))
            response = requests.get(page_count_url, headers=headers)
            response.raise_for_status()
            data = response.json()

            page_count = data["response"]["data"][0]["numPages"]
            return page_count
        except requests.exceptions.RequestException as e:
            print(f"An error occurred: {e}")
            return None
    
    def save_aggregrated_data(self, dgId, cookie, aggregratedData):
        headers = {
            'cookie': f'customJwtCookie={cookie}',
            'Content-Type': 'application/json'
        }

        payload = {
            "dgId": dgId,
            "dataset": aggregratedData
        }
        try:
            response = requests.post(SAVE_JSON_AGGREGRATED_DATA_URL, json=payload, headers=headers)
            response.raise_for_status()
        except requests.exceptions.RequestException as e:
            print(f"An error occurred while uploading aggregrated dataset: {e}")
            return None
        
        return True

    def download_chunk(self, dgId, cookie, pageId):
        params = {'dgId': dgId, 'pageId': pageId}
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
                data["rowId"] = max_row_id
                processed_data.append(data)
            return processed_data
        except Exception as e:
            print(e)
            return None
        
    def update_preprocess_status(self,dg_id, cookie, processed_data_available, raw_data_available, preprocess_data_location, raw_data_location, enable_allowed, num_samples, num_pages):
        url = STATUS_UPDATE_URL
        print(url)
        headers = {
            'Content-Type': 'application/json',
            'Cookie': cookie
        }
        data = {
            "dgId": dg_id,
            "processedDataAvailable": processed_data_available,
            "rawDataAvailable": raw_data_available,
            "preprocessDataLocation": preprocess_data_location,
            "rawDataLocation": raw_data_location,
            "enableAllowed": enable_allowed,
            "numSamples": num_samples,
            "numPages": num_pages
        }

        try:
            response = requests.post(url, json=data, headers=headers)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"An error occurred: {e}")
            return None
        
    def process_handler(self, dgId, newDgId, cookie, updateType, savedFilePath, patchPayload):
        print(f"Process handler started with updateType: {updateType}")
        page_count = self.get_page_count(dgId, cookie)
        print(f"Page Count : {page_count}")
        
        if updateType == "minor" and page_count>0:
            updateType = "minor_append_update"
        elif updateType == "patch":
            pass
        else:
            updateType = "minor_initial_update"
        
        if updateType == "minor_initial_update":
            print("Handling Minor update")
            # dataset = self.get_dataset(dgId, cookie)
            dataset = self.get_dataset_by_location(savedFilePath, cookie)
            if dataset is not None:
                print("Dataset retrieved successfully")
                structured_data = self.check_and_convert(dataset)
                if structured_data is not None:
                    print("Dataset converted successfully")
                    selected_data_fields_to_enrich = self.get_selected_data_fields(newDgId, cookie)
                    if selected_data_fields_to_enrich is not None:
                        print("Selected data fields to enrich retrieved successfully")
                        max_row_id = max(item["rowId"] for item in structured_data)
                        enriched_data = self.enrich_data(structured_data, selected_data_fields_to_enrich, max_row_id)

                        agregated_dataset = structured_data + enriched_data
                        
                        if enriched_data is not None:
                            print("Data enrichment successful")
                            stop_words = self.get_stopwords(cookie)
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
                                        operation_result = self.save_chunked_data(chunked_data, cookie, newDgId, 0)
                                        if operation_result:
                                            print("Chunked data saved successfully")
                                            agregated_dataset_operation = self.save_aggregrated_data(newDgId, cookie, cleaned_data)
                                            if agregated_dataset_operation != None:
                                                return_data = self.update_preprocess_status(newDgId, cookie, True, False, f"/dataset/{newDgId}/chunks/", "", True, len(cleaned_data), len(chunked_data))
                                                print(return_data)
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
        elif updateType == "minor_append_update":
            print("Handling Minor update")
            agregated_dataset = self.get_dataset(dgId, cookie)
            max_row_id = max(item["rowId"] for item in agregated_dataset)
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
                        selected_data_fields_to_enrich = self.get_selected_data_fields(newDgId, cookie)
                        if selected_data_fields_to_enrich is not None:
                            print("Selected data fields to enrich for minor update retrieved successfully")
                            max_row_id = max(item["rowId"] for item in structured_data)
                            enriched_data = self.enrich_data(structured_data, selected_data_fields_to_enrich, max_row_id)
                            if enriched_data is not None:
                                print("Minor update data enrichment successful")
                                stop_words = self.get_stopwords(cookie)
                                if stop_words is not None:
                                    combined_new_dataset = structured_data + enriched_data
                                    print("Stop words for minor update retrieved successfully")
                                    cleaned_data = self.remove_stop_words(combined_new_dataset, stop_words)
                                    if cleaned_data is not None:
                                        print("Stop words for minor update removed successfully")
                                        chunked_data = self.chunk_data(cleaned_data)
                                        if chunked_data is not None:
                                            print("Minor update data chunking successful")
                                            page_count = self.get_page_count(dgId, cookie)
                                            if page_count is not None:
                                                print(f"Page count retrieved successfully: {page_count}")
                                                print(chunked_data)
                                                copy_exsisting_files = self.copy_chunked_datafiles(dgId, newDgId, cookie, page_count)
                                                if copy_exsisting_files is not None:
                                                    operation_result = self.save_chunked_data(chunked_data, cookie, newDgId, page_count)
                                                    if operation_result is not None:
                                                        print("Chunked data for minor update saved successfully")
                                                        agregated_dataset += cleaned_data
                                                        agregated_dataset_operation = self.save_aggregrated_data(newDgId, cookie, agregated_dataset)
                                                        if agregated_dataset_operation:
                                                            print("Aggregated dataset for minor update saved successfully")
                                                            return_data = self.update_preprocess_status(newDgId, cookie, True, False, f"/dataset/{newDgId}/chunks/", "", True, len(agregated_dataset), (len(chunked_data)+page_count))
                                                            print(return_data)  
                                                            return SUCCESSFUL_OPERATION
                                                        else:
                                                            print("Failed to save aggregated dataset for minor update")
                                                            return FAILED_TO_SAVE_AGGREGATED_DATA
                                                    else:
                                                        print("Failed to save chunked data for minor update")
                                                        return FAILED_TO_SAVE_CHUNKED_DATA
                                                else:
                                                    print("Failed to copy existing chunked data for minor update")
                                                    return FAILED_TO_COPY_CHUNKED_DATA
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
        elif updateType == "patch":
            decoded_string = urllib.parse.unquote(patchPayload)
            data_payload = json.loads(decoded_string)
            if (data_payload["editedData"]!=[]):
                print("Handling Patch update")
                stop_words = self.get_stopwords(cookie)
                if stop_words is not None:
                    print("Stop words for patch update retrieved successfully")
                    cleaned_patch_payload = self.remove_stop_words(data_payload["editedData"], stop_words)
                    if cleaned_patch_payload is not None:
                        print("Stop words for patch update removed successfully")
                        page_count = self.get_page_count(dgId, cookie)
                        if page_count is not None:
                            print(f"Page count for patch update retrieved successfully: {page_count}")
                            print(cleaned_patch_payload)
                            chunk_updates = {}
                            for entry in cleaned_patch_payload:
                                rowId = entry.get("rowId")
                                rowId = int(rowId)
                                chunkNum = (rowId - 1) // 5 + 1
                                if chunkNum not in chunk_updates:
                                    chunk_updates[chunkNum] = []
                                chunk_updates[chunkNum].append(entry)
                            print(f"Chunk updates prepared: {chunk_updates}")
                            for chunkNum, entries in chunk_updates.items():
                                chunk_data = self.download_chunk(dgId, cookie, chunkNum)
                                if chunk_data is not None:
                                    print(f"Chunk {chunkNum} downloaded successfully")
                                    for entry in entries:
                                        rowId = entry.get("rowId")
                                        rowId = int(rowId)
                                        for idx, chunk_entry in enumerate(chunk_data):
                                            if chunk_entry.get("rowId") == rowId:
                                                chunk_data[idx] = entry
                                                break
                                    chunk_save_operation = self.save_chunked_data([chunk_data], cookie, dgId, chunkNum-1)
                                    if chunk_save_operation == None:
                                        print(f"Failed to save chunk {chunkNum}")
                                        return FAILED_TO_SAVE_CHUNKED_DATA
                                else:
                                    print(f"Failed to download chunk {chunkNum}")
                                    return FAILED_TO_DOWNLOAD_CHUNK
                            agregated_dataset = self.get_dataset(dgId, cookie)
                            if agregated_dataset is not None:
                                print("Aggregated dataset for patch update retrieved successfully")
                                for entry in cleaned_patch_payload:
                                    rowId = entry.get("rowId")
                                    rowId = int(rowId)
                                    for index, item in enumerate(agregated_dataset):
                                        if item.get("rowId") == rowId:
                                            entry["rowId"] = rowId
                                            del entry["rowId"]
                                            agregated_dataset[index] = entry
                                            break

                                save_result_update = self.save_aggregrated_data(dgId, cookie, agregated_dataset)
                                if save_result_update:
                                    print("Aggregated dataset for patch update saved successfully")
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
                
            print(data_payload["deletedDataRows"])
            if (data_payload["deletedDataRows"]!=[]):
                try:
                    print("Handling deleted data rows")
                    deleted_rows = data_payload["deletedDataRows"]
                    aggregated_dataset = self.get_dataset(dgId, cookie)
                    if aggregated_dataset is not None:
                        print("Aggregated dataset for delete operation retrieved successfully")
                        updated_dataset = [row for row in aggregated_dataset if row.get('rowId') not in deleted_rows]
                        for idx, row in enumerate(updated_dataset, start=1):
                            row['rowId'] = idx
                        if updated_dataset is not None:
                            print("Deleted rows removed and dataset updated successfully")
                            chunked_data = self.chunk_data(updated_dataset)
                            if chunked_data is not None:
                                print("Data chunking after delete operation successful")
                                print(chunked_data)
                                operation_result = self.save_chunked_data(chunked_data, cookie, dgId, 0)
                                if operation_result:
                                    print("Chunked data after delete operation saved successfully")
                                    save_result_delete = self.save_aggregrated_data(dgId, cookie, updated_dataset)
                                    if save_result_delete:
                                        print("Aggregated dataset after delete operation saved successfully")
                                    else:
                                        print("Failed to save aggregated dataset after delete operation")
                                        return FAILED_TO_SAVE_AGGREGATED_DATA
                                else:
                                    print("Failed to save chunked data after delete operation")
                                    return FAILED_TO_SAVE_CHUNKED_DATA
                            else:
                                print("Failed to chunk data after delete operation")
                                return FAILED_TO_CHUNK_CLEANED_DATA
                        else:
                            print("Failed to update dataset after deleting rows")
                            return FAILED_TO_UPDATE_DATASET
                    else:
                        print("Failed to retrieve aggregated dataset for delete operation")
                        return FAILED_TO_GET_AGGREGATED_DATASET
                except Exception as e:
                    print(f"An error occurred while handling deleted data rows: {e}")
                    return FAILED_TO_HANDLE_DELETED_ROWS

            if data_payload["editedData"]==[] and data_payload["deletedDataRows"]==[]:
                return SUCCESSFUL_OPERATION
            elif data_payload["editedData"]!=[] and data_payload["deletedDataRows"]==[]:
                if save_result_update:
                    return SUCCESSFUL_OPERATION
                else:
                    return FAILED_TO_SAVE_AGGREGATED_DATA
            elif data_payload["editedData"]==[] and data_payload["deletedDataRows"]!=[]:
                if save_result_delete:
                    return_data = self.update_preprocess_status(dgId, cookie, True, False, f"/dataset/{dgId}/chunks/", "", True, len(updated_dataset), len(chunked_data))
                    print(return_data)
                    return SUCCESSFUL_OPERATION
                else:
                    return FAILED_TO_SAVE_AGGREGATED_DATA
            elif data_payload["editedData"]!=[] and data_payload["deletedDataRows"]!=[]:
                if save_result_update and save_result_delete:
                    return_data = self.update_preprocess_status(dgId, cookie, True, False, f"/dataset/{dgId}/chunks/", "", True, len(updated_dataset), len(chunked_data))
                    print(return_data)
                    return SUCCESSFUL_OPERATION
                else:
                    return FAILED_TO_SAVE_AGGREGATED_DATA

                



