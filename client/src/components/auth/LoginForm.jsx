import { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { isValidEmail, isRequired } from '../../utils/validators';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

export function LoginForm() {
  const { login, isAuthenticated, status, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '', rememberMe: false });
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (isAuthenticated) {
      const redirectTo = location.state?.from?.pathname || '/dashboard';
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state]);

  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  }, []);

  const validate = useCallback(() => {
    const errors = {};
    if (!isRequired(form.email)) errors.email = 'Email is required';
    else if (!isValidEmail(form.email)) errors.email = 'Please enter a valid email address';
    if (!isRequired(form.password)) errors.password = 'Password is required';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [form]);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!validate()) return;
      login(form);
    },
    [form, login, validate]
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <Input
        id="email"
        name="email"
        type="email"
        label="Email"
        value={form.email}
        onChange={handleChange}
        error={fieldErrors.email}
        autoComplete="email"
      />
      <Input
        id="password"
        name="password"
        type="password"
        label="Password"
        value={form.password}
        onChange={handleChange}
        error={fieldErrors.password}
        autoComplete="current-password"
      />
      <label className="flex items-center gap-2 text-sm text-gray-600">
        <input type="checkbox" name="rememberMe" checked={form.rememberMe} onChange={handleChange} />
        Remember me
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" disabled={status === 'loading'} className="mt-2 w-full">
        {status === 'loading' ? 'Signing in...' : 'Sign in'}
      </Button>

      <p className="text-center text-sm text-gray-600">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="font-medium text-indigo-600 hover:underline">
          Register
        </Link>
      </p>
    </form>
  );
}
