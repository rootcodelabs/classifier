// Callback.js
import React, { useEffect, useState } from 'react';
import { exchangeCodeForToken } from '../api/tokenService';

const Callback = () => {
    const [token, setToken] = useState(null);

    useEffect(() => {
        const fetchTokens = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');

            if (code) {
                try {
                    const tokens = await exchangeCodeForToken(code);
                    setToken(tokens.refresh_token);
                    console.log("Access Token: ", tokens.access_token);
                    console.log("Refresh Token: ", tokens.refresh_token);
                } catch (error) {
                    console.error("Error exchanging code for token: ", error);
                }
            }
        };

        fetchTokens();
    }, []);

    return (
        <div>
            <h1>Authentication Callback</h1>
            {token && <p>Refresh Token: {token}</p>}
        </div>
    );
};

export default Callback;
