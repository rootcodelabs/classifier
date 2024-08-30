import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import ValidationSessionCard from 'components/molecules/ValidationSessionCard';
import { useValidationSessions } from 'hooks/useValidationSessions';

const ValidationSessions: FC = () => {
  const { t } = useTranslation();
  const progresses = useValidationSessions();

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
