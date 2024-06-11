import React, { useState } from 'react';
import { IconType } from 'react-icons';
import * as MdIcons from 'react-icons/md';
import menuConfig from '../../../config/menuConfig.json';

interface MenuItem {
  title: string;
  icon: string;
  submenu?: MenuItem[];
}

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<{ [key: number]: boolean }>({});

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const toggleMenu = (index: number) => {
    setExpandedMenus(prevState => ({
      ...prevState,
      [index]: !prevState[index]
    }));
  };

  const renderIcon = (iconName: string): JSX.Element => {
    const Icon: IconType = (MdIcons as any)[iconName];
    return <Icon />;
  };

  return (
    <div className={`h-full bg-gray-900 text-white transition-width duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      <button onClick={toggleSidebar} className="bg-gray-800 text-white p-2 w-full">
        {collapsed ? '>' : '<'}
      </button>
      <ul className="list-none p-0">
        {menuConfig.map((item: MenuItem, index: number) => (
          <li key={index}>
            <div
              className="flex items-center p-4 cursor-pointer hover:bg-gray-700"
              onClick={() => toggleMenu(index)}
            >
              {renderIcon(item.icon)}
              {!collapsed && <span className="ml-2">{item.title}</span>}
            </div>
            {expandedMenus[index] && item.submenu && (
              <ul className="list-none p-0 bg-gray-800">
                {item.submenu.map((subItem, subIndex) => (
                  <li key={subIndex} className="flex items-center p-4 cursor-pointer hover:bg-gray-700">
                    {renderIcon(subItem.icon)}
                    {!collapsed && <span className="ml-2">{subItem.title}</span>}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
