import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ProgressBar from 'components/ProgressBar';
import { Card, Label } from 'components';

type ValidationSessionCardProps = {
    dgName:string;
    version:string;
    isLatest:boolean;
    status?:string;
    errorMessage?: string;
    progress: number;
  };
  
const ValidationSessionCard: React.FC<ValidationSessionCardProps> = ({dgName,version,isLatest,status,errorMessage,progress}) => {
  const { t } = useTranslation();

  return (
    <Card
    header={
      <div className="flex-grid">
        {dgName} <Label type='success'>{version}</Label>
        {isLatest &&(
        <Label type='success'>Latest</Label>
        )}
         {status==="failed" &&(
        <Label type='error'>Failed</Label>
        )}
      </div>
    }
  >
    <div>
      {status==="failed" ? (
        <div className='text-center'>
         {errorMessage}
        </div>
      ) : (
        <div>
          <div className="text-center">{status}</div>
          <ProgressBar
            value={progress}
            max={100}
            label={`${progress}%`}
          />
        </div>
      )}
    </div>
  </Card>
  );
};

export default ValidationSessionCard;
