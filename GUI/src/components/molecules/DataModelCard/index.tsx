import { FC, PropsWithChildren } from 'react';
import Button from 'components/Button';
import Label from 'components/Label';
import { useDialog } from 'hooks/useDialog';
import './DataModel.scss';
import { Maturity, TrainingStatus } from 'enums/dataModelsEnums';
import Card from 'components/Card';
import { useTranslation } from 'react-i18next';

type DataModelCardProps = {
  modelId: number;
  dataModelName?: string | undefined;
  datasetGroupName?: string;
  version?: string;
  isLatest?: boolean;
  dgVersion?: string;
  lastTrained?: string;
  trainingStatus?: string;
  platform?: string;
  maturity?: string;
  setId: React.Dispatch<React.SetStateAction<number>>;
  setView: React.Dispatch<React.SetStateAction<string>>;
  results?: any;
};

const DataModelCard: FC<PropsWithChildren<DataModelCardProps>> = ({
  modelId,
  dataModelName,
  datasetGroupName,
  version,
  isLatest,
  dgVersion,
  lastTrained,
  trainingStatus,
  platform,
  maturity,
  results,
  setId,
  setView,
}) => {
  const { open, close } = useDialog();
  const { t } = useTranslation();

  const renderTrainingStatus = (status: string | undefined) => {
    if (status === TrainingStatus.RETRAINING_NEEDED) {
      return (
        <Label type="warning">
          {t('dataModels.trainingStatus.retrainingNeeded') ?? ''}
        </Label>
      );
    } else if (status === TrainingStatus.TRAINED) {
      return (
        <Label type="success">
          {t('dataModels.trainingStatus.trained') ?? ''}
        </Label>
      );
    } else if (status === TrainingStatus.TRAINING_INPROGRESS) {
      return (
        <Label type="info">
          {t('dataModels.trainingStatus.trainingInProgress') ?? ''}
        </Label>
      );
    } else if (status === TrainingStatus.UNTRAINABLE) {
      return (
        <Label type="error">
          {t('dataModels.trainingStatus.untrainable') ?? ''}
        </Label>
      );
    } else if (status === TrainingStatus.NOT_TRAINED) {
      return <Label>{t('dataModels.trainingStatus.notTrained') ?? ''}</Label>;
    }
  };

  const renderMaturityLabel = (status: string | undefined) => {
    if (status === Maturity.DEVELOPMENT) {
      return (
        <Label type="warning">
          {t('dataModels.maturity.development') ?? ''}
        </Label>
      );
    } else if (status === Maturity.PRODUCTION) {
      return (
        <Label type="success">
          {t('dataModels.maturity.production') ?? ''}
        </Label>
      );
    } else if (status === Maturity.STAGING) {
      return (
        <Label type="info">{t('dataModels.maturity.staging') ?? ''}</Label>
      );
    } else if (status === Maturity.TESTING) {
      return (
        <Label type="error">{t('dataModels.maturity.testing') ?? ''}</Label>
      );
    }
  };

  return (
    <div>
      <div className="dataset-group-card">
        <p>{dataModelName}</p>
        <div className="flex">
          <Label>{version}</Label>
          {isLatest ? <Label type="success">latest</Label> : null}
        </div>

        <div className="py-3">
          <p>
            {'Dataset Group:'}
            {datasetGroupName}
          </p>
          <p>
            {'Dataset Group Version:'}
            {dgVersion}
          </p>
          <p>
            {'Last Trained:'}
            {lastTrained}
          </p>
        </div>
        <div className="flex">
          {renderTrainingStatus(trainingStatus)}
          <Label type="info">{platform}</Label>
          {renderMaturityLabel(maturity)}
        </div>

        <div className="label-row flex-grid">
          <Button
            appearance="secondary"
            size="s"
            onClick={() => {
              open({
                title: 'Training Results',
                footer: <Button onClick={close}>Close</Button>,
                size: 'large',
                content: (
                  <div>
                    <div className="flex" style={{ margin: '20px 0px' }}>
                      Best Performing Model -
                    </div>{' '}
                    <Card
                      isHeaderLight={true}
                      header={
                        <div className="training-results-grid-container">
                          <div>Classes</div>
                          <div>Accuracy</div>
                          <div>F1 Score</div>
                        </div>
                      }
                    >
                      {results ? (
                        <div className="training-results-grid-container">
                          <div>
                            {results?.classes?.map((c: string) => {
                              return <div>{c}</div>;
                            })}
                          </div>
                          <div>
                            {results?.accuracy?.map((c: string) => {
                              return <div>{c}</div>;
                            })}
                          </div>
                          <div>
                            {results?.f1_score?.map((c: string) => {
                              return <div>{c}</div>;
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          No training results available
                        </div>
                      )}
                    </Card>
                  </div>
                ),
              });
            }}
          >
            View Results
          </Button>
          <Button
            appearance="primary"
            size="s"
            onClick={() => {
              setId(modelId);
              setView('individual');
            }}
          >
            Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DataModelCard;
