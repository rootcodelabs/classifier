import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ValidationSessionCard from 'components/molecules/ValidationSessionCard';
import sse from 'services/sse-service';
import { useQuery } from '@tanstack/react-query';
import { getDatasetGroupsProgress } from 'services/datasets';

const ValidationSessions: FC = () => {
  const { t } = useTranslation();
  const [progresses, setProgresses] = useState([]);

  const { data: progressData } = useQuery(
    ['datasetgroups/progress'],
    () => getDatasetGroupsProgress(),
    {
      onSuccess: (data) => {
        setProgresses(data); 
      },
    }
  );

  useEffect(() => {
    if (!progressData) return;

    // Function to update the state with data from each SSE
    const handleUpdate = (sessionId, newData) => {
      setProgresses((prevProgresses) =>
        prevProgresses.map((progress) =>
          progress.id === sessionId ? { ...progress, ...newData } : progress
        )
      );
    };

    // Iterate over each element and create an SSE connection for each
    const eventSources = progressData.map((progress) => {
      return sse(`/${progress.id}`, (data) => {
        console.log(`New data for notification ${progress.id}:`, data);
        handleUpdate(data.sessionId, data);
      });
    });

    // Clean up all event sources on component unmount
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
            <ValidationSessionCard
              dgName={session.groupName}
              version={`V${session?.majorVersion}.${session?.minorVersion}.${session?.patchVersion}`}
              isLatest={session.latest}
              status={session.validationStatus}
              errorMessage={session.validationMessage}
              progress={session.progressPercentage}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ValidationSessions;
