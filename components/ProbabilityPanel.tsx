import React from 'react';

const ProbabilityPanel: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-10 bg-white rounded-[40px] border border-gray-100 shadow-sm text-center">
      <div className="bg-indigo-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-[#004481]">
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      </div>
      <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-2">Avaliação Técnica Integrada</h3>
      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest leading-relaxed max-w-xs mx-auto">
        A avaliação de probabilidade agora é feita diretamente na Matriz de Risco do Laudo NR-01 para maior precisão técnica.
      </p>
    </div>
  );
};

export default ProbabilityPanel;