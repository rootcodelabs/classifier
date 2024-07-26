import apiDev from './api-dev';
import apiExternal from './api-external';


import { PaginationState } from '@tanstack/react-table';
import { DatasetGroup, Operation } from 'types/datasetGroups';
export async function getDatasetsOverview(
  pageNum: number,
  name: string,
  majorVersion: number,
  minorVersion: number,
  patchVersion: number,
  validationStatus: string,
  sort: string
) {
  const { data } = await apiDev.get('classifier/datasetgroup/overview', {
    params: {
      page: pageNum,
      groupName:name,
      majorVersion,
      minorVersion,
      patchVersion,
      validationStatus,
      sortType:sort,
      pageSize:12
    },
  });
  return data;
}

export async function enableDataset(enableData: Operation) {
  const { data } = await apiDev.post('classifier/datasetgroup/update/status', {
    dgId: enableData.dgId,
    operationType: enableData.operationType,
  });
  return data;
}

export async function getFilterData() {
  const { data } = await apiDev.get('classifier/datasetgroup/overview/filters');
  return data;
}

export async function getDatasets(
  pagination: PaginationState,
  groupId: string | number | null
) {
  const { data } = await apiDev.get('classifier/datasetgroup/group/data', {
    params: {
      pageNum: pagination.pageIndex+1,
      groupId,
    },
  });
  
  
  return data?.response?.data[0];
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

export async function importDataset(file: File, id: string|number) {  
  
  
  const { data } = await apiExternal.post('datasetgroup/data/import', {
    dataFile:file,
    dgId:id
  });
  return data;
}

export async function exportDataset(id: string, type: string) {
  const headers = {
    'Content-Type': 'application/json',
  }
  const { data } = await apiExternal.post('datasetgroup/data/download', {
    dgId: id,
    exportType: type,
  },{headers,responseType: 'blob'});
  return data;
}

export async function patchUpdate(updatedData: DatasetGroup) {
  const { data } = await apiDev.post('classifier/datasetgroup/update/patch', {
    ...updatedData,
  });
  return data;
}

export async function minorUpdate(updatedData) {
  const { data } = await apiDev.post('classifier/datasetgroup/update/minor', {
    ...updatedData,
  });
  return data;
}

export async function majorUpdate(updatedData: DatasetGroup) {
  const { data } = await apiDev.post('classifier/datasetgroup/update/major', {
    ...updatedData,
  });
  return data;
}

export async function getStopWords() {
  const { data } = await apiDev.get('classifier/datasetgroup/stop-words');
  return data?.response?.stopWords;
}

export async function addStopWord(stopWordData) {
  const { data } = await apiDev.post('classifier/datasetgroup/update/stop-words',{
...stopWordData
  });
  return data;
}

export async function deleteStopWord(stopWordData) {
  const { data } = await apiDev.post('classifier/datasetgroup/delete/stop-words',{
...stopWordData
  });
  return data;
}