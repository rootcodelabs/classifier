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
  children: Class[] | any;
}

export interface LinkedModel {
  modelId: number;
  modelName: string;
  modelVersion: string;
  trainingTimestamp: number;
}

export interface Dataset {
  rowId: number;
  emailAddress: string;
  emailBody: string;
  emailSendTime: string;
  departmentCode: string;
  ministry: string;
  division: string;
}

export interface Operation {
  dgId: number|undefined;
  operationType: 'enable' | 'disable';
}

export interface ValidationRuleResponse {
  type: string;
  isDataClass: boolean;
};

export interface ValidationCriteria {
  fields: string[];
  validationRules: Record<string, ValidationRuleResponse>;
};

export interface ClassNode {
  class: string;
  subclasses: ClassNode[];
};

export interface DatasetGroup {
  dgId?: number;
  groupName?:string;
  validationCriteria: ValidationCriteria;
  classHierarchy: ClassNode[];
};

export interface ImportDataset {
  dgId: number|string;
  dataFile: File;
}