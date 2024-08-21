import { DataModel } from "types/dataModels";
import { customFormattedArray, dgArrayWithVersions, getChangedAttributes, validateDataModel } from "../dataModelsUtils";

describe('Data model utils functions', () => {
  describe('customFormattedArray', () => {
    it('should given data record array return valid object', () => {
        const data = [
            { id: 1, name: 'dataset1' },
            { id: 2, name: 'dataset2' },
          ];
          const attributeName = 'name' as keyof typeof data[0];
      
          const expectedOutput = [
            { label: 'dataset1', value: { name: 'dataset1', id: 1 } },
            { label: 'dataset2', value: { name: 'dataset2', id: 2 } },
          ];
      
          expect(customFormattedArray(data, attributeName)).toEqual(expectedOutput);
    });
  });

  describe('validateDataModel', () => {
    it('should return errors for missing required fields', () => {
      const invalidDataModel: Partial<DataModel> = {
        modelName: '',
        platform: '',
        dgId: 0,
        baseModels: [],
        maturity: '',
      };
  
      const errors = validateDataModel(invalidDataModel);
  
      expect(errors).toEqual({
        modelName: 'Model Name is required',
        platform: 'Platform is required',
        dgId: 'Dataset group is required',
        baseModels: 'At least one Base Model is required',
        maturity: 'Maturity is required',
      });
    });
  
    it('should not return errors if all required fields are valid', () => {
      const validDataModel: Partial<DataModel> = {
        modelName: 'Test Model',
        platform: 'Test Platform',
        dgId: 1,
        baseModels: ['Base Model 1'],
        maturity: 'Production',
      };
  
      const errors = validateDataModel(validDataModel);
  
      expect(errors).toEqual({});
    });
  
    it('should trim whitespace before validating', () => {
      const invalidDataModel: Partial<DataModel> = {
        modelName: '   ',
        platform: '   ',
        dgId: 0,
        baseModels: [],
        maturity: '   ',
      };
  
      const errors = validateDataModel(invalidDataModel);
  
      expect(errors).toEqual({
        modelName: 'Model Name is required',
        platform: 'Platform is required',
        dgId: 'Dataset group is required',
        baseModels: 'At least one Base Model is required',
        maturity: 'Maturity is required',
      });
    });
  });

  describe('dgArrayWithVersions', () => {
    it('should return formatted array with versions', () => {
      const inputArray = [
        { dgId: 1, name: 'Dataset 1', majorVersion: 1, minorVersion: 0, patchVersion: 2 },
        { dgId: 2, name: 'Dataset 2', majorVersion: 2, minorVersion: 1, patchVersion: 3 },
      ];
  
      const result = dgArrayWithVersions(inputArray, 'name');
  
      expect(result).toEqual([
        { label: 'Dataset 1 (1.0.2)', value: 1 },
        { label: 'Dataset 2 (2.1.3)', value: 2 },
      ]);
    });
  
    it('should handle an empty input array', () => {
      const result = dgArrayWithVersions([], 'name');
      expect(result).toEqual([]);
    });
  
    it('should handle missing version fields gracefully', () => {
      const inputArray = [
        { dgId: 1, name: 'Dataset 1', majorVersion: undefined, minorVersion: 0, patchVersion: 2 },
      ];
  
      const result = dgArrayWithVersions(inputArray, 'name');
  
      expect(result).toEqual([
        { label: 'Dataset 1 (undefined.0.2)', value: 1 },
      ]);
    });
  });

  describe('getChangedAttributes', () => {
    it('should return an empty object if no attributes have changed', () => {
      const original: Partial<DataModel> = {
        modelName: 'Test Model',
        platform: 'Platform 1',
      };
  
      const updated: Partial<DataModel> = {
        modelName: 'Test Model',
        platform: 'Platform 1',
      };
  
      const result = getChangedAttributes(original, updated);
  
      expect(result).toEqual({});
    });
  
    it('should return the changed attributes', () => {
      const original: Partial<DataModel> = {
        modelName: 'Test Model',
        platform: 'Platform 1',
      };
  
      const updated: Partial<DataModel> = {
        modelName: 'Updated Model',
        platform: 'Platform 1',
      };
  
      const result = getChangedAttributes(original, updated);
  
      expect(result).toEqual({
        modelName: 'Updated Model',
      });
    });
  
    it('should return `null` for removed attributes', () => {
      const original: Partial<DataModel> = {
        modelName: 'Test Model',
        platform: 'Platform 1',
      };
  
      const updated: Partial<DataModel> = {
        platform: 'Platform 1',
      };
  
      const result = getChangedAttributes(original, updated);
  
      expect(result).toEqual({
        modelName: undefined,
      });
    });
  
    it('should handle partial updates correctly', () => {
      const original: Partial<DataModel> = {
        modelName: 'Test Model',
        platform: 'Platform 1',
      };
  
      const updated: Partial<DataModel> = {
        modelName: 'Updated Model',
      };
  
      const result = getChangedAttributes(original, updated);
  
      expect(result).toEqual({
        modelName: 'Updated Model',
      });
    });
  });
});
