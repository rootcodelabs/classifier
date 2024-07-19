import apiMock from './api-mock';
import { User, UserDTO } from 'types/user';

export async function getDatasetsOverview(
  pageNum: number,
  name: string,
  majorVersion: number,
  minorVersion: number,
  patchVersion: number,
  validationStatus: string,
  sort: string
) {
  const { data } = await apiMock.get('GET/datasetgroup/overview', {
    params: {
      pageNum: pageNum,
      name,
      majorVersion,
      minorVersion,
      patchVersion,
      validationStatus,
      sort,
    },
  });
  return data;
}

export async function enableDataset(enableData) {
  const { data } = await apiMock.post('POST/datasetgroup/update/status', {
    dgId: enableData.dgId,
    operationType: enableData.operationType,
  });
  return data;
}

export async function getFilterData() {
  const { data } = await apiMock.get('GET/datasetgroup/overview/filters');
  return data;
}
