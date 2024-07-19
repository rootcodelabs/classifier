import { FC, PropsWithChildren } from 'react';
import './DatasetGroupCard.scss';
import Dataset from 'assets/Dataset';
import { Switch } from 'components/FormElements';
import Button from 'components/Button';
import Label from 'components/Label';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { enableDataset } from 'services/datasets';
import { useDialog } from 'hooks/useDialog';

type DatasetGroupCardProps = {
  datasetGroupId?: number;
  datasetName?: string;
  version?: string;
  isLatest?: boolean;
  isEnabled?: boolean;
  enableAllowed?: boolean;
  lastUpdated?: string;
  lastUsed?: string;
  validationStatus?: string;
  lastModelTrained?: string;
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
}) => {
  const queryClient = useQueryClient();
  const { open, close } = useDialog();

  const renderValidationStatus = (status) => {
    if (status === 'successful') {
      return <Label type="success">{'Validation Successful'}</Label>;
    } else if (status === 'failed') {
      return <Label type="error">{'Validation Failed'}</Label>;
    } else if (status === 'pending') {
      return <Label type="warning">{'Validation Pending'}</Label>;
    } else if (status === 'in_progress') {
      return <Label type="warning">{'Validation In Progress'}</Label>;
    }
  };

  const datasetEnableMutation = useMutation({
    mutationFn: (data) => enableDataset(data),
    onSuccess: async (response) => {
      await queryClient.invalidateQueries(['GET/datasetgroup/overview', 1]);
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
    onError: (error: AxiosError) => {
      open({
        title: 'Operation Unsuccessful',
        content: <p>Something went wrong. Please try again.</p>,
      });
    },
  });

  const datasetDisableMutation = useMutation({
    mutationFn: (data) => enableDataset(data),
    onSuccess: async (response) => {
      await queryClient.invalidateQueries(['GET/datasetgroup/overview', 1]);
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
    onError: (error: AxiosError) => {
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
    <>
      <div className="dataset-group-card">
        <div className="row switch-row">
          <p className="icon-text">{datasetName}</p>
          <Switch
            label=""
            checked={isEnabled}
            onCheckedChange={() => handleCheck()}
          />
        </div>
        {renderValidationStatus(validationStatus)}
        <div className="py-3">
          <p className="text">
            {'Last Model Trained:'}
            {lastModelTrained}
          </p>
          <p className="text">
            {'Last Used For Training:'}
            {lastUsed}
          </p>
          <p className="text">
            {'Last Updated:'}
            {lastUpdated}
          </p>
        </div>
        <div className="flex">
          <Label type="success">{version}</Label>
          {isLatest ? <Label type="success">latest</Label> : null}
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
