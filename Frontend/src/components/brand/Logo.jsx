import { useId } from 'react';

/**
 * Isotipo de InveSchool: un cubo isométrico (la "caja" del inventario)
 * con tres caras en degradado de azul claro a azul marino.
 */
export const LogoMark = ({ size = 32, className = '' }) => {
  const id = useId();
  const top = `${id}-top`;
  const left = `${id}-left`;
  const right = `${id}-right`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={top} x1="4.7" y1="3" x2="27.3" y2="16" gradientUnits="userSpaceOnUse">
          <stop stopColor="#BFDBFE" />
          <stop offset="1" stopColor="#60A5FA" />
        </linearGradient>
        <linearGradient id={left} x1="4.7" y1="9.5" x2="16" y2="29" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3B82F6" />
          <stop offset="1" stopColor="#1D4ED8" />
        </linearGradient>
        <linearGradient id={right} x1="27.3" y1="9.5" x2="16" y2="29" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1E40AF" />
          <stop offset="1" stopColor="#0B1B3F" />
        </linearGradient>
      </defs>
      <path d="M16 3 27.3 9.5 16 16 4.7 9.5Z" fill={`url(#${top})`} />
      <path d="M4.7 9.5 16 16v13L4.7 22.5Z" fill={`url(#${left})`} />
      <path d="M16 16 27.3 9.5v13L16 29Z" fill={`url(#${right})`} />
    </svg>
  );
};

/** Logo completo: isotipo + nombre. */
const Logo = ({ size = 32, showWordmark = true, className = '' }) => (
  <div className={`flex items-center gap-2.5 ${className}`}>
    <LogoMark size={size} />
    {showWordmark && (
      <span className="text-[17px] font-semibold tracking-tight text-fg">
        Inve<span className="text-muted">School</span>
      </span>
    )}
  </div>
);

export default Logo;
