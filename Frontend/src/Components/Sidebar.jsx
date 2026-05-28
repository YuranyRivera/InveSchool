import React from 'react';
import { useUser } from '../Context/UserContext';
import { Link } from 'react-router-dom';

const Sidebar = ({ onClose, isMobile }) => {
  const { user, logoutUser } = useUser();

  const hasContactAccess = user?.rol === "Administrador" || user?.rol === "Recursos Humanos";

  return (
    <div className="flex flex-col w-64 h-full bg-[#2563EB] text-white p-4 relative">
      {isMobile && (
        <button
          onClick={onClose}
          className="md:hidden absolute top-4 right-4 text-white"
        >
          <i className="fas fa-times"></i>
        </button>
      )}

      <div className="flex items-center mb-8 gap-3">
        <div className="flex items-center justify-center w-10 h-10 bg-white rounded-lg flex-shrink-0">
          <span className="text-[#2563EB] font-bold text-lg leading-none">IS</span>
        </div>
        <div>
          <span className="text-xl font-bold tracking-tight">InveSchool</span>
          {user && (
            <span className="flex text-sm text-blue-100">
              Hola, {user.nombre}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col space-y-4">
        <Link
          to="/Dashboard"
          className="flex items-center text-base md:text-lg hover:bg-[#3B82F6] p-2 rounded transition duration-300"
          onClick={isMobile ? onClose : undefined}
        >
          <i className="fas fa-chart-line mr-3"></i> Tablero
        </Link>
        <Link
          to="/Articulos"
          className="flex items-center text-base md:text-lg hover:bg-[#3B82F6] p-2 rounded transition duration-300"
          onClick={isMobile ? onClose : undefined}
        >
          <i className="fas fa-box mr-3"></i> Artículo
        </Link>

        {hasContactAccess && (
          <Link
            to="/Contacto"
            className="flex items-center text-base md:text-lg hover:bg-[#3B82F6] p-2 rounded transition duration-300"
            onClick={isMobile ? onClose : undefined}
          >
            <i className="fas fa-address-book mr-3"></i> Contacto
          </Link>
        )}

        <Link
          to="/Registro"
          className="flex items-center text-base md:text-lg hover:bg-[#3B82F6] p-2 rounded transition duration-300"
          onClick={isMobile ? onClose : undefined}
        >
          <i className="fas fa-file-alt mr-3"></i> Registro
        </Link>
        <Link
          to="/EditarPerfil"
          className="flex items-center text-base md:text-lg hover:bg-[#3B82F6] p-2 rounded transition duration-300"
          onClick={isMobile ? onClose : undefined}
        >
          <i className="fas fa-user-edit mr-3"></i> Editar perfil
        </Link>
      </div>

      <div
        onClick={logoutUser}
        className="mt-auto flex items-center text-lg hover:bg-[#3B82F6] p-2 rounded cursor-pointer"
      >
        <i className="fas fa-sign-out-alt mr-3"></i> Salir
      </div>
    </div>
  );
};

export default Sidebar;
