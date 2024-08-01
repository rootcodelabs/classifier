import { PaginationState, SortingState } from '@tanstack/react-table';

export const userManagementQueryKeys = {
  getAllEmployees: function (
    pagination?: PaginationState,
    sorting?: SortingState
  ) {
    return ['accounts/users', pagination, sorting];
  },
};

export const integrationQueryKeys = {
  INTEGRATION_STATUS: (): string[] => [
    `classifier/integration/platform-status`,
  ],
  USER_ROLES: (): string[] => ['/accounts/user-role', 'prod'],
};
