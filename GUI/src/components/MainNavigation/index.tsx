import { FC, MouseEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useLocation } from 'react-router-dom';
import {
  MdApps,
  MdClass,
  MdClose,
  MdDashboard,
  MdDataset,
  MdKeyboardArrowDown,
  MdOutlineForum,
  MdPeople,
  MdSettings,
  MdTextFormat,
} from 'react-icons/md';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { Icon } from 'components';
import type { MenuItem } from 'types/mainNavigation';
import { menuIcons } from 'constants/menuIcons';
import './MainNavigation.scss';
import { error } from 'console';
import apiDev from 'services/api-dev';

const MainNavigation: FC = () => {
  const { t } = useTranslation();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  const items = [
    {
      id: 'userManagement',
      label: t('menu.userManagement'),
      path: '/user-management',
      icon: <MdPeople />,
    },
    {
      id: 'integration',
      label: t('menu.integration'),
      path: 'integration',
      icon: <MdSettings />,
    },
    {
      id: 'datasets',
      label: t('menu.datasets'),
      path: '#',
      icon: <MdDataset />,
      children: [
        {
          label: t('menu.datasetGroups'),
          path: 'dataset-groups',
          icon: <MdOutlineForum />,
        },
        {
          label: t('menu.versions'),
          path: 'versions',
          icon: <MdOutlineForum />,
        },
      ],
    },
    {
      id: 'dataModels',
      label: t('menu.dataModels'),
      path: '/data-models',
      icon: <MdApps />,
    },
    {
      id: 'classes',
      label: t('menu.classes'),
      path: '/classes',
      icon: <MdDashboard />,
    },
    {
      id: 'stopWords',
      label: t('menu.stopWords'),
      path: '/stop-words',
      icon: <MdClass />,
    },
    {
      id: 'incomingTexts',
      label: t('menu.incomingTexts'),
      path: '/incoming-texts',
      icon: <MdTextFormat />,
    },
  ];

  const getUserRole = () => {
    apiDev
      .get(`/accounts/user-role`)
      .then((res: any) => {
        const filteredItems =
          items.filter((item) => {
            const role = res?.data?.response[0];

            switch (role) {
              case 'ROLE_ADMINISTRATOR':
                return item.id;
              case 'ROLE_MODEL_TRAINER':
                return (
                  item.id !== 'userManagement' && item.id !== 'integration'
                );
              case 'ROLE_UNAUTHENTICATED':
                return null;
            }
          }) ?? [];
        setMenuItems(filteredItems);
      })
      .catch((error: any) => console.log(error));
  };

  useEffect(() => {
    getUserRole();
  }, []);

  useQuery({
    queryKey: ['/accounts/user-role', 'prod'],
    onSuccess: (res: any) => {
      console.log(res);
      
      const filteredItems =
          items.filter((item) => {
            const role = res?.response[0];

            switch (role) {
              case 'ROLE_ADMINISTRATOR':
                return item.id;
              case 'ROLE_MODEL_TRAINER':
                return (
                  item.id !== 'userManagement' && item.id !== 'integration'
                );
              case 'ROLE_UNAUTHENTICATED':
                return null;
            }
          }) ?? [];
        setMenuItems(filteredItems);
    },
  });


  const location = useLocation();
  const [navCollapsed, setNavCollapsed] = useState(false);

  const handleNavToggle = (event: MouseEvent) => {
    const isExpanded =
      event.currentTarget.getAttribute('aria-expanded') === 'true';
    event.currentTarget.setAttribute(
      'aria-expanded',
      isExpanded ? 'false' : 'true'
    );
  };

  const renderMenuTree = (menuItems: MenuItem[]) => {
    return menuItems.map((menuItem) => (
      <li key={menuItem.label}>
        {menuItem.children ? (
          <>
            <button
              className={clsx('nav__toggle', {
                'nav__toggle--icon': !!menuItem.id,
              })}
              aria-expanded={
                menuItem.path && location.pathname.includes(menuItem.path)
                  ? 'true'
                  : 'false'
              }
              onClick={handleNavToggle}
            >
              {/* {menuItem.id && ( */}
              <Icon icon={menuItem?.icon} />
              <span>{menuItem.label}</span>
              <Icon icon={<MdKeyboardArrowDown />} />
            </button>
            <ul className="nav__submenu">
              {renderMenuTree(menuItem.children)}
            </ul>
          </>
        ) : (
          <NavLink to={menuItem.path ?? '#'}>
            {' '}
            <Icon icon={menuItem?.icon} />
            {menuItem.label}
          </NavLink>
        )}
      </li>
    ));
  };

  if (!menuItems) return null;

  return (
    <nav className={clsx('nav', { 'nav--collapsed': navCollapsed })}>
      <ul className="nav__menu">{renderMenuTree(menuItems)}</ul>
    </nav>
  );
};

export default MainNavigation;
