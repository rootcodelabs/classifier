import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, FormSelect } from 'components';
import Pagination from 'components/molecules/Pagination';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { formattedArray, parseVersionString } from 'utils/commonUtilts';
import { getDataModelsOverview, getFilterData } from 'services/data-models';
import DataModelCard from 'components/molecules/DataModelCard';
import ConfigureDataModel from './ConfigureDataModel';
import { INTEGRATION_OPERATIONS } from 'enums/integrationEnums';
import { Platform } from 'enums/dataModelsEnums';

const DataModels: FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [pageIndex, setPageIndex] = useState(1);
  const [id, setId] = useState(0);
  const [enableFetch, setEnableFetch] = useState(true);
  const [view, setView] = useState('list');

  useEffect(() => {
    setEnableFetch(true);
  }, [view]);

  const [filters, setFilters] = useState({
    modelName: 'all',
    version: 'x.x.x',
    platform: 'all',
    datasetGroup: 'all',
    trainingStatus: 'all',
    maturity: 'all',
    sort: 'asc',
  });

  const { data: dataModelsData, isLoading } = useQuery(
    [
      'datamodels/overview',
      pageIndex,
      filters.modelName,
      parseVersionString(filters?.version)?.major,
      parseVersionString(filters?.version)?.minor,
      parseVersionString(filters?.version)?.patch,
      filters.platform,
      filters.datasetGroup,
      filters.trainingStatus,
      filters.maturity,
      filters.sort,
    ],
    () =>
      getDataModelsOverview(
        pageIndex,
        filters.modelName,
        parseVersionString(filters?.version)?.major,
        parseVersionString(filters?.version)?.minor,
        parseVersionString(filters?.version)?.patch,
        filters.platform,
        filters.datasetGroup,
        filters.trainingStatus,
        filters.maturity,
        filters.sort
      ),
    {
      keepPreviousData: true,
      enabled: enableFetch,
    }
  );
  const { data: filterData } = useQuery(['datamodels/filters'], () =>
    getFilterData()
  );
   const pageCount = dataModelsData?.data[0]?.totalPages || 1;

  const handleFilterChange = (name: string, value: string) => {
    setEnableFetch(false);
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  return (
    <div>
      {view === 'list' && (
        <div className="container">
          <div className="title_container">
            <div className="title">Data Models</div>
            <Button
              appearance="primary"
              size="m"
              onClick={() => navigate('/create-data-model')}
            >
              Create Model
            </Button>
          </div>
          <div>
            <div className="search-panel">
              <FormSelect
                label=""
                name="modelName"
                placeholder="Model Name"
                options={formattedArray(filterData?.modelNames) ?? []}
                onSelectionChange={(selection) =>
                  handleFilterChange('modelName', selection?.value ?? '')
                }
              />
              <FormSelect
                label=""
                name="version"
                placeholder="Version"
                options={formattedArray(filterData?.modelVersions) ?? []}
                onSelectionChange={(selection) =>
                  handleFilterChange('version', selection?.value ?? '')
                }
              />
              <FormSelect
                label=""
                name="platform"
                placeholder="Platform"
                options={formattedArray(filterData?.deploymentsEnvs) ?? []}
                onSelectionChange={(selection) =>
                  handleFilterChange('platform', selection?.value ?? '')
                }
              />
              <FormSelect
                label=""
                name="datasetGroup"
                placeholder="Dataset Group"
                options={formattedArray(filterData?.datasetGroups) ?? []}
                onSelectionChange={(selection) =>
                  handleFilterChange('datasetGroup', selection?.value ?? '')
                }
              />
              <FormSelect
                label=""
                name="trainingStatus"
                placeholder="Training Status"
                options={formattedArray(filterData?.trainingStatuses) ?? []}
                onSelectionChange={(selection) =>
                  handleFilterChange('trainingStatus', selection?.value ?? '')
                }
              />
              <FormSelect
                label=""
                name="maturity"
                placeholder="Maturity"
                options={formattedArray(filterData?.maturityLabels) ?? []}
                onSelectionChange={(selection) =>
                  handleFilterChange('maturity', selection?.value ?? '')
                }
              />
              <FormSelect
                label=""
                name="sort"
                placeholder="Sort by name (A - Z)"
                options={[
                  { label: 'A-Z', value: 'asc' },
                  { label: 'Z-A', value: 'desc' },
                ]}
                onSelectionChange={(selection) =>
                  handleFilterChange('sort', selection?.value ?? '')
                }
              />
              <Button onClick={() => setEnableFetch(true)}>Search</Button>
              <Button
                onClick={() => {
                  navigate(0);
                }}
              >
                Reset
              </Button>
            </div>
            {isLoading && <div>Loading...</div>}

            <div className="title" style={{ marginTop: '30px' }}>
              Production Models
            </div>

            <div className="grid-container" style={{ margin: '30px 0px' }}>
              {dataModelsData?.data?.map((dataset, index: number) => {
                if (
                  dataset.deploymentEnv === Platform.JIRA ||
                  dataset.deploymentEnv === Platform.OUTLOOK ||
                  dataset.deploymentEnv === Platform.PINAL
                )
                  return (
                    <DataModelCard
                      key={index}
                      modelId={dataset?.id}
                      dataModelName={dataset?.modelName}
                      datasetGroupName={dataset?.connectedDgName}
                      version={`V${dataset?.majorVersion}.${dataset?.minorVersion}`}
                      isLatest={dataset.latest}
                      dgVersion={dataset?.dgVersion}
                      lastTrained={dataset?.lastTrained}
                      trainingStatus={dataset.trainingStatus}
                      platform={dataset?.deploymentEnv}
                      maturity={dataset?.maturityLabel}
                      results={dataset?.trainingResults}
                      setId={setId}
                      setView={setView}
                    />
                  );
              })}
            </div>
            <div className="title">Data Models</div>
            <div className="grid-container" style={{ marginTop: '30px' }}>
              {dataModelsData?.data?.map((dataset, index: number) => {
                return (
                  <DataModelCard
                    key={index}
                    modelId={dataset?.id}
                    dataModelName={dataset?.modelName}
                    datasetGroupName={dataset?.connectedDgName}
                    version={`V${dataset?.majorVersion}.${dataset?.minorVersion}`}
                    isLatest={dataset.latest}
                    dgVersion={dataset?.dgVersion}
                    lastTrained={dataset?.lastTrained}
                    trainingStatus={dataset.trainingStatus}
                    platform={dataset?.deploymentEnv}
                    maturity={dataset?.maturityLabel}
                    results={dataset?.trainingResults}
                    setId={setId}
                    setView={setView}
                  />
                );
              })}
            </div>

            <Pagination
              pageCount={pageCount}
              pageIndex={pageIndex}
              canPreviousPage={pageIndex > 1}
              canNextPage={pageIndex < 10}
              onPageChange={setPageIndex}
            />
          </div>
        </div>
      )}
      {view === 'individual' && <ConfigureDataModel id={id} />}
    </div>
  );
};

export default DataModels;
