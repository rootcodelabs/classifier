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
import CorrectedTexts from 'pages/CorrectedTexts';
import CreateDataModel from 'pages/DataModels/CreateDataModel';
import TrainingSessions from 'pages/TrainingSessions';
import DataModels from 'pages/DataModels';

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
        <Route
          path="/validation-sessions"
          element={<ValidationSessions />}
        />{' '}
        <Route path="/data-models" element={<DataModels />} />
        <Route path="/create-data-model" element={<CreateDataModel />} />
        <Route path="/training-sessions" element={<TrainingSessions />} />
        <Route path="/corrected-texts" element={<CorrectedTexts />} />
      </Route>
    </Routes>
  );
};

export default App;
