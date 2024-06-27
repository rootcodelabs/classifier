import { FC, PropsWithChildren, ReactNode, useState } from 'react';
import './IntegrationCard.scss';
import { useTranslation } from 'react-i18next';
import { Button, Card, Dialog, FormInput, Switch } from 'components';

type IntegrationCardProps = {
  logo?: ReactNode;
  channel?: string;
  channelDescription?: string;
  user?: string;
  isActive?: boolean;
  status?: string;
};

const IntegrationCard: FC<PropsWithChildren<IntegrationCardProps>> = ({
  logo,
  channel,
  channelDescription,
  user,
  isActive,
  status,
}) => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('JIRA_INTEGRATION');

  return (
    <>
      <Card
        isfullwidth={true}
        footer={
          <>
            
          </>
        }
      >
        <>
          <div className="card_header">
            <div className="logo">{logo}</div>
            <div className="title">
              <h2>{channel}</h2>
              <p>{channelDescription}</p>
              
            </div>
            <div className="toggle-switch">
              <div style={{float:"right",marginBottom:"5px"}}>
              <Switch label="" checked={isActive}/>
              </div>
              <div style={{display:"block"}}>
              <div className="footer_container">
              <div className="status-indicators">
                <span className="status">
                  <span className="dot green"></span> connected - Outlook
                </span>
                <span className="status">
                  <span className="dot grey"></span> Disconnected - Pinal
                </span>
              </div>
              </div>
            </div>
            </div>
            
          </div>
        </>
      </Card>
      {modalType === 'JIRA_INTEGRATION' && (
        <Dialog
          onClose={() => setIsModalOpen(false)}
          isOpen={isModalOpen}
          title={'Integration with Jira'}
          footer={
            <>
              <>
                <Button
                  appearance="secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  appearance="primary"
                  onClick={() => setModalType('ERROR')}
                >
                  Connect
                </Button>
              </>
            </>
          }
        >
          <div className="form-container">
            <form>
              <div className="form-group">
                <FormInput
                  label="Access Token ID"
                  placeholder="Token ID"
                  name="tokenID"
                />
              </div>
            </form>
          </div>
        </Dialog>
      )}
      {modalType === 'SUCCESS' && (
        <Dialog
          onClose={() => setIsModalOpen(false)}
          isOpen={isModalOpen}
          title={'Integration Successful'}
        >
          <div className="form-container">
            You have successfully connected with Jira! Your integration is now
            complete, and you can start working with Jira seamlessly.
          </div>
        </Dialog>
      )}
      {modalType === 'ERROR' && (
        <Dialog
          onClose={() => setIsModalOpen(false)}
          isOpen={isModalOpen}
          title={'Integration Error'}
        >
          <div className="form-container">
          Failed to connect with Jira. Please check your settings and try again. If the problem persists, contact support for assistance.
          </div>
        </Dialog>
      )}
        {modalType === 'DISCONNECT' && (
        <Dialog
          onClose={() => setIsModalOpen(false)}
          isOpen={isModalOpen}
          title={'Are you sure?'}
          footer={
            <>
              <>
                <Button
                  appearance="secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  appearance="error"
                  onClick={() => setModalType('ERROR')}
                >
                  Disconnect
                </Button>
              </>
            </>
          }
        >
          <div className="form-container">
          Are you sure you want to disconnect the Jira integration? This action cannot be undone and may affect your workflow and linked issues.
          </div>
        </Dialog>
      )}
    </>
  );
};

export default IntegrationCard;
