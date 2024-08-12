export type DataModel = {
    modelId: string;
    modelName: string;
    dgName: string;
    dgId: string;
    platform: string;
    baseModels: string[];
    maturity: string;
    version: string;
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