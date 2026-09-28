import { apiClient } from './apiClient';

export async function fetchUsersRequest() {
  const { data } = await apiClient.get('/users');
  return data.data;
}
