import { apiClient } from './apiClient';

export async function registerRequest({ name, email, password }) {
  const { data } = await apiClient.post('/auth/register', { name, email, password });
  return data.data;
}

export async function loginRequest({ email, password, rememberMe }) {
  const { data } = await apiClient.post('/auth/login', { email, password, rememberMe });
  return data.data;
}

export async function fetchCurrentUserRequest() {
  const { data } = await apiClient.get('/auth/me');
  return data.data.user;
}
