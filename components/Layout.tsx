import React from 'react';
import Logo from './Logo';

interface LayoutProps {
  children: React.ReactNode;
  role: 'employee' | 'hr' | 'psychologist';
  onRoleChange: (role: 'employee' | 'hr' | 'psychologist') => void;
}

const Layout: React.FC<LayoutProps> = ({ children, role, onRoleChange }) => {
  return (
    <div className="h-[100dvh] flex flex-col bg-gray-50 overflow-hidden">
      {/* Header Restaurado */}
      <header className="flex-none bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shadow-sm z-50">
        <div className="flex items-center gap-3">
          <Logo size="sm" />
          <div className="flex flex-col">
            <span className="font-black text-[#004481] uppercase tracking-tighter text-sm leading-none">Educa Mente</span>
            <span className="text-[7px] font-bold text-gray-400 uppercase tracking-widest">Módulo de Coleta</span>
          </div>
        </div>
      </header>
      
      <main className="flex-1 overflow-y-auto w-full max-w-7xl mx-auto p-3 md:p-6 custom-scrollbar relative">
        {children}
      </main>

      <footer className="flex-none bg-white border-t border-gray-100 p-2 md:p-3 flex flex-col items-center gap-1">
        <div className="text-[7px] font-bold text-gray-300 uppercase tracking-widest text-center">
          Educa Mente • Consultoria em Riscos Psicossociais • NR-01
        </div>
      </footer>
    </div>
  );
};

export default Layout;