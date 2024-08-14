import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FormCheckboxes,
  FormInput,
  FormRadios,
  FormSelect,
  Label,
} from 'components';
import { formattedArray } from 'utils/commonUtilts';
import { useQuery } from '@tanstack/react-query';
import { getCreateOptions } from 'services/data-models';
import { dgArrayWithVersions } from 'utils/dataModelsUtils';
import CircularSpinner from '../CircularSpinner/CircularSpinner';
import { DataModel } from 'types/dataModels';

type DataModelFormType = {
  dataModel: any;
  handleChange: (name: keyof DataModel, value: any) => void;
  errors?: Record<string, string>;
  type: string;
};

const DataModelForm: FC<DataModelFormType> = ({
  dataModel,
  handleChange,
  errors,
  type,
}) => {
  const { t } = useTranslation();

  const { data: createOptions, isLoading } = useQuery(
    ['datamodels/create-options'],
    () => getCreateOptions()
  );

  return (
    <div>
      {type === 'create' ? (
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
            Model Version <Label type="success">{dataModel?.version}</Label>
          </div>
        </div>
      ) : (
        <div className="grey-card flex-grid">
          <div className="title">{dataModel.modelName}</div>
          <Label type="success">{dataModel?.version}</Label>
        </div>
      )}

      {createOptions && !isLoading ? (
        <div>
          <div className="title-sm">Select Dataset Group</div>
          <div className="grey-card">
            <FormSelect
              name="dgId"
              options={dgArrayWithVersions(
                createOptions?.datasetGroups,
                'groupName'
              )}
              label=""
              onSelectionChange={(selection) => {
                handleChange('dgId', selection?.value);
              }}
              defaultValue={dataModel?.dgId}
              error={errors?.dgId}
            />
          </div>

          <div className="title-sm">Select Base Models</div>
          <div className="grey-card flex-grid">
            <FormCheckboxes
              isStack={false}
              items={formattedArray(createOptions?.baseModels)}
              name="baseModels"
              label=""
              onValuesChange={(values) =>
                handleChange('baseModels', values.baseModels)
              }
              error={errors?.baseModels}
              selectedValues={dataModel?.baseModels}
            />
          </div>

          <div className="title-sm">Select Deployment Platform</div>
          <div className="grey-card">
            <FormRadios
              items={formattedArray(createOptions?.deploymentPlatforms)}
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
              items={formattedArray(createOptions?.maturityLabels)}
              label=""
              name="maturity"
              onChange={(value) => handleChange('maturity', value)}
              error={errors?.maturity}
              selectedValue={dataModel?.maturity}
            />
          </div>
        </div>
      ) : (
        <CircularSpinner />
      )}
    </div>
  );
};

export default DataModelForm;
