// authService.js
import { msalConfig } from '../authconfig';
import { generateCodeVerifier, generateCodeChallenge } from '../pkceUtils';

export const getAuthUrl = async () => {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    sessionStorage.setItem('codeVerifier', codeVerifier);

    const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${msalConfig.auth.clientId}&response_type=code&redirect_uri=${msalConfig.auth.redirectUri}&response_mode=query&scope=${msalConfig.scopes.join(' ')}&code_challenge=${codeChallenge}&code_challenge_method=S256`;

    return authUrl;
};
