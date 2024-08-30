from datapipeline import DataPipeline
from trainingpipeline import TrainingPipeline
import os
import requests
import torch
import pickle
import shutil
from datetime import datetime
from s3_ferry import S3Ferry
from constants import  GET_MODEL_METADATA_ENDPOINT,  OUTLOOK_DEPLOYMENT_ENDPOINT, JIRA_DEPLOYMENT_ENDPOINT, TEST_DEPLOYMENT_ENDPOINT ,UPDATE_MODEL_TRAINING_STATUS_ENDPOINT, CREATE_TRAINING_PROGRESS_SESSION_ENDPOINT, UPDATE_TRAINING_PROGRESS_SESSION_ENDPOINT, TRAINING_LOGS_PATH, MODEL_RESULTS_PATH, \
                        LOCAL_BASEMODEL_TRAINED_LAYERS_SAVE_PATH,LOCAL_CLASSIFICATION_LAYER_SAVE_PATH, \
                        LOCAL_LABEL_ENCODER_SAVE_PATH, S3_FERRY_MODEL_STORAGE_PATH, MODEL_TRAINING_IN_PROGRESS, MODEL_TRAINING_SUCCESSFUL, \
                        INITIATING_TRAINING_PROGRESS_STATUS, TRAINING_IN_PROGRESS_PROGRESS_STATUS, DEPLOYING_MODEL_PROGRESS_STATUS,  \
                        INITIATING_TRAINING_PROGRESS_MESSAGE, TRAINING_IN_PROGRESS_PROGRESS_MESSAGE, DEPLOYING_MODEL_PROGRESS_MESSAGE,  \
                        INITIATING_TRAINING_PROGRESS_PERCENTAGE, TRAINING_IN_PROGRESS_PROGRESS_PERCENTAGE, DEPLOYING_MODEL_PROGRESS_PERCENTAGE, \
                        OUTLOOK, JIRA, TESTING
from loguru import logger

logger.add(sink=TRAINING_LOGS_PATH)

