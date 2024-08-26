import { useTranslation } from 'react-i18next';
import ProgressBar from 'components/ProgressBar';
import { Card, Label } from 'components';

type TrainingSessionCardProps = {
  modelName: string;
  isLatest: boolean;
  version: string;
  status?: string;
  errorMessage?: string;
  progress: number;
  platform?: string;
  maturity?: string;
};

const TrainingSessionCard: React.FC<TrainingSessionCardProps> = ({
  modelName,
  version,
  isLatest,
  status,
  errorMessage,
  progress,
  maturity,
  platform,
}) => {
  const { t } = useTranslation();

  return (
    <Card
      header={
        <div>
          <div className="flex-grid">
          <div> {modelName} </div>
            {isLatest && <Label type="success">{t('global.latest')}</Label>}
            <Label type="success">{version}</Label>
            {platform && <Label type="success">{platform}</Label>}{' '}
            {maturity && <Label type="success">{maturity}</Label>}
            {status === 'Fail' && <Label type="error">{t('global.failed')}</Label>}
          </div>
        </div>
      }
    >
      <div>
        {errorMessage ? (
          <div className="text-center">{errorMessage}</div>
        ) : (
          <div>
            <div className="text-center">{status}</div>
            <ProgressBar value={progress} max={100} label={`${progress}%`} />
          </div>
        )}
      </div>
    </Card>
  );
};

export default TrainingSessionCard;
