import { Class, ValidationRule } from 'types/datasetGroups';
import { v4 as uuidv4 } from 'uuid';
import isEqual from 'lodash/isEqual';

export const transformValidationRules = (
  data: ValidationRule[] | undefined
) => {
  const validationCriteria = {
    fields: [],
    validationRules: {},
  };

  data?.forEach((item) => {
    validationCriteria.fields.push(item.fieldName);

    validationCriteria.validationRules[item.fieldName] = {
      type: item.dataType.toLowerCase(),
      isDataClass: item.isDataClass,
    };
  });

  return validationCriteria;
};

export const transformClassHierarchy = (data: Class[]) => {
  const transformNode = (node: Class) => {
    return {
      class: node?.fieldName,
      subclasses: node?.children?.map(transformNode),
    };
  };

  return {
    classHierarchy: data?.map(transformNode),
  };
};

export const reverseTransformClassHierarchy = (data) => {
  const traverse = (node, level: number) => {
    const flatNode = {
      id: uuidv4(),
      fieldName: node.class,
      level,
      children: node?.subclasses.map((subclass) =>
        traverse(subclass, level + 1)
      ),
    };

    return flatNode;
  };

  return data?.map((item) => traverse(item, 0));
};

export const transformObjectToArray = (data) => {
  if (data) {
    const output = Object.entries(data).map(([fieldName, details], index) => ({
      id: index + 1,
      fieldName,
      dataType: details?.type,
      isDataClass: details?.isDataClass,
    }));

    return output;
  }
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

export const validateValidationRules = (data: ValidationRule[] | undefined) => {
  for (let item of data) {
    if (item.fieldName === '' || item.dataType === '') {
      return true;
    }
  }
  return false;
};

export const getTimestampNow = () => {
  return Math.floor(Date.now() / 1000);
};

export const isValidationRulesSatisfied = (data: ValidationRule[]) => {
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
};

export const isFieldNameExisting = (dataArray, fieldNameToCheck) => {
  const count = dataArray?.reduce((acc, item) => {
    return item?.fieldName?.toLowerCase() === fieldNameToCheck?.toLowerCase()
      ? acc + 1
      : acc;
  }, 0);

  return count === 2;
};

export const countFieldNameOccurrences = (dataArray, fieldNameToCheck) => {
  let count = 0;

  function countOccurrences(node) {
    if (node?.fieldName?.toLowerCase() === fieldNameToCheck?.toLowerCase()) {
      count += 1;
    }

    if (node.children) {
      node.children.forEach((child) => countOccurrences(child));
    }
  }

  dataArray.forEach((node) => countOccurrences(node));

  return count;
};

export const isClassHierarchyDuplicated = (dataArray, fieldNameToCheck) => {
  const count = countFieldNameOccurrences(dataArray, fieldNameToCheck);
  return count === 2;
};

export const handleDownload = (response, format) => {
  try {
    // Create a URL for the Blob
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `export.${format}`); // Specify the file name and extension
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
  } catch (error) {
    console.error('Error downloading the file', error);
  }
};

export const isMajorUpdate = (initialData, updatedData) => {
  return !isEqual(initialData, updatedData);
};
