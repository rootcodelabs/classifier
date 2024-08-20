import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import ValidationSessionCard from 'components/molecules/ValidationSessionCard';
import TrainingSessionCard from 'components/molecules/TrainingSessionCard';
import sse from 'services/sse-service';
import { getDataModelsProgress } from 'services/data-models';
import { SSEEventData, TrainingProgressData } from 'types/dataModels';

const TrainingSessions: FC = () => {
  const { t } = useTranslation();
  const [progresses, setProgresses] = useState<TrainingProgressData[]>([]);

  const { data: progressData } = useQuery<TrainingProgressData[]>(
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

    const handleUpdate = (sessionId: string, newData: SSEEventData) => {
      setProgresses((prevProgresses) =>
        prevProgresses.map((progress) =>
          progress.id === sessionId ? { ...progress, ...newData } : progress
        )
      );
    };

    const eventSources = progressData.map((progress) => {
      if(progress.validationStatus !=="Success" && progress.progressPercentage!==100)
      return sse(`/${progress.id}`, 'model', (data: SSEEventData) => {
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
          <div className="title">{t('trainingSessions.title')}</div>
        </div>
        {progresses?.map((session) => (
          <TrainingSessionCard
            key={session.id}
            modelName={session.modelName}
            version={`V${session?.majorVersion}.${session?.minorVersion}`}
            isLatest={session.latest}
            status={session.trainingStatus}
            progress={session.progressPercentage}
          />
        ))}
      </div>
    </div>
  );
};

export default TrainingSessions;
