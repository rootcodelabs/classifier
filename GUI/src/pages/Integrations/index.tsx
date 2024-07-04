import { FC } from 'react';
import './Integrations.scss';
import { useTranslation } from 'react-i18next';
import { Button, Card, Switch } from 'components';
import IntegrationCard from 'components/molecules/IntegrationCard';
import Outlook from 'assets/Outlook';
import Pinal from 'assets/Pinal';
import Jira from 'assets/Jira';

const Integrations: FC = () => {
  const { t } = useTranslation();

  return (
    <><div className='container'>
      <div className="title_container">
        <div className="title">Integration</div>
      </div>
      <div>
        <IntegrationCard
          logo={<Jira/>}
          channel={"Jira"}
          channelDescription={"Atlassian vea jälgimise ja projektijuhtimise tarkvara"}
          user={"Rickey Walker - Admin"}
          isActive={false}
          connectedStatus={[{platform:"Jira", status:"Connected"}]}
        />
         <IntegrationCard
          logo={<Outlook/>}
          channel={"Outlook"}
          channelDescription={"Atlassian vea jälgimise ja projektijuhtimise tarkvara"}
          user={"Rickey Walker - Admin"}
          isActive={true}
          connectedStatus={[{platform:"Outlook", status:"Connected"}]}
        />
         <IntegrationCard
          logo={<Pinal/>}
          channel={"Outlook+Pinal"}
          channelDescription={"Atlassian vea jälgimise ja projektijuhtimise tarkvara"}
          user={"Rickey Walker - Admin"}
          isActive={true}
          connectedStatus={[{platform:"Outlook", status:"Connected"}, {platform:"Pinal", status:"Disconnected"}]}
        />
      </div></div>
    </>
  );
};

export default Integrations;
