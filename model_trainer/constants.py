
#TODO - REFACTOR CODE TO CREATE A GENERIC FUNCTION HERE WHICH WILL CONSTRUCT AND RETURN THE CONSTANTS IN A DICTIONARY WHICH CAN BE REFERENCED IN ALL PARTS OF THE CODE

DATA_DOWNLOAD_ENDPOINT = "http://file-handler:8000/datasetgroup/data/download/json"

GET_DATASET_METADATA_ENDPOINT = "http://ruuter-private:8088/classifier/datasetgroup/group/metadata"

GET_MODEL_METADATA_ENDPOINT= "http://ruuter-private:8088/classifier/datamodel/metadata"

DEPLOYMENT_ENDPOINT = "http://ruuter-private:8088/classifier/datamodel/deployment/{deployment_platform}/update"

TRAINING_LOGS_PATH = "/app/model_trainer/training_logs.log"

MODEL_RESULTS_PATH = "/shared/model_trainer/results" #stored in the shared folder which is connected to s3-ferry

LOCAL_BASEMODEL_TRAINED_LAYERS_SAVE_PATH = "/shared/model_trainer/results/{model_id}/trained_base_model_layers" #stored in the shared folder which is connected to s3-ferry

LOCAL_CLASSIFICATION_LAYER_SAVE_PATH = "/shared/model_trainer/results/{model_id}/classifier_layers" #stored in the shared folder which is connected to s3-ferry

LOCAL_LABEL_ENCODER_SAVE_PATH = "/shared/model_trainer/results/{model_id}/label_encoders" #stored in the shared folder which is connected to s3-ferry

S3_FERRY_MODEL_STORAGE_PATH = "/models" #folder path in s3 bucket


BASE_MODEL_FILENAME = "base_model_trainable_layers_{model_id}"

CLASSIFIER_MODEL_FILENAME = "classifier_{model_id}.pth"


