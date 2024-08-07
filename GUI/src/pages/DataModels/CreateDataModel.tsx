import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'components';
import { Link, useNavigate } from 'react-router-dom';
import './DataModels.scss';
import { useMutation } from '@tanstack/react-query';
import { useDialog } from 'hooks/useDialog';
import BackArrowButton from 'assets/BackArrowButton';
import { validateDataModel } from 'utils/dataModelsUtils';
import DataModelForm from 'components/molecules/DataModelForm';
import { ButtonAppearanceTypes } from 'enums/commonEnums';
import { createDataModel } from 'services/data-models';

const CreateDataModel: FC = () => {
  const { t } = useTranslation();
  const { open,close } = useDialog();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const navigate = useNavigate();

  const [dataModel, setDataModel] = useState({
    modelName: '',
    dgName: '',
    dgId: '',
    platform: '',
    baseModels: [],
    maturity: '',
    version: 'V1.0',
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
    const validationErrors = validateDataModel(dataModel);
    setErrors(validationErrors);
    return Object.keys(validationErrors)?.length === 0;

    
  };

  const handleCreate = ()=>{
if(validateData()){
  const payload={
    modelName: dataModel.modelName,
    datasetGroupName: dataModel.dgName,
    dgId: dataModel.dgId,
    baseModels: dataModel.baseModels,
    deploymentPlatform: dataModel.platform,
    maturityLabel:dataModel.maturity
}

createDataModelMutation.mutate(payload);
}
  }
  const createDataModelMutation = useMutation({
    mutationFn: (data) => createDataModel(data),
    onSuccess: async (response) => {
      open({
        title: 'Data Model Created and Trained',
        content: <p>You have successfully created and trained the data model. You can view it on the data model dashboard.</p>,
        footer:<div className='flex-grid'><Button appearance={ButtonAppearanceTypes.SECONDARY}>Cancel</Button> <Button onClick={()=>{navigate('/data-models');close()}}>View All Data Models</Button></div>
      });
    },
    onError: () => {
      open({
        title: 'Error Creating Data Model',
        content: <p>There was an issue creating or training the data model. Please try again. If the problem persists, contact support for assistance.</p>,
      });
    },
  });

  return (
    <div>
      <div className="container">
        <div className="title_container">
          <div className="flex-grid">
            <Link to={'/data-models'}>
              <BackArrowButton />
            </Link>
            <div className="title">Create Data Model</div>
          </div>
        </div>
        <DataModelForm
          errors={errors}
          dataModel={dataModel}
          handleChange={handleDataModelAttributesChange}
          type='create'
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
        <Button onClick={() => handleCreate()}>Create Dataset Group</Button>
        <Button appearance="secondary" onClick={() => navigate('/data-models')}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default CreateDataModel;
