import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Input from '../../Components/Input';
import Boton from '../../Components/Boton';
import ModalConfirmacion from '../../Components/ModalConfirmacion';
import API_URL from '../../config/api.js';

const ActualizarContrasena = () => {
  const [contrasena, setContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [correo, setCorreo] = useState('');
  const [token, setToken] = useState('');
  const [contrasenaError, setContrasenaError] = useState('');
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const email = params.get('email');
    const token = params.get('token');
  
    if (email && token) {
      setCorreo(email);
      setToken(token);
    }
  }, [location]);

  const togglePasswordVisibility = (field) => {
    setShowPassword({
      ...showPassword,
      [field]: !showPassword[field],
    });
  };

  // Limpia los errores cuando el usuario empieza a escribir en los campos de contraseñas
  const handleChangeContrasena = (e) => {
    setContrasena(e.target.value);
    setContrasenaError('');
  };

  const handleChangeConfirmarContrasena = (e) => {
    setConfirmarContrasena(e.target.value);
    setContrasenaError(''); // Limpiar error si el usuario corrige el campo
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    // Validaciones de contraseñas
    if (contrasena !== confirmarContrasena) {
      setContrasenaError('Las contraseñas no coinciden');
      return;
    }
  
    if (!contrasena || !confirmarContrasena) {
      setContrasenaError('La contraseña es obligatoria');
      return;
    }

    // Validaciones adicionales para la contraseña
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[a-zA-Z]).{8,}$/; // Al menos 8 caracteres, una mayúscula, un número, y sin espacios
    const spaceRegex = /\s/; // Verifica si hay espacios en la contraseña

    if (spaceRegex.test(contrasena)) {
      setContrasenaError('La contraseña no debe contener espacios');
      return;
    }

    if (!passwordRegex.test(contrasena)) {
      setContrasenaError('La contraseña debe tener al menos 8 caracteres, incluir una letra mayúscula y un número');
      return;
    }

    setContrasenaError(''); // Limpiar errores
  
    setLoading(true);
  
    try {
      const requestBody = { token, email: correo, newPassword: contrasena };
  
      const response = await fetch(`${API_URL}/api/update-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        setModalVisible(true);

        // Temporizador para cerrar el modal después de 2 segundos y redirigir
        setTimeout(() => {
          setModalVisible(false);
          navigate('/');
        }, 2000);
      } else {
        setGlobalError(data.error);
      }
    } catch (error) {
      console.error('Error al actualizar la contraseña:', error);
      setGlobalError('Hubo un error al actualizar la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative bg-gray-100">
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#1e3a5f] via-[#3B82F6] to-[#2563EB]"></div>
      <div className="absolute  max-[768px]:justify-center w-full md:w-[80%] h-full md:h-[80%] top-0 md:top-[10%] left-0 md:left-2/4 transform md:-translate-x-1/2 bg-white bg-opacity-50 rounded-none md:rounded-lg flex flex-col md:flex-row">
        {/* Columna izquierda - Oculta en pantallas pequeñas y medianas */}
        <div className="hidden md:flex md:w-1/2 flex-col justify-center space-y-4 p-6 md:p-20 bg-cover bg-center">
          <h2 className="font-serif text-[24px] md:text-[50px] break-words text-white font-montagu text-center md:text-left">
        ¡Actualiza tu Contraseña!</h2>
          <p className="font-fans text-lg text-[30px] text-white font-bold">Ingresa tu nueva contraseña</p>
        </div>

             {/* Columna derecha - Visible en todas las pantallas */}
             <div className="w-full md:w-full lg:w-1/2 bg-white flex flex-col justify-center items-center p-6 md:p-10">
            <div className="mb-6 flex flex-col items-center gap-2">
              <div className="flex items-center justify-center w-14 h-14 bg-[#3B82F6] rounded-xl">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="12" y1="22.08" x2="12" y2="12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-800 tracking-tight">InveSchool</span>
            </div>
          <form className="space-y-4 w-full max-w-sm justify-center items-center" onSubmit={handleSubmit}>
            <h2 className="text-center text-4xl font-josefin flex-auto">Actualizar Contraseña</h2>
            <div className="relative">
              <Input
                type={showPassword.password ? 'text' : 'password'}
                id="contrasena"
                name="contrasena"
                className="w-full p-10 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                placeholder="Ingresa tu nueva contraseña"
                value={contrasena}
                onChange={handleChangeContrasena}
              />
              <i
                className={`bx ${showPassword.password ? 'bx-show' : 'bx-hide'} cursor-pointer absolute right-4 top-[40%] transform -translate-y-1/2`}
                onClick={() => togglePasswordVisibility('password')}
              ></i>
              {contrasenaError && <span className="text-red-500">{contrasenaError}</span>}
            </div>

            <div className="relative">
              <Input
                type={showPassword.confirmPassword ? 'text' : 'password'}
                id="confirmarContrasena"
                name="confirmarContrasena"
                className="w-full p-10 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                placeholder="Confirma tu nueva contraseña"
                value={confirmarContrasena}
                onChange={handleChangeConfirmarContrasena}
              />
              <i
                className={`bx ${showPassword.confirmPassword ? 'bx-show' : 'bx-hide'} cursor-pointer absolute right-4 top-1/2 transform -translate-y-1/2`}
                onClick={() => togglePasswordVisibility('confirmPassword')}
              ></i>
            </div>

            {globalError && <div className="text-red-500">{globalError}</div>}

            <div className="flex justify-center">
              <Boton type="submit" Text={loading ? 'Cargando...' : 'Actualizar'} disabled={loading} />
            </div>
          </form>
        </div>
      </div>

      {/* Modal de confirmación */}
      {modalVisible && (
        <ModalConfirmacion 
          isOpen={modalVisible}
          message="Contraseña actualizada con éxito."
          onClose={() => setModalVisible(false)} 
        />
      )}
    </div>
  );
};

export default ActualizarContrasena;
