import axios, { AxiosError } from 'axios';

const instance = axios.create({
  baseURL: 'https://cd16ef7b-5bb2-419b-9785-af03380d0b9d.mock.pstmn.io',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/x-www-form-urlencoded',
  },
});

instance.interceptors.response.use(
  (axiosResponse) => {
    return axiosResponse;
  },
  (error: AxiosError) => {
    return Promise.reject(new Error(error.message));
  }
);

instance.interceptors.request.use(
  (axiosRequest) => {
    return axiosRequest;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // To be added: handle unauthorized requests
    }
    if (error.response?.status === 403) {
      // To be added: handle unauthorized requests
    }
    return Promise.reject(new Error(error.message));
  }
);

export default instance;
