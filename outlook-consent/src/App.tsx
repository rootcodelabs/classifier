
import './App.css'
import { Navigate, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Callback from './pages/Callback';

function App() {

  return (
    <Routes>
        <Route index element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/callback" element={<Callback />} />
    </Routes>
  );
}

export default App
