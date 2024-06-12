// src/App.js

import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import UserManagement from "./pages/UserManagement";

const App = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/home" />} />
        <Route path="/home" element={<Home />} />
        <Route path="/user-management" element={<UserManagement />} />

      </Route>
    </Routes>
  );
};

export default App;
