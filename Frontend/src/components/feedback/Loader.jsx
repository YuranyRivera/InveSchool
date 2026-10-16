
const Loader = ({ fullScreen = false, label = 'Cargando' }) => (
  <div
    role="status"
    aria-live="polite"
    className={`flex w-full items-center justify-center ${fullScreen ? 'fixed inset-0 z-50 bg-canvas' : 'min-h-[60vh]'}`}
  >
    <div className="spinner" />
    <span className="sr-only">{label}</span>
  </div>
);

export default Loader;
