import { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import Logo from '@/components/brand/Logo';
import DemoNotice from '@/components/feedback/DemoNotice';
import { useAuth } from '@/features/auth/context/AuthContext';

const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const closeSidebar = () => setIsSidebarOpen(false);
  const { user } = useAuth();
  const isDemo = user?.rol === 'Demo';

  return (
    <div className="relative flex min-h-screen flex-col bg-canvas md:flex-row">
      {/* Barra superior (móvil) */}
      <header className="fixed inset-x-0 top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-canvas/80 px-4 backdrop-blur-xl md:hidden">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="btn-ghost h-9 w-9 p-0"
          aria-label="Abrir menú"
        >
          <Menu size={20} />
        </button>
        <Logo size={24} />
      </header>

      {/* Barra lateral */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-out md:relative md:z-auto md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar onClose={closeSidebar} isMobile={isSidebarOpen} />
      </div>

      {isSidebarOpen && (
        <div onClick={closeSidebar} className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden" />
      )}

      {/* Contenido */}
      <main className="flex-1 overflow-y-auto pt-14 md:h-screen md:pt-0">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-10 md:py-10">
          {isDemo && <DemoNotice />}
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
