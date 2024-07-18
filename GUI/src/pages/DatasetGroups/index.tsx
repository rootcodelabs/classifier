import { FC, useState } from 'react';
import './DatasetGroups.scss';
import { useTranslation } from 'react-i18next';
import { Button, FormInput, FormSelect } from 'components';
import DatasetGroupCard from 'components/molecules/DatasetGroupCard';
import Pagination from 'components/molecules/Pagination';
import { getDatasetsOverview } from 'services/datasets';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

const DatasetGroups: FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [pageIndex, setPageIndex] = useState(1);

  const { data: datasetGroupsData, isLoading, isError } = useQuery(['datasets/groups', pageIndex], () => getDatasetsOverview(pageIndex), {
    keepPreviousData: true,
  });

  const pageCount = datasetGroupsData?.totalPages || 5

  return (
    <>
      <div className="container">
        <div className="title_container">
          <div className="title">Dataset Groups</div>
          <Button appearance="primary" size="m" onClick={()=>navigate('/create-dataset-group')}>
            Create Dataset Group
          </Button>
        </div>
        <div>
          <div className="search-panel">
            <FormSelect
              label=""
              name="sort"
              placeholder="Dataset Group"
              options={[
                { label: 'A-Z', value: 'az' },
                { label: 'Z-A', value: 'za' },
              ]}
            />
            <FormSelect
              label=""
              name="sort"
              placeholder="Version"
              options={[
                { label: 'A-Z', value: 'az' },
                { label: 'Z-A', value: 'za' },
              ]}
            />
            <FormSelect
              label=""
              name="sort"
              placeholder="Validation Status"
              options={[
                { label: 'A-Z', value: 'az' },
                { label: 'Z-A', value: 'za' },
              ]}
            />
            <FormSelect
              label=""
              name="sort"
              placeholder="Sort by name (A - Z)"
              options={[
                { label: 'A-Z', value: 'az' },
                { label: 'Z-A', value: 'za' },
              ]}
            />
          </div>
          <div
            className="bordered-card grid-container"
            style={{ padding: '20px', marginTop: '20px' }}
          >
            {isLoading && <>Loading...</>}
            {datasetGroupsData?.data?.map((dataset) => {
              return (
                <DatasetGroupCard
                datasetGroupId={dataset?.dgId}
                  isEnabled={dataset?.isEnabled}
                  datasetName={dataset?.name}
                  version={`${dataset?.majorVersion}.${dataset?.minorVersion}.${dataset?.patchVersion}`}
                  isLatest={dataset.latest}
                  enableAllowed={dataset.enableAllowed}
                  lastUpdated={dataset.lastUpdated}
                  lastUsed={dataset?.linkedModels[0]?.trainingTimestamp}
                  validationStatus={dataset.validationStatus}
                  lastModelTrained={dataset?.linkedModels[0]?.modelNname}
                />
              );
            })}
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
    </>
  );
};

export default DatasetGroups;
