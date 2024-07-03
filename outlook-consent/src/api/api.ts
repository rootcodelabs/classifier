import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://login.microsoftonline.com/common/oauth2/v2.0', 
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded', 
    'Access-Control-Allow-Origin':"*"
  },
});


export const getToken = async (code) => {
    try {
      const formData = new URLSearchParams();
      formData.append('code', code);
      formData.append('redirect_uri', 'http://localhost:3003/callback');
      formData.append('client_id', '7063e01a-96cd-46a9-ab98-7d6b36843227');
      formData.append('scope', 'User.Read Mail.ReadWrite MailboxSettings.ReadWrite offline_access');
      formData.append('grant_type', 'authorization_code');
  
      const response = await apiClient.post('/token', formData);
  
      return response.data;
    } catch (error) {
      console.error('Error fetching token:', error);
      throw error;
    }
  };

export const getAuthCode = async () => {
  try {
    const response = await apiClient.get('/authorize', {
      params: {
        response_type: 'code',
        redirect_uri: 'http://localhost:3003/callback',
        response_mode: 'query',
        scope: 'User.Read Mail.ReadWrite MailboxSettings.ReadWrite offline_access',
        state: '12345', // state should be a string
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching authCode:', error);
    throw error;
  }
};

