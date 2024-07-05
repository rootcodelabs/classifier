import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig } from './authconfig';

export const msalInstance = new PublicClientApplication(msalConfig);
