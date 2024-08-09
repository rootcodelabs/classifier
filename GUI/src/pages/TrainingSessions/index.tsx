import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ValidationSessionCard from 'components/molecules/ValidationSessionCard';
import sse from 'services/sse-service';
import { useQuery } from '@tanstack/react-query';
import { getDatasetGroupsProgress } from 'services/datasets';
import { getDataModelsProgress } from 'services/data-models';
import TrainingSessionCard from 'components/molecules/TrainingSessionCard';

const TrainingSessions: FC = () => {
  const { t } = useTranslation();
  const [progresses, setProgresses] = useState([]);

  const { data: progressData } = useQuery(
    ['datamodels/progress'],
    () => getDataModelsProgress(),
    {
      onSuccess: (data) => {
        setProgresses(data);
      },
    }
  );

  useEffect(() => {
    if (!progressData) return;

    const handleUpdate = (sessionId, newData) => {
      setProgresses((prevProgresses) =>
        prevProgresses.map((progress) =>
          progress.id === sessionId ? { ...progress, ...newData } : progress
        )
      );
    };

    const eventSources = progressData.map((progress) => {
      return sse(`/${progress.id}`, 'model', (data) => {
        console.log(`New data for notification ${progress.id}:`, data);
        handleUpdate(data.sessionId, data);
      });
    });

    return () => {
      eventSources.forEach((eventSource) => eventSource.close());
      console.log('SSE connections closed');
    };
  }, [progressData]);

  return (
    <div>
      <div className="container">
        <div className="title_container">
          <div className="title">Validation Sessions</div>
        </div>
        {progresses?.map((session) => {
          return (
            <TrainingSessionCard
              modelName={session.modelName}
              deployedModel={session.deployedModel}
              lastTrained={session.lastTrained}
              dgName={session.groupName}
              version={`V${session?.majorVersion}.${session?.minorVersion}`}
              isLatest={session.latest}
              status={session.trainingStatus}
              progress={session.progressPercentage}
            />
          );
        })}
      </div>
    </div>
  );
};

export default TrainingSessions;
