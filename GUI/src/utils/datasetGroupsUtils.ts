import { Class, ValidationRule } from 'types/datasetGroups';

export const transformValidationRules = (data: ValidationRule[]) => {
  const validationCriteria = {
    fields: [],
    validation_rules: {},
  };

  data.forEach((item) => {
    const fieldNameKey: string = item.fieldName
      .toLowerCase()
      .replace(/\s+/g, '_');

    validationCriteria.fields.push(fieldNameKey);

    validationCriteria.validation_rules[fieldNameKey] = {
      type: item.dataType.toLowerCase(),
      is_data_class: item.isDataClass,
    };
  });

  return validationCriteria;
};

export const transformClassHierarchy = (data: Class[]) => {
  const transformNode = (node: Class) => {
    return {
      class: node.fieldName,
      subclasses: node.children.map(transformNode),
    };
  };

  return {
    class_hierarchy: data.map(transformNode),
  };
};

export const validateClassHierarchy = (data: Class[]) => {
  for (let item of data) {
    if (item.fieldName === '') {
      return true;
    }
    if (item.children && item.children.length > 0) {
      if (validateClassHierarchy(item.children)) {
        return true;
      }
    }
  }
  return false;
};

export const validateValidationRules = (data: ValidationRule[]) => {
  for (let item of data) {
    if (item.fieldName === '' || item.dataType === '') {
      return true;
    }
  }
  return false;
};

export const getTimestampNow = ()=>{
 return Math.floor(Date.now() / 1000);
}

export const isValidationRulesSatisfied=(data: ValidationRule[])=>{
  if (data.length < 2) {
    return false; 
}

let hasDataClassTrue = false;
let hasDataClassFalse = false;

for (let item of data) {
    if (item.isDataClass === true) {
        hasDataClassTrue = true;
    }
    if (item.isDataClass === false) {
        hasDataClassFalse = true;
    }

    if (hasDataClassTrue && hasDataClassFalse) {
        return true;
    }
}

return false;
}