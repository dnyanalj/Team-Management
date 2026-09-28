import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from './constants';

function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function saveAuth({ token, user, rememberMe }) {
  const storage = rememberMe ? window.localStorage : window.sessionStorage;
  const other = rememberMe ? window.sessionStorage : window.localStorage;

  storage.setItem(AUTH_TOKEN_KEY, token);
  storage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  other.removeItem(AUTH_TOKEN_KEY);
  other.removeItem(AUTH_USER_KEY);
}

export function getStoredAuth() {
  const localToken = window.localStorage.getItem(AUTH_TOKEN_KEY);
  if (localToken) {
    return { token: localToken, user: safeParse(window.localStorage.getItem(AUTH_USER_KEY)) };
  }

  const sessionToken = window.sessionStorage.getItem(AUTH_TOKEN_KEY);
  if (sessionToken) {
    return { token: sessionToken, user: safeParse(window.sessionStorage.getItem(AUTH_USER_KEY)) };
  }

  return { token: null, user: null };
}

export function clearAuth() {
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_USER_KEY);
  window.sessionStorage.removeItem(AUTH_TOKEN_KEY);
  window.sessionStorage.removeItem(AUTH_USER_KEY);
}
