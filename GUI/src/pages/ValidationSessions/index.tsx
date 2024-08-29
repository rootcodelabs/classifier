import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ValidationSessionCard from 'components/molecules/ValidationSessionCard';
import sse from 'services/sse-service';
import { useQuery } from '@tanstack/react-query';
import { getDatasetGroupsProgress } from 'services/datasets';
import { ValidationProgressData, SSEEventData } from 'types/datasetGroups';
import { datasetQueryKeys } from 'utils/queryKeys';

const ValidationSessions: FC = () => {
  const { t } = useTranslation();
  const [progresses, setProgresses] = useState<ValidationProgressData[]>([]);

  const { data: progressData, refetch } = useQuery<ValidationProgressData[]>(
    datasetQueryKeys.GET_DATASET_GROUP_PROGRESS(),
    () => getDatasetGroupsProgress(),
    {
      onSuccess: (data) => {
        setProgresses(data);
      },
    }
  );

  useEffect(() => {
    if (!progressData) return;

    const handleUpdate = (sessionId: string, newData: SSEEventData) => {
      setProgresses((prevProgresses) =>
        prevProgresses.map((progress) =>
          progress.id === sessionId ? { ...progress, ...newData } : progress
        )
      );
    };

    const eventSources = progressData.map((progress) => {
      if (
        progress.validationStatus !== 'Success' &&
        progress.progressPercentage !== 100
      )
        return sse(`/${progress.id}`, 'dataset', (data: SSEEventData) => {
          console.log(`New data for notification ${progress.id}:`, data);
          handleUpdate(data.sessionId, data);
        });
    });
    return () => {
      eventSources.forEach((eventSource) => eventSource?.close());
      console.log('SSE connections closed');
    };
  }, [progressData, refetch]);

  return (
    <div>
      <div className="container">
        <div className="title_container">
          <div className="title">{t('validationSessions.title')}</div>
        </div>
        {progresses?.map((session) => (
          <ValidationSessionCard
            key={session.id}
            dgName={session.groupName}
            version={`V${session?.majorVersion}.${session?.minorVersion}.${session?.patchVersion}`}
            isLatest={session.latest}
            status={session.validationStatus}
            validationMessage={session.validationMessage}
            progress={session.progressPercentage}
          />
        ))}
      </div>
    </div>
  );
};

export default ValidationSessions;
