import React from 'react';
import DashboardLayout from '../../Layouts/DashboardLayout';
import InputField from '../../Components/InputField';
import Boton from '../../Components/Boton';
import ModalConfirmacion from '../../Components/ModalConfirmacion';
import '@dotlottie/player-component';
import useEditarPerfil from '../../hooks/useEditarPerfil';

const EditarPerfil = () => {
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
  } = useEditarPerfil();

  return (
    <DashboardLayout>
      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <dotlottie-player
            src="https://lottie.host/0aca447b-d3c9-46ed-beeb-d4481815915a/qvvqgKAKQU.lottie"
            background="transparent"
            speed="1"
            style={{ width: '300px', height: '300px' }}
            loop
            autoplay
          />
        </div>
      ) : (
        <div className="justify-center items-center flex flex-col h-full pt-[3em]">
          <div className="w-full max-w-lg p-8 shadow-md overflow-hidden rounded-lg">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Editar Perfil</h1>
            {message && <p className="text-center text-red-500 mb-4">{message}</p>}

            <form onSubmit={handleSubmit}>
              <InputField
                label="Nombre Completo"
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Ingresa tu nombre completo"
              />
              {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName}</p>}

              <InputField
                label="Correo"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Ingresa tu correo"
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

              <div className="relative">
                <InputField
                  label="Contraseña Actual"
                  type={showPassword.currentPassword ? 'text' : 'password'}
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  placeholder="Ingresa tu contraseña actual"
                />
                <button
                  type="button"
                  onClick={() => handlePasswordToggle('currentPassword')}
                  className="absolute top-[70%] right-2 transform -translate-y-1/2 text-gray-500"
                >
                  <i className={`bx ${showPassword.currentPassword ? 'bx-show' : 'bx-hide'} cursor-pointer`}></i>
                </button>
              </div>
              {errors.currentPassword && <p className="text-red-500 text-sm">{errors.currentPassword}</p>}

              <div className="relative">
                <InputField
                  label="Nueva Contraseña"
                  type={showPassword.newPassword ? 'text' : 'password'}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Ingresa tu nueva contraseña"
                />
                <button
                  type="button"
                  onClick={() => handlePasswordToggle('newPassword')}
                  className="absolute top-[70%] right-2 transform -translate-y-1/2 text-gray-500"
                >
                  <i className={`bx ${showPassword.newPassword ? 'bx-show' : 'bx-hide'} cursor-pointer`}></i>
                </button>
              </div>
              {errors.newPassword && <p className="text-red-500 text-sm">{errors.newPassword}</p>}

              <div className="relative">
                <InputField
                  label="Confirmar Nueva Contraseña"
                  type={showPassword.confirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirma tu nueva contraseña"
                />
                <button
                  type="button"
                  onClick={() => handlePasswordToggle('confirmPassword')}
                  className="absolute top-[70%] right-2 transform -translate-y-1/2 text-gray-500"
                >
                  <i className={`bx ${showPassword.confirmPassword ? 'bx-show' : 'bx-hide'} cursor-pointer`}></i>
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}

              <div className="flex justify-center mt-6">
                <Boton type="submit" Text="Actualizar" />
              </div>
            </form>
          </div>
        </div>
      )}

      <ModalConfirmacion
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        message="Perfil actualizado exitosamente"
      />
    </DashboardLayout>
  );
};

export default EditarPerfil;