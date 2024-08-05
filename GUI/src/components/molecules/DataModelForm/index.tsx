import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FormCheckboxes, FormInput, FormRadios, FormSelect, Label } from 'components';
import { DatasetGroup } from 'types/datasetGroups';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createDatasetGroup } from 'services/datasets';
import { useDialog } from 'hooks/useDialog';
import { getCreateOptions } from 'services/data-models';
import { customFormattedArray, formattedArray } from 'utils/commonUtilts';
import { validateDataModel } from 'utils/dataModelsUtils';

type DataModelFormType = {
  dataModel: any;
  handleChange:any
 
};
const DataModelForm: FC<DataModelFormType>  = ({dataModel,handleChange}) => {
  const { t } = useTranslation();
  const { open } = useDialog();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const navigate = useNavigate();

  const { data: createOptions } = useQuery(['datamodels/create-options'], () =>
    getCreateOptions()
  );

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
      <div>
        <div className="grey-card">
          <FormInput
            name="modelName"
            label="Model Name"
            defaultValue={dataModel.modelName}
            onChange={(e) =>
              handleChange('modelName', e.target.value)
            }
            error={errors.modelName}
          ></FormInput>
        </div>
        <div className="grey-card">
          Model Version <Label type="success">V1.0</Label>
        </div>
      </div>
      {createOptions && (
        <div>
          <div className="title-sm">Select Dataset Group</div>
          <div className="grey-card">
            <FormSelect
              name="dgName"
              options={customFormattedArray(
                createOptions?.dataset_groups,
                'group_name'
              )}
              label=""
              onSelectionChange={(selection) =>
                handleChange('dgName', selection.value)
              }
              error={errors.dgName}
            ></FormSelect>
          </div>
          <div className="title-sm">Select Deployment Platform</div>
          <div className="grey-card flex-grid">
            <FormCheckboxes
              isStack={false}
              items={formattedArray(createOptions?.base_models)}
              name="dataset"
              label=""
              onValuesChange={(values) =>
                handleChange('baseModels', values?.dataset)
              }
              error={errors.baseModels}
            ></FormCheckboxes>
          </div>
          <div className="title-sm">Select Deployment Platform</div>
          <div className="grey-card">
            <FormRadios
              items={formattedArray(createOptions?.deployment_platforms)}
              label=""
              name="platform"
              onChange={(value) =>
                handleChange('platform', value)
              }
              error={errors.platform}
            ></FormRadios>
          </div>
          <div className="title-sm">Select Maturity Label</div>
          <div className="grey-card">
            <FormRadios
              items={formattedArray(createOptions?.maturity_labels)}
              label=""
              name="maturity"
              onChange={(value) =>
                handleChange('maturity', value)
              }
              error={errors.maturity}
            ></FormRadios>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataModelForm;
