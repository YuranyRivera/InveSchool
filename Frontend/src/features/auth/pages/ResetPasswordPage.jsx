import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '@/components/layout/AuthLayout';
import PasswordInput from '@/components/form/PasswordInput';
import SuccessDialog from '@/components/feedback/SuccessDialog';
import API_URL, { apiFetch } from '@/lib/apiClient';
import { ROUTES } from '@/app/routes';

// Mínimo 8 caracteres, al menos una mayúscula y un número.
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[a-zA-Z]).{8,}$/;
const REDIRECT_DELAY_MS = 2000;

const validatePassword = (password, confirmation) => {
  if (!password || !confirmation) return 'La contraseña es obligatoria.';
  if (password !== confirmation) return 'Las contraseñas no coinciden.';
  if (/\s/.test(password)) return 'La contraseña no debe contener espacios.';
  if (!PASSWORD_REGEX.test(password)) {
    return 'Debe tener al menos 8 caracteres, una letra mayúscula y un número.';
  }
  return '';
};

const ResetPasswordPage = () => {
  const [contrasena, setContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [correo, setCorreo] = useState('');
  const [token, setToken] = useState('');
  const [contrasenaError, setContrasenaError] = useState('');
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const email = params.get('email');
    const resetToken = params.get('token');

    if (email && resetToken) {
      setCorreo(email);
      setToken(resetToken);
    }
  }, [location]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const error = validatePassword(contrasena, confirmarContrasena);
    setContrasenaError(error);
    if (error) return;

    setLoading(true);
    try {
      const response = await apiFetch(`${API_URL}/api/update-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email: correo, newPassword: contrasena }),
      });
      const data = await response.json();

      if (!response.ok) {
        setGlobalError(data.error);
        return;
      }

      setModalVisible(true);
      setTimeout(() => {
        setModalVisible(false);
        navigate(ROUTES.login);
      }, REDIRECT_DELAY_MS);
    } catch (err) {
      console.error('Error al actualizar la contraseña:', err);
      setGlobalError('Hubo un error al actualizar la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      heroTitle="Una nueva contraseña, un nuevo comienzo."
      heroSubtitle="Elige una contraseña segura que no uses en otros servicios."
      title="Actualizar contraseña"
      subtitle="Mínimo 8 caracteres, con una mayúscula y un número."
    >
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <PasswordInput
          id="contrasena"
          name="contrasena"
          label="Nueva contraseña"
          autoComplete="new-password"
          value={contrasena}
          onChange={(e) => {
            setContrasena(e.target.value);
            setContrasenaError('');
          }}
        />
        <div>
          <PasswordInput
            id="confirmarContrasena"
            name="confirmarContrasena"
            label="Confirmar contraseña"
            autoComplete="new-password"
            value={confirmarContrasena}
            onChange={(e) => {
              setConfirmarContrasena(e.target.value);
              setContrasenaError('');
            }}
          />
          {contrasenaError && <p className="field-error">{contrasenaError}</p>}
        </div>

        {globalError && (
          <div role="alert" className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
            {globalError}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary btn-lg w-full">
          {loading ? 'Actualizando…' : 'Actualizar contraseña'}
        </button>
      </form>

      {modalVisible && (
        <SuccessDialog
          isOpen={modalVisible}
          message="Contraseña actualizada con éxito."
          onClose={() => setModalVisible(false)}
        />
      )}
    </AuthLayout>
  );
};

export default ResetPasswordPage;
