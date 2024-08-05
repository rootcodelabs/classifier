import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { FormCheckboxes, FormInput, FormRadios, FormSelect, Label } from 'components';
import { customFormattedArray, formattedArray } from 'utils/commonUtilts';
import { useQuery } from '@tanstack/react-query';
import { getCreateOptions } from 'services/data-models';

type DataModelFormType = {
  dataModel: any;
  handleChange: (name: string, value: any) => void;
  errors: Record<string, string>;
};

const DataModelForm: FC<DataModelFormType> = ({ dataModel, handleChange, errors }) => {
  const { t } = useTranslation();
  
  const { data: createOptions } = useQuery(['datamodels/create-options'], () =>
    getCreateOptions()
  );

  return (
    <div>
      <div>
        <div className="grey-card">
          <FormInput
            name="modelName"
            label="Model Name"
            value={dataModel.modelName}
            onChange={(e) => handleChange('modelName', e.target.value)}
            error={errors?.modelName}
          />
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
              options={customFormattedArray(createOptions?.dataset_groups, 'group_name')}
              label=""
              onSelectionChange={(selection) => handleChange('dgName', selection.value)}
              error={errors?.dgName}
              value={dataModel?.dgName}
            />
          </div>
          
          <div className="title-sm">Select Base Models</div>
          <div className="grey-card flex-grid">
            <FormCheckboxes
              isStack={false}
              items={formattedArray(createOptions?.base_models)}
              name="baseModels"
              label=""
              onValuesChange={(values) => handleChange('baseModels', values.baseModels)}
              error={errors?.baseModels}
              selectedValues={dataModel?.baseModels}
            />
          </div>
          
          <div className="title-sm">Select Deployment Platform</div>
          <div className="grey-card">
            <FormRadios
              items={formattedArray(createOptions?.deployment_platforms)}
              label=""
              name="platform"
              onChange={(value) => handleChange('platform', value)}
              error={errors?.platform}
              selectedValue={dataModel?.platform}
            />
          </div>
          
          <div className="title-sm">Select Maturity Label</div>
          <div className="grey-card">
            <FormRadios
              items={formattedArray(createOptions?.maturity_labels)}
              label=""
              name="maturity"
              onChange={(value) => handleChange('maturity', value)}
              error={errors?.maturity}
              selectedValue={dataModel?.maturity}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DataModelForm;
