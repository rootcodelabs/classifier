import { FC, PropsWithChildren } from 'react';
import './DatasetGroupCard.scss';
import Dataset from 'assets/Dataset';
import { Switch } from 'components/FormElements';

type DatasetGroupCardProps = {
  isEnabled?: boolean;
  datasetName?: string;
  status?: string;
};

const DatasetGroupCard: FC<PropsWithChildren<DatasetGroupCardProps>> = ({
  isEnabled,
  datasetName,
  status,
}) => {
  return (
    <>
      <div className="dataset-group-card">
        <div className="row switch-row">
          <Switch label="" checked={isEnabled} />
        </div>
        <div className="row icon-text-row">
          <div className="icon">
            <Dataset />
          </div>
        </div>
        <div className="row icon-text-row">
          <p className="icon-text">{datasetName}</p>
        </div>
        <div className="label-row">
          <div className="status-indicators">
            <span className="status">
              <span
                className={`dot ${
                  status?.toLowerCase() === 'connected' ? 'green' : 'grey'
                }`}
              ></span>{' '}
              {status}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default DatasetGroupCard;
