import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ProgressBar from 'components/ProgressBar';
import { Card, Label } from 'components';

type ValidationSessionCardProps = {
    dgName:string;
    version:string;
    isLatest:boolean;
    status?:string;
    validationMessage?: string;
    progress: number;
  };
  
const ValidationSessionCard: React.FC<ValidationSessionCardProps> = ({dgName,version,isLatest,status,validationMessage,progress}) => {
  const { t } = useTranslation();

  return (
    <Card
    header={
      <div className="flex-grid">
        {dgName} <Label type='success'>{version}</Label>
        {isLatest &&(
        <Label type='success'>Latest</Label>
        )}
         {status==="Fail" &&(
        <Label type='error'>Failed</Label>
        )}
      </div>
    }
  >
    <div>
      {(status==="Fail" || status==="Success") && progress===100 ? (
        <div className={`text-center ${status==="Fail"?'error':''}`}>
         {validationMessage}
        </div>
      ) : (
        <div>
          <div className="text-center">{status}</div>
          <ProgressBar
            value={progress}
            max={100}
            label={`${progress}%`}
          />
           <div className='text-center'>
         {validationMessage}
        </div>
        </div>
      )}
    </div>
  </Card>
  );
};

export default ValidationSessionCard;
