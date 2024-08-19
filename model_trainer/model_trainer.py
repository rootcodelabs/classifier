from datapipeline import DataPipeline
from trainingpipeline import TrainingPipeline
import os
import requests
import torch
import pickle
import shutil
from s3_ferry import S3Ferry
from constants import  GET_MODEL_METADATA_ENDPOINT, DEPLOYMENT_ENDPOINT,TRAINING_LOGS_PATH, MODEL_RESULTS_PATH, \
                        LOCAL_BASEMODEL_TRAINED_LAYERS_SAVE_PATH,LOCAL_CLASSIFICATION_LAYER_SAVE_PATH, \
                        LOCAL_LABEL_ENCODER_SAVE_PATH, S3_FERRY_MODEL_STORAGE_PATH
from loguru import logger

logger.add(sink=TRAINING_LOGS_PATH)

#TODO - REFACTOR CODE TO CREATE A GENERIC FUNCTION HERE WHICH WILL CONSTRUCT AND RETURN THE CONSTANTS IN A DICTIONARY WHICH CAN BE REFERENCED IN ALL PARTS OF THE CODE

class ModelTrainer:
    def __init__(self, cookie, new_model_id,old_model_id) -> None:

        model_url = GET_MODEL_METADATA_ENDPOINT

        self.new_model_id = new_model_id
        self.old_model_id = old_model_id
        self.cookie = cookie
        
        cookies = {'customJwtCookie': cookie}

        logger.info("GETTING MODEL METADATA")

        response = requests.get(model_url, params = {'modelId': self.new_model_id}, cookies=cookies)
                    
        if response.status_code == 200:
            self.model_details = response.json()
            logger.info("SUCCESSFULLY RECIEVED MODEL DETAILS")
        else:
            
            logger.error(f"FAILED WITH STATUS CODE: {response.status_code}")
            logger.error(f"RESPONSE: {response.text}")

            raise RuntimeError(f"RESPONSE : {response.text}")
        
    @staticmethod
    def create_training_folders(folder_paths):

        logger.info("CREATING FOLDER PATHS")

        try:

            for folder_path in folder_paths:
                if not os.path.exists(folder_path):
                    os.makedirs(folder_path)
            
            logger.success(f"SUCCESSFULLY CREATED MODEL FOLDER PATHS : {folder_paths}")

        except Exception as e:

            logger.error(f"FAILED TO CREATE MODEL FOLDER PATHS : {folder_paths}")
            raise RuntimeError(e)

    def train(self):

        s3_ferry = S3Ferry()
        dg_id = self.model_details['response']['data'][0]['connectedDgId']
        data_pipeline = DataPipeline(dg_id, self.cookie)
        dfs = data_pipeline.create_dataframes()
        models_inference_metadata,_  = data_pipeline.models_and_filters()
        models_to_train = self.model_details['response']['data'][0]['baseModels']

        local_basemodel_layers_save_path = LOCAL_BASEMODEL_TRAINED_LAYERS_SAVE_PATH.format(model_id=self.new_model_id)
        local_classification_layer_save_path = LOCAL_CLASSIFICATION_LAYER_SAVE_PATH.format(model_id=self.new_model_id)
        local_label_encoder_save_path = LOCAL_LABEL_ENCODER_SAVE_PATH.format(model_id=self.new_model_id)


        ModelTrainer.create_training_folders([local_basemodel_layers_save_path,
                                              local_classification_layer_save_path,
                                              local_label_encoder_save_path])
        
        with open(f'{MODEL_RESULTS_PATH}/{self.new_model_id}/models_dets.pkl', 'wb') as file:
            pickle.dump(models_inference_metadata, file)

        selected_models = []
        selected_classifiers = []
        selected_label_encoders = []
        average_accuracy = []
        logger.info(f"MODELS TO BE TRAINED: {models_to_train}")

        for i in range(len(models_to_train)):
            training_pipeline =  TrainingPipeline(dfs, models_to_train[i])
            metrics, models, classifiers, label_encoders = training_pipeline.train()
            selected_models.append(models)
            selected_classifiers.append(classifiers)
            selected_label_encoders.append(label_encoders)
            average = sum(metrics[1]) / len(metrics[1])
            average_accuracy.append(average)

        max_value_index = average_accuracy.index(max(average_accuracy))
        best_model_base = selected_models[max_value_index]
        best_model_classifier = selected_classifiers[max_value_index]
        best_model_label_encoder = selected_label_encoders[max_value_index]
        best_model_name = models_to_train[max_value_index]

        logger.info("TRAINING COMPLETE")
        logger.info(f"THE BEST PERFORMING MODEL IS {best_model_name}")

        torch.save(best_model_base, f"{local_basemodel_layers_save_path}/base_model_trainable_layers_{self.new_model_id}.pth")
        torch.save(best_model_classifier, f"{local_classification_layer_save_path}/classifier_{self.new_model_id}.pth")
        
        label_encoder_path = f"{local_label_encoder_save_path}/label_encoder_{self.new_model_id}.pkl"
        with open(label_encoder_path, 'wb') as file:
            pickle.dump(best_model_label_encoder, file)

        
        model_zip_path = f"{MODEL_RESULTS_PATH}/{str(self.new_model_id)}"

        shutil.make_archive(base_name=model_zip_path, root_dir=model_zip_path, format="zip") 
        
        save_location = f"{S3_FERRY_MODEL_STORAGE_PATH}/{str(self.new_model_id)}/{str(self.new_model_id)}.zip"
        source_location = f"{MODEL_RESULTS_PATH.replace('/shared/','')}/{str(self.new_model_id)}.zip" # Removing 'shared/' path here so that S3 ferry source file path works without any issue

        logger.info("INITIATING MODEL UPLOAD TO S3")
        logger.info(f"SOURCE LOCATION - {source_location}")
        logger.info(f"S3 SAVE LOCATION - {save_location}")
        
        response = s3_ferry.transfer_file(save_location, "S3", source_location, "FS")
        
        if response.status_code == 201:
            logger.info(f"MODEL FILE UPLOADED SUCCESSFULLY TO {save_location}")
        
        else:
            logger.error(f"MODEL FILE UPLOAD TO {save_location} FAILED")
            logger.error(f"RESPONSE: {response.text}")
            raise RuntimeError(f"RESPONSE STATUS: {response.text}")
        
 
        deployment_platform = self.model_details['response']['data'][0]['deploymentEnv']

        logger.info(f"INITIATING DEPLOYMENT TO {deployment_platform}")

        deploy_url = DEPLOYMENT_ENDPOINT.format(deployment_platform = deployment_platform)

    
    ## CODE SHOULD BE UPDATED TO CHECK WHETHER old_model_id  == new_model_id (because that is how ruuter sends the request if it's a model create operation) 
        if self.old_model_id is not None:
            
            payload = {
                "modelId": self.new_model_id,
                "replaceDeployment": True,
                "replaceDeploymentPlatform":deployment_platform,
                "bestModelName":best_model_name
            }
        
        else:
            payload = {
                "modelId": self.new_model_id,
                "replaceDeployment": False,
                "replaceDeploymentPlatform": deployment_platform,
                "bestModelName":best_model_name
            }

        response = requests.post(deploy_url, json=payload)

        if response.status_code == 201 or response.status_code == 200:
            logger.info(f"{deployment_platform} DEPLOYMENT SUCCESSFUL")
        
        else:
            logger.error(f"{deployment_platform} DEPLOYMENT FAILED")
            logger.info(f"RESPONSE: {response.text}")

            raise RuntimeError(f"RESPONSE : {response.text}")

