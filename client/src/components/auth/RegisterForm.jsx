import { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { isValidEmail, isRequired, getPasswordIssues } from '../../utils/validators';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

export function RegisterForm() {
  const { register, isAuthenticated, status, error, clearError } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const validate = useCallback(() => {
    const errors = {};
    if (!isRequired(form.name)) errors.name = 'Name is required';
    else if (form.name.trim().length < 2) errors.name = 'Name must be at least 2 characters';

    if (!isRequired(form.email)) errors.email = 'Email is required';
    else if (!isValidEmail(form.email)) errors.email = 'Please enter a valid email address';

    const passwordIssues = getPasswordIssues(form.password);
    if (!isRequired(form.password)) errors.password = 'Password is required';
    else if (passwordIssues.length) errors.password = `Password must contain ${passwordIssues.join(', ')}`;

    if (form.confirmPassword !== form.password) errors.confirmPassword = 'Passwords do not match';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [form]);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!validate()) return;
      register({ name: form.name, email: form.email, password: form.password });
    },
    [form, register, validate]
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <Input id="name" name="name" label="Full name" value={form.name} onChange={handleChange} error={fieldErrors.name} autoComplete="name" />
      <Input id="email" name="email" type="email" label="Email" value={form.email} onChange={handleChange} error={fieldErrors.email} autoComplete="email" />
      <Input
        id="password"
        name="password"
        type="password"
        label="Password"
        value={form.password}
        onChange={handleChange}
        error={fieldErrors.password}
        autoComplete="new-password"
      />
      <Input
        id="confirmPassword"
        name="confirmPassword"
        type="password"
        label="Confirm password"
        value={form.confirmPassword}
        onChange={handleChange}
        error={fieldErrors.confirmPassword}
        autoComplete="new-password"
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" disabled={status === 'loading'} className="mt-2 w-full">
        {status === 'loading' ? 'Creating account...' : 'Create account'}
      </Button>

      <p className="text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-indigo-600 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
