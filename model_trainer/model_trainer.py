from datapipeline import DataPipeline
from trainingpipeline import TrainingPipeline
import os
import requests
import torch
import pickle
import shutil
from s3_ferry import S3Ferry
from constants import URL_MODEL, URL_DEPLOY

class ModelTrainer:
    def __init__(self) -> None:
        
        cookie = os.environ.get('COOKIE')
        newModelId = os.environ.get('NEW_MODEL_ID')
        oldModelId = os.environ.get('OLD_MODEL_ID')

        model_url = URL_MODEL

        self.newModelId = newModelId
        self.oldModelId = oldModelId
        cookies = {'customJwtCookie': cookie}
        self.cookie = cookie
        response = requests.get(model_url, params = {'modelId': newModelId}, cookies=cookies)
        if response.status_code == 200:
            self.model_details = response.json()
            print("success")
        else:
            print(f"Failed with status code: {response.status_code}")

    def train(self):
        s3_ferry = S3Ferry()
        dgId = self.model_details['response']['data'][0]['connectedDgId']
        data_pipeline = DataPipeline(dgId, self.cookie)
        dfs = data_pipeline.create_dataframes()
        models_dets,_  = data_pipeline.models_and_filters()
        models_to_train = self.model_details['response']['data'][0]['baseModels']

        results_rt_paths = [f"results/saved_models", f"results/classifiers", f"results/saved_label_encoders"]
        for path in results_rt_paths:
            if not os.path.exists(path):
                os.makedirs(path)
        
        with open('results/models_dets.pkl', 'wb') as file:
            pickle.dump(models_dets, file)

        models_list = []
        classifiers_list = []
        label_encoders_list = []
        average_accuracy = []
        for i in range(len(models_to_train)):
            training_pipeline =  TrainingPipeline(dfs, models_to_train[i])
            metrics, models, classifiers, label_encoders = training_pipeline.train()
            models_list.append(models)
            classifiers_list.append(classifiers)
            label_encoders_list.append(label_encoders)
            average = sum(metrics[1]) / len(metrics[1])
            average_accuracy.append(average)
            
        max_value_index = average_accuracy.index(max(average_accuracy))
        best_models = models_list[max_value_index]
        best_classifiers = classifiers_list[max_value_index]
        best_label_encoders = label_encoders_list[max_value_index]
        model_name = models_to_train[max_value_index]
        for i, (model, classifier, label_encoder) in enumerate(zip(best_models, best_classifiers, best_label_encoders)):
            if model_name == 'distil-bert':
                torch.save(model, f"results/saved_models/last_two_layers_dfs_{i}.pth")
            elif model_name == 'roberta':
                torch.save(model, f"results/saved_models/last_two_layers_dfs_{i}.pth")
            elif model_name == 'bert':
                torch.save(model, f"results/saved_models/last_two_layers_dfs_{i}.pth")

            torch.save(classifier, f"results/classifiers/classifier_{i}.pth")

            label_encoder_path = f"results/saved_label_encoders/label_encoder_{i}.pkl"
            with open(label_encoder_path, 'wb') as file:
                pickle.dump(label_encoder, file)
        
        shutil.make_archive(f"{str(self.newModelId)}", 'zip', f"results")
        save_location = f"shared/models/{str(self.newModelId)}/{str(self.newModelId)}.zip"
        source_location = f"{str(self.newModelId)}.zip"
        response = s3_ferry.transfer_file(save_location, "S3", source_location, "FS")
        if response.status_code == 201:
            upload_status = {"message": "Model File Uploaded Successfully!", "saved_file_path": save_location}
        
        else:
            upload_status = {"message": "failed to Upload Model File!"}
        
        DeploymentPlatform = self.model_details['response']['data'][0]['deploymentEnv']

        deploy_url = URL_DEPLOY.format(deployment_platform = DeploymentPlatform)

    
        if self.oldModelId is not None:
            
            payload = {
                "modelId": self.newModelId,
                "replaceDeployment": True,
                "replaceDeploymentPlatform":DeploymentPlatform,
                "bestModelName":model_name
            }
        
        else:
            payload = {
                "modelId": self.newModelId,
                "replaceDeployment": False,
                "replaceDeploymentPlatform": DeploymentPlatform,
                "bestModelName":model_name
            }

        response = requests.post(deploy_url, json=payload)
