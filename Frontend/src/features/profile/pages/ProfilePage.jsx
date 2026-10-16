import DashboardLayout from '@/components/layout/DashboardLayout';
import FormInput from '@/components/form/FormInput';
import Loader from '@/components/feedback/Loader';
import SuccessDialog from '@/components/feedback/SuccessDialog';
import { FieldError, PasswordField } from '@/components/form/FormFields';
import useProfileForm from '@/features/profile/hooks/useProfileForm';

const ProfilePage = () => {
  const {
    isLoading,
    formData,
    errors,
    message,
    showPassword,
    modalOpen,
    handleChange,
    handlePasswordToggle,
    handleSubmit,
    setModalOpen,
  } = useProfileForm();

  if (isLoading) {
    return (
      <DashboardLayout>
        <Loader />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <header className="mb-8">
        <h1 className="page-title">Mi perfil</h1>
        <p className="page-subtitle">Actualiza tus datos personales y tu contraseña.</p>
      </header>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {message && (
          <div role="alert" className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
            {message}
          </div>
        )}

        <section className="card p-6 md:p-8">
          <h2 className="text-base font-semibold text-fg">Información personal</h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <FormInput
                label="Nombre completo"
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Nombre y apellido"
              />
              <FieldError message={errors.fullName} />
            </div>
            <div>
              <FormInput
                label="Correo"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="nombre@empresa.com"
              />
              <FieldError message={errors.email} />
            </div>
          </div>
        </section>

        <section className="card p-6 md:p-8">
          <h2 className="text-base font-semibold text-fg">Contraseña</h2>
          <p className="mt-1 text-sm text-muted">
            Ingresa tu contraseña actual para guardar cualquier cambio. Deja la nueva en blanco si no quieres cambiarla.
          </p>
          <div className="mt-6 space-y-6">
            <PasswordField
              label="Contraseña actual"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              visible={showPassword.currentPassword}
              onToggle={() => handlePasswordToggle('currentPassword')}
              error={errors.currentPassword}
            />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <PasswordField
                label="Nueva contraseña"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                visible={showPassword.newPassword}
                onToggle={() => handlePasswordToggle('newPassword')}
                error={errors.newPassword}
              />
              <PasswordField
                label="Confirmar nueva contraseña"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                visible={showPassword.confirmPassword}
                onToggle={() => handlePasswordToggle('confirmPassword')}
                error={errors.confirmPassword}
              />
            </div>
          </div>
        </section>

        <div className="flex justify-end">
          <button type="submit" className="btn-primary">
            Guardar cambios
          </button>
        </div>
      </form>

      <SuccessDialog isOpen={modalOpen} onClose={() => setModalOpen(false)} message="Perfil actualizado exitosamente." />
    </DashboardLayout>
  );
};

export default ProfilePage;
