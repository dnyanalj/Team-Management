import { apiClient } from './apiClient';

export async function fetchTasksRequest(params) {
  const { data } = await apiClient.get('/tasks', { params });
  return { items: data.data, pagination: data.pagination };
}

export async function fetchTaskStatsRequest() {
  const { data } = await apiClient.get('/tasks/stats');
  return data.data;
}

export async function fetchTaskByIdRequest(id) {
  const { data } = await apiClient.get(`/tasks/${id}`);
  return data.data;
}

export async function createTaskRequest(payload) {
  const { data } = await apiClient.post('/tasks', payload);
  return data.data;
}

export async function updateTaskRequest(id, payload) {
  const { data } = await apiClient.put(`/tasks/${id}`, payload);
  return data.data;
}

export async function deleteTaskRequest(id) {
  const { data } = await apiClient.delete(`/tasks/${id}`);
  return data.data;
}
