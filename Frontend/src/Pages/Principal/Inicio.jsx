import React, { useState } from "react";
import Input from "../../Components/Input";
import BotonPrincipal from "../../Components/Boton";
import { useUser } from "../../Context/UserContext";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

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
        "https://inventarioschool-v1.onrender.com/api/login",
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
      <div className="absolute inset-0 z-0">
        <img
          src="/Img/colegio.png"
          alt="Imagen del colegio"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </div>

      {/* Login Container */}

      <div className="absolute  max-[768px]:justify-center w-full md:w-[80%] h-full md:h-[80%] top-0 md:top-[10%] left-0 md:left-2/4 transform md:-translate-x-1/2 bg-white bg-opacity-50 rounded-none md:rounded-lg flex flex-col md:flex-row">
        {/* Columna izquierda - Oculta en pantallas pequeñas y medianas */}
        <div className="hidden md:flex md:w-1/2 flex-col justify-center space-y-4 p-6 md:p-20 bg-cover bg-center">
          <h2 className="font-serif text-[24px] md:text-[50px] break-words text-white font-montagu text-center md:text-left">
            ¡Trabajemos juntos!
          </h2>
          <p className="font-fans text-lg md:text-[30px] text-white font-bold text-center md:text-left">
            Para crear un ambiente positivo y colaborativo
          </p>
        </div>

        {/* Columna derecha - Visible en todas las pantallas */}
        <div className="w-full md:w-full lg:w-1/2 bg-white flex flex-col justify-center items-center p-6 md:p-10">
          <div className="mb-6">
            <img
              src="/Img/logo.png"
              alt="Logo del colegio"
              className="w-20 md:w-32 h-auto"
            />
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
                className={`bg-[#00A305] text-white hover:bg-green-700 relative cursor-pointer font-semibold overflow-hidden border border-verde group w-[180px] h-[50px] py-[10px] rounded-[8px] mt-3 self-center `}
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
