import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useIdleTimer } from 'react-idle-timer';
import { MdOutlineExpandMore } from 'react-icons/md';

import {
  Track,
  Button
} from 'components';
import useStore from 'store';
import { ReactComponent as BykLogo } from 'assets/logo.svg';
import { useToast } from 'hooks/useToast';
import { USER_IDLE_STATUS_TIMEOUT } from 'constants/config';
import apiDev from 'services/api-dev';
import { useCookies } from 'react-cookie';
import './Header.scss';

type CustomerSupportActivityDTO = {
  customerSupportActive: boolean;
  customerSupportStatus: 'offline' | 'idle' | 'online';
  customerSupportId: string;
};

const Header: FC = () => {
  const { t } = useTranslation();
  const userInfo = useStore((state) => state.userInfo);
  const toast = useToast();

  const queryClient = useQueryClient();
  const [csaStatus, setCsaStatus] = useState<'idle' | 'offline' | 'online'>(
    'online'
  );

  const customJwtCookieKey = 'customJwtCookie';

  useEffect(() => {
    const interval = setInterval(() => {
      const expirationTimeStamp = localStorage.getItem('exp');
      if (
        expirationTimeStamp !== 'null' &&
        expirationTimeStamp !== null &&
        expirationTimeStamp !== undefined
      ) {
        const expirationDate = new Date(parseInt(expirationTimeStamp) ?? '');
        const currentDate = new Date(Date.now());        
        if (expirationDate < currentDate) {
          localStorage.removeItem('exp');
           window.location.href =import.meta.env.REACT_APP_CUSTOMER_SERVICE_LOGIN;
        }
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [userInfo]);

  const [_, setCookie] = useCookies([customJwtCookieKey]);


  const customerSupportActivityMutation = useMutation({
    mutationFn: (data: CustomerSupportActivityDTO) =>
      apiDev.post('accounts/customer-support-activity', {
        customerSupportActive: data.customerSupportActive,
        customerSupportStatus: data.customerSupportStatus,
      }),
    onSuccess: () => {
      if (csaStatus === 'online') extendUserSessionMutation.mutate();
    },
    onError: async (error: AxiosError) => {
      await queryClient.invalidateQueries([
        'accounts/customer-support-activity',
        'prod',
      ]);
      toast.open({
        type: 'error',
        title: t('global.notificationError'),
        message: error.message,
      });
    },
  });

  const setNewCookie = (cookieValue: string) => {
    const cookieOptions = { path: '/' };
    setCookie(customJwtCookieKey, cookieValue, cookieOptions);
  };

  const extendUserSessionMutation = useMutation({
    mutationFn: async () => {
      const {
        data: { data },
      } = await apiDev.post('extend', {});
      if (data.custom_jwt_extend === null) return;
      setNewCookie(data.custom_jwt_extend);
    },
    onError: (error: AxiosError) => {},
  });

  const logoutMutation = useMutation({
    mutationFn: () => apiDev.get('accounts/logout'),
    onSuccess(_: any) {
      window.location.href = import.meta.env.REACT_APP_CUSTOMER_SERVICE_LOGIN;
    },
    onError: async (error: AxiosError) => {
      toast.open({
        type: 'error',
        title: t('global.notificationError'),
        message: error.message,
      });
    },
  });

  return (
    <div>
      <header className="header">
        <Track justify="between">
          <BykLogo height={50} />
          {userInfo && (
            <Track gap={32}>            
             
              <Button
                appearance="text"
                style={{ textDecoration: 'underline' }}
                onClick={() => {
                  localStorage.removeItem('exp');
                  logoutMutation.mutate();
                }}
              >
                {t('global.logout')}
              </Button>
            </Track>
          )}
        </Track>
      </header>
    </div>
  );
};

export default Header;
