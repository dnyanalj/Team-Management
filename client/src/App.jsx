import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { AppRoutes } from './routes/AppRoutes';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { setUnauthorizedHandler } from './services/apiClient';
import { fetchCurrentUser, logout } from './store/slices/authSlice';
import { getStoredAuth } from './utils/tokenStorage';

function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const wasAuthenticated = useRef(isAuthenticated);

  useEffect(() => {
    wasAuthenticated.current = isAuthenticated;
  }, [isAuthenticated]);

  useEffect(() => {
    const { token } = getStoredAuth();
    if (token) dispatch(fetchCurrentUser());
  }, [dispatch]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      // A 401 from a failed login attempt isn't a session expiry, so only notify signed-in users.
      if (wasAuthenticated.current) toast.error('Your session has expired. Please log in again.', { id: 'session-expired' });
      dispatch(logout());
      navigate('/login');
    });
  }, [dispatch, navigate]);

  return (
    <ErrorBoundary>
      <AppRoutes />
      <Toaster position="top-right" toastOptions={{ duration: 3500, style: { fontSize: '14px' } }} />
    </ErrorBoundary>
  );
}

export default App;
