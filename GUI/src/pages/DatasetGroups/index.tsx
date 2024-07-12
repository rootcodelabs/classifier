import { FC } from 'react';
import './DatasetGroups.scss';
import { useTranslation } from 'react-i18next';
import { Button, FormInput, FormSelect } from 'components';
import DatasetGroupCard from 'components/molecules/DatasetGroupCard';
import Pagination from 'components/molecules/Pagination';

const DatasetGroups: FC = () => {
  const { t } = useTranslation();

  const datasets = [
    { datasetName: 'Dataset 10', status: 'Connected', isEnabled: false },
    { datasetName: 'Dataset 2', status: 'Disconnected', isEnabled: false },
    { datasetName: 'Dataset 2', status: 'Disconnected', isEnabled: true },
    { datasetName: 'Dataset 9', status: 'Disconnected', isEnabled: false },
    { datasetName: 'Dataset 4', status: 'Disconnected', isEnabled: true },
    { datasetName: 'Dataset 10', status: 'Connected', isEnabled: true },
    { datasetName: 'Dataset 9', status: 'Disconnected', isEnabled: true },
    { datasetName: 'Dataset 2', status: 'Disconnected', isEnabled: true },
    { datasetName: 'Dataset 4', status: 'Disconnected', isEnabled: true },
    { datasetName: 'Dataset 3', status: 'Disconnected', isEnabled: false },
  ];

  return (
    <>
      <div className="container">
        <div className="title_container">
          <div className="title">Dataset Groups</div>
          <Button appearance="primary" size="m">
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
            {datasets.map((dataset) => {
              return (
                <DatasetGroupCard
                  isEnabled={dataset.isEnabled}
                  status={dataset.status}
                  datasetName={dataset.datasetName}
                />
              );
            })}
          </div>

          <Pagination pageCount={1} pageSize={1} pageIndex={0} canPreviousPage={true} canNextPage={true} ></Pagination>
        </div>
      </div>
    </>
  );
};

export default DatasetGroups;
