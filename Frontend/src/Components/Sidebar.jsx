import React from 'react';
import { useUser } from '../Context/UserContext';
import { Link } from 'react-router-dom';

const Sidebar = ({ onClose, isMobile }) => {
  const { user, logoutUser } = useUser();
  
  // Verificar si el usuario tiene acceso a la sección de contacto
  const hasContactAccess = user?.rol === "Rector" || user?.rol === "Talento Humano";

  return (
    <div className="flex flex-col w-64 h-full bg-[#00A305] text-white p-4 relative">
      {isMobile && (
        <button 
          onClick={onClose} 
          className="md:hidden absolute top-4 right-4 text-white"
        >
          <i className="fas fa-times"></i>
        </button>
      )}

      <div className="flex items-center mb-8">
        <img
          src="/Img/logo.png"
          alt="Logo del Colegio"
          className="h-12 w-12 mr-2"
        />
        <div>
          <span className="text-2xl font-semibold">Inventario</span>
          {user && (
            <span className="flex">
              Hola, {user.nombre}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col space-y-4">
        <Link 
          to="/Dashboard" 
          className="flex items-center text-base md:text-lg hover:bg-[#41B646] p-2 rounded transition duration-300"
          onClick={isMobile ? onClose : undefined}
        >
          <i className="fas fa-chart-line mr-3"></i> Tablero
        </Link>
        <Link 
          to="/Articulos" 
          className="flex items-center text-base md:text-lg hover:bg-[#41B646] p-2 rounded transition duration-300"
          onClick={isMobile ? onClose : undefined}
        >
          <i className="fas fa-box mr-3"></i> Artículo
        </Link>
        
        {/* Mostrar el enlace de Contacto solo si tiene acceso */}
        {hasContactAccess && (
          <Link 
            to="/Contacto" 
            className="flex items-center text-base md:text-lg hover:bg-[#41B646] p-2 rounded transition duration-300"
            onClick={isMobile ? onClose : undefined}
          >
            <i className="fas fa-address-book mr-3"></i> Contacto
          </Link>
        )}
        
        <Link 
          to="/Registro" 
          className="flex items-center text-base md:text-lg hover:bg-[#41B646] p-2 rounded transition duration-300"
          onClick={isMobile ? onClose : undefined}
        >
          <i className="fas fa-file-alt mr-3"></i> Registro
        </Link>
        <Link 
          to="/EditarPerfil" 
          className="flex items-center text-base md:text-lg hover:bg-[#41B646] p-2 rounded transition duration-300"
          onClick={isMobile ? onClose : undefined}
        >
          <i className="fas fa-user-edit mr-3"></i> Editar perfil
        </Link>
      </div>

      <div 
        onClick={logoutUser} 
        className="mt-auto flex items-center text-lg hover:bg-[#41B646] p-2 rounded cursor-pointer"
      >
        <i className="fas fa-sign-out-alt mr-3"></i> Salir
      </div>
    </div>
  );
};

export default Sidebar;