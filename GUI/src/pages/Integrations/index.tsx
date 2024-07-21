import { FC } from 'react';
import './Integrations.scss';
import { useTranslation } from 'react-i18next';
import { Button, Card, Switch } from 'components';
import IntegrationCard from 'components/molecules/IntegrationCard';
import Outlook from 'assets/Outlook';
import Pinal from 'assets/Pinal';
import Jira from 'assets/Jira';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getIntegrationStatus } from 'services/integration';

const Integrations: FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  
  const { data: integrationStatus, isLoading } = useQuery(
    ['classifier/integration/platform-status'],
    () => getIntegrationStatus()
  );
console.log(integrationStatus);

  return (
    <div><div className='container'>
      <div className="title_container">
        <div className="title">{t('integration.title')}</div>
      </div>
      <div>
        <IntegrationCard
          logo={<Jira/>}
          channel={t('integration.jira')??""}
          channelDescription={t('integration.jiraDesc')??""}
          isActive={integrationStatus?.jira_connection_status}
        />
         <IntegrationCard
          logo={<Outlook/>}
          channel={t('integration.outlook')??""}
          channelDescription={t('integration.outlookDesc')??""}
          isActive={integrationStatus?.outlook_connection_status}
        />
         <IntegrationCard
          logo={<Pinal/>}
          channel={"Outlook+Pinal"}
          channelDescription={t('integration.pinalDesc')??""}
          user={"Rickey Walker - Admin"}
          isActive={integrationStatus?.pinal_connection_status}
        />
      </div></div>
    </div>
  );
};

export default Integrations;
