export type DataModel = {
    modelId: number;
    modelName: string;
    dgName?: string;
    dgId: string |number;
    platform: string;
    baseModels: string[];
    maturity: string;
    version?: string;
  };

export type TrainingProgressData = {
  id: string;
  modelName: string;
  majorVersion: number;
  minorVersion: number;
  latest: boolean;
  trainingStatus: string;
  progressPercentage: number;
};

export type SSEEventData = {
  sessionId: string;
  trainingStatus: string;
  progressPercentage: number;
};

export type UpdatedDataModelPayload = {
  modelId: number;
  connectedDgId: number | string;
  deploymentEnv: string; 
  baseModels: string[] |string;
  maturityLabel: string;
  updateType: string;    
};

export type CreateDataModelPayload={
  modelName: string;
  dgId: string | number;
  baseModels: string[];
  deploymentPlatform: string;
  maturityLabel: string;
}

export type FilterData = {
  modelNames: string[];
  modelVersions: string[];
  deploymentsEnvs: string[];
  datasetGroups: Array<{ id: number; name: string }>;
  trainingStatuses: string[];
  maturityLabels: string[];
};

export type DataModelResponse = {
  id: number;
  modelName: string;
  connectedDgName: string;
  majorVersion: number;
  minorVersion: number;
  latest: boolean;
  dgVersion: string;
  lastTrained: string;
  trainingStatus: string;
  deploymentEnv: string;
  maturityLabel: string;
  trainingResults: string[];
};

export type Filters = {
  modelName: string;
  version: string;
  platform: string;
  datasetGroup: number;
  trainingStatus: string;
  maturity: string;
  sort: 'asc' | 'desc';
};
