import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Pagination } from './Pagination';

describe('Pagination', () => {
  it('renders nothing for a single page', () => {
    const { container } = render(<Pagination page={1} totalPages={1} total={3} limit={10} onPageChange={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the visible range and marks the current page', () => {
    render(<Pagination page={2} totalPages={3} total={25} limit={10} onPageChange={() => {}} />);

    expect(screen.getByText(/Showing/)).toHaveTextContent('Showing 11–20 of 25 tasks');
    expect(screen.getByRole('button', { name: '2' })).toHaveAttribute('aria-current', 'page');
  });

  it('calls onPageChange and disables Previous on the first page', async () => {
    const onPageChange = vi.fn();
    render(<Pagination page={1} totalPages={3} total={25} limit={10} onPageChange={onPageChange} />);

    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    await userEvent.click(screen.getByRole('button', { name: '3' }));

    expect(onPageChange.mock.calls).toEqual([[2], [3]]);
  });
});
