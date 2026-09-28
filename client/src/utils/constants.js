export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const TASK_STATUSES = ['Pending', 'In Progress', 'Completed'];
export const TASK_PRIORITIES = ['Low', 'Medium', 'High'];

export const TASKS_PAGE_SIZE = 10;
export const RECENT_TASKS_COUNT = 5;

export const AUTH_TOKEN_KEY = 'tmp_auth_token';
export const AUTH_USER_KEY = 'tmp_auth_user';
