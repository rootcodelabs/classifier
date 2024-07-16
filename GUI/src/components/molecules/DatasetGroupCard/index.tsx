import { FC, PropsWithChildren } from 'react';
import './DatasetGroupCard.scss';
import Dataset from 'assets/Dataset';
import { Switch } from 'components/FormElements';
import Button from 'components/Button';
import Label from 'components/Label';

type DatasetGroupCardProps = {
  datasetGroupId?: string;
  datasetName?: string;
  version?: string;
  isLatest?: boolean;
  isEnabled?:boolean;
  enableAllowed?:boolean;
  lastUpdated?:string;
  validationStatus?:string;
  lastModelTrained?:string
};

const DatasetGroupCard: FC<PropsWithChildren<DatasetGroupCardProps>> = ({
  datasetGroupId,
  datasetName,
  version,
  isLatest,
  isEnabled,
  enableAllowed,
  lastUpdated,
  validationStatus,
  lastModelTrained
}) => {
  return (
    <>
      <div className="dataset-group-card">
        <div className="row switch-row">
          <p className="icon-text">{datasetName}</p>
          <Switch label="" checked={isEnabled} />
        </div>
        <Label type="error">{validationStatus}</Label>
        <div className="py-3">
          <p className="text">{'Last Model Trained:'}{lastModelTrained}</p>
          <p className="text">{'Last Used For Training:'}{}</p>
          <p className="text">{'Last Updated:  7.6.24-15:31'}</p>
        </div>
        <div className="flex">
          <Label type="success">V5.3.1</Label>
          <Label type="success">latest</Label>
        </div>

        <div className="label-row">
          <Button appearance="primary" size="s">
            Settings
          </Button>
        </div>
      </div>
    </>
  );
};

export default DatasetGroupCard;
