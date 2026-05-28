import React, { useState } from "react";
import Input from "../../Components/Input";
import BotonPrincipal from "../../Components/Boton";
import { useUser } from "../../Context/UserContext";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import API_URL from '../../config/api.js';

const Login = () => {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [correoError, setCorreoError] = useState("");
  const [contrasenaError, setContrasenaError] = useState("");
  const [globalError, setGlobalError] = useState("");

  const [successMessage, setSuccessMessage] = useState("");
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const { loginUser } = useUser();
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setMostrarContrasena(!mostrarContrasena);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setCorreoError("");
    setContrasenaError("");
    setGlobalError("");

    let isValid = true;

    if (!correo || !validateEmail(correo)) {
      setCorreoError("Por favor, ingresa un correo electrónico válido.");
      isValid = false;
    }

    if (!contrasena || contrasena.length < 6) {
      setContrasenaError("La contraseña debe tener al menos 6 caracteres.");
      isValid = false;
    }

    if (!isValid) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ correo, contraseña: contrasena }),
        }
      );

      console.log("Login response status:", response.status);

      if (response.ok) {
        const result = await response.json();
        console.log("Login result:", result);

        loginUser(result.user, result.token);
        navigate("/Dashboard");
      } else {
        const errorResult = await response.json();
        console.error("Login error:", errorResult);
        setGlobalError(errorResult.error || "Error de inicio de sesión");
      }
    } catch (error) {
      console.error("Login network error:", error);
      setGlobalError("Error de conexión");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative bg-gray-100">
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#1e3a5f] via-[#3B82F6] to-[#2563EB]"></div>

      {/* Login Container */}

      <div className="absolute  max-[768px]:justify-center w-full md:w-[80%] h-full md:h-[80%] top-0 md:top-[10%] left-0 md:left-2/4 transform md:-translate-x-1/2 bg-white bg-opacity-50 rounded-none md:rounded-lg flex flex-col md:flex-row">
        {/* Columna izquierda - Oculta en pantallas pequeñas y medianas */}
        <div className="hidden md:flex md:w-1/2 flex-col justify-center space-y-4 p-6 md:p-20 bg-cover bg-center">
          <h2 className="font-serif text-[24px] md:text-[50px] break-words text-white font-montagu text-center md:text-left">
            Gestiona tu inventario
          </h2>
          <p className="font-fans text-lg md:text-[30px] text-white font-bold text-center md:text-left">
            De forma simple, rápida y segura
          </p>
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
          <form className="space-y-4 w-full max-w-sm" onSubmit={handleSubmit}>
            <h2 className="text-center text-2xl md:text-4xl font-josefin">
              Iniciar Sesión
            </h2>
            <div>
              <Input
                type="email"
                id="username"
                name="username"
                className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ingresa tu usuario"
                value={correo}
                onChange={(e) => {
                  setCorreo(e.target.value);
                  setCorreoError("");
                  setGlobalError("");
                }}
              />
              {correoError && (
                <span className="text-red-500">{correoError}</span>
              )}
            </div>

            <div className="relative">
              <Input
                type={mostrarContrasena ? "text" : "password"}
                id="password"
                name="password"
                className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ingresa tu contraseña"
                value={contrasena}
                onChange={(e) => {
                  setContrasena(e.target.value);
                  setContrasenaError("");
                  setGlobalError("");
                }}
              />
              <i
                className={`bx ${
                  mostrarContrasena ? "bx-show" : "bx-hide"
                } absolute top-1/2 right-4 transform -translate-y-1/2 cursor-pointer text-gray-500`}
                onClick={togglePasswordVisibility}
              ></i>
            </div>

            {contrasenaError && (
              <div className="text-red-500">{contrasenaError}</div>
            )}
            {globalError && <div className="text-red-500">{globalError}</div>}
            {successMessage && (
              <div className="text-green-500">{successMessage}</div>
            )}

            <div className="flex justify-center">
              <button
                type="submit"
                className={`bg-[#3B82F6] text-white hover:bg-[#2563EB] relative cursor-pointer font-semibold overflow-hidden border border-[#3B82F6] group w-[180px] h-[50px] py-[10px] rounded-[8px] mt-3 self-center`}
              >
                Iniciar sesión
              </button>
            </div>

            <div className="mt-4 text-center">
              <Link
                to="/OlvidarContraseña"
                className="text-blue-500 hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
