import requests

class S3Ferry:
    def __init__(self):
        self.url = "http://s3-ferry:3000/v1/files/copy"

    def transfer_file(self, destinationFilePath, destinationStorageType, sourceFilePath, sourceStorageType):
        payload = self.get_s3_ferry_payload(destinationFilePath, destinationStorageType, sourceFilePath, sourceStorageType)

        response = requests.post(self.url, json=payload)
        return response

    def get_s3_ferry_payload(self, destinationFilePath:str, destinationStorageType:str, sourceFilePath:str, sourceStorageType:str):
        S3_FERRY_PAYLOAD = {
                "destinationFilePath": destinationFilePath,
                "destinationStorageType": destinationStorageType,
                "sourceFilePath": sourceFilePath,
                "sourceStorageType": sourceStorageType
            }
        return S3_FERRY_PAYLOAD
