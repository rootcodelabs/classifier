import { FC, useEffect, useState } from 'react';
import './DatasetGroups.scss';
import { useTranslation } from 'react-i18next';
import { Button, FormSelect } from 'components';
import DatasetGroupCard from 'components/molecules/DatasetGroupCard';
import Pagination from 'components/molecules/Pagination';
import { getDatasetsOverview, getFilterData } from 'services/datasets';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { formattedArray, parseVersionString } from 'utils/commonUtilts';
import { SingleDatasetType } from 'types/datasetGroups';
import ViewDatasetGroup from './ViewDatasetGroup';
import { datasetQueryKeys } from 'utils/queryKeys';
import { DatasetViewEnum } from 'enums/datasetEnums';

const DatasetGroups: FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [pageIndex, setPageIndex] = useState(1);
  const [id, setId] = useState(0);
  const [enableFetch, setEnableFetch] = useState(true);
  const [view, setView] = useState<DatasetViewEnum>(DatasetViewEnum.LIST);

  useEffect(() => {
    setEnableFetch(true);
  }, [view]);

  const [filters, setFilters] = useState({
    datasetGroupName: 'all',
    version: 'x.x.x',
    validationStatus: 'all',
    sort: 'asc',
  });

  const { data: datasetGroupsData, isLoading } = useQuery(
    datasetQueryKeys.DATASET_OVERVIEW(
      pageIndex,
      filters.datasetGroupName,
      parseVersionString(filters?.version)?.major,
      parseVersionString(filters?.version)?.minor,
      parseVersionString(filters?.version)?.patch,
      filters.validationStatus,
      filters.sort
    ),
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
  const { data: filterData } = useQuery(
    datasetQueryKeys.DATASET_FILTERS(),
    () => getFilterData()
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
      {view === DatasetViewEnum.LIST && (
        <div className="container">
          <div className="title_container">
            <div className="title">{t('datasetGroups.title')}</div>
            <Button
              appearance="primary"
              size="m"
              onClick={() => navigate('/create-dataset-group')}
            >
              {t('datasetGroups.createDatasetGroupButton')}
            </Button>
          </div>
          <div>
            <div className="search-panel">
              <FormSelect
                label=""
                name="sort"
                placeholder={t('datasetGroups.table.group') ?? ''}
                options={formattedArray(filterData?.response?.dgNames) ?? []}
                onSelectionChange={(selection) =>
                  handleFilterChange('datasetGroupName', selection?.value ?? '')
                }
              />
              <FormSelect
                label=""
                name="sort"
                placeholder={t('datasetGroups.table.version') ?? ''}
                options={formattedArray(filterData?.response?.dgVersions) ?? []}
                onSelectionChange={(selection) =>
                  handleFilterChange('version', selection?.value ?? '')
                }
              />
              <FormSelect
                label=""
                name="sort"
                placeholder={t('datasetGroups.table.validationStatus') ?? ''}
                options={
                  formattedArray(filterData?.response?.dgValidationStatuses) ??
                  []
                }
                onSelectionChange={(selection) =>
                  handleFilterChange('validationStatus', selection?.value ?? '')
                }
              />
              <FormSelect
                label=""
                name="sort"
                placeholder={
                  t('datasetGroups.table.sortBy', {
                    sortOrder: filters?.sort === 'asc' ? 'A-Z' : 'Z-A',
                  }) ?? ''
                }
                options={[
                  { label: 'A-Z', value: 'asc' },
                  { label: 'Z-A', value: 'desc' },
                ]}
                onSelectionChange={(selection) =>
                  handleFilterChange('sort', selection?.value ?? '')
                }
              />
              <Button onClick={() => setEnableFetch(true)}>
                {t('global.search')}
              </Button>
              <Button
                onClick={() => {
                  navigate(0);
                }}
              >
                {t('global.reset')}
              </Button>
            </div>
            <div
              className="grid-container"
              style={{marginTop: '20px' }}
            >
              {isLoading && <div>Loading...</div>}
              {datasetGroupsData?.response?.data?.map(
                (dataset: SingleDatasetType, index: number) => {
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
      )}
      {view === DatasetViewEnum.INDIVIDUAL && (
        <ViewDatasetGroup dgId={id} setView={setView} />
      )}
    </div>
  );
};

export default DatasetGroups;
