import { FC, PropsWithChildren, ReactNode, useState } from 'react';
import './IntegrationCard.scss';
import { useTranslation } from 'react-i18next';
import { Button, Card, Dialog, FormInput, Switch } from 'components';
import { useNavigate } from 'react-router-dom';

type IntegrationCardProps = {
  logo?: ReactNode;
  channel?: string;
  channelDescription?: string;
  user?: string;
  isActive?: boolean;
  connectedStatus?: { platform: string, status: string }[];
};

const IntegrationCard: FC<PropsWithChildren<IntegrationCardProps>> = ({
  logo,
  channel,
  channelDescription,
  user,
  isActive,
  connectedStatus,
}) => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChecked, setIsChecked] = useState(isActive);
  const [modalType, setModalType] = useState('JIRA_INTEGRATION');
  const navigate = useNavigate();

  const renderStatusIndicators = () => {
    return connectedStatus?.map((status, index) => (
      <span key={index} className="status">
        <span className={`dot ${status.status.toLowerCase() === 'connected' ? 'green' : 'grey'}`}></span>{connectedStatus?.length>1 ? `${status.status} - ${status.platform}`:`${status.status}`} 
      </span>
    ));
  };

  const onSelect=()=>{
    if(channel==="Outlook"){
      window.location.href="http://localhost:3003/";
    }
    if(isChecked){
      setModalType("DISCONNECT");
    }else{
      setIsChecked(true)
      setModalType("SUCCESS");
     
    }
    setIsModalOpen(true)

  }

  return (
    <>
      <Card
        isFullWidth={true}
      >
        <div className="card_header">
          <div className="logo">{logo}</div>
          <div className="title">
            <h2>{channel}</h2>
            <p>{channelDescription}</p>
          </div>
          <div className="toggle-switch">
              <div style={{float:"right",marginBottom:"5px"}}>
              <Switch label="" checked={isChecked} onCheckedChange={onSelect}/>
              </div>
              <div style={{display:"block"}}>
              <div className="footer_container">
              <div className="status-indicators">
              {renderStatusIndicators()}
              </div>
              </div>
            </div>            </div>

        </div>
      </Card>
   
      {modalType === 'SUCCESS' && (
        <Dialog
          onClose={() => setIsModalOpen(false)}
          isOpen={isModalOpen}
          title={'Integration Successful'}
        >
          <div className="form-container">
            You have successfully connected with {channel}! Your integration is now complete, and you can start working with Jira seamlessly.
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
            Failed to connect with {channel}. Please check your settings and try again. If the problem persists, contact support for assistance.
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
              <Button appearance="secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button appearance="error" onClick={() => {setIsModalOpen(false);setIsChecked(false)}}>
                Disconnect
              </Button>
            </>
          }
        >
          <div className="form-container">
            Are you sure you want to disconnect the {channel} integration? This action cannot be undone and may affect your workflow and linked issues.
          </div>
        </Dialog>
      )}
    </>
  );
};

export default IntegrationCard;
