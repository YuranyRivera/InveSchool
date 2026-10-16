import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye } from 'lucide-react';
import AuthLayout from '@/components/layout/AuthLayout';
import TextInput from '@/components/form/TextInput';
import PasswordInput from '@/components/form/PasswordInput';
import { useAuth } from '@/features/auth/context/AuthContext';
import useDemoLogin from '@/features/auth/hooks/useDemoLogin';
import API_URL, { apiFetch } from '@/lib/apiClient';
import { ROUTES } from '@/app/routes';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const MIN_PASSWORD_LENGTH = 6;

const LoginPage = () => {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [errors, setErrors] = useState({ correo: '', contrasena: '', global: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { loginUser } = useAuth();
  const demo = useDemoLogin();
  const navigate = useNavigate();

  const clearErrors = () => setErrors({ correo: '', contrasena: '', global: '' });

  const validate = () => {
    const next = { correo: '', contrasena: '', global: '' };
    if (!EMAIL_REGEX.test(correo)) next.correo = 'Ingresa un correo electrónico válido.';
    if (contrasena.length < MIN_PASSWORD_LENGTH) {
      next.contrasena = `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`;
    }
    setErrors(next);
    return !next.correo && !next.contrasena;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const response = await apiFetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, contraseña: contrasena }),
      });
      const result = await response.json();

      if (!response.ok) {
        setErrors((prev) => ({ ...prev, global: result.error || 'Correo o contraseña incorrectos.' }));
        return;
      }

      loginUser(result.user, result.token);
      navigate(ROUTES.dashboard);
    } catch (error) {
      console.error('Error de red al iniciar sesión:', error);
      setErrors((prev) => ({ ...prev, global: 'No pudimos conectar con el servidor. Inténtalo de nuevo.' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      heroTitle="Tu inventario, bajo control."
      heroSubtitle="Gestiona artículos, movimientos y reportes de forma simple, rápida y segura."
      title="Iniciar sesión"
      subtitle="Ingresa con tu cuenta para continuar."
    >
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <div>
          <TextInput
            Text="Correo electrónico"
            type="email"
            id="correo"
            name="correo"
            autoComplete="email"
            placeholder="nombre@empresa.com"
            value={correo}
            onChange={(e) => {
              setCorreo(e.target.value);
              clearErrors();
            }}
          />
          {errors.correo && <p className="field-error">{errors.correo}</p>}
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="contrasena" className="text-[13px] font-medium text-muted">
              Contraseña
            </label>
            <Link to={ROUTES.forgotPassword} className="text-[13px] text-accent transition-colors hover:text-fg">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <PasswordInput
            id="contrasena"
            name="contrasena"
            placeholder="••••••••"
            value={contrasena}
            onChange={(e) => {
              setContrasena(e.target.value);
              clearErrors();
            }}
          />
          {errors.contrasena && <p className="field-error">{errors.contrasena}</p>}
        </div>

        {errors.global && (
          <div role="alert" className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
            {errors.global}
          </div>
        )}

        <button type="submit" disabled={isSubmitting} className="btn-primary btn-lg w-full">
          {isSubmitting ? 'Ingresando…' : 'Continuar'}
          {!isSubmitting && <ArrowRight size={18} />}
        </button>
      </form>

      <div className="my-8 flex items-center gap-4 text-xs uppercase tracking-wider text-subtle">
        <span className="h-px flex-1 bg-line" />
        o
        <span className="h-px flex-1 bg-line" />
      </div>

      <button type="button" onClick={() => demo.startDemo()} disabled={demo.isLoading} className="btn-secondary btn-lg w-full">
        <Eye size={18} className="text-subtle" />
        {demo.isLoading ? 'Preparando la demo…' : 'Explorar la demo'}
      </button>
      <p className="mt-3 text-center text-xs text-subtle">Acceso de solo lectura, sin registro.</p>
      {demo.error && <p className="field-error text-center">{demo.error}</p>}
    </AuthLayout>
  );
};

export default LoginPage;
