import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <h1 className="mb-6 text-center text-2xl font-bold text-indigo-700">Task & Team Management</h1>
        <div className="rounded-lg bg-white p-8 shadow-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
