// App.js
import React from 'react';
import { getAuthUrl } from '../api/authService';

const App = () => {
    const handleLogin = async () => {
        const authUrl = await getAuthUrl();
        window.location.href = authUrl;
    };

    return (
        <div>
            <h1>Welcome to My App</h1>
            <button onClick={handleLogin}>Login</button>
        </div>
    );
};

export default App;
