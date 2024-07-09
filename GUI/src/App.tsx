import { FC, useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from 'components';
import useStore from 'store';
import './locale/et_EE';
import UserManagement from 'pages/UserManagement';
import Integrations from 'pages/Integrations';
import DatasetGroups from 'pages/DataSetGroups';
import apiDev from 'services/api-dev';

const App: FC = () => {

  const getUserInfo = () => {
    apiDev
      .get(`auth/jwt/userinfo`)
      .then((res: any) => {
        localStorage.setItem('exp', res?.data?.response?.JWTExpirationTimestamp);
        return useStore.getState().setUserInfo(res?.data?.response);
      })
      .catch((error: any) => console.log(error));
  };

  useEffect(() => {
    getUserInfo();
  }, []);

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/user-management" />} />
        <Route path="/user-management" element={<UserManagement />} />
        <Route path="/integration" element={<Integrations />} />
        <Route path="/dataset-groups" element={<DatasetGroups />} />


      </Route>
    </Routes>
  );
};

export default App;
