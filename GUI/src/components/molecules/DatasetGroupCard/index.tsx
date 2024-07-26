import { FC, PropsWithChildren } from 'react';
import './DatasetGroupCard.scss';
import { Switch } from 'components/FormElements';
import Button from 'components/Button';
import Label from 'components/Label';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { enableDataset } from 'services/datasets';
import { useDialog } from 'hooks/useDialog';
import { createSearchParams, URLSearchParamsInit, useNavigate } from 'react-router-dom';
import { Operation } from 'types/datasetGroups';
import { AxiosError } from 'axios';

type DatasetGroupCardProps = {
  datasetGroupId?: number|string|undefined;
  datasetName?: string;
  version?: string;
  isLatest?: boolean;
  isEnabled?: boolean;
  enableAllowed?: boolean;
  lastUpdated?: string;
  lastUsed?: string;
  validationStatus?: string;
  lastModelTrained?: string;
  setId?: React.Dispatch<React.SetStateAction<number>>
  setView?: React.Dispatch<React.SetStateAction<string>>

};

const DatasetGroupCard: FC<PropsWithChildren<DatasetGroupCardProps>> = ({
  datasetGroupId,
  datasetName,
  version,
  isLatest,
  isEnabled,
  enableAllowed,
  lastUpdated,
  lastUsed,
  validationStatus,
  lastModelTrained,
  setId,
  setView
}) => {
  const queryClient = useQueryClient();
  const { open } = useDialog();
  
  const renderValidationStatus = (status:string|undefined) => {
    if (status === 'success') {
      return <Label type="success">{'Validation Successful'}</Label>;
    } else if (status === 'fail') {
      return <Label type="error">{'Validation Failed'}</Label>;
    } else if (status === 'unvalidated') {
      return <Label type="info">{'Not Validated'}</Label>;
    } else if (status === 'in-progress') {
      return <Label type="warning">{'Validation In Progress'}</Label>;
    }
  };

  const datasetEnableMutation = useMutation({
    mutationFn: (data:Operation) => enableDataset(data),
    onSuccess: async (response) => {
      await queryClient.invalidateQueries(['datasetgroup/overview', 1]);
    },
    onError: (error) => {
      open({
        title: 'Cannot Enable Dataset Group',
        content: (
          <p>
            The dataset group cannot be enabled until data is added. Please
            add datasets to this group and try again.
          </p>
        ),
      });
    },
  });

  const datasetDisableMutation = useMutation({
    mutationFn: (data:Operation) => enableDataset(data),
    onSuccess: async (response) => {
      await queryClient.invalidateQueries(['datasetgroup/overview', 1]);
      if (response?.operationSuccessful)
        open({
          title: 'Cannot Enable Dataset Group',
          content: (
            <p>
              The dataset group cannot be enabled until data is added. Please
              add datasets to this group and try again.
            </p>
          ),
        });
    },
    onError: () => {
      open({
        title: 'Operation Unsuccessful',
        content: <p>Something went wrong. Please try again.</p>,
      });
    },
  });

  const handleCheck = () => {
    if (isEnabled)
      datasetDisableMutation.mutate({
        dgId: datasetGroupId,
        operationType: 'disable',
      });
    else
      datasetEnableMutation.mutate({
        dgId: datasetGroupId,
        operationType: 'enable',
      });
  };

  return (
    <div>
      <div className="dataset-group-card">
        <div className="row switch-row">
          <div className='text'>{datasetName}</div>
          <Switch
            label=""
            checked={isEnabled}
            onCheckedChange={() => handleCheck()}
          />
        </div>
        {renderValidationStatus(validationStatus)}
        <div className="py-3">
          <p >
            {'Last Model Trained:'}
            {lastModelTrained}
          </p>
          <p >
            {'Last Used For Training:'}
            {lastUsed}
          </p>
          <p >
            {'Last Updated:'}
            {lastUpdated}
          </p>
        </div>
        <div className="flex">
          <Label type="success">{version}</Label>
          {isLatest ? <Label type="success">latest</Label> : null}
        </div>

        <div className="label-row">
          <Button appearance="primary" size="s" onClick={()=>{setId(datasetGroupId);setView("individual")}}>
            Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DatasetGroupCard;