class ModelTrainer:
    def __init__(self, cookie, new_model_id,old_model_id,prev_deployment_env,update_type) -> None:

        model_url = GET_MODEL_METADATA_ENDPOINT

        self.new_model_id = int(new_model_id)
        self.old_model_id = int(old_model_id)
        self.prev_deployment_env = prev_deployment_env
        self.cookie = cookie
        self.update_type = update_type
        
        self.cookies_payload = {'customJwtCookie': cookie}

        logger.info(f"COOKIES PAYLOAD - {self.cookies_payload}")

        logger.info("GETTING MODEL METADATA")

        if self.update_type == "retrain":
            logger.info(f"ENTERING INTO RETRAIN SEQUENCE FOR MODELID - {self.new_model_id}")

        response = requests.get(model_url, params = {'modelId': self.new_model_id}, cookies=self.cookies_payload)

        #only for model create and retrain operations old_model_id=new_model_id
        if self.old_model_id==self.new_model_id:
            self.replace_deployment = False

        else:
            self.replace_deployment = True


        if response.status_code == 200:
            self.model_details = response.json()
            self.current_deployment_platform = self.model_details['response']['data'][0]['deploymentEnv']


            logger.info("SUCCESSFULLY RECIEVED MODEL DETAILS")
            logger.info(f"MODEL DETAILS - {self.model_details}")
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
    

    def update_model_db_training_status(self,training_status, model_s3_location,
                                        last_trained_time_stamp,training_results, inference_routes):

        training_results_payload = {"trainingResults":{}}

        if len(training_results) == 3:
            logger.info(f"UPDATE TRAINING STATUS DB RESULTS PAYLOAD: {training_results}")
            training_results_payload["trainingResults"]["classes"] = training_results[0]
            training_results_payload["trainingResults"]["accuracy"] = training_results[1]
            training_results_payload["trainingResults"]["f1_score"] = training_results[2]

        payload = {}
        payload["modelId"] = self.new_model_id
        payload["trainingStatus"] = training_status
        payload["modelS3Location"] = model_s3_location
        payload["lastTrainedTimestamp"] = last_trained_time_stamp
        payload["trainingResults"] = training_results_payload
        payload["inferenceRoutes"] = {"inference_routes":inference_routes}

        logger.info(f"{training_status} UPLOAD PAYLOAD - \n {payload}")

        response = requests.post( url=UPDATE_MODEL_TRAINING_STATUS_ENDPOINT,
                        json=payload, cookies=self.cookies_payload)
        
        if response.status_code==200:
            logger.info(f"REQUEST TO UPDATE MODEL TRAINING STATUS TO {training_status} SUCCESSFUL")
        
        else:
            logger.error(f"REQUEST TO UPDATE MODEL TRAINING STATUS TO {training_status} FAILED")
            logger.error(f"ERROR RESPONSE {response.text}")
            raise RuntimeError(response.text)
        
    def create_model_training_progress_session(self):

        payload = {}
        session_id = None
        model_details = self.model_details['response']['data'][0]
        payload["modelId"] = self.new_model_id
        payload["modelName"] = model_details["modelName"]
        payload["majorVersion"] = model_details["majorVersion"]
        payload["minorVersion"] = model_details["minorVersion"]
        payload["latest"] = model_details["latest"]


        logger.info(f"Create training progress session for model id - {self.new_model_id} payload \n {payload}")

        response = requests.post( url=CREATE_TRAINING_PROGRESS_SESSION_ENDPOINT,
                                 json=payload, cookies=self.cookies_payload)
        
        
        if response.status_code==200:

            logger.info(f"REQUEST TO CREATE TRAINING PROGRESS SESSION FOR MODEL ID {self.new_model_id} SUCCESSFUL")
            logger.info(f"RESPONSE PAYLOAD \n {response.json()}")
            session_id = response.json()["response"]["sessionId"]
            

        else:
            logger.error(f"REQUEST TO CREATE TRAINING PROGRESS SESSION FOR MODEL ID {self.new_model_id} FAILED")
            logger.error(f"ERROR RESPONSE JSON {response.json()}")
            logger.error(f"ERROR RESPONSE TEXT {response.text}")
            raise RuntimeError(response.text)


        return session_id
    

    def update_model_training_progress_session(self,session_id,training_status, 
                                               training_progress_update_message, training_progress_percentage,
                                               process_complete):

        payload = {}

        payload["sessionId"] = session_id
        payload["trainingStatus"] =  training_status
        payload["trainingMessage"] = training_progress_update_message
        payload["progressPercentage"] = training_progress_percentage
        payload["processComplete"] = process_complete

        logger.info(f"Update training progress session for model id - {self.new_model_id} payload \n {payload}")

        response=requests.post( url=UPDATE_TRAINING_PROGRESS_SESSION_ENDPOINT,
                                 json=payload, cookies=self.cookies_payload)
        

        if response.status_code==200:

            logger.info(f"REQUEST TO UPDATE TRAINING PROGRESS SESSION FOR MODEL ID {self.new_model_id} SUCCESSFUL")
            logger.info(f"RESPONSE PAYLOAD \n {response.json()}")
            session_id = response.json()["response"]["sessionId"]
            

        else:
            logger.error(f"REQUEST TO UPDATE TRAINING PROGRESS SESSION FOR MODEL ID {self.new_model_id} FAILED")
            logger.error(f"ERROR RESPONSE JSON {response.json()}")
            logger.error(f"ERROR RESPONSE TEXT {response.text}")
            raise RuntimeError(response.text)


        return session_id

        
    def deploy_model(self, best_model_name, progress_session_id):
        
        payload = {}
        payload["modelId"] = self.new_model_id
        payload["oldModelId"] = self.old_model_id
        payload["replaceDeployment"] = self.replace_deployment
        payload["replaceDeploymentPlatform"] = self.prev_deployment_env
        payload["bestBaseModel"] = best_model_name
        payload["progressSessionId"] = progress_session_id
        payload["updateType"] = self.update_type

        if self.update_type == "retrain":
            payload["replaceDeploymentPlatform"] = self.current_deployment_platform

        logger.info(f"SENDING MODEL DEPLOYMENT REQUEST FOR MODEL ID - {self.new_model_id}")
        logger.info(f"MODEL DEPLOYMENT PAYLOAD - {payload}")
        
        deployment_url = None

        if self.current_deployment_platform == JIRA:

            deployment_url = JIRA_DEPLOYMENT_ENDPOINT
        
        elif self.current_deployment_platform == OUTLOOK:

            deployment_url = OUTLOOK_DEPLOYMENT_ENDPOINT

        elif self.current_deployment_platform == TESTING:

            deployment_url  = TEST_DEPLOYMENT_ENDPOINT

        else:
            
            logger.info(f"UNRECOGNIZED DEPLOYMENT PLATFORM - {self.current_deployment_platform}")
            raise RuntimeError(f"RUNTIME ERROR - UNRECOGNIZED DEPLOYMENT PLATFORM - {self.current_deployment_platform}")
        

        response = requests.post( url=deployment_url, 
                                 json=payload, cookies=self.cookies_payload)



        if response.status_code==200:

            logger.info(f"REQUEST TO DEPLOY MODEL ID {self.new_model_id} SUCCESSFUL")
            logger.info(f"RESPONSE PAYLOAD \n {response.json()}")
            

        else:
            logger.error(f"REQUEST TO DEPLOY MODEL ID {self.new_model_id} FAILED")
            logger.error(f"ERROR RESPONSE JSON {response.json()}")
            logger.error(f"ERROR RESPONSE TEXT {response.text}")
            raise RuntimeError(response.text)


        
    def train(self):
        
        try:
            #updating model training status to in-progress
            current_timestamp = int(datetime.now().timestamp())
            self.update_model_db_training_status(training_status=MODEL_TRAINING_IN_PROGRESS,
                                                model_s3_location="",
                                                last_trained_time_stamp=current_timestamp,
                                                training_results={},
                                                inference_routes={})


            deployment_platform = self.model_details['response']['data'][0]['deploymentEnv']

            session_id = self.create_model_training_progress_session()

            self.update_model_training_progress_session(session_id=session_id, 
                                                        training_status=INITIATING_TRAINING_PROGRESS_STATUS,
                                                        training_progress_update_message=INITIATING_TRAINING_PROGRESS_MESSAGE.format(deployment_platform=deployment_platform),
                                                        training_progress_percentage=INITIATING_TRAINING_PROGRESS_PERCENTAGE,
                                                        process_complete=False
                                                        )


            

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
            selected_metrics = []
            average_accuracy = []
            logger.info(f"MODELS TO BE TRAINED: {models_to_train}")

            self.update_model_training_progress_session(session_id=session_id, 
                                                training_status=TRAINING_IN_PROGRESS_PROGRESS_STATUS,
                                                training_progress_update_message=TRAINING_IN_PROGRESS_PROGRESS_MESSAGE,
                                                training_progress_percentage=TRAINING_IN_PROGRESS_PROGRESS_PERCENTAGE,
                                                process_complete=False
                                                )


            for i in range(len(models_to_train)):
                training_pipeline =  TrainingPipeline(dfs, models_to_train[i])
                metrics, models, classifiers, label_encoders = training_pipeline.train()
                selected_models.append(models)
                selected_classifiers.append(classifiers)
                selected_metrics.append(metrics)
                selected_label_encoders.append(label_encoders)
                average = sum(metrics[1]) / len(metrics[1])
                average_accuracy.append(average)

            max_value_index = average_accuracy.index(max(average_accuracy))
            best_model_base = selected_models[max_value_index]
            best_model_classifier = selected_classifiers[max_value_index]
            best_model_label_encoder = selected_label_encoders[max_value_index]
            best_model_name = models_to_train[max_value_index]
            best_model_metrics = selected_metrics[max_value_index]

            logger.info(f"BEST MODEL METRICS - {best_model_metrics}")

            logger.info("TRAINING COMPLETE")
            logger.info(f"THE BEST PERFORMING MODEL IS {best_model_name}")

            for i, (model, classifier, label_encoder) in enumerate(zip(best_model_base, best_model_classifier, best_model_label_encoder)):
                torch.save(model, f"{local_basemodel_layers_save_path}/last_two_layers_dfs_{i}.pth")
                torch.save(classifier, f"{local_classification_layer_save_path}/classifier_{i}.pth")
                
                label_encoder_path = f"{local_label_encoder_save_path}/label_encoder_{i}.pkl"
                with open(label_encoder_path, 'wb') as file:
                    pickle.dump(label_encoder, file)
            
            model_zip_path = f"{MODEL_RESULTS_PATH}/{str(self.new_model_id)}"

            shutil.make_archive(base_name=model_zip_path, root_dir=model_zip_path, format="zip") 
            
            s3_save_location = f"{S3_FERRY_MODEL_STORAGE_PATH}/{str(self.new_model_id)}/{str(self.new_model_id)}.zip"
            local_source_location = f"{MODEL_RESULTS_PATH.replace('/shared/','')}/{str(self.new_model_id)}.zip" # Removing 'shared/' path here so that S3 ferry source file path works without any issue

            logger.info("INITIATING MODEL UPLOAD TO S3")
            logger.info(f"SOURCE LOCATION - {local_source_location}")
            logger.info(f"S3 SAVE LOCATION - {s3_save_location}")
            
            response = s3_ferry.transfer_file(s3_save_location, "S3", local_source_location, "FS")
            
            if response.status_code == 201:
                logger.info(f"MODEL FILE UPLOADED SUCCESSFULLY TO {s3_save_location}")
            
            else:
                logger.error(f"MODEL FILE UPLOAD TO {s3_save_location} FAILED")
                logger.error(f"RESPONSE: {response.text}")
                raise RuntimeError(f"RESPONSE STATUS: {response.text}")
            

            current_timestamp = int(datetime.now().timestamp())
            self.update_model_db_training_status(training_status=MODEL_TRAINING_SUCCESSFUL,
                                                model_s3_location=s3_save_location,
                                                last_trained_time_stamp=current_timestamp,
                                                training_results=best_model_metrics, 
                                                inference_routes=models_inference_metadata)
            

            logger.info(f"FINAL MODEL TRAINING PROGRESS SESSION UPDATE {deployment_platform}")

            self.update_model_training_progress_session(session_id=session_id, 
                                                training_status=DEPLOYING_MODEL_PROGRESS_STATUS,
                                                training_progress_update_message=DEPLOYING_MODEL_PROGRESS_MESSAGE,
                                                training_progress_percentage=DEPLOYING_MODEL_PROGRESS_PERCENTAGE,
                                                process_complete=False
                                                )


            logger.info(f"INITIATING DEPLOYMENT TO {deployment_platform}")

            self.deploy_model(best_model_name=best_model_name, progress_session_id=session_id)

        except Exception as e:

            logger.error(f"RUNTIME CRASHED - ERROR - {e.with_traceback()}")

