import {
    userManagementQueryKeys,
    integrationQueryKeys,
    datasetQueryKeys,
    stopWordsQueryKeys,
    authQueryKeys,
    dataModelsQueryKeys,
    testModelsQueryKeys,
  } from '../queryKeys';
  import { PaginationState, SortingState } from '@tanstack/react-table';
  
  describe('Query Keys', () => {
    describe('userManagementQueryKeys', () => {
      it('should return the correct query key for getAllEmployees with pagination and sorting', () => {
        const pagination: PaginationState = { pageIndex: 1, pageSize: 10 };
        const sorting: SortingState = [{ id: 'name', desc: true }];
        const result = userManagementQueryKeys.getAllEmployees(pagination, sorting);
        expect(result).toEqual(['accounts/users', pagination, sorting]);
      });
  
      it('should filter out undefined values in getAllEmployees', () => {
        const result = userManagementQueryKeys.getAllEmployees(undefined, undefined);
        expect(result).toEqual(['accounts/users']);
      });
    });
  
    describe('integrationQueryKeys', () => {
      it('should return the correct query key for INTEGRATION_STATUS', () => {
        const result = integrationQueryKeys.INTEGRATION_STATUS();
        expect(result).toEqual(['classifier/integration/platform-status']);
      });
  
      it('should return the correct query key for USER_ROLES', () => {
        const result = integrationQueryKeys.USER_ROLES();
        expect(result).toEqual(['/accounts/user-role', 'prod']);
      });
    });
  
    describe('datasetQueryKeys', () => {
      it('should return the correct query key for DATASET_FILTERS', () => {
        const result = datasetQueryKeys.DATASET_FILTERS();
        expect(result).toEqual(['datasets/filters']);
      });
  
      it('should return the correct query key for DATASET_OVERVIEW', () => {
        const result = datasetQueryKeys.DATASET_OVERVIEW(1, 'groupName', 1, 0, 2, 'validated', 'asc');
        expect(result).toEqual([
          'datasetgroup/overview',
          1,
          'groupName',
          1,
          0,
          2,
          'validated',
          'asc',
        ]);
      });
  
      it('should filter out undefined values in DATASET_OVERVIEW', () => {
        const result = datasetQueryKeys.DATASET_OVERVIEW();
        expect(result).toEqual(['datasetgroup/overview']);
      });
  
      it('should return the correct query key for GET_META_DATA', () => {
        const result = datasetQueryKeys.GET_META_DATA(123);
        expect(result).toEqual(['datasets/groups/metadata', '123']);
      });
  
      it('should return the correct query key for GET_DATA_SETS', () => {
        const pagination: PaginationState = { pageIndex: 2, pageSize: 20 };
        const result = datasetQueryKeys.GET_DATA_SETS(123, pagination);
        expect(result).toEqual(['datasets/groups/data', '123', pagination]);
      });
  
      it('should return the correct query key for GET_DATASET_GROUP_PROGRESS', () => {
        const result = datasetQueryKeys.GET_DATASET_GROUP_PROGRESS();
        expect(result).toEqual(['datasetgroups/progress']);
      });
    });
  
    describe('stopWordsQueryKeys', () => {
      it('should return the correct query key for GET_ALL_STOP_WORDS', () => {
        const result = stopWordsQueryKeys.GET_ALL_STOP_WORDS();
        expect(result).toEqual(['datasetgroups/stopwords']);
      });
    });
  
    describe('authQueryKeys', () => {
      it('should return the correct query key for USER_DETAILS', () => {
        const result = authQueryKeys.USER_DETAILS();
        expect(result).toEqual(['auth/jwt/userinfo', 'prod']);
      });
    });
  
    describe('dataModelsQueryKeys', () => {
      it('should return the correct query key for DATA_MODEL_FILTERS', () => {
        const result = dataModelsQueryKeys.DATA_MODEL_FILTERS();
        expect(result).toEqual(['datamodels/filters']);
      });
  
      it('should return the correct query key for DATA_MODELS_OVERVIEW', () => {
        const result = dataModelsQueryKeys.DATA_MODELS_OVERVIEW(
          1,
          'modelName',
          1,
          0,
          'platform',
          123,
          'trainingStatus',
          'mature',
          'desc',
          true
        );
        expect(result).toEqual([
          'datamodels/overview',
          1,
          'modelName',
          1,
          0,
          'platform',
          123,
          'trainingStatus',
          'mature',
          'desc',
          true,
        ]);
      });
  
      it('should filter out undefined values in DATA_MODELS_OVERVIEW', () => {
        const result = dataModelsQueryKeys.DATA_MODELS_OVERVIEW();
        expect(result).toEqual(['datamodels/overview']);
      });
  
      it('should return the correct query key for GET_META_DATA', () => {
        const result = dataModelsQueryKeys.GET_META_DATA(123);
        expect(result).toEqual(['datamodels/metadata', '123']);
      });
    });
  
    describe('testModelsQueryKeys', () => {
      it('should return the correct query key for GET_TEST_MODELS', () => {
        const result = testModelsQueryKeys.GET_TEST_MODELS();
        expect(result).toEqual(['testModels']);
      });
    });
  });
  