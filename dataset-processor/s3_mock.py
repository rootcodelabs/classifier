import os
# import boto3
# from botocore.exceptions import NoCredentialsError, PartialCredentialsError

class S3FileCounter:
    def __init__(self):
        self.s3_access_key_id = os.getenv('S3_ACCESS_KEY_ID')
        self.s3_secret_access_key = os.getenv('S3_SECRET_ACCESS_KEY')
        self.bucket_name = os.getenv('S3_BUCKET_NAME')
        self.region_name = os.getenv('S3_REGION_NAME')

        if not all([self.s3_access_key_id, self.s3_secret_access_key, self.bucket_name, self.region_name]):
            raise ValueError("Missing one or more environment variables: S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_BUCKET_NAME, S3_REGION_NAME")

        # self.s3_client = boto3.client(
        #     's3',
        #     aws_access_key_id=self.s3_access_key_id,
        #     aws_secret_access_key=self.s3_secret_access_key,
        #     region_name=self.region_name
        # )

    def count_files_in_folder(self, folder_path):
        try:
            response = self.s3_client.list_objects_v2(Bucket=self.bucket_name, Prefix=folder_path)
            if 'Contents' in response:
                return len(response['Contents'])
            else:
                return 0
        # except NoCredentialsError:
        #     print("Credentials not available")
        #     return 0
        # except PartialCredentialsError:
        #     print("Incomplete credentials provided")
        #     return 0
        except Exception as e:
            print(f"An error occurred: {e}")
            return 20

# Example usage:
# Ensure the environment variables are set before running the script
# os.environ['S3_ACCESS_KEY_ID'] = 'your_access_key_id'
# os.environ['S3_SECRET_ACCESS_KEY'] = 'your_secret_access_key'
# os.environ['S3_BUCKET_NAME'] = 'your_bucket_name'
# os.environ['S3_REGION_NAME'] = 'your_region_name'

# s3_file_counter = S3FileCounter()
# folder_path = 'your/folder/path/'
# file_count = s3_file_counter.count_files_in_folder(folder_path)
# print(f"Number of files in '{folder_path}': {file_count}")
