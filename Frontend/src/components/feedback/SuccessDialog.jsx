import { CheckCircle2 } from 'lucide-react';

/** Aviso de operación exitosa. */
const SuccessDialog = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop z-[100]" onClick={onClose}>
      <div role="status" className="modal-panel max-w-sm p-6 text-center" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-success/10 text-success">
          <CheckCircle2 size={22} />
        </div>
        <p className="mt-4 text-[15px] text-fg">{message}</p>
      </div>
    </div>
  );
};

export default SuccessDialog;
