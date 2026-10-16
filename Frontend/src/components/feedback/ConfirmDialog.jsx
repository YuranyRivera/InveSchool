import { AlertTriangle } from 'lucide-react';

/** Diálogo de confirmación con acción destructiva. */
const ConfirmDialog = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop z-[100]" onClick={onClose}>
      <div
        role="alertdialog"
        aria-modal="true"
        className="modal-panel max-w-sm p-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-danger/10 text-danger">
          <AlertTriangle size={20} />
        </div>
        <p className="mt-4 text-[15px] text-fg">{message}</p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancelar
          </button>
          <button type="button" onClick={onConfirm} className="btn-danger">
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
