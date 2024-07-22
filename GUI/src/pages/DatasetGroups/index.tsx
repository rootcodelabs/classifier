import { FC, useState } from 'react';
import './DatasetGroups.scss';
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
import { DatasetGroup } from 'types/datasetGroups';

const DatasetGroups: FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [pageIndex, setPageIndex] = useState(1);
  const [enableFetch, setEnableFetch] = useState(true);

  const [filters, setFilters] = useState({
    datasetGroupName: 'all',
    version: 'x.x.x',
    validationStatus: 'all',
    sort: 'asc',
  });

  const {
    data: datasetGroupsData,
    isLoading,
    refetch,
  } = useQuery(
    [
      'datasets/groups',
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
  const pageCount = datasetGroupsData?.totalPages || 5;

  // Handler for updating filters state
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
          <div className="title">Dataset Groups</div>
          <Button
            appearance="primary"
            size="m"
            onClick={() => navigate('/create-dataset-group')}
          >
            Create Dataset Group
          </Button>
        </div>
        <div>
          <div className="search-panel">
            <FormSelect
              label=""
              name="sort"
              placeholder="Dataset Group Name"
              options={formattedArray(filterData?.dgNames) ?? []}
              onSelectionChange={(selection) =>
                handleFilterChange('datasetGroupName', selection?.value ?? '')
              }
            />
            <FormSelect
              label=""
              name="sort"
              placeholder="Version"
              options={formattedArray(filterData?.dgVersions) ?? []}
              onSelectionChange={(selection) =>
                handleFilterChange('version', selection?.value ?? '')
              }
            />
            <FormSelect
              label=""
              name="sort"
              placeholder="Validation Status"
              options={formattedArray(filterData?.dgValidationStatuses) ?? []}
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
            {datasetGroupsData?.data?.map(
              (dataset: DatasetGroup, index: number) => {
                return (
                  <DatasetGroupCard
                    key={index}
                    datasetGroupId={dataset?.dgId}
                    isEnabled={dataset?.isEnabled}
                    datasetName={dataset?.name}
                    version={`${dataset?.majorVersion}.${dataset?.minorVersion}.${dataset?.patchVersion}`}
                    isLatest={dataset.latest}
                    enableAllowed={dataset.enableAllowed}
                    lastUpdated={convertTimestampToDateTime(
                      dataset?.lastUpdated
                    )}
                    lastUsed={convertTimestampToDateTime(
                      dataset?.linkedModels[0]?.trainingTimestamp
                    )}
                    validationStatus={dataset.validationStatus}
                    lastModelTrained={dataset?.linkedModels[0]?.modelName}
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

export default DatasetGroups;
