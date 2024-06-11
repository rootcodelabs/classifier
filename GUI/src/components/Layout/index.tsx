import { FC } from 'react';
import { Outlet } from 'react-router-dom';
import './Layout.scss';
import Sidebar from '../molecules/SideBar';
import Header from '../molecules/Header';

const Layout: FC = () => {
  return (
    <div className="flex h-screen overflow-hidden">
    <Sidebar />
    <div className="flex flex-col flex-grow">
      <Header />
      <main className="flex-grow p-4 bg-gray-100 mt-16">
        <Outlet/>
      </main>
    </div>
  </div>

  );
};

export default Layout;
