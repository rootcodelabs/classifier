import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, FormInput, FormSelect } from 'components';
import DatasetGroupCard from 'components/molecules/DatasetGroupCard';
import Pagination from 'components/molecules/Pagination';
import { getDatasetsOverview, getFilterData } from 'services/datasets';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  convertTimestampToDateTime,
  formattedArray,
  parseVersionString,
} from 'utils/commonUtilts';

const DataModels: FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [pageIndex, setPageIndex] = useState(1);
  const [id, setId] = useState(0);
  const [enableFetch, setEnableFetch] = useState(true);
  const [view, setView] = useState("list");

useEffect(()=>{
  setEnableFetch(true)
},[view]);

  const [filters, setFilters] = useState({
    datasetGroupName: 'all',
    version: 'x.x.x',
    validationStatus: 'all',
    sort: 'asc',
  });

  const {
    data: datasetGroupsData,
    isLoading,
  } = useQuery(
    [
      'datasetgroup/overview',
      pageIndex,
      filters.datasetGroupName,
      parseVersionString(filters?.version)?.major,
      parseVersionString(filters?.version)?.minor,
      parseVersionString(filters?.version)?.patch,
      filters.validationStatus,
      filters.sort,
    ],
    () =>
      getDatasetsOverview(
        pageIndex,
        filters.datasetGroupName,
        parseVersionString(filters?.version)?.major,
        parseVersionString(filters?.version)?.minor,
        parseVersionString(filters?.version)?.patch,
        filters.validationStatus,
        filters.sort
      ),
    {
      keepPreviousData: true,
      enabled: enableFetch,
    }
  );
  const { data: filterData } = useQuery(['datasets/filters'], () =>
    getFilterData()
  );
  const pageCount = datasetGroupsData?.response?.data?.[0]?.totalPages || 1;

  const handleFilterChange = (name: string, value: string) => {
    setEnableFetch(false);
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };


  return (
    <div>
     <div className="container">
        <div className="title_container">
          <div className="title">Data Models</div>
          <Button
            appearance="primary"
            size="m"
            onClick={() => navigate('/create-model')}
          >
            Create Dataset Group
          </Button>
        </div>
        <div>
          <div className="search-panel">
            <FormSelect
              label=""
              name="sort"
              placeholder="Model Group"
              options={formattedArray(filterData?.response?.dgNames) ?? []}
              onSelectionChange={(selection) =>
                handleFilterChange('datasetGroupName', selection?.value ?? '')
              }
            />
            <FormSelect
              label=""
              name="sort"
              placeholder="Version"
              options={formattedArray(filterData?.response?.dgVersions) ?? []}
              onSelectionChange={(selection) =>
                handleFilterChange('version', selection?.value ?? '')
              }
            />
            <FormSelect
              label=""
              name="sort"
              placeholder="Platform"
              options={formattedArray(filterData?.response?.dgValidationStatuses) ?? []}
              onSelectionChange={(selection) =>
                handleFilterChange('validationStatus', selection?.value ?? '')
              }
            />
             <FormSelect
              label=""
              name="sort"
              placeholder="Dataset Group"
              options={formattedArray(filterData?.response?.dgValidationStatuses) ?? []}
              onSelectionChange={(selection) =>
                handleFilterChange('validationStatus', selection?.value ?? '')
              }
            />
             <FormSelect
              label=""
              name="sort"
              placeholder="Training Status"
              options={formattedArray(filterData?.response?.dgValidationStatuses) ?? []}
              onSelectionChange={(selection) =>
                handleFilterChange('validationStatus', selection?.value ?? '')
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
          <div
            className="bordered-card grid-container"
            style={{ padding: '20px', marginTop: '20px' }}
          >
            {isLoading && <div>Loading...</div>}
            {datasetGroupsData?.response?.data?.map(
              (dataset, index: number) => {
                return (
                  <DatasetGroupCard
                    key={index}
                    datasetGroupId={dataset?.id}
                    isEnabled={dataset?.isEnabled}
                    datasetName={dataset?.groupName}
                    version={`${dataset?.majorVersion}.${dataset?.minorVersion}.${dataset?.patchVersion}`}
                    isLatest={dataset.latest}
                    lastUpdated={dataset?.lastUpdatedTimestamp}
                    lastUsed={dataset?.lastTrainedTimestamp}
                    validationStatus={dataset.validationStatus}
                    lastModelTrained={dataset?.lastModelTrained}
                    setId={setId}
                    setView={setView}

                  />
                );
              }
            )}
          </div>
          <Pagination
            pageCount={pageCount}
            pageIndex={pageIndex}
            canPreviousPage={pageIndex > 1}
            canNextPage={pageIndex < pageCount}
            onPageChange={setPageIndex}
          />
        </div>
      </div>
      
    </div>
  );
};

export default DataModels;
