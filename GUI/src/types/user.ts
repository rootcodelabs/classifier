import { ROLES } from 'utils/constants';

export interface User {
  login?: string;
  fullName?: string;
  firstName: string;
  lastName: string;
  userIdCode: string;
  displayName: string;
  csaTitle: string;
  csaEmail: string;
  authorities: ROLES[];
  customerSupportStatus: 'online' | 'idle' | 'offline';
}

export interface UserDTO extends Pick<User, 'login' | 'firstName' | 'lastName' | 'fullName' | 'userIdCode' | 'authorities' | 'displayName' | 'csaTitle' | 'csaEmail'> {
}
