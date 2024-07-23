import requests

class S3Ferry:
    def __init__(self, url):
        self.url = url

    def transfer_file(self, destinationFilePath, destinationStorageType, sourceFilePath, sourceStorageType):
        payload = {
            "destinationFilePath": destinationFilePath,
            "destinationStorageType": destinationStorageType,
            "sourceFilePath": sourceFilePath,
            "sourceStorageType": sourceStorageType
        }

        response = requests.post(self.url, json=payload)
        return response
