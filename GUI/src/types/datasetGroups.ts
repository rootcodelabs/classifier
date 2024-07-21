export interface ValidationRule {
  id: number;
  fieldName: string;
  dataType: string;
  isDataClass: boolean;
}

export interface Class {
  id: string;
  fieldName: string;
  level: number;
  children: Class[]|any;
}

export interface LinkedModel {
  modelId: number;
  modelName: string;
  modelVersion: string;
  trainingTimestamp: number;
};

export interface DatasetGroup {
  dgId: number;
  name: string;
  majorVersion: number;
  minorVersion: number;
  patchVersion: number;
  latest: boolean;
  isEnabled: boolean;
  enableAllowed: boolean;
  lastUpdated: string;
  linkedModels: LinkedModel[];
  validationStatus: string;
};