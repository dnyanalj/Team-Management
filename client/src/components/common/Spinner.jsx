export function Spinner({ size = 'md', className = '' }) {
  const dimensions = size === 'sm' ? 'h-4 w-4 border-2' : 'h-8 w-8 border-4';
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`animate-spin rounded-full border-indigo-600 border-t-transparent ${dimensions} ${className}`}
    />
  );
}
