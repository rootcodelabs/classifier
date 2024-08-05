import { FC, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  FormCheckbox,
  FormCheckboxes,
  FormInput,
  FormRadios,
  FormSelect,
  Label,
} from 'components';
import { DatasetGroup } from 'types/datasetGroups';
import { Link, useNavigate } from 'react-router-dom';
import './DataModels.scss';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createDatasetGroup } from 'services/datasets';
import { useDialog } from 'hooks/useDialog';
import BackArrowButton from 'assets/BackArrowButton';
import { getCreateOptions } from 'services/data-models';
import { customFormattedArray, formattedArray } from 'utils/commonUtilts';
import { validateDataModel } from 'utils/dataModelsUtils';
import DataModelForm from 'components/molecules/DataModelForm';

const CreateDataModel: FC = () => {
  const { t } = useTranslation();
  const { open } = useDialog();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const navigate = useNavigate();

  const { data: createOptions } = useQuery(['datamodels/create-options'], () =>
    getCreateOptions()
  );
  const [dataModel, setDataModel] = useState({
    modelName: '',
    dgName: '',
    platform: '',
    baseModels: [],
    maturity: '',
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
    console.log(dataModel);
    
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
        <div className="title_container">
          <div className="flex-grid">
            <Link to={''} onClick={() => navigate(0)}>
              <BackArrowButton />
            </Link>
            <div className="title">Create Data Model</div>
          </div>
        </div>
        <DataModelForm dataModel={dataModel} handleChange={handleDataModelAttributesChange} />
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

export default CreateDataModel;
