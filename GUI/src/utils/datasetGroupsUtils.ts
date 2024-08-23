import { Class, TreeNode, ValidationRule, ValidationRuleResponse } from 'types/datasetGroups';
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
    validationCriteria?.fields.push(item?.fieldName);

    validationCriteria.validationRules[item?.fieldName] = {
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

export const reverseTransformClassHierarchy = (data: any) => {
  const traverse = (node: any, level: number) => {
    const flatNode = {
      id: uuidv4(),
      fieldName: node?.class,
      level,
      children: node?.subclasses?.map((subclass: any) =>
        traverse(subclass, level + 1)
      ),
    };

    return flatNode;
  };

  return data?.map((item: any) => traverse(item, 0));
};

export const transformObjectToArray = (data: Record<string, ValidationRuleResponse> | undefined) => {
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
  console.log("data ", data)
  for (let item of data) {
    if (item.fieldName === '') {
      console.log("data s")
      return true;
    }
    if (item.children && item.children.length > 0) {
      if (validateClassHierarchy(item.children)) {
        console.log("data 2")
        return true;
      }
    }
  }
  console.log("data 4")
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

export const isFieldNameExisting = (dataArray: ValidationRule[] | undefined, fieldNameToCheck: string) => {
  const count = dataArray?.reduce((acc, item) => {
    return item?.fieldName?.toLowerCase() === fieldNameToCheck?.toLowerCase()
      ? acc + 1
      : acc;
  }, 0);

  return count === 2;
};

export const countFieldNameOccurrences = (dataArray:TreeNode[] | undefined, fieldNameToCheck: string) => {
  let count = 0;

  function countOccurrences(node: TreeNode) {
    if (node?.fieldName?.toLowerCase() === fieldNameToCheck?.toLowerCase()) {
      count += 1;
    }

    if (node.children) {
      node.children.forEach((child) => countOccurrences(child));
    }
  }

  dataArray && dataArray.forEach((node) => countOccurrences(node));

  return count;
};

export const isClassHierarchyDuplicated = (dataArray: TreeNode[] | undefined, fieldNameToCheck: string) => {
  const count = countFieldNameOccurrences(dataArray, fieldNameToCheck);
  return count === 2;
};

export const handleDownload = (response: any, format: string) => {
  try {
    // Create a URL for the Blob
    const url = window.URL.createObjectURL(new Blob([response]));
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
