import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ProgressBar from 'components/ProgressBar';
import { Card, Label } from 'components';
import ValidationSessionCard from 'components/molecules/ValidationSessionCard';

const ValidationSessions: FC = () => {
  const { t } = useTranslation();
  const [progress, setProgress] = useState(40);

  const data = [
    {
      dgName: 'Dataset Group Alpha',
      version: 'V5.3.1',
      isLatest: true,
      status: '',
      errorMessage: '',
      progress: 30,
    },
    {
      dgName: 'Dataset Group 1',
      version: 'V5.3.1',
      isLatest: true,
      status: '',
      errorMessage: '',
      progress: 50,
    },
    {
      dgName: 'Dataset Group 2',
      version: 'V5.3.1',
      isLatest: true,
      status: 'failed',
      errorMessage:
        'Validation failed because “complaints” class found in the “department” column does not exist in hierarchy',
      progress: 30,
    },
    {
      dgName: 'Dataset Group 3',
      version: 'V5.3.1',
      isLatest: false,
      status: '',
      errorMessage: '',
      progress: 80,
    },
  ];

  return (
    <div>
      <div className="container">
        <div className="title_container">
          <div className="title">Validation Sessions</div>
        </div>
        {data?.map((session) => {
          return (
            <ValidationSessionCard
              dgName={session.dgName}
              version={session.version}
              isLatest={session.isLatest}
              status={session.status}
              errorMessage={session.errorMessage}
              progress={session.progress}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ValidationSessions;
