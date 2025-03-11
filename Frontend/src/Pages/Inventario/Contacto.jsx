import React from 'react';
import MainLayout from '../../Layouts/DashboardLayout';
import InputField from '../../Components/InputField';
import SelectRole from '../../Components/SelectRole';
import BotonPrincipal from '../../Components/Boton';
import Table from '../../Components/TableUsuarios';
import ModalConfirmacion from '../../Components/ModalConfirmacion';
import ModalError from '../../Components/ModalError';
import '@dotlottie/player-component';
import ModalConf from '../../Components/ModalConf';
import { useContactManagement } from '../../hooks/useContactManagement';

const Contactos = () => {
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
  } = useContactManagement();

  return (
    <MainLayout>
      <ModalConf
        isOpen={isDeleteConfirmModalOpen}
        onClose={() => {
          setIsDeleteConfirmModalOpen(false);
        }}
        onConfirm={eliminarUsuario}
        message="¿Estás seguro de que deseas eliminar este usuario?"
        className="z-[50]"
      />

      {isLoading && (
        <div className="flex justify-center items-center h-screen">
          <dotlottie-player
            src="https://lottie.host/0aca447b-d3c9-46ed-beeb-d4481815915a/qvvqgKAKQU.lottie"
            autoplay
            loop
            style={{ width: '300px', height: '300px' }}
          />
        </div>
      )}

      {isContentReady && (
        <div className="justify-center items-center flex flex-col pt-[7em] h-full">
          <div className="w-full max-w-3xl p-12 shadow-md rounded-lg overflow-hidden">
            <h1 className="text-3xl font-bold text-gray-800 mb-10 text-center">
              Agregar Nuevo Usuario
            </h1>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <InputField
                  label="Nombre Completo"
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Ingresa tu nombre completo"
                  className={`border-b ${formErrors.fullName ? 'border-red-500' : ''}`}
                />
                {formErrors.fullName && (
                  <div className="text-red-500 mt-1 text-sm">{formErrors.fullName}</div>
                )}
                <InputField
                  label="Correo"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Ingresa tu correo"
                  className={`border-b ${formErrors.email ? 'border-red-500' : ''}`}
                />
                {formErrors.email && (
                  <div className="text-red-500 mt-1 text-sm">{formErrors.email}</div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative">
                <div className="relative">
                  <InputField
                    label="Contraseña"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Ingresa tu contraseña"
                    className={`border-b ${formErrors.password ? 'border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    className="absolute top-1/2 right-2 transform -translate-y-1/2 text-gray-500"
                    onClick={togglePasswordVisibility}
                  >
                    <i
                      className={`bx ${showPassword ? 'bx-hide' : 'bx-show'} cursor-pointer mt-[30px] text-[20px]`}
                    ></i>
                  </button>
                  {formErrors.password && (
                    <p className="text-red-500 mt-2 text-sm">{formErrors.password}</p>
                  )}
                </div>
                <div className="relative">
                  <InputField
                    label="Confirmar Contraseña"
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirma tu contraseña"
                    className={`border-b ${formErrors.confirmPassword ? 'border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    className="absolute top-1/2 right-2 transform -translate-y-1/2 text-gray-500"
                    onClick={toggleConfirmPasswordVisibility}
                  >
                    <i
                      className={`bx ${
                        showConfirmPassword ? 'bx-hide' : 'bx-show'
                      } cursor-pointer mt-[30px] text-[20px]`}
                    ></i>
                  </button>
                  {formErrors.confirmPassword && (
                    <p className="text-red-500 mt-2 text-sm">{formErrors.confirmPassword}</p>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <SelectRole
                  value={formData.role}
                  onChange={handleChange}
                  className={`border-b ${formErrors.role ? 'border-red-500' : ''}`}
                />
                {formErrors.role && (
                  <p className="text-red-500 mt-2 text-sm">{formErrors.role}</p>
                )}
              </div>

              <div className="flex justify-center mt-6">
                <BotonPrincipal type="submit" Text="Guardar" />
                <div className="absolute top-6 right-6">
                  <button
                    type="button"
                    onClick={toggleModal}
                    className="bg-[#00A305] hover:bg-green-700 font-semibold overflow-hidden border border-verde group w-[180px] h-[50px] py-[10px] rounded-[8px] mt-3 text-white"
                  >
                    Ver Contactos
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <ModalConfirmacion
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        message={message}
      />

      <ModalError
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        message={errorMessage}
      />

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-[90%] sm:w-[70%] p-6 max-h-screen overflow-y-auto relative">
            <button
              type="button"
              className="absolute top-4 right-4 text-gray-500"
              onClick={toggleModal}
            >
              X
            </button>

        

            <div className="">
              <Table
    contactos={contactos}
                title="Lista de Contactos"
                headers={['Nombre Completo', 'Correo', 'Rol']}
                rows={contactos}
                onDelete={handleDeleteConfirmation}
              />
            </div>

            

          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default Contactos;
