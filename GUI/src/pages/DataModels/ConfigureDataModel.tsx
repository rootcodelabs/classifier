import { FC, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card } from 'components';
import { useDialog } from 'hooks/useDialog';
import BackArrowButton from 'assets/BackArrowButton';
import { getMetadata } from 'services/data-models';
import DataModelForm from 'components/molecules/DataModelForm';
import { getChangedAttributes, validateDataModel } from 'utils/dataModelsUtils';
import { Platform } from 'enums/dataModelsEnums';
import { ButtonAppearanceTypes } from 'enums/commonEnums';

type ConfigureDataModelType = {
  id: number;
};

const ConfigureDataModel: FC<ConfigureDataModelType> = ({ id }) => {
  const { open, close } = useDialog();
  const navigate = useNavigate();
  const [enabled, setEnabled] = useState(true);
  const [initialData, setInitialData] = useState({});
  const [dataModel, setDataModel] = useState({
    modelId: '',
    modelName: '',
    dgName: '',
    dgId: '',
    platform: '',
    baseModels: [],
    maturity: '',
    version: '',
  });

  const { data: dataModelData } = useQuery(
    ['datamodels/metadata', id],
    () => getMetadata(id),

    {
      enabled,
      onSuccess: (data) => {
        setDataModel({
          modelId: data?.modelId || '',
          modelName: data?.modelName || '',
          dgName: data?.connectedDgName || '',
          dgId: data?.modelId || '',
          platform: data?.deploymentEnv || '',
          baseModels: data?.baseModels || [],
          maturity: data?.maturityLabel || '',
          version: `V${data?.majorVersion}.${data?.minorVersion}`,
        });
        setInitialData({
          modelName: data?.modelName || '',
          dgName: data?.connectedDgName || '',
          dgId: data?.modelId || '',
          platform: data?.deploymentEnv || '',
          baseModels: data?.baseModels || [],
          maturity: data?.maturityLabel || '',
          version: `V${data?.majorVersion}.${data?.minorVersion}`,
        });
        setEnabled(false);
      },
    }
  );

  const handleDataModelAttributesChange = (name: string, value: any) => {
    setDataModel((prevDataModel) => ({
      ...prevDataModel,
      [name]: value,
    }));
  };

  const [errors, setErrors] = useState({
    modelName: '',
    dgName: '',
    platform: '',
    baseModels: '',
    maturity: '',
  });

  const validateData = () => {
    const validationErrors = validateDataModel(dataModel);
    setErrors(validationErrors);
    return Object.keys(validationErrors)?.length === 0;
  };

  const handleSave = () => {
    const payload = getChangedAttributes(initialData, dataModel);
    

    if (validateData()) {
      if (
        dataModel.dgId !== initialData.dgId ||
        dataModel.dgName !== initialData.dgName
      ) {
      }
    }
  };

  const handleDelete = () => {
    if (
      dataModel.platform === Platform.JIRA ||
      dataModel.platform === Platform.OUTLOOK ||
      dataModel.platform === Platform.PINAL
    ) {
      open({
        title: 'Cannot Delete Model',
        content: (
          <p>
            The model cannot be deleted because it is currently in production.
            Please escalate another model to production before proceeding to
            delete this model.
          </p>
        ),
        footer: (
          <div className="flex-grid">
            <Button
              appearance={ButtonAppearanceTypes.SECONDARY}
              onClick={close}
            >
              Cancel
            </Button>
            <Button appearance={ButtonAppearanceTypes.ERROR}>Delete</Button>
          </div>
        ),
      });
    } else {
      open({
        title: 'Are you sure?',
        content: (
          <p>Confirm that you are wish to delete the following data model</p>
        ),
        footer: (
          <div className="flex-grid">
            <Button
              appearance={ButtonAppearanceTypes.SECONDARY}
              onClick={close}
            >
              Cancel
            </Button>
            <Button appearance={ButtonAppearanceTypes.ERROR}>Delete</Button>
          </div>
        ),
      });
    }
  };

  return (
    <div>
      <div className="container">
        <div className="flex-grid" style={{ margin: '30px 0px' }}>
          <Link to={''} onClick={() => navigate(0)}>
            <BackArrowButton />
          </Link>
          <div className="title">Configure Data Model</div>
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
              <p>
                Model updated. Please initiate retraining to continue benefiting
                from the latest improvements.
              </p>
              <Button onClick={() => {}}>Retrain</Button>
            </div>
          </div>
        </Card>

        <DataModelForm
          dataModel={dataModel}
          handleChange={handleDataModelAttributesChange}
          errors={errors}
        />
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
          Delete Model
        </Button>
        <Button
          onClick={() =>
            open({
              title: 'Confirm Retrain Model',
              content: 'Are you sure you want to retrain this model?',
              footer: (
                <div className="flex-grid">
                  <Button appearance={ButtonAppearanceTypes.SECONDARY} onClick={close}>
                    Cancel
                  </Button>
                  <Button >
                    Retrain
                  </Button>
                </div>
              ),
            })
          }
        >
          Retrain
        </Button>
        <Button onClick={handleSave}>Save Changes</Button>
      </div>
    </div>
  );
};

export default ConfigureDataModel;
