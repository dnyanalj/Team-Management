import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, registerUser, logout as logoutAction, clearAuthError } from '../store/slices/authSlice';

export function useAuth() {
  const dispatch = useDispatch();
  const { user, token, isAuthenticated, status, error } = useSelector((state) => state.auth);

  const login = useCallback((credentials) => dispatch(loginUser(credentials)), [dispatch]);
  const register = useCallback((formData) => dispatch(registerUser(formData)), [dispatch]);
  const logout = useCallback(() => dispatch(logoutAction()), [dispatch]);
  const clearError = useCallback(() => dispatch(clearAuthError()), [dispatch]);

  return {
    user,
    token,
    isAuthenticated,
    status,
    error,
    login,
    register,
    logout,
    clearError,
  };
}
