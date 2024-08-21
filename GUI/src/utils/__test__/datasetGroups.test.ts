import { Class, TransformValidationCriteria, TreeNode, ValidationRule, ValidationRuleResponse } from '../../types/datasetGroups';
import { countFieldNameOccurrences, getTimestampNow, isClassHierarchyDuplicated, isValidationRulesSatisfied, transformClassHierarchy, transformObjectToArray, transformValidationRules } from '../datasetGroupsUtils';

describe('Dataset Utility Functions', () => {
  describe('transformObjectToArray', () => {
    it('should transform a valid object into an array', () => {
      const input: Record<string, ValidationRuleResponse> = {
        field1: { type: 'string', isDataClass: true },
        field2: { type: 'number', isDataClass: false },
      };

      const expectedOutput = [
        { id: 1, fieldName: 'field1', dataType: 'string', isDataClass: true },
        { id: 2, fieldName: 'field2', dataType: 'number', isDataClass: false },
      ];

      expect(transformObjectToArray(input)).toEqual(expectedOutput);
    });

    it('should return undefined when input data is undefined', () => {
      const result = transformObjectToArray(undefined);
      expect(result).toBeUndefined();
    });

    it('should return an empty array when the input object is empty', () => {
      const input: Record<string, ValidationRuleResponse> = {};

      const expectedOutput: any[] = [];

      expect(transformObjectToArray(input)).toEqual(expectedOutput);
    });

    it('should handle undefined properties correctly', () => {
      const input: Record<string, ValidationRuleResponse> = {
        field1: { type: 'string', isDataClass: true },
        field2: { type: 'number', isDataClass: false },
        field3: { type: undefined as any, isDataClass: undefined as any },
      };

      const expectedOutput = [
        { id: 1, fieldName: 'field1', dataType: 'string', isDataClass: true },
        { id: 2, fieldName: 'field2', dataType: 'number', isDataClass: false },
        {
          id: 3,
          fieldName: 'field3',
          dataType: undefined,
          isDataClass: undefined,
        },
      ];

      expect(transformObjectToArray(input)).toEqual(expectedOutput);
    });
  });

  describe('transformValidationRules', () => {
    it('should correctly transform a valid array of ValidationRule objects', () => {
      const input: ValidationRule[] = [
        { id: 1, fieldName: 'field1', dataType: 'STRING', isDataClass: true },
        { id: 2, fieldName: 'field2', dataType: 'NUMBER', isDataClass: false },
      ];
  
      const expectedOutput: TransformValidationCriteria = {
        fields: ['field1', 'field2'],
        validationRules: {
          field1: { type: 'string', isDataClass: true },
          field2: { type: 'number', isDataClass: false },
        },
      };
  
      expect(transformValidationRules(input)).toEqual(expectedOutput);
    });
  
    it('should return an object with empty arrays when input data is undefined', () => {
      const expectedOutput: TransformValidationCriteria = {
        fields: [],
        validationRules: {},
      };
  
      expect(transformValidationRules(undefined)).toEqual(expectedOutput);
    });
  
    it('should return an object with empty arrays when input array is empty', () => {
      const input: ValidationRule[] = [];
  
      const expectedOutput: TransformValidationCriteria = {
        fields: [],
        validationRules: {},
      };
  
      expect(transformValidationRules(input)).toEqual(expectedOutput);
    });
  
    it('should correctly handle a single ValidationRule object', () => {
      const input: ValidationRule[] = [
        { id: 1, fieldName: 'field1', dataType: 'BOOLEAN', isDataClass: false },
      ];
  
      const expectedOutput: TransformValidationCriteria = {
        fields: ['field1'],
        validationRules: {
          field1: { type: 'boolean', isDataClass: false },
        },
      };
  
      expect(transformValidationRules(input)).toEqual(expectedOutput);
    });
  
    it('should correctly transform data with different data types', () => {
      const input: ValidationRule[] = [
        { id: 1, fieldName: 'field1', dataType: 'STRING', isDataClass: true },
        { id: 2, fieldName: 'field2', dataType: 'NUMBER', isDataClass: false },
        { id: 3, fieldName: 'field3', dataType: 'BOOLEAN', isDataClass: true },
      ];
  
      const expectedOutput: TransformValidationCriteria = {
        fields: ['field1', 'field2', 'field3'],
        validationRules: {
          field1: { type: 'string', isDataClass: true },
          field2: { type: 'number', isDataClass: false },
          field3: { type: 'boolean', isDataClass: true },
        },
      };
  
      expect(transformValidationRules(input)).toEqual(expectedOutput);
    });
  });

  describe('transformClassHierarchy', () => {
    it('should correctly transform a simple class hierarchy', () => {
      const input: Class[] = [
        {
          id: '1',
          fieldName: 'ParentClass',
          level: 1,
          children: [
            {
              id: '2',
              fieldName: 'ChildClass',
              level: 2,
              children: [],
            },
          ],
        },
      ];
  
      const expectedOutput = {
        classHierarchy: [
          {
            class: 'ParentClass',
            subclasses: [
              {
                class: 'ChildClass',
                subclasses: [],
              },
            ],
          },
        ],
      };
  
      expect(transformClassHierarchy(input)).toEqual(expectedOutput);
    });
  
    it('should return an empty array for classHierarchy when input is an empty array', () => {
      const input: Class[] = [];
  
      const expectedOutput = {
        classHierarchy: [],
      };
  
      expect(transformClassHierarchy(input)).toEqual(expectedOutput);
    });
  
    it('should correctly handle multiple classes at the same level', () => {
      const input: Class[] = [
        {
          id: '1',
          fieldName: 'ClassA',
          level: 1,
          children: [],
        },
        {
          id: '2',
          fieldName: 'ClassB',
          level: 1,
          children: [],
        },
      ];
  
      const expectedOutput = {
        classHierarchy: [
          {
            class: 'ClassA',
            subclasses: [],
          },
          {
            class: 'ClassB',
            subclasses: [],
          },
        ],
      };
  
      expect(transformClassHierarchy(input)).toEqual(expectedOutput);
    });
  
    it('should handle nested subclasses correctly', () => {
      const input: Class[] = [
        {
          id: '1',
          fieldName: 'RootClass',
          level: 1,
          children: [
            {
              id: '2',
              fieldName: 'SubClass1',
              level: 2,
              children: [
                {
                  id: '3',
                  fieldName: 'SubSubClass1',
                  level: 3,
                  children: [],
                },
              ],
            },
          ],
        },
      ];
  
      const expectedOutput = {
        classHierarchy: [
          {
            class: 'RootClass',
            subclasses: [
              {
                class: 'SubClass1',
                subclasses: [
                  {
                    class: 'SubSubClass1',
                    subclasses: [],
                  },
                ],
              },
            ],
          },
        ],
      };
  
      expect(transformClassHierarchy(input)).toEqual(expectedOutput);
    });
  
    it('should return undefined for subclasses when children is undefined', () => {
      const input: Class[] = [
        {
          id: '1',
          fieldName: 'ClassWithoutChildren',
          level: 1,
          children: undefined!,
        },
      ];
  
      const expectedOutput = {
        classHierarchy: [
          {
            class: 'ClassWithoutChildren',
            subclasses: undefined,
          },
        ],
      };
  
      expect(transformClassHierarchy(input)).toEqual(expectedOutput);
    });
  });

  describe('getTimestampNow', () => {
    it('should return the current timestamp in seconds', () => {
      const mockDateNow = 1625097600000;
      jest.spyOn(Date, 'now').mockReturnValue(mockDateNow);
  
      const expectedTimestamp = Math.floor(mockDateNow / 1000);
  
      expect(getTimestampNow()).toBe(expectedTimestamp);
  
      jest.restoreAllMocks();
    });
  
    it('should return a value that is a number', () => {
      const timestamp = getTimestampNow();
      expect(typeof timestamp).toBe('number');
    });
  
    it('should return a timestamp that is close to the current time', () => {
      const timestampBefore = Math.floor(Date.now() / 1000);
      const timestampNow = getTimestampNow();
      const timestampAfter = Math.floor(Date.now() / 1000);
  
      expect(timestampNow).toBeGreaterThanOrEqual(timestampBefore);
      expect(timestampNow).toBeLessThanOrEqual(timestampAfter);
    });
  });

  describe('isValidationRulesSatisfied', () => {
    it('should return false if the array has fewer than 2 elements', () => {
      const input: ValidationRule[] = [
        { id: 1, fieldName: 'field1', dataType: 'string', isDataClass: true },
      ];
  
      expect(isValidationRulesSatisfied(input)).toBe(false);
    });
  
    it('should return false if the array has 2 elements but both have isDataClass as true', () => {
      const input: ValidationRule[] = [
        { id: 1, fieldName: 'field1', dataType: 'string', isDataClass: true },
        { id: 2, fieldName: 'field2', dataType: 'number', isDataClass: true },
      ];
  
      expect(isValidationRulesSatisfied(input)).toBe(false);
    });
  
    it('should return false if the array has 2 elements but both have isDataClass as false', () => {
      const input: ValidationRule[] = [
        { id: 1, fieldName: 'field1', dataType: 'string', isDataClass: false },
        { id: 2, fieldName: 'field2', dataType: 'number', isDataClass: false },
      ];
  
      expect(isValidationRulesSatisfied(input)).toBe(false);
    });
  
    it('should return true if the array has 2 elements and one has isDataClass as true and the other as false', () => {
      const input: ValidationRule[] = [
        { id: 1, fieldName: 'field1', dataType: 'string', isDataClass: true },
        { id: 2, fieldName: 'field2', dataType: 'number', isDataClass: false },
      ];
  
      expect(isValidationRulesSatisfied(input)).toBe(true);
    });
  
    it('should return true if the array has more than 2 elements and contains both true and false for isDataClass', () => {
      const input: ValidationRule[] = [
        { id: 1, fieldName: 'field1', dataType: 'string', isDataClass: true },
        { id: 2, fieldName: 'field2', dataType: 'number', isDataClass: false },
        { id: 3, fieldName: 'field3', dataType: 'boolean', isDataClass: true },
      ];
  
      expect(isValidationRulesSatisfied(input)).toBe(true);
    });
  
    it('should return false if the array is empty', () => {
      const input: ValidationRule[] = [];
  
      expect(isValidationRulesSatisfied(input)).toBe(false);
    });
  });

  describe('countFieldNameOccurrences', () => {
    it('should return 0 if the dataArray is undefined', () => {
      const result = countFieldNameOccurrences(undefined, 'testField');
      expect(result).toBe(0);
    });
  
    it('should return 0 if the fieldNameToCheck is not found in the array', () => {
      const input: TreeNode[] = [
        { id: '1', fieldName: 'root', level: 1, children: [] },
      ];
  
      const result = countFieldNameOccurrences(input, 'nonExistentField');
      expect(result).toBe(0);
    });
  
    it('should return the correct count when the fieldName is found', () => {
      const input: TreeNode[] = [
        {
          id: '1',
          fieldName: 'root',
          level: 1,
          children: [
            { id: '2', fieldName: 'child', level: 2, children: [] },
            { id: '3', fieldName: 'child', level: 2, children: [] },
          ],
        },
      ];
  
      const result = countFieldNameOccurrences(input, 'child');
      expect(result).toBe(2);
    });
  
    it('should be case insensitive when checking field names', () => {
      const input: TreeNode[] = [
        {
          id: '1',
          fieldName: 'Root',
          level: 1,
          children: [
            { id: '2', fieldName: 'child', level: 2, children: [] },
            { id: '3', fieldName: 'Child', level: 2, children: [] },
          ],
        },
      ];
  
      const result = countFieldNameOccurrences(input, 'child');
      expect(result).toBe(2);
    });
  
    it('should correctly count occurrences in nested structures', () => {
      const input: TreeNode[] = [
        {
          id: '1',
          fieldName: 'root',
          level: 1,
          children: [
            {
              id: '2',
              fieldName: 'child',
              level: 2,
              children: [
                { id: '3', fieldName: 'child', level: 3, children: [] },
              ],
            },
          ],
        },
      ];
  
      const result = countFieldNameOccurrences(input, 'child');
      expect(result).toBe(2);
    });
  });

  describe('isClassHierarchyDuplicated', () => {
    it('should return false if the dataArray is undefined', () => {
      const result = isClassHierarchyDuplicated(undefined, 'testField');
      expect(result).toBe(false);
    });
  
    it('should return false if the fieldName occurs less than 2 times', () => {
      const input: TreeNode[] = [
        { id: '1', fieldName: 'root', level: 1, children: [] },
      ];
  
      const result = isClassHierarchyDuplicated(input, 'root');
      expect(result).toBe(false);
    });
  
    it('should return false if the fieldName occurs more than 2 times', () => {
      const input: TreeNode[] = [
        {
          id: '1',
          fieldName: 'root',
          level: 1,
          children: [
            { id: '2', fieldName: 'child', level: 2, children: [] },
            { id: '3', fieldName: 'child', level: 2, children: [] },
            { id: '4', fieldName: 'child', level: 2, children: [] },
          ],
        },
      ];
  
      const result = isClassHierarchyDuplicated(input, 'child');
      expect(result).toBe(false);
    });
  
    it('should return true if the fieldName occurs exactly 2 times', () => {
      const input: TreeNode[] = [
        {
          id: '1',
          fieldName: 'root',
          level: 1,
          children: [
            { id: '2', fieldName: 'child', level: 2, children: [] },
            { id: '3', fieldName: 'child', level: 2, children: [] },
          ],
        },
      ];
  
      const result = isClassHierarchyDuplicated(input, 'child');
      expect(result).toBe(true);
    });
  
    it('should correctly identify duplication regardless of case sensitivity', () => {
      const input: TreeNode[] = [
        {
          id: '1',
          fieldName: 'Root',
          level: 1,
          children: [
            { id: '2', fieldName: 'child', level: 2, children: [] },
            { id: '3', fieldName: 'Child', level: 2, children: [] },
          ],
        },
      ];
  
      const result = isClassHierarchyDuplicated(input, 'child');
      expect(result).toBe(true);
    });
  });
});
