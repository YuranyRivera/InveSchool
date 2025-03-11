import React, { useState } from 'react';
import Input from '../../Components/Input';
import Boton from '../../Components/Boton';
import ModalConfirmacion from '../../Components/ModalConfirmacion';  // Importación del modal

const OlvidarContrasena = () => {
  const [correo, setCorreo] = useState('');
  const [correoError, setCorreoError] = useState('');
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false); // Estado para abrir/cerrar el modal
  const [modalMessage, setModalMessage] = useState(''); // Mensaje del modal

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Validación básica del correo
    if (!correo) {
      setCorreoError('El correo es obligatorio');
      return;
    } else if (!/\S+@\S+\.\S+/.test(correo)) {
      setCorreoError('Por favor ingresa un correo válido');
      return;
    }

    // Limpiar errores previos
    setCorreoError('');
    setGlobalError('');
    setLoading(true);

    try {
      // Solicitud POST para recuperar contraseña
      const response = await fetch('https://inventarioschool-v1.onrender.com/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: correo }),
      });

      const data = await response.json();

      if (response.ok) {
        // Mostrar mensaje de éxito en el modal
        setModalMessage(data.message);
        setModalOpen(true);
        
        // Limpiar el correo después de enviar el formulario
        setCorreo(''); 

        // Cerrar el modal automáticamente después de 2 segundos
        setTimeout(() => {
          setModalOpen(false);
        }, 2000);
      } else {
        // Mostrar errores globales
        setGlobalError(data.error);
      }
    } catch (error) {
      // Manejo de errores en caso de que no se pueda conectar al servidor
      console.error('Error al enviar la solicitud:', error);
      setGlobalError('Hubo un error al enviar el enlace de recuperación.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative bg-gray-100">
    <div className="absolute inset-0 z-0">
<img 
  src="/Img/colegio.png"
  alt="Imagen del colegio" 
  className="w-full h-full object-cover" 
  
/>
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
</div>

     
<div className="absolute  max-[768px]:justify-center w-full md:w-[80%] h-full md:h-[80%] top-0 md:top-[10%] left-0 md:left-2/4 transform md:-translate-x-1/2 bg-white bg-opacity-50 rounded-none md:rounded-lg flex flex-col md:flex-row">
        {/* Columna izquierda - Oculta en pantallas pequeñas y medianas */}
        <div className="hidden md:flex md:w-1/2 flex-col justify-center space-y-4 p-6 md:p-20 bg-cover bg-center">
          <h2 className="font-serif text-[50px] break-words text-white font-montagu">
            ¡Recupera tu Contraseña!
          </h2>
          <p className="font-fans text-lg text-[30px] text-white font-bold">
            Ingresa tu correo para recuperar el acceso
          </p>
        </div>

        <div className="w-full md:w-full lg:w-1/2 bg-white flex flex-col justify-center items-center p-6 md:p-10">
            <div className="mb-6">
            <img 
              src="/Img/logo.png"
              alt="Imagen del colegio"
              className="w-32 h-auto"
            />
          </div>
          <form className="space-y-4 w-full max-w-sm justify-center items-center" onSubmit={handleSubmit}>
          <h2 className="text-center text-2xl md:text-4xl font-josefin">
              Recuperar Contraseña
            </h2>
            <div>
              <Input
                type="email"
                id="correo"
                name="correo"
                className="w-full p-10 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ingresa tu correo"
                value={correo}
                onChange={(e) => {
                  setCorreo(e.target.value);
                  setCorreoError(''); // Limpiar el error de correo al escribir
                  setGlobalError(''); // Limpiar el error global al escribir
                }}
              />
              {correoError && <span className="text-red-500">{correoError}</span>}
            </div>

            {globalError && <div className="text-red-500">{globalError}</div>}

            <div className="flex justify-center">
              <Boton 
                type="submit" 
                Text={loading ? 'Cargando...' : 'Recuperar'} 
                disabled={loading} 
              />
            </div>
          </form>
        </div>
      </div>

      {/* Mostrar modal de confirmación si el estado modalOpen es true */}
      <ModalConfirmacion 
        isOpen={modalOpen} 
        onClose={() => {
          setModalOpen(false);
          setCorreo(''); // Limpiar el correo cuando se cierra el modal
          setCorreoError(''); // Limpiar error de correo al cerrar modal
          setGlobalError(''); // Limpiar error global
        }} 
        message={modalMessage}
      />
    </div>
  );
};

export default OlvidarContrasena;
