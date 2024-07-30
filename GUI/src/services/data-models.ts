import apiDev from './api-dev';
import apiExternal from './api-external';
import apiMock from './api-mock';
import { PaginationState } from '@tanstack/react-table';
import { DatasetGroup, Operation } from 'types/datasetGroups';

export async function getDatasetsOverview(
  pageNum: number,
  modelGroup: string,
  majorVersion: number,
  minorVersion: number,
  patchVersion: number,
  platform: string,
  sort: string,
  datasetGroup:string,
  trainingStatus:string,
  deploymentMaturity:string
) {
  const { data } = await apiMock.get('classifier/datamodel/overview', {
    params: {
      page: pageNum,
      modelGroup,
      majorVersion,
      minorVersion,
      patchVersion,
      platform,
      sortType:sort,
      datasetGroup,
      trainingStatus,
      deploymentMaturity,
      pageSize:5
    },
  });
  return data;
}

export async function getFilterData() {
  const { data } = await apiDev.get('classifier/datasetgroup/overview/filters');
  return data;
}

export async function getMetadata(groupId: string | number | null) {
  const { data } = await apiDev.get('classifier/datasetgroup/group/metadata', {
    params: {
      groupId
    },
  });
  return data;
}

export async function createDatasetGroup(datasetGroup: DatasetGroup) {

  const { data } = await apiDev.post('classifier/datasetgroup/create', {
    ...datasetGroup,
  });
  return data;
}

