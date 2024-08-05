import apiDev from './api-dev';
import apiExternal from './api-external';
import apiMock from './api-mock';
import { PaginationState } from '@tanstack/react-table';
import { DatasetGroup, Operation } from 'types/datasetGroups';

export async function getDataModelsOverview(
  pageNum: number,
  modelGroup: string,
  majorVersion: number,
  minorVersion: number,
  patchVersion: number,
  platform: string,
  datasetGroup:string,
  trainingStatus:string,
  deploymentMaturity:string,
  sort: string,
 
) {
  const { data } = await apiMock.get('classifier/datamodel/overview', {
    params: {
      page: pageNum,
      modelGroup,
      majorVersion,
      minorVersion,
      patchVersion,
      platform,
      datasetGroup,
      trainingStatus,
      deploymentMaturity,
      sortType:sort,
      pageSize:5
    },
  });
  return data;
}

export async function getFilterData() {
  const { data } = await apiMock.get('classifier/datamodel/overview/filters');
  return data;
}

export async function getCreateOptions() {
  const { data } = await apiMock.get('classifier/datamodel/create/options');
  return data;
}

export async function getMetadata(modelId: string | number | null) {
  const { data } = await apiMock.get('classifier/datamodel/metadata', {
    params: {
      modelId
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

