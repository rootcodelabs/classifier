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
import { customFormattedArray, extractedArray } from 'utils/dataModelsUtils';
import { MdPin, MdPinEnd, MdStar } from 'react-icons/md';
import CircularSpinner from 'components/molecules/CircularSpinner/CircularSpinner';
import { ButtonAppearanceTypes } from 'enums/commonEnums';

const DataModels: FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [pageIndex, setPageIndex] = useState(1);
  const [id, setId] = useState(0);
  const [enableFetch, setEnableFetch] = useState(true);
  const [enableProdModelsFetch, setEnableProdModelsFetch] = useState(true);

  const [view, setView] = useState('list');
  const [availableProdModels, setAvailableProdModels] = useState<string[]>([]);

  useEffect(() => {
    setEnableFetch(true);
  }, [view]);

  const [filters, setFilters] = useState({
    modelName: 'all',
    version: 'x.x.x',
    platform: 'all',
    datasetGroup: -1,
    trainingStatus: 'all',
    maturity: 'all',
    sort: 'asc',
  });

  const { data: dataModelsData, isLoading: isModelDataLoading } = useQuery(
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
      false,
    ],
    () =>
      getDataModelsOverview(
        pageIndex,
        filters.modelName,
        parseVersionString(filters?.version)?.major,
        parseVersionString(filters?.version)?.minor,
        filters.platform,
        filters.datasetGroup,
        filters.trainingStatus,
        filters.maturity,
        filters.sort,
        false
      ),
    {
      keepPreviousData: true,
      enabled: enableFetch,
    }
  );
  const { data: prodDataModelsData, isLoading: isProdModelDataLoading } =
    useQuery(
      [
        'datamodels/overview',
        0,
        'all',
        -1,
        -1,
        'all',
        -1,
        'all',
        'all',
        'asc',
        true,
      ],
      () =>
        getDataModelsOverview(
          1,
          'all',
          -1,
          -1,
          'all',
          -1,
          'all',
          'all',
          'asc',
          true
        ),
      {
        onSuccess:(data)=>{          
          setAvailableProdModels(extractedArray(data?.data,"deploymentEnv"))
          setEnableProdModelsFetch(false)
        },
        keepPreviousData: true,
        enabled: enableProdModelsFetch,
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
          {!isModelDataLoading && !isProdModelDataLoading ?(<div>
            <div className="featured-content">
              <div className="title_container" style={{ marginTop: '30px' }}>
                <div className="title">Production Models</div>{' '}
                <MdStar size={30} color="#f39c12" />
              </div>

              <div className="grid-container" style={{ margin: '30px 0px' }}>
                {prodDataModelsData?.data?.map((dataset, index: number) => {
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
            </div>
            <div>
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
              <div className="search-panel">
                <FormSelect
                  label=""
                  name=""
                  placeholder="Model Name"
                  options={formattedArray(filterData?.modelNames) ?? []}
                  onSelectionChange={(selection) =>
                    handleFilterChange('modelName', selection?.value ?? '')
                  }
                  defaultValue={filters?.modelName}
                />
                <FormSelect
                  label=""
                  name=""
                  placeholder="Version"
                  options={formattedArray(filterData?.modelVersions) ?? []}
                  onSelectionChange={(selection) =>
                    handleFilterChange('version', selection?.value ?? '')
                  }
                  defaultValue={filters?.version}

                />
                <FormSelect
                  label=""
                  name=""
                  placeholder="Platform"
                  options={formattedArray(filterData?.deploymentsEnvs) ?? []}
                  onSelectionChange={(selection) =>
                    handleFilterChange('platform', selection?.value ?? '')
                  }
                  defaultValue={filters?.platform}

                />
                <FormSelect
                  label=""
                  name=""
                  placeholder="Dataset Group"
                  options={
                    customFormattedArray(filterData?.datasetGroups, 'name') ??
                    []
                  }
                  onSelectionChange={(selection) =>
                    handleFilterChange('datasetGroup', selection?.value?.id)
                  }
                  defaultValue={filters?.datasetGroup}

                />
                <FormSelect
                  label=""
                  name=""
                  placeholder="Training Status"
                  options={formattedArray(filterData?.trainingStatuses) ?? []}
                  onSelectionChange={(selection) =>
                    handleFilterChange('trainingStatus', selection?.value )
                  }
                  defaultValue={filters?.trainingStatus}

                />
                <FormSelect
                  label=""
                  name=""
                  placeholder="Maturity"
                  options={formattedArray(filterData?.maturityLabels) ?? []}
                  onSelectionChange={(selection) =>
                    handleFilterChange('maturity', selection?.value ?? '')
                  }
                  defaultValue={filters?.maturity}

                />
                <FormSelect
                  label=""
                  name=""
                  placeholder="Sort by name (A - Z)"
                  options={[
                    { label: 'A-Z', value: 'asc' },
                    { label: 'Z-A', value: 'desc' },
                  ]}
                  onSelectionChange={(selection) =>
                    handleFilterChange('sort', selection?.value ?? '')
                  }
                  defaultValue={filters?.sort}

                />
                <Button onClick={() => setEnableFetch(true)}>Search</Button>
                <Button
                  onClick={() => {
                    navigate(0);
                  }}
                  appearance={ButtonAppearanceTypes.SECONDARY}               >
                  Reset
                </Button>
              </div>

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
            </div>
            <Pagination
              pageCount={pageCount}
              pageIndex={pageIndex}
              canPreviousPage={pageIndex > 1}
              canNextPage={pageIndex < 10}
              onPageChange={setPageIndex}
            />
          </div>):(
            <CircularSpinner/>
          )}
        </div>
      )}
      {view === 'individual' && <ConfigureDataModel id={id} availableProdModels={availableProdModels}/>}
    </div>
  );
};

export default DataModels;
