
/** Botón de acción principal. Mantiene la prop `Text` por compatibilidad con las vistas existentes. */
const PrimaryButton = ({ Text, children, type = 'button', onClick, disabled = false, className = '' }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`btn-primary btn-lg min-w-[160px] ${className}`}
  >
    {children ?? Text}
  </button>
);

export default PrimaryButton;
