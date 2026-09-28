import { Modal } from './Modal';
import { Button } from './Button';

export function ConfirmDialog({ open, title = 'Are you sure?', description, onConfirm, onCancel, confirmLabel = 'Confirm', loading }) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      {description && <p className="mb-6 text-sm text-gray-600">{description}</p>}
      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={loading}>
          {loading ? 'Please wait...' : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
