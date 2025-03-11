import React, { useState } from 'react';
import Sidebar from '../Components/Sidebar';
import { useNavigate } from 'react-router-dom';

const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false); // Estado para el loader
  const navigate = useNavigate();

  const handleLogout = async () => {
    setLoading(true); // Mostrar el loader
    try {
      await fetch('https://inventarioschool-v1.onrender.com/api/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      // Log out process and redirection
      setTimeout(() => {
        navigate('/Inicio'); // Redirige después de 2 segundos
      }, 2000);
    } catch (error) {
      console.error('Logout failed', error);
      setLoading(false); // Ocultar loader si hay error
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen relative">
      {/* Loader */}
      {loading && (
        <div className="fixed inset-0 bg-white z-50 flex justify-center items-center">
          <dotlottie-player
            src="https://lottie.host/0aca447b-d3c9-46ed-beeb-d4481815915a/qvvqgKAKQU.lottie"
            background="transparent"
            speed="1"
            style={{ width: '300px', height: '300px'  }}
            loop
            autoplay
          />
        </div>
      )}

      {/* Mobile Control Button */}
      {!isSidebarOpen && (
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="md:hidden fixed top-4 left-4 z-50 bg-[#00A305] p-2 rounded-md"
        >
          <i className="fas fa-bars text-white"></i>
        </button>
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        w-64 z-50 md:z-auto
      `}>
        <Sidebar 
          onClose={() => setIsSidebarOpen(false)} 
          isMobile={isSidebarOpen}
          handleLogout={handleLogout} // Pasa la función de logout
        />
      </div>

      {/* Overlay */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black opacity-50 z-40 md:hidden"
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto md:h-screen  pt-16 md:pt-0">
        <div className="p-4 max-w-full">{children}</div>
      </div>
    </div>
  );
};

export default DashboardLayout;
