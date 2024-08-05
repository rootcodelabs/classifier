import { FC, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card } from 'components';
import { useDialog } from 'hooks/useDialog';
import BackArrowButton from 'assets/BackArrowButton';
import { getMetadata } from 'services/data-models';
import DataModelForm from 'components/molecules/DataModelForm';
import { validateDataModel } from 'utils/dataModelsUtils';

type ConfigureDataModelType = {
  id: number;
};

const ConfigureDataModel: FC<ConfigureDataModelType> = ({ id }) => {
  const { open } = useDialog();
  const navigate = useNavigate();
  const [dataModel, setDataModel] = useState({
    modelName: '',
    dgName: '',
    platform: '',
    baseModels: [],
    maturity: '',
  });

  const { data: dataModelData } = useQuery(['datamodels/metadata', id], () =>
    getMetadata(id),
    {
      onSuccess: (data) => {
        setDataModel({
          modelName: data?.modelName || '',
          dgName: data?.connectedDgName || '',
          platform: data?.deploymentEnv || '',
          baseModels: data?.baseModels || [],
          maturity: data?.maturityLabel || '',
        });
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
    return Object.keys(validationErrors).length === 0;
  };

  const handleSave = () => {
    console.log(dataModel);
    
    if (validateData()) {
      // Trigger the mutation or save action
    } else {
      open({
        title: 'Validation Error',
        content: <p>Please correct the errors and try again.</p>,
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
              <div style={{ marginBottom: '10px', fontSize: '20px' }}>
                No Data Available
              </div>
              <p>
                You have created the dataset group, but there are no datasets
                available to show here. You can upload a dataset to view it in
                this space. Once added, you can edit or delete the data as
                needed.
              </p>
              <Button onClick={() => {}}>Import New Data</Button>
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
        <Button onClick={handleSave}>Save Data Model</Button>
        <Button appearance="secondary" onClick={() => navigate('/data-models')}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default ConfigureDataModel;
