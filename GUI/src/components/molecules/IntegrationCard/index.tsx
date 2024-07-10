import { FC, PropsWithChildren, ReactNode, useState } from 'react';
import './IntegrationCard.scss';
import { useTranslation } from 'react-i18next';
import { Button, Card, Dialog, Switch } from 'components';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { IntegrationStatus } from 'types/integration';
import { togglePlatform } from 'services/integration';
import { AxiosError } from 'axios';

type IntegrationCardProps = {
  logo?: ReactNode;
  channel?: string;
  channelDescription?: string;
  user?: string;
  isActive?: boolean;
};

const IntegrationCard: FC<PropsWithChildren<IntegrationCardProps>> = ({
  logo,
  channel,
  channelDescription,
  user,
  isActive,
}) => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChecked, setIsChecked] = useState(isActive);
  const [modalType, setModalType] = useState('JIRA_INTEGRATION');
  const queryClient = useQueryClient();

  const renderStatusIndicators = () => {
    // return connectedStatus?.map((status, index) => (
    //   <span key={index} className="status">
    //     <span
    //       className={`dot ${
    //         status.status.toLowerCase() === 'connected' ? 'green' : 'grey'
    //       }`}
    //     ></span>
    //     {connectedStatus?.length > 1
    //       ? `${status.status} - ${status.platform}`
    //       : `${status.status}`}
    //   </span>
    // ));

    return (
      <span className="status">
        <span className={`dot ${isActive ? 'green' : 'grey'}`}></span>
        <>
          {isActive
            ? t('integration.connected')
            : t('integration.disconnected')}
        </>
      </span>
    );
  };

  const platformEnableMutation = useMutation({
    mutationFn: (data: IntegrationStatus) => togglePlatform(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries([
        'classifier/integration/platform-status',
        'prod',
      ]);
      // setIsChecked(true);
      setModalType('INTEGRATION_SUCCESS');
    },
    onError: (error: AxiosError) => {
      setModalType('INTEGRATION_ERROR');
    },
  });

  const platformDisableMutation = useMutation({
    mutationFn: (data: IntegrationStatus) => togglePlatform(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries([
        'classifier/integration/platform-status',
        'prod',
      ]);
      // setIsChecked(true);
      // setModalType('DISCONNECT_CONFIRMATION');
    },
    onError: (error: AxiosError) => {
      setModalType('DISCONNECT_ERROR');
    },
  });

  const onSelect = () => {
    if (isChecked) {
      setModalType("DISCONNECT_CONFIRMATION")
    } else {
      setModalType("CONNECT_CONFIRMATION")
    }
    setIsModalOpen(true);
  };

  return (
    <>
      <Card isFullWidth={true}>
        <div className="card_header">
          <div className="logo">{logo}</div>
          <div className="title">
            <h2>{channel}</h2>
            <p>{channelDescription}</p>
          </div>
          <div className="toggle-switch">
            <div style={{ float: 'right', marginBottom: '5px' }}>
              <Switch label="" checked={isActive} onCheckedChange={onSelect} />
            </div>
            <div style={{ display: 'block' }}>
              <div className="footer_container">
                <div className="status-indicators">
                  {renderStatusIndicators()}
                </div>
              </div>
            </div>{' '}
          </div>
        </div>
      </Card>

      {modalType === 'INTEGRATION_SUCCESS' && (
        <Dialog
          onClose={() => setIsModalOpen(false)}
          isOpen={isModalOpen}
          title={t('integration.integrationSuccessTitle')}
        >
          <div className="form-container">
            {t('integration.integrationSuccessDesc', { channel })}
          </div>
        </Dialog>
      )}
      {modalType === 'INTEGRATION_ERROR' && (
        <Dialog
          onClose={() => setIsModalOpen(false)}
          isOpen={isModalOpen}
          title={t('integration.integrationErrorTitle')}
        >
          <div className="form-container">
            {t('integration.integrationErrorDesc', { channel })}
          </div>
        </Dialog>
      )}
      {modalType === 'DISCONNECT_CONFIRMATION' && (
        <Dialog
          onClose={() => setIsModalOpen(false)}
          isOpen={isModalOpen}
          title={t('integration.confirmationModalTitle')}
          footer={
            <>
              <Button
                appearance="secondary"
                onClick={() => setIsModalOpen(false)}
              >
                {t('global.cancel')}
              </Button>
              <Button
                appearance="error"
                onClick={() => {
                  platformDisableMutation.mutate({
                    operation: 'disable',
                    platform: channel?.toLowerCase(),
                  });
                }}
              >
                {t('global.disconnect')}
              </Button>
            </>
          }
        >
          <div className="form-container">
            {t('integration.disconnectConfirmationModalDesc', { channel })}
          </div>
        </Dialog>
      )}
      {modalType === 'CONNECT_CONFIRMATION' && (
        <Dialog
          onClose={() => setIsModalOpen(false)}
          isOpen={isModalOpen}
          title={t('integration.confirmationModalTitle')}
          footer={
            <>
              <Button
                appearance="secondary"
                onClick={() => setIsModalOpen(false)}
              >
                {t('global.cancel')}
              </Button>
              <Button
                appearance="primary"
                onClick={() => {
                  platformEnableMutation.mutate({
                    operation: 'enable',
                    platform: channel?.toLowerCase(),
                  });
                }}
              >
                {t('global.connect')}
              </Button>
            </>
          }
        >
          <div className="form-container">
            {t('integration.connectConfirmationModalDesc', { channel })}
          </div>
        </Dialog>
      )}
      {modalType === 'DISCONNECT_ERROR' && (
        <Dialog
          onClose={() => setIsModalOpen(false)}
          isOpen={isModalOpen}
          title={t('integration.disconnectErrorTitle')}
        >
          <div className="form-container">
            {t('integration.disconnectErrorDesc', { channel })}
          </div>
        </Dialog>
      )}
    </>
  );
};

export default IntegrationCard;
