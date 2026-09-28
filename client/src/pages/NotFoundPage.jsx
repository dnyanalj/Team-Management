import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';

export default function NotFoundPage() {
  return (
    <div className="flex h-full min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <p className="text-6xl font-bold text-indigo-600">404</p>
      <h1 className="text-xl font-semibold text-gray-900">Page not found</h1>
      <p className="max-w-md text-sm text-gray-600">The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/dashboard">
        <Button>Back to dashboard</Button>
      </Link>
    </div>
  );
}
