import { FC, MouseEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  NavLink,
  useLocation,
  useNavigate,
  useNavigation,
} from 'react-router-dom';
import {
  MdApps,
  MdKeyboardArrowDown,
  MdOutlineDataset,
  MdPeople,
  MdSettings,
  MdSettingsBackupRestore,
  MdTextFormat,
} from 'react-icons/md';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { Icon } from 'components';
import type { MenuItem } from 'types/mainNavigation';
import './MainNavigation.scss';
import apiDev from 'services/api-dev';
import { userManagementEndpoints } from 'utils/endpoints';
import { integrationQueryKeys } from 'utils/queryKeys';
import { ROLES } from 'enums/roles';

const MainNavigation: FC = () => {
  const { t } = useTranslation();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  const navigate = useNavigate();

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
      icon: <MdOutlineDataset />,
      children: [
        {
          label: t('menu.datasetGroups'),
          path: 'dataset-groups',
        },
        {
          label: t('menu.validationSessions'),
          path: 'validation-sessions',
        },
        {
          label: t('menu.stopWords'),
          path: 'stop-words',
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
      id: 'incomingTexts',
      label: t('menu.incomingTexts'),
      path: '/incoming-texts',
      icon: <MdTextFormat />,
    },
    {
      id: 'testModel',
      label: t('menu.testModel'),
      path: '/test-model',
      icon: <MdSettingsBackupRestore />,
    },
  ];

  const filterItemsByRole = (role: string, items: MenuItem[]) => {
    return items?.filter((item) => {
      switch (role) {
        case ROLES.ROLE_ADMINISTRATOR:
          return item?.id;
        case ROLES.ROLE_MODEL_TRAINER:
          return item?.id !== 'userManagement' && item?.id !== 'integration';
        case 'ROLE_UNAUTHENTICATED':
          return false;
        default:
          return false;
      }
    });
  };

  useQuery(integrationQueryKeys.USER_ROLES(), {
    queryFn: async () => {
      const res = await apiDev.get(userManagementEndpoints.FETCH_USER_ROLES());
      return res?.data?.response;
    },
    onSuccess: (res) => {
      const role = res[0];
      const filteredItems = filterItemsByRole(role, items);
      setMenuItems(filteredItems);
      if (role !== ROLES.ROLE_ADMINISTRATOR) {
        navigate('/dataset-groups');
      }
    },
    onError: (error) => {
      console.error('Error fetching user roles:', error);
    },
  });
  const location = useLocation();
  const [navCollapsed, setNavCollapsed] = useState(false);

  const handleNavToggle = (event: MouseEvent) => {
    const isExpanded =
      event?.currentTarget?.getAttribute('aria-expanded') === 'true';
    event?.currentTarget?.setAttribute(
      'aria-expanded',
      isExpanded ? 'false' : 'true'
    );
  };

  const renderMenuTree = (menuItems: MenuItem[]) => {
    return menuItems?.map((menuItem) => (
      <li key={menuItem?.label}>
        {menuItem?.children ? (
          <div>
            <button
              className={clsx('nav__toggle', {
                'nav__toggle--icon': !!menuItem.id,
              })}
              aria-expanded={
                menuItem?.path && location?.pathname?.includes(menuItem?.path)
                  ? 'true'
                  : 'false'
              }
              onClick={handleNavToggle}
            >
              <Icon icon={menuItem?.icon} />
              <span>{menuItem?.label}</span>
              <Icon icon={<MdKeyboardArrowDown />} />
            </button>
            <ul className="nav__submenu">
              {renderMenuTree(menuItem?.children)}
            </ul>
          </div>
        ) : (
          <NavLink to={menuItem?.path ?? '#'}>
            {' '}
            <Icon icon={menuItem?.icon} />
            {menuItem?.label}
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