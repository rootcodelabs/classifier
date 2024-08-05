import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Card } from 'components';
import { DatasetGroup } from 'types/datasetGroups';
import { Link, useNavigate } from 'react-router-dom';
import './DataModels.scss';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createDatasetGroup } from 'services/datasets';
import { useDialog } from 'hooks/useDialog';
import BackArrowButton from 'assets/BackArrowButton';
import { getMetadata } from 'services/data-models';
import { validateDataModel } from 'utils/dataModelsUtils';
import DataModelForm from 'components/molecules/DataModelForm';

type ConfigureDataModelType = {
  id: number;
};
const ConfigureDataModel: FC<ConfigureDataModelType> = ({ id }) => {
  const { t } = useTranslation();
  const { open } = useDialog();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const navigate = useNavigate();


  const { data: dataModelData } = useQuery(['datamodels/metadata',id], () =>
    getMetadata(id),
  );
  const [dataModel, setDataModel] = useState({
    modelName: dataModelData?.modelName,
    dgName: dataModelData?.connectedDgName,
    platform: dataModelData?.deploymentEnv,
    baseModels: dataModelData?.baseModels,
    maturity: dataModelData?.maturityLabel,
  });

  const handleDataModelAttributesChange = (name: string, value: string) => {
    

    setDataModel((prevFilters) => ({
      ...prevFilters,
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
    
    setErrors(validateDataModel(dataModel));
  };

  const createDatasetGroupMutation = useMutation({
    mutationFn: (data: DatasetGroup) => createDatasetGroup(data),
    onSuccess: async (response) => {
      setIsModalOpen(true);
      setModalType('SUCCESS');
    },
    onError: () => {
      open({
        title: 'Dataset Group Creation Unsuccessful',
        content: <p>Something went wrong. Please try again.</p>,
      });
    },
  });

  return (
    <div>
      <div className="container">
          <div className="flex-grid" style={{margin: "30px 0px"
}}>
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
        <Button onClick={() => validateData()}>Create Dataset Group</Button>
        <Button appearance="secondary" onClick={() => navigate('/data-models')}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default ConfigureDataModel;
