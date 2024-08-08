import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { Track, Button, Dialog } from 'components';
import useStore from 'store';
import { ReactComponent as BykLogo } from 'assets/logo.svg';
import { useToast } from 'hooks/useToast';
import apiDev from 'services/api-dev';
import { useCookies } from 'react-cookie';
import './Header.scss';
import { useDialog } from 'hooks/useDialog';
import { ButtonAppearanceTypes } from 'enums/commonEnums';
import { authEndpoints } from 'utils/endpoints';

const Header: FC = () => {
  const { t } = useTranslation();
  const userInfo = useStore((state) => state.userInfo);
  const toast = useToast();

  const { open } = useDialog();

  const [sessionTimeOutDuration, setSessionTimeOutDuration] =
    useState<number>(30);
  const [sessionTimeOutModalOpened, setSessionTimeOutModalOpened] =
    useState<boolean>(false);
  const [sessionExtentionInProgress, setSessionExtentionInProgress] =
    useState<boolean>(false);
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
        if (
          expirationDate < currentDate &&
          expirationDate.getTime() - currentDate.getTime() <= 120000
        ) {
          setSessionTimeOutModalOpened(true);
          setSessionTimeOutDuration(30);
        }
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [open, sessionTimeOutDuration]);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (sessionTimeOutModalOpened) {
      timer = setInterval(() => {
        setSessionTimeOutDuration((prev) => {
          if (prev > 0) {
            return prev - 1;
          } else {
            if (!sessionExtentionInProgress) handleLogout();
            return 0;
          }
        });
      }, 1000);
    } else if (timer) {
      clearInterval(timer);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [sessionTimeOutModalOpened]);

  const [_, setCookie] = useCookies([customJwtCookieKey]);

  const setNewCookie = (cookieValue: string) => {
    const cookieOptions = { path: '/' };
    setCookie(customJwtCookieKey, cookieValue, cookieOptions);
  };

  const extendUserSessionMutation = useMutation({
    mutationFn: async () => {
      return await apiDev.get(authEndpoints.GET_EXTENDED_COOKIE());
    },
    onSuccess: (data) => {
      setNewCookie(data?.data?.response);
      setSessionTimeOutDuration(30);
      setSessionTimeOutModalOpened(false);
      setSessionExtentionInProgress(false);
    },
    onError: (error: AxiosError) => {
      handleLogout();
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => apiDev.get(authEndpoints.LOGOUT()),
    onSuccess() {
      localStorage.removeItem('exp');
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

  const handleLogout = () => {
    localStorage.removeItem('exp');
    logoutMutation.mutate();
  };
  return (
    <div>
      <header className="header">
        <Track justify="between">
          <BykLogo height={50} />
          {userInfo && (
            <Track gap={32}>
              <Button
                appearance={ButtonAppearanceTypes.TEXT}
                style={{ textDecoration: 'underline' }}
                onClick={handleLogout}
              >
                {t('global.logout')}
              </Button>
            </Track>
          )}
        </Track>
      </header>

      {sessionTimeOutModalOpened && (
        <>
          <Dialog
            onClose={() => setSessionTimeOutModalOpened(false)}
            isOpen={sessionTimeOutModalOpened}
            title={t('global.sessionTimeOutTitle') ?? ''}
            footer={
              <div>
                <Button
                  appearance={ButtonAppearanceTypes.SECONDARY}
                  onClick={handleLogout}
                >
                  {t('global.logout')}
                </Button>
                <Button
                  appearance={ButtonAppearanceTypes.PRIMARY}
                  onClick={() => {
                    setSessionExtentionInProgress(true);
                    extendUserSessionMutation.mutate();
                  }}
                >
                  {t('global.extedSession')}
                </Button>
              </div>
            }
          >
            <p>
              {t('global.sessionTimeOutDesc', {
                seconds: sessionTimeOutDuration,
              }) ?? ''}
            </p>
          </Dialog>
        </>
      )}
    </div>
  );
};

export default Header;