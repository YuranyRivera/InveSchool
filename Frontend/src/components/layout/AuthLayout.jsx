import Logo, { LogoMark } from '@/components/brand/Logo';

/**
 * Layout de las pantallas de acceso (login, recuperar y actualizar contraseña).
 * Izquierda: panel de marca. Derecha: formulario.
 */
const AuthLayout = ({ heroTitle, heroSubtitle, title, subtitle, children }) => (
  <div className="grid min-h-screen bg-canvas lg:grid-cols-2">
    {/* Panel de marca */}
    <section className="relative hidden overflow-hidden border-r border-line lg:flex lg:flex-col lg:justify-between lg:p-14">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 -top-40 h-[640px] w-[640px] rounded-full bg-navy/80 blur-[140px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-56 -right-40 h-[520px] w-[520px] rounded-full bg-accent/20 blur-[160px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
      />

      <Logo size={30} className="relative" />

      <div className="relative max-w-lg">
        <LogoMark size={72} className="mb-10 drop-shadow-[0_20px_40px_rgba(37,99,235,0.35)]" />
        <h1 className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-5xl font-semibold leading-[1.05] tracking-tight text-transparent xl:text-6xl">
          {heroTitle}
        </h1>
        <p className="mt-6 text-lg text-muted">{heroSubtitle}</p>
      </div>

      <p className="relative text-xs text-subtle">© {new Date().getFullYear()} InveSchool</p>
    </section>

    {/* Formulario */}
    <section className="flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm animate-fade-in">
        <Logo size={30} className="mb-12 lg:hidden" />
        <h2 className="text-2xl font-semibold tracking-tight text-fg">{title}</h2>
        {subtitle && <p className="mt-2 text-sm text-muted">{subtitle}</p>}
        <div className="mt-8">{children}</div>
      </div>
    </section>
  </div>
);

export default AuthLayout;
