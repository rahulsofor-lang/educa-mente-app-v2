import React, { useState } from 'react';
import { SurveyResponse, Company } from '../types';
import { QUESTIONS, OPTIONS } from '../constants';

interface SurveyProps {
  currentCompany: Company | null;
  onLogin: (code: string) => Company | null;
  onSubmit: (response: Omit<SurveyResponse, 'id'>) => void;
  onBack: () => void;
  onExitKiosk: () => void;
  isKioskMode: boolean;
  allResponses: SurveyResponse[];
}

const Survey: React.FC<SurveyProps> = ({
  currentCompany,
  onLogin,
  onSubmit,
  onBack,
  onExitKiosk,
  allResponses,
  isKioskMode
}) => {
  const [step, setStep] = useState<'code' | 'info' | 'questions' | 'done'>('code');
  const [accessCode, setAccessCode] = useState('');
  const [sectorId, setSectorId] = useState('');
  const [jobFunction, setJobFunction] = useState('');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const company = onLogin(accessCode.trim());
    if (!company) return alert("Código inválido!");

    const count = allResponses.filter(r => r.companyId === company.id).length;
    if (count >= company.totalEmployees) return alert('Limite de respostas atingido para esta unidade.');

    setStep('info');
  };

  const handleFinish = (finalAnswers: { [key: number]: number }) => {
    if (!currentCompany) return onBack();
    const responseData = {
      companyId: currentCompany.id,
      completedAt: new Date().toISOString(),
      sectorId,
      jobFunction,
      answers: finalAnswers
    };
    onSubmit(responseData);
    setStep('done');
  };

  if (step === 'code') {
    return (
      <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-[40px] shadow-2xl border border-gray-100 text-center animate-fade-in">
        <h2 className="text-xl font-black uppercase text-[#004481] mb-6">Acesso Unidade</h2>
        <form onSubmit={handleCodeSubmit} className="space-y-4">
          <input
            value={accessCode}
            onChange={e => setAccessCode(e.target.value)}
            placeholder="#CÓDIGO"
            className="input-field text-center font-black uppercase"
            required
          />
          <button type="submit" className="btn-premium bg-[#004481] text-white w-full py-4 shadow-xl">Entrar</button>
          <button type="button" onClick={onBack} className="text-[10px] font-black uppercase text-gray-300">Voltar</button>
        </form>
      </div>
    );
  }

  if (step === 'info') {
    return (
      <div className="max-w-xl mx-auto bg-white rounded-[40px] shadow-2xl overflow-hidden animate-fade-in mt-6">
        <div className="bg-[#004481] p-8 text-white text-center">
          <h2 className="text-xl font-black uppercase">{currentCompany?.nomeFantasia}</h2>
          <p className="text-[10px] uppercase opacity-60 font-bold">Identificação</p>
        </div>
        <div className="p-8 space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase">Setor de Trabalho</label>
            <select value={sectorId} onChange={e => setSectorId(e.target.value)} className="input-field" required>
              <option value="">Selecione seu setor...</option>
              {currentCompany?.sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase">Função/Cargo</label>
            <input value={jobFunction} onChange={e => setJobFunction(e.target.value)} placeholder="Ex: Operador" className="input-field uppercase font-black" required />
          </div>
          <button disabled={!sectorId || !jobFunction} onClick={() => setStep('questions')} className="btn-premium bg-[#004481] text-white w-full py-4 shadow-xl disabled:opacity-30">Começar Questionário</button>
        </div>
      </div>
    );
  }

  if (step === 'questions') {
    const q = QUESTIONS[currentIdx];
    const progress = ((currentIdx + 1) / QUESTIONS.length) * 100;

    const handleSelect = (val: number) => {
      const nextAnswers = { ...answers, [q.id]: val };
      setAnswers(nextAnswers);
      if (currentIdx < QUESTIONS.length - 1) {
        setCurrentIdx(prev => prev + 1);
      } else {
        handleFinish(nextAnswers);
      }
    };

    // valor selecionado para a pergunta atual (usado para renderizar estado "selecionado")
    const selectedValue = answers[q.id];

    return (
      <div className="fixed inset-0 bg-[#f8fbff] flex flex-col z-[100] h-screen w-screen overflow-hidden animate-fade-in">
        {/* Progresso */}
        <div className="fixed top-0 left-0 w-full h-1.5 bg-gray-100 z-[110]">
          <div className="h-full bg-[#004481] transition-all duration-300 shadow-[0_0_10px_rgba(0,68,129,0.3)]" style={{width: `${progress}%`}}></div>
        </div>

        {/* Pergunta - Área Superior (Espaço fixo em 30% da tela) */}
        <div className="flex-none h-[30%] flex flex-col items-center justify-center px-6 text-center pt-6 bg-white border-b border-gray-100">
           {currentIdx > 0 && (
            <button onClick={() => setCurrentIdx(prev => prev - 1)} className="mb-4 text-[10px] font-black text-[#004481] uppercase flex items-center gap-1 opacity-50 active:opacity-100">
              ← Pergunta Anterior
            </button>
           )}
           <span className="text-[9px] font-black text-[#004481] uppercase tracking-[0.3em] opacity-40 mb-2">Página {currentIdx + 1} de {QUESTIONS.length}</span>
           <h3 className="text-lg sm:text-2xl font-black text-gray-900 leading-tight max-w-lg px-2">
             {q.text}
           </h3>
        </div>

        {/* Botões - Área Inferior (70% da tela, com scroll se necessário) */}
        <div className="flex-grow flex flex-col justify-start p-4 pb-12 sm:pb-8 w-full max-w-md mx-auto space-y-3 overflow-y-auto">
           <div className="grid grid-cols-2 gap-3">
              {OPTIONS.slice(0, 4).map(opt => {
                const isSelected = selectedValue === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => handleSelect(opt.value)}
                    className={`bg-white border-2 p-4 rounded-2xl shadow-sm active:scale-95 active:border-[#004481] transition-all flex flex-col items-center justify-center hover:border-[#004481] h-20 ${
                      isSelected ? 'border-[#004481] bg-[#e6f8ff]' : 'border-gray-200'
                    }`}
                  >
                    <span className="text-xl font-black text-[#004481]">{opt.value}</span>
                    <span className="text-[9px] font-black uppercase text-gray-400 mt-1">{opt.label}</span>
                  </button>
                );
              })}
           </div>

           {(() => {
             const isSelectedLarge = selectedValue === OPTIONS[4].value;
             return (
               <button
                 onClick={() => handleSelect(OPTIONS[4].value)}
                 className={`w-full p-5 rounded-2xl shadow-sm active:scale-95 transition-all flex flex-col items-center justify-center hover:border-[#004481] h-20 ${
                   isSelectedLarge ? 'border-[#004481] bg-[#e6f8ff]' : 'border-2 border-gray-200 bg-white'
                 }`}
               >
                 <span className="text-2xl font-black text-[#004481]">{OPTIONS[4].value}</span>
                 <span className="text-[10px] font-black uppercase text-gray-400 mt-1">{OPTIONS[4].label}</span>
               </button>
             );
           })()}

           <div className="text-center pt-2 pb-6">
             {isKioskMode && (
               <button onClick={onExitKiosk} className="text-[8px] font-black text-gray-300 uppercase underline">Sair do Modo Quiosque</button>
             )}
             <p className="text-[8px] font-black text-gray-300 uppercase mt-2">Responda com sinceridade conforme sua rotina</p>
           </div>
        </div>
      </div>
    );
  }

  if (step === 'done') {
    return (
      <div className="max-w-md mx-auto mt-20 bg-white p-10 rounded-[40px] shadow-2xl text-center animate-fade-in border border-gray-100">
        <div className="bg-emerald-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2 uppercase">Sucesso!</h2>
        <p className="text-[10px] text-gray-400 font-bold uppercase mb-8">Sua avaliação foi registrada com segurança.</p>
        <button onClick={onBack} className="btn-premium bg-[#004481] text-white w-full py-4 shadow-lg">Sair e Finalizar</button>
      </div>
    );
  }

  return null;
};

export default Survey;