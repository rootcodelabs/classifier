import { FC } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from 'components';
import useStore from 'store';
import './locale/et_EE';
import UserManagement from 'pages/UserManagement';
import Integrations from 'pages/Integrations';
import DatasetGroups from 'pages/DatasetGroups';
import { useQuery } from '@tanstack/react-query';
import { UserInfo } from 'types/userInfo';
import CreateDatasetGroup from 'pages/DatasetGroups/CreateDatasetGroup';
import ViewDatasetGroup from 'pages/DatasetGroups/ViewDatasetGroup';
import StopWords from 'pages/StopWords';
import ValidationSessions from 'pages/ValidationSessions';

const App: FC = () => {

  useQuery<{
    data: { custom_jwt_userinfo: UserInfo };
  }>({
    queryKey: ['auth/jwt/userinfo', 'prod'],
    onSuccess: (res: { response: UserInfo }) => {
      localStorage.setItem('exp', res.response.JWTExpirationTimestamp);
      return useStore.getState().setUserInfo(res.response);
    },
  });
 
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/user-management" />} />
        <Route path="/user-management" element={<UserManagement />} />
        <Route path="/integration" element={<Integrations />} />
        <Route path="/dataset-groups" element={<DatasetGroups />} />
        <Route path="/create-dataset-group" element={<CreateDatasetGroup />} />
        <Route path="/stop-words" element={<StopWords />} />
        <Route path="/validation-sessions" element={<ValidationSessions />} />


      </Route>
    </Routes>
  );
};

export default App;
