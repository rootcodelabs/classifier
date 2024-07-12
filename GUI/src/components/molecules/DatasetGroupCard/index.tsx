import { FC, PropsWithChildren } from 'react';
import './DatasetGroupCard.scss';
import Dataset from 'assets/Dataset';
import { Switch } from 'components/FormElements';
import Button from 'components/Button';
import Label from 'components/Label';

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
        <p className="icon-text">{datasetName}</p>
          <Switch label="" checked={isEnabled} />
        </div>
        <Label type='error'>Validation Failed</Label>
        <div className='py-3'>
        <p className="text">{"Last Model Trained: Model Alpha"}</p>
        <p className="text">{"Last Used For Training:  8.6.24-13:01"}</p>
        <p className="text">{"Last Updated:  7.6.24-15:31"}</p>
        </div>
        <div className='flex'>
<Label type='success'>V5.3.1</Label>
<Label type='success'>latest</Label>

        </div>
       
        <div className="label-row">
          <Button appearance='primary' size='s'>Settings</Button>
        </div>
      </div>
    </>
  );
};

export default DatasetGroupCard;
