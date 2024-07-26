import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ProgressBar from 'components/ProgressBar';

const ValidationSessions: FC = () => {
  const { t } = useTranslation();
  const [progress, setProgress] = useState(40);


  return (
    <div><div className='container'>
      <div className="title_container">
        <div className="title">Validation Sessions</div>
      </div>
      <ProgressBar value={progress} max={100} label={`${progress}%`} />

     </div>
    </div>
  );
};

export default ValidationSessions;
