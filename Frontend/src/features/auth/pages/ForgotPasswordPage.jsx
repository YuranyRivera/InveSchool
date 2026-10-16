import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AuthLayout from '@/components/layout/AuthLayout';
import TextInput from '@/components/form/TextInput';
import SuccessDialog from '@/components/feedback/SuccessDialog';
import API_URL, { apiFetch } from '@/lib/apiClient';
import { ROUTES } from '@/app/routes';

const EMAIL_REGEX = /\S+@\S+\.\S+/;
const MODAL_AUTOCLOSE_MS = 2000;

const ForgotPasswordPage = () => {
  const [correo, setCorreo] = useState('');
  const [correoError, setCorreoError] = useState('');
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const resetForm = () => {
    setCorreo('');
    setCorreoError('');
    setGlobalError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!correo) {
      setCorreoError('El correo es obligatorio.');
      return;
    }
    if (!EMAIL_REGEX.test(correo)) {
      setCorreoError('Ingresa un correo válido.');
      return;
    }

    setCorreoError('');
    setGlobalError('');
    setLoading(true);

    try {
      const response = await apiFetch(`${API_URL}/api/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: correo }),
      });
      const data = await response.json();

      if (!response.ok) {
        setGlobalError(data.error);
        return;
      }

      setModalMessage(data.message);
      setModalOpen(true);
      setCorreo('');
      setTimeout(() => setModalOpen(false), MODAL_AUTOCLOSE_MS);
    } catch (error) {
      console.error('Error al enviar la solicitud:', error);
      setGlobalError('Hubo un error al enviar el enlace de recuperación.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      heroTitle="Recupera tu acceso."
      heroSubtitle="Te enviaremos un enlace seguro para que crees una nueva contraseña."
      title="¿Olvidaste tu contraseña?"
      subtitle="Ingresa el correo asociado a tu cuenta."
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
              setCorreoError('');
              setGlobalError('');
            }}
          />
          {correoError && <p className="field-error">{correoError}</p>}
        </div>

        {globalError && (
          <div role="alert" className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
            {globalError}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary btn-lg w-full">
          {loading ? 'Enviando…' : 'Enviar enlace'}
        </button>

        <Link to={ROUTES.login} className="btn-ghost w-full">
          <ArrowLeft size={16} />
          Volver a iniciar sesión
        </Link>
      </form>

      <SuccessDialog
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          resetForm();
        }}
        message={modalMessage}
      />
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
