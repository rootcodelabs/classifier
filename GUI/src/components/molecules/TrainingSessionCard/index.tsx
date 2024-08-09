import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ProgressBar from 'components/ProgressBar';
import { Card, Label } from 'components';

type TrainingSessionCardProps = {
  modelName: string;
  dgName: string;
  deployedModel: string;
  lastTrained: string;
  isLatest: boolean;
  version: string;
  status?: string;
  errorMessage?: string;
  progress: number;
  platform?: string;
  maturity?: string;
};

const TrainingSessionCard: React.FC<TrainingSessionCardProps> = ({
  dgName,
  modelName,
  deployedModel,
  lastTrained,
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
          <div className="title-m"> {modelName} </div>
          <p className="flex">Dataset Group : {dgName} </p>
          <p className="flex">Deployed Model : {deployedModel} </p>
          <p className="flex">Last Trained : {lastTrained} </p>

          <div className="flex-grid">
            {isLatest && <Label type="success">Latest</Label>}
            <Label type="success">{version}</Label>
            {platform && <Label type="success">{platform}</Label>}{' '}
            {maturity && <Label type="success">{maturity}</Label>}
            {status === 'Fail' && <Label type="error">Failed</Label>}
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
