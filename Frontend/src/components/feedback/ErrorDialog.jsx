import { XCircle } from 'lucide-react';

/** Aviso de error. */
const ErrorDialog = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop z-[100]" onClick={onClose}>
      <div role="alert" className="modal-panel max-w-sm p-6 text-center" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-danger/10 text-danger">
          <XCircle size={22} />
        </div>
        <p className="mt-4 text-[15px] text-fg">{message}</p>
        {onClose && (
          <button type="button" onClick={onClose} className="btn-secondary mt-6 w-full">
            Entendido
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorDialog;
