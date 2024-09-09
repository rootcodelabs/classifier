import React, { ReactNode } from 'react';
import { MdDashboard } from 'react-icons/md';
import './NoDataView.scss';
interface NoDataViewProps {
  text?: string;
  icon?: ReactNode;
}

const NoDataView: React.FC<NoDataViewProps> = ({ text, icon }) => {
  return (
    <div className="text-center p-5">
      <MdDashboard size={50} color="grey" />
      <div className="text-center text-grey">
        {text}
      </div>
    </div>
  );
};

export default NoDataView;
