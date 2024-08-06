import os
import json
import requests
from s3_ferry import S3Ferry

GET_PAGE_COUNT_URL = os.getenv("GET_PAGE_COUNT_URL")
UPLOAD_DIRECTORY = os.getenv("UPLOAD_DIRECTORY", "/shared")

class DatasetDeleter:
    def __init__(self, s3_ferry_url):
        self.s3_ferry = S3Ferry(s3_ferry_url)

    def get_page_count(self, dg_id, custom_jwt_cookie):
        headers = {
            'cookie': custom_jwt_cookie
        }

        try:
            page_count_url = GET_PAGE_COUNT_URL.replace("dgId", str(dg_id))
            response = requests.get(page_count_url, headers=headers)
            response.raise_for_status()
            data = response.json()
            print(page_count_url)
            print(f"data : {data}")

            page_count = data["response"]["data"][0]["numPages"]
            return page_count
        except requests.exceptions.RequestException as e:
            print(f"An error occurred: {e}")
            return None

    def delete_dataset_files(self, dg_id, cookie):
        print("Reach : 3")
        page_count = self.get_page_count(dg_id, cookie)
        print(f"Page count : {page_count}")

        if page_count is None:
            print(f"Failed to get page count for dg_id: {dg_id}")
            return False, 0

        file_locations = [
            f"/dataset/{dg_id}/primary_dataset/dataset_{dg_id}_aggregated.json",
            f"/dataset/{dg_id}/temp/temp_dataset.json"
        ]

        if page_count>0:
            print("Reach : 4")
            for page_id in range(1, page_count + 1):
                file_locations.append(f"/dataset/{dg_id}/chunks/{page_id}.json")

        print(f"Reach : 5 > {file_locations}")
        empty_json_path = os.path.join(UPLOAD_DIRECTORY, "empty.json")
        with open(empty_json_path, 'w') as empty_file:
            json.dump({}, empty_file)

        success_count = 0
        for file_location in file_locations:
            response = self.s3_ferry.transfer_file(file_location, "S3", empty_json_path, "FS")
            if response.status_code == 201:
                success_count += 1
                print("SUCESS : FILE DELETED")
            else:
                print(f"Failed to transfer file to {file_location}")

        all_files_deleted = success_count >= len(file_locations)-2
        os.remove(empty_json_path)
        print(f"Dataset Deletion Final  : {all_files_deleted} / {success_count}")
        return all_files_deleted, success_count