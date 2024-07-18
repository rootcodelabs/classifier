import apiMock from './api-mock';
import { User, UserDTO } from 'types/user';

export async function getDatasetsOverview(pageNum: number) {
 
  const { data } = await apiMock.get('GET/datasetgroup/overview',  { params: {
    pageNum: pageNum
  }});
  return data;
}

export async function enableDataset(enableData) {
  const { data } = await apiMock.post('POST/datasetgroup/update/status', {
    dgId: enableData.dgId,
    operationType: enableData.operationType
  });
  return data;
}
