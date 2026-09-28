import { memo, useMemo } from 'react';
import { Button } from './Button';
import { getPageItems } from '../../utils/pagination';

function PaginationBase({ page, totalPages, total, limit, onPageChange }) {
  const items = useMemo(() => getPageItems(page, totalPages), [page, totalPages]);

  if (totalPages <= 1) return null;

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <nav className="flex flex-col items-center justify-between gap-3 sm:flex-row" aria-label="Pagination">
      <p className="text-sm text-gray-600">
        Showing <span className="font-medium">{from}</span>–<span className="font-medium">{to}</span> of{' '}
        <span className="font-medium">{total}</span> tasks
      </p>

      <div className="flex items-center gap-1">
        <Button variant="secondary" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
          Previous
        </Button>
        {items.map((item) =>
          typeof item === 'string' ? (
            <span key={item} className="px-2 text-sm text-gray-400">
              …
            </span>
          ) : (
            <Button
              key={item}
              variant={item === page ? 'primary' : 'ghost'}
              onClick={() => onPageChange(item)}
              aria-current={item === page ? 'page' : undefined}
              className="min-w-9 px-3"
            >
              {item}
            </Button>
          )
        )}
        <Button variant="secondary" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>
          Next
        </Button>
      </div>
    </nav>
  );
}

export const Pagination = memo(PaginationBase);
