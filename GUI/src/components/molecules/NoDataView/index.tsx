import React, { ReactNode } from 'react';
import { MdDashboard } from 'react-icons/md';
import { useTranslation } from 'react-i18next';

interface NoDataViewProps {
  text?: string;
  icon?: ReactNode;
}

const NoDataView: React.FC<NoDataViewProps> = ({ text, icon }) => {
    const { t } = useTranslation();

  return (
    <div className="text-center" style={{padding:'5rem'}}>
      <MdDashboard size={50} color='grey'/>
      <div className='text-center' style={{color:'grey'}}>{text}</div>
      </div>
  );
};

export default NoDataView;