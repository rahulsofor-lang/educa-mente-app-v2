
import React, { useState } from 'react';

interface Props {
  onLoginSuccess: () => void;
  onBack: () => void;
}

const PsychologistSecurityHandler: React.FC<Props> = ({ onLoginSuccess, onBack }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Senha hardcoded conforme solicitado
    if (password === '30061979') {
      onLoginSuccess();
    } else {
      alert('Senha incorreta');
    }
  };

  return (
    <div className="max-w-sm mx-auto bg-white p-12 rounded-[48px] shadow-2xl animate-fade-in border border-gray-100 mt-10">
      <div className="bg-[#004481]/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8">
        <svg className="w-10 h-10 text-[#004481]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-3.04l.533-.811a1 1 0 01.832-.45h.33a1 1 0 01.832.45l.533.811m-3.44 3.04A10.024 10.024 0 013 12c0-5.523 4.477-10 10-10s10 4.477 10 10a10.024 10.024 0 01-6.247 9.571" />
        </svg>
      </div>
      
      <h2 className="text-xl font-black text-center text-gray-900 uppercase tracking-tight mb-2">Acesso Restrito</h2>
      <p className="text-[10px] text-gray-400 font-bold text-center mb-10 uppercase tracking-widest">Responsável Técnico (RT)</p>
      
      <form onSubmit={handleLogin} className="space-y-6">
        <div className="relative">
          <input 
            required 
            type={showPassword ? "text" : "password"} 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            placeholder="Digite sua senha" 
            className="input-field text-center pr-12 text-lg tracking-widest"
            autoFocus
          />
          <button 
            type="button" 
            onClick={() => setShowPassword(!showPassword)} 
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#004481] transition-colors"
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
            )}
          </button>
        </div>
        
        <button type="submit" className="btn-premium bg-[#004481] text-white py-5 shadow-xl">
          Entrar no Painel
        </button>
        
        <button 
          type="button" 
          onClick={onBack} 
          className="w-full text-[10px] font-black text-gray-300 uppercase tracking-widest hover:text-gray-500 transition-colors pt-2"
        >
          Voltar ao Início
        </button>
      </form>
    </div>
  );
};

export default PsychologistSecurityHandler;
