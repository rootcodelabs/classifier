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
