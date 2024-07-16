import apiMock from './api-mock';
import { User, UserDTO } from 'types/user';

export async function getDatasetsOverview(pageNum: number) {
 
  const { data } = await apiMock.get('GET/datasetgroup/overview',  { params: {
    page_num: pageNum
  }});
  return data;
}

