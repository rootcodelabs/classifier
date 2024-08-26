import { FC, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card } from 'components';
import { useDialog } from 'hooks/useDialog';
import BackArrowButton from 'assets/BackArrowButton';
import {
  deleteDataModel,
  getMetadata,
  retrainDataModel,
  updateDataModel,
} from 'services/data-models';
import DataModelForm from 'components/molecules/DataModelForm';
import { getChangedAttributes } from 'utils/dataModelsUtils';
import { Platform, UpdateType } from 'enums/dataModelsEnums';
import { ButtonAppearanceTypes } from 'enums/commonEnums';
import CircularSpinner from 'components/molecules/CircularSpinner/CircularSpinner';
import { DataModel, UpdatedDataModelPayload } from 'types/dataModels';
import { dataModelsQueryKeys } from 'utils/queryKeys';
import { useTranslation } from 'react-i18next';

type ConfigureDataModelType = {
  id: number;
  availableProdModels?: string[];
};

const ConfigureDataModel: FC<ConfigureDataModelType> = ({
  id,
  availableProdModels,
}) => {
  const { t } = useTranslation();
  const { open, close } = useDialog();
  const navigate = useNavigate();
  const [enabled, setEnabled] = useState<boolean>(true);
  const [initialData, setInitialData] = useState<Partial<DataModel>>({
    modelName: '',
    dgId: 0,
    platform: '',
    baseModels: [],
    maturity: '',
    version: '',
  });
  const [dataModel, setDataModel] = useState<DataModel>({
    modelId: 0,
    modelName: '',
    dgId: 0,
    platform: '',
    baseModels: [],
    maturity: '',
    version: '',
  });

  const { isLoading } = useQuery(
    dataModelsQueryKeys.GET_META_DATA(id),
    () => getMetadata(id),
    {
      enabled,
      onSuccess: (data) => {
        setDataModel({
          modelId: data?.modelId || 0,
          modelName: data?.modelName || '',
          dgId: data?.connectedDgId || 0,
          platform: data?.deploymentEnv || '',
          baseModels: data?.baseModels || [],
          maturity: data?.maturityLabel || '',
          version: `V${data?.majorVersion}.${data?.minorVersion}`,
        });
        setInitialData({
          modelName: data?.modelName || '',
          dgId: data?.connectedDgId || 0,
          platform: data?.deploymentEnv || '',
          baseModels: data?.baseModels || [],
          maturity: data?.maturityLabel || '',
          version: `V${data?.majorVersion}.${data?.minorVersion}`,
        });
        setEnabled(false);
      },
    }
  );

  const handleDataModelAttributesChange = (
    name: keyof DataModel,
    value: any
  ) => {
    setDataModel((prevDataModel) => ({
      ...prevDataModel,
      [name]: value,
    }));
  };

  const handleSave = () => {
    const payload = getChangedAttributes(initialData, dataModel);
    let updateType: string | undefined;
    if (payload.dgId) {
      updateType = UpdateType.MAJOR;
    } else if (payload.baseModels || payload.platform) {
      updateType = UpdateType.MINOR;
    } else if (payload.maturity) {
      updateType = UpdateType.MATURITY_LABEL;
    }

    const updatedPayload = {
      modelId: dataModel.modelId,
      connectedDgId: payload.dgId,
      deploymentEnv: payload.platform,
      baseModels: payload.baseModels,
      maturityLabel: payload.maturity,
      updateType: updateType,
    };

    if (updateType) {
      if (availableProdModels?.includes(dataModel.platform)) {
        open({
          title: t('dataModels.createDataModel.replaceTitle'),
          content: t('dataModels.createDataModel.replaceDesc'),
          footer: (
            <div className="flex-grid">
              <Button
                appearance={ButtonAppearanceTypes.SECONDARY}
                onClick={close}
              >
                {t('global.cancel')}
              </Button>
              <Button
                onClick={() => updateDataModelMutation.mutate(updatedPayload)}
              >
                {t('global.proceed')}
              </Button>
            </div>
          ),
        });
      } else {
        updateDataModelMutation.mutate(updatedPayload);
      }
    }
  };

  const updateDataModelMutation = useMutation({
    mutationFn: (data: UpdatedDataModelPayload) => updateDataModel(data),
    onSuccess: async () => {
      open({
        title: t('dataModels.configureDataModel.saveChangesTitile'),
        content: <p>{t('dataModels.configureDataModel.saveChangesDesc')}</p>,
        footer: (
          <div className="flex-grid">
            <Button
              appearance={ButtonAppearanceTypes.SECONDARY}
              onClick={() => {
                navigate(0);
                close();
              }}
            >
              {t('global.cancel')}
            </Button>{' '}
            <Button
              onClick={() => {
                navigate(0);
                close();
              }}
            >
              {t('dataModels.createDataModel.viewAll')}
            </Button>
          </div>
        ),
      });
    },
    onError: () => {
      open({
        title: t('dataModels.configureDataModel.updateErrorTitile'),
        content: <p>{t('dataModels.configureDataModel.updateErrorDesc')}</p>,
      });
    },
  });

  const handleDelete = () => {
    if (
      dataModel.platform === Platform.JIRA ||
      dataModel.platform === Platform.OUTLOOK) {
      open({
        title: t('dataModels.configureDataModel.deleteErrorTitle'),
        content: <p>{t('dataModels.configureDataModel.deleteErrorDesc')}</p>,
        footer: (
          <div className="flex-grid">
            <Button
              appearance={ButtonAppearanceTypes.SECONDARY}
              onClick={close}
            >
              {t('global.cancel')}
            </Button>
            <Button appearance={ButtonAppearanceTypes.ERROR} onClick={() => deleteDataModelMutation.mutate(dataModel?.modelId)}
            >
              {t('global.delete')}
            </Button>
          </div>
        ),
      });
    } else {
      open({
        title: t('dataModels.configureDataModel.deleteConfirmation'),
        content: (
          <p>{t('dataModels.configureDataModel.deleteConfirmationDesc')}</p>
        ),
        footer: (
          <div className="flex-grid">
            <Button
              appearance={ButtonAppearanceTypes.SECONDARY}
              onClick={close}
            >
              {t('global.cancel')}
            </Button>
            <Button
              onClick={() => deleteDataModelMutation.mutate(dataModel.modelId)}
              appearance={ButtonAppearanceTypes.ERROR}
            >
              {t('global.delete')}
            </Button>
          </div>
        ),
      });
    }
  };

  const deleteDataModelMutation = useMutation({
    mutationFn: (modelId: number) => deleteDataModel(modelId),
    onSuccess: async (response) => {
      close();
      navigate(0);
    },
    onError: () => {
      open({
        title: t('dataModels.configureDataModel.deleteModalErrorTitle'),
        content: (
          <p>{t('dataModels.configureDataModel.deleteModalErrorDesc')}</p>
        ),
      });
    },
  });

  const retrainDataModelMutation = useMutation({
    mutationFn: (modelId: number) => retrainDataModel(modelId),
    onSuccess: async () => {
      close();
      navigate(0);
    },
    onError: () => {
      open({
        title: t('dataModels.configureDataModel.retrainDataModalErrorTitle'),
        content: (
          <p>{t('dataModels.configureDataModel.retrainDataModalErrorDesc')}</p>
        ),
      });
    },
  });

  return (
    <div>
      <div className="container">
        <div className="flex-grid" style={{ margin: '30px 0px' }}>
          <Link to={''} onClick={() => navigate(0)}>
            <BackArrowButton />
          </Link>
          <div className="title">
            {t('dataModels.configureDataModel.title')}
          </div>
        </div>

        <Card>
          <div
            style={{
              padding: '20px 150px',
              justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            <div>
              <p>{t('dataModels.configureDataModel.retrainCard')}</p>
              <Button
                onClick={() => {
                  retrainDataModelMutation.mutate(dataModel.modelId);
                }}
              >
                {t('dataModels.configureDataModel.retrain')}
              </Button>
            </div>
          </div>
        </Card>

        {isLoading ? (
          <CircularSpinner />
        ) : (
          <DataModelForm
            dataModel={dataModel}
            handleChange={handleDataModelAttributesChange}
            type="configure"
          />
        )}
      </div>
      <div
        className="flex"
        style={{
          alignItems: 'end',
          gap: '10px',
          justifyContent: 'end',
          margin: '25px -16px -16px',
          padding: '20px 64px',
          background: 'white',
        }}
      >
        <Button appearance="error" onClick={() => handleDelete()}>
          {t('dataModels.configureDataModel.deleteModal')}
        </Button>
        <Button
          onClick={() =>
            open({
              title: t('dataModels.configureDataModel.confirmRetrain'),
              content: t('dataModels.configureDataModel.confirmRetrainDesc'),
              footer: (
                <div className="flex-grid">
                  <Button
                    appearance={ButtonAppearanceTypes.SECONDARY}
                    onClick={close}
                  >
                    {t('global.cancel')}
                  </Button>
                  <Button
                    onClick={() =>
                      retrainDataModelMutation.mutate(dataModel.modelId)
                    }
                  >
                    {t('dataModels.configureDataModel.retrain')}
                  </Button>
                </div>
              ),
            })
          }
        >
          {t('dataModels.configureDataModel.retrain')}
        </Button>
        <Button onClick={handleSave}>
          {t('dataModels.configureDataModel.save')}
        </Button>
      </div>
    </div>
  );
};

export default ConfigureDataModel;