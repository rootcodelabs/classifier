import { FC, useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { Layout } from 'components';
import useStore from 'store';
import { UserInfo } from 'types/userInfo';

import './locale/et_EE';
import UserManagement from 'pages/UserManagement';
import Integrations from 'pages/Integrations';
import DatasetGroups from 'pages/DataSetGroups';

const App: FC = () => {

  const res={
    response: {
        firstName: "Kustuta",
        lastName: "Kasutaja",
        idCode: "EE30303039914",
        displayName: "Kustutamiseks",
        JWTCreated: "1.71886644E12" ,
        fullName: "OK TESTNUMBER",
        login: "EE30303039914",
        authMethod: "smartid",
        csaEmail: "kustutamind@mail.ee",
        authorities: [
            "ROLE_ADMINISTRATOR"
        ],
        csaTitle: "",
        JWTExpirationTimestamp: "1.71887364E12"
    }
};
  // useQuery<{
  //   data: { response: UserInfo };
  // }>({
  //   queryKey: ['auth/jwt/userinfo', 'prod'],
  //   onSuccess: (res: { response: UserInfo }) => {
  //     localStorage.setItem('exp', res.response.JWTExpirationTimestamp);
  //     return useStore.getState().setUserInfo(res.response);
  //   },
  // });

  useEffect(()=>{
    localStorage.setItem('exp', res.response.JWTExpirationTimestamp);
    return useStore.getState().setUserInfo(res.response);

  },[])

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/user-management" />} />
        <Route path="/user-management" element={<UserManagement />} />
        <Route path="/integrations" element={<Integrations />} />
        <Route path="/dataset-groups" element={<DatasetGroups />} />


      </Route>
    </Routes>
  );
};

export default App;
