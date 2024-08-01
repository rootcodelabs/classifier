export const userManagementEndpoints = {
  FETCH_USERS: (): string => `/accounts/users`,
  ADD_USER: (): string => `/accounts/add`,
  CHECK_ACCOUNT_AVAILABILITY: (): string => `/accounts/exists`,
  EDIT_USER: (): string => `/accounts/edit`,
  DELETE_USER: (): string => `/accounts/delete`,
  FETCH_USER_ROLES: (): string => `/accounts/user-role`
};

export const integrationsEndPoints = {
  GET_INTEGRATION_STATUS: (): string =>
    `/classifier/integration/platform-status`,
  TOGGLE_PLATFORM: (): string => `/classifier/integration/toggle-platform`,
};
