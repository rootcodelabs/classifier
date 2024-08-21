import requests
from utils import get_s3_payload

class S3Ferry:
    def __init__(self, url):
        self.url = url

    def transfer_file(self, destinationFilePath, destinationStorageType, sourceFilePath, sourceStorageType):
        print("Transfer File Method Calling")
        print(f"Destination Path :{destinationFilePath}",
              f"Destination Storage  :{destinationStorageType}",
              f"Source File Path :{sourceFilePath}",
              f"Source Storage Type :{sourceStorageType}",
              sep="\n"
              )
        payload = get_s3_payload(destinationFilePath, destinationStorageType, sourceFilePath, sourceStorageType)
        print(payload)
        print(f"url : {self.url}")
        response = requests.post(self.url, json=payload)
        print(response)
        return response
