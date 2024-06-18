import { FC, PropsWithChildren, ReactNode } from 'react';
import './IntegrationCard.scss';
import { useTranslation } from 'react-i18next';
import { Button, Card, Switch } from 'components';

type IntegrationCardProps = {
    logo?: ReactNode;
    channel?: string;
    channelDescription?: string;
    user?: string;
    isActive?:boolean;
    status?:string;
  };

const IntegrationCard: FC<PropsWithChildren<IntegrationCardProps>> = ({logo,channel,channelDescription,user,isActive,status}) => {
  const { t } = useTranslation();

  return (
        <Card
          isfullwidth={true}
          footer={
            <>
              <div className="footer_container">
                <div className="status-indicators">
                  <span className="status">
                    <span className="dot green"></span> connected - Outlook
                  </span>
                  <span className="status">
                    <span className="dot grey"></span> Disconnected - Pinal
                  </span>
                </div>
                <div className="actions">
                  <Button appearance="primary" size='s'>Connect</Button>
                  <Button appearance="error" size='s'>Disconnect</Button>
                </div>
              </div>
            </>
          }
        >
          <>
            <div className="card_header">
              <div className="logo">
               {logo}
              </div>
              <div className="title">
                <h2>{channel}</h2>
                <p>
                  {channelDescription}
                </p>
                <p>{user}</p>
              </div>
              <div className="toggle-switch">
                <Switch label="" checked={isActive}/>
              </div>
            </div>
          </>
        </Card>
      
  );
};

export default IntegrationCard;
