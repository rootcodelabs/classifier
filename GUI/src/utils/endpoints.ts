export const userManagementEndpoints = {
  FETCH_USERS: (): string => `/accounts/users`,
  ADD_USER: (): string => `/accounts/add`,
  CHECK_ACCOUNT_AVAILABILITY: (): string => `/accounts/exists`,
  EDIT_USER: (): string => `/accounts/edit`,
  DELETE_USER: (): string => `/accounts/delete`,
  FETCH_USER_ROLES: (): string => `/accounts/user-role`,
};

export const integrationsEndPoints = {
  GET_INTEGRATION_STATUS: (): string =>
    `/classifier/integration/platform-status`,
  TOGGLE_PLATFORM: (): string => `/classifier/integration/toggle-platform`,
};

export const datasetsEndpoints = {
  GET_OVERVIEW: (): string => '/classifier/datasetgroup/overview',
  GET_DATASET_OVERVIEW_BY_FILTERS: (): string =>
    '/classifier/datasetgroup/overview/filters',
  ENABLE_DATASET: (): string => `/classifier/datasetgroup/update/status`,
  GET_DATASETS: (): string => `/classifier/datasetgroup/group/data`,
  GET_METADATA: (): string => `/classifier/datasetgroup/group/metadata`,
  CREATE_DATASET_GROUP: (): string => `/classifier/datasetgroup/create`,
  IMPORT_DATASETS: (): string => `/datasetgroup/data/import`,
  EXPORT_DATASETS: (): string => `/datasetgroup/data/download`,
  DATASET_GROUP_PATCH_UPDATE: (): string => `/classifier/datasetgroup/update/patch`,
  DATASET_GROUP_MINOR_UPDATE: (): string => `/classifier/datasetgroup/update/minor`,
  DATASET_GROUP_MAJOR_UPDATE: (): string => `/classifier/datasetgroup/update/major`,
  GET_STOP_WORDS: (): string => `/classifier/datasetgroup/stop-words`,
  POST_STOP_WORDS: (): string => `/classifier/datasetgroup/update/stop-words`,
  DELETE_STOP_WORD: (): string => `/classifier/datasetgroup/delete/stop-words`
};
