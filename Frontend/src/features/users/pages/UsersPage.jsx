import { Users, X } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import FormInput from '@/components/form/FormInput';
import { FieldError, PasswordField } from '@/components/form/FormFields';
import RoleSelect from '@/features/users/components/RoleSelect';
import Loader from '@/components/feedback/Loader';
import UsersTable from '@/features/users/components/UsersTable';
import SuccessDialog from '@/components/feedback/SuccessDialog';
import ErrorDialog from '@/components/feedback/ErrorDialog';
import ConfirmDialog from '@/components/feedback/ConfirmDialog';
import { useUserManagement } from '@/features/users/hooks/useUserManagement';

const UsersPage = () => {
  const {
    formData,
    formErrors,
    showPassword,
    showConfirmPassword,
    isLoading,
    isContentReady,
    contactos,
    isModalOpen,
    isConfirmModalOpen,
    isErrorModalOpen,
    isDeleteConfirmModalOpen,
    message,
    errorMessage,
    handleChange,
    handleSubmit,
    handleDeleteConfirmation,
    eliminarUsuario,
    toggleModal,
    togglePasswordVisibility,
    toggleConfirmPasswordVisibility,
    setIsConfirmModalOpen,
    setIsErrorModalOpen,
    setIsDeleteConfirmModalOpen,
  } = useUserManagement();

  return (
    <DashboardLayout>
      <ConfirmDialog
        isOpen={isDeleteConfirmModalOpen}
        onClose={() => setIsDeleteConfirmModalOpen(false)}
        onConfirm={eliminarUsuario}
        message="¿Estás seguro de que deseas eliminar este usuario?"
      />

      {isLoading && <Loader />}

      {isContentReady && (
        <>
          <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="page-title">Contactos</h1>
              <p className="page-subtitle">Crea usuarios y gestiona quién tiene acceso al sistema.</p>
            </div>
            <button type="button" onClick={toggleModal} className="btn-secondary">
              <Users size={16} className="text-subtle" />
              Ver contactos
            </button>
          </header>

          <section className="card max-w-3xl p-6 md:p-8">
            <h2 className="text-base font-semibold text-fg">Nuevo usuario</h2>
            <p className="mt-1 text-sm text-muted">Completa los datos para crear una cuenta.</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <FormInput
                    label="Nombre completo"
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Nombre y apellido"
                  />
                  <FieldError message={formErrors.fullName} />
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
                  <FieldError message={formErrors.email} />
                </div>
                <PasswordField
                  label="Contraseña"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Mínimo 8 caracteres"
                  visible={showPassword}
                  onToggle={togglePasswordVisibility}
                  error={formErrors.password}
                />
                <PasswordField
                  label="Confirmar contraseña"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repite la contraseña"
                  visible={showConfirmPassword}
                  onToggle={toggleConfirmPasswordVisibility}
                  error={formErrors.confirmPassword}
                />
              </div>

              <div>
                <RoleSelect value={formData.role} onChange={handleChange} />
                <FieldError message={formErrors.role} />
              </div>

              <div className="flex justify-end border-t border-line pt-6">
                <button type="submit" className="btn-primary">
                  Crear usuario
                </button>
              </div>
            </form>
          </section>
        </>
      )}

      <SuccessDialog isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} message={message} />

      <ErrorDialog isOpen={isErrorModalOpen} onClose={() => setIsErrorModalOpen(false)} message={errorMessage} />

      {isModalOpen && (
        <div className="modal-backdrop" onClick={toggleModal}>
          <div
            className="modal-panel relative max-h-[90vh] max-w-4xl overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Lista de contactos"
          >
            <button type="button" onClick={toggleModal} className="icon-btn absolute right-4 top-4" aria-label="Cerrar">
              <X size={18} />
            </button>
            <UsersTable
              title="Lista de contactos"
              headers={['Nombre completo', 'Correo', 'Rol']}
              rows={contactos}
              onDelete={handleDeleteConfirmation}
            />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default UsersPage;
