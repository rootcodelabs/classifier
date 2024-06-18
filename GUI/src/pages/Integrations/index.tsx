import { FC } from 'react';
import './Integrations.scss';
import { useTranslation } from 'react-i18next';
import { Button, Card, Switch } from 'components';
import IntegrationCard from 'components/molecules/IntegrationCard';
import Jira from 'assets/jira';
import Outlook from 'assets/Outlook';
import Pinal from 'assets/Pinal';

const Integrations: FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <div className="container">
        <div className="title">Integration</div>
      </div>
      <div className="integration_container">
        <IntegrationCard
          logo={<Jira/>}
          channel={"Jira"}
          channelDescription={"Atlassian vea jälgimise ja projektijuhtimise tarkvara"}
          user={"Rickey Walker - Admin"}
          isActive={true}
          status={"Connected"}
        />
         <IntegrationCard
          logo={<Outlook/>}
          channel={"Outlook"}
          channelDescription={"Atlassian vea jälgimise ja projektijuhtimise tarkvara"}
          user={"Rickey Walker - Admin"}
          isActive={true}
          status={"Connected"}
        />
         <IntegrationCard
          logo={<Pinal/>}
          channel={"Outlook+Pinal"}
          channelDescription={"Atlassian vea jälgimise ja projektijuhtimise tarkvara"}
          user={"Rickey Walker - Admin"}
          isActive={true}
          status={"Connected"}
        />
      </div>
    </>
  );
};

export default Integrations;
