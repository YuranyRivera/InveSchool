
/** Botón de acción secundaria (cancelar, volver, etc.). */
const SecondaryButton = ({ Text, children, type = 'button', onClick, disabled = false, className = '' }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`btn-secondary btn-lg min-w-[160px] ${className}`}
  >
    {children ?? Text}
  </button>
);

export default SecondaryButton;
