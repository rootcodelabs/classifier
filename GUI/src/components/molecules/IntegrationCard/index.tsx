import { FC, PropsWithChildren, ReactNode, useState } from 'react';
import './IntegrationCard.scss';
import { useTranslation } from 'react-i18next';
import { Button, Card, Dialog, Switch } from 'components';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { OperationConfig } from 'types/integration';
import { togglePlatform } from 'services/integration';
import { AxiosError } from 'axios';
import { INTEGRATION_MODALS, INTEGRATION_OPERATIONS } from 'enums/integrationEnums';

type IntegrationCardProps = {
  logo?: ReactNode;
  channel?: string;
  channelDescription?: string;
  isActive?: boolean;
};

const IntegrationCard: FC<PropsWithChildren<IntegrationCardProps>> = ({
  logo,
  channel,
  channelDescription,
  isActive,
}) => {

  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const queryClient = useQueryClient();

  const renderStatusIndicators = () => {
    //kept this, in case the logic is changed for the connected status
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
    mutationFn: (data: OperationConfig) => togglePlatform(data),
    onSuccess: async () => {
      setModalType(INTEGRATION_MODALS.INTEGRATION_SUCCESS);
      await queryClient.invalidateQueries([
        'classifier/integration/platform-status'
      ]);
    },
    onError: (error: AxiosError) => {
      setModalType(INTEGRATION_MODALS.INTEGRATION_ERROR);
    },
  });

  const platformDisableMutation = useMutation({
    mutationFn: (data: OperationConfig) => togglePlatform(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries([
        'classifier/integration/platform-status'
      ]);
      setIsModalOpen(false)    },
    onError: (error: AxiosError) => {
      setModalType(INTEGRATION_MODALS.DISCONNECT_ERROR);
    },
  });

  const onSelect = () => {
    if (isActive) {
      setModalType(INTEGRATION_MODALS.DISCONNECT_CONFIRMATION)
    } else {
      setModalType(INTEGRATION_MODALS.CONNECT_CONFIRMATION)
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

      {modalType === INTEGRATION_MODALS.INTEGRATION_SUCCESS && (
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
      {modalType ===INTEGRATION_MODALS.INTEGRATION_ERROR && (
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
      {modalType === INTEGRATION_MODALS.DISCONNECT_CONFIRMATION && (
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
                    operation: INTEGRATION_OPERATIONS.DISABLE,
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
      {modalType === INTEGRATION_MODALS.CONNECT_CONFIRMATION && (
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
                    operation: INTEGRATION_OPERATIONS.ENABLE,
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
      {modalType === INTEGRATION_MODALS.DISCONNECT_ERROR && (
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
