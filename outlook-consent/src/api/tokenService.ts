// tokenService.js
import axios from 'axios';
import { msalConfig } from '../authconfig';

export const exchangeCodeForToken = async (code) => {
    const codeVerifier = sessionStorage.getItem('codeVerifier');

    const params = new URLSearchParams({
        client_id: msalConfig.auth.clientId,
        scope: msalConfig.scopes.join(' '),
        code,
        redirect_uri: msalConfig.auth.redirectUri,
        grant_type: 'authorization_code',
        code_verifier: codeVerifier,
    });

    const response = await axios.post(`https://login.microsoftonline.com/common/oauth2/v2.0/token`, params);
    return response.data;
};
