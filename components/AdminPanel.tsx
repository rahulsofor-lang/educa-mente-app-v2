import React, { useState, useEffect, useMemo } from 'react';
import { Sector, Company, CompanyStatus, SurveyResponse } from '../types';
import { QUESTIONS } from '../constants';

interface AdminPanelProps {
  company: Company | null;
  allCompanies: Company[];
  responses: SurveyResponse[];
  // Fix: changed return type to string | Promise<string> to allow async registration functions
  onRegister: (data: Omit<Company, 'id' | 'accessCode' | 'status'>) => string | Promise<string>;
  onUpdateCompany: (data: Partial<Company>) => void;
  onResetPassword: (id: string, newPass: string) => void;
  onUpdateSectors: (sectors: Sector[]) => void;
  onLogin: (code: string, password?: string) => Company | null;
  onToggleKiosk: () => void;
  isKioskMode: boolean;
  onLogout: () => void;
  initialView?: 'login' | 'register';
}

const SECURITY_QUESTIONS = [
  "Qual o nome da sua mãe?",
  "Qual o nome do seu primeiro pet?",
  "Cidade de nascimento?",
  "Nome da primeira escola?"
];

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  company, allCompanies, responses, onRegister, onUpdateCompany, onResetPassword, onLogin, onUpdateSectors, onToggleKiosk, isKioskMode, onLogout, initialView = 'login'
}) => {
  const [view, setView] = useState<'login' | 'register' | 'edit' | 'recovery_cnpj' | 'recovery_question' | 'recovery_reset' | 'dashboard'>(initialView);
  const [showPassword, setShowPassword] = useState(false);
  const [newSector, setNewSector] = useState('');
  const [isFetchingCep, setIsFetchingCep] = useState(false);
  
  const [loginCode, setLoginCode] = useState('');
  const [loginPass, setLoginPass] = useState('');

  const [recoveryCNPJ, setRecoveryCNPJ] = useState('');
  const [recoveryCompany, setRecoveryCompany] = useState<Company | null>(null);
  const [recoveryAnswer, setRecoveryAnswer] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmNewPass, setConfirmNewPass] = useState('');

  const [formData, setFormData] = useState({
    razaoSocial: '', nomeFantasia: '', cnpj: '', cep: '',
    logradouro: '', numero: '', bairro: '', cidade: '', uf: '',
    telefoneFixo: '', telefoneCelular: '', totalEmployees: 0,
    password: '', confirmPassword: '', securityQuestion: SECURITY_QUESTIONS[0], securityAnswer: ''
  });

  useEffect(() => {
    if (!company) {
      setView(initialView);
    }
  }, [initialView, company]);

  const companyResponses = useMemo(() => 
    responses.filter(r => r.companyId === company?.id), 
    [responses, company]
  );

  const applyMask = (value: string, type: 'cnpj' | 'cep' | 'phone') => {
    let v = value.replace(/\D/g, '');
    if (type === 'cnpj') {
      v = v.slice(0, 14);
      return v.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
    }
    if (type === 'cep') {
      v = v.slice(0, 8);
      return v.replace(/^(\d{5})(\d{3})/, "$1-$2");
    }
    if (type === 'phone') {
      v = v.slice(0, 11);
      if (v.length > 10) return v.replace(/^(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
      return v.replace(/^(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    }
    return v;
  };

  const handleCepChange = async (value: string) => {
    const masked = applyMask(value, 'cep');
    setFormData(prev => ({ ...prev, cep: masked }));

    const cleanCep = masked.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      setIsFetchingCep(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            logradouro: data.logradouro || '',
            bairro: data.bairro || '',
            cidade: data.localidade || '',
            uf: data.uf || ''
          }));
        } else {
          alert("CEP não encontrado na base de dados dos Correios.");
        }
      } catch (e) { 
        console.error("Erro ao buscar CEP:", e);
        alert("Erro ao conectar com o serviço de busca de CEP.");
      } finally {
        setIsFetchingCep(false);
      }
    }
  };

  const handleAddSector = () => {
    if (!company || !newSector.trim()) return;
    const existingSectors = company.sectors || [];
    if (existingSectors.find(s => s.name === newSector.trim().toUpperCase())) {
      alert("Este setor já foi adicionado.");
      return;
    }
    onUpdateSectors([...existingSectors, { id: Date.now().toString(), name: newSector.trim().toUpperCase() }]);
    setNewSector('');
  };

  const handleExportCSV = () => {
    if (!company) return;
    
    const headers = [
      "RAZAO_SOCIAL", 
      "CNPJ", 
      "EMAIL",
      "TELEFONE_FIXO", 
      "TELEFONE_CELULAR", 
      "ENDERECO_COMPLETO",
      "CIDADE", 
      "UF", 
      "SETOR", 
      "FUNCAO",
      "DATA_RESPOSTA", 
      ...QUESTIONS.map(q => `P${q.id}`)
    ];

    const rows = companyResponses.map(r => {
      const sector = company.sectors.find(s => s.id === r.sectorId)?.name || 'N/A';
      const date = new Date(r.completedAt).toLocaleDateString('pt-BR');
      const fullAddress = `${company.logradouro}, ${company.numero} - ${company.bairro}`;
      const emailPlaceholder = (company as any).email || "";
      const answers = QUESTIONS.map(q => r.answers[q.id] !== undefined ? r.answers[q.id] : 0);
      
      return [
        `"${company.razaoSocial || ''}"`,
        `"${company.cnpj || ''}"`,
        `"${emailPlaceholder}"`,
        `"${company.telefoneFixo || ''}"`,
        `"${company.telefoneCelular || ''}"`,
        `"${fullAddress}"`,
        `"${company.cidade || ''}"`,
        `"${company.uf || ''}"`,
        `"${sector}"`,
        `"${r.jobFunction || 'N/A'}"`,
        `"${date}"`,
        ...answers
      ].join(";");
    });

    const csvContent = "\ufeff" + [headers.join(";"), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `relatorio_nr01_${company.nomeFantasia.toLowerCase().replace(/\s/g, '_')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleShareWhatsApp = () => {
    if (!company) return;
            const vercelAppLink = "https://educa-mente-app-v2.vercel.app/"; // Seu link do Vercel
        const text = `Olá equipe ${company.nomeFantasia}! 🚀

Acesse o link abaixo, baixe o app e participe da Avaliação de Riscos Psicossociais da NR-1. Assim você contribui para o bem-estar da nossa empresa. 🧠💙

Sua participação é essencial para essa virada de chave! 🚀

🔗 Link de Acesso: ${vercelAppLink}

Use esse código para acessar a Avaliação: ${company.accessCode}`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleStartEdit = () => {
    if (!company) return;
    setFormData({
      razaoSocial: company.razaoSocial,
      nomeFantasia: company.nomeFantasia,
      cnpj: company.cnpj,
      cep: company.cep,
      logradouro: company.logradouro,
      numero: company.numero,
      bairro: company.bairro,
      cidade: company.cidade,
      uf: company.uf,
      telefoneFixo: company.telefoneFixo,
      telefoneCelular: company.telefoneCelular,
      totalEmployees: company.totalEmployees,
      password: company.password || '',
      confirmPassword: company.password || '',
      securityQuestion: company.securityQuestion,
      securityAnswer: company.securityAnswer
    });
    setView('edit');
  };

  if (company && view !== 'edit') {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-20">
        <div className="bg-[#004481] p-8 rounded-[32px] text-white shadow-2xl flex flex-col md:flex-row justify-between items-center">
          <div>
            <span className="text-[10px] font-black uppercase opacity-60 tracking-widest">Painel Gestão</span>
            <h2 className="text-2xl font-black mt-1">{company.nomeFantasia}</h2>
            <p className="text-[10px] opacity-60 uppercase font-bold">{company.razaoSocial} | {company.cnpj}</p>
          </div>
          <div className="bg-white/10 px-6 py-4 rounded-2xl text-center mt-4 md:mt-0 border border-white/10">
            <span className="block text-[8px] font-black uppercase opacity-60">Código Unidade</span>
            <span className="block text-xl font-black tracking-widest">{company.accessCode}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-[10px] font-black uppercase text-gray-400 mb-1">Dados Coletados</h3>
              <p className="text-3xl font-black text-gray-900">{companyResponses.length} <span className="text-sm font-bold text-gray-300">/ {company.totalEmployees}</span></p>
            </div>
            <button onClick={handleExportCSV} className="bg-emerald-500 text-white px-5 py-3 rounded-2xl text-[10px] font-black uppercase shadow-lg hover:scale-105 transition-all mt-4 w-full">Baixar CSV Completo</button>
          </div>

          <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-[10px] font-black uppercase text-gray-400 mb-1">Engajamento</h3>
              <p className="text-xs font-black text-indigo-600 uppercase">Convidar Colaboradores</p>
            </div>
            <button 
              onClick={handleShareWhatsApp} 
              className="bg-[#25D366] text-white px-5 py-3 rounded-2xl text-[10px] font-black uppercase shadow-lg hover:scale-105 transition-all mt-4 flex items-center justify-center gap-2 w-full"
            >
              Convidar via WhatsApp
            </button>
          </div>

          <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-[10px] font-black uppercase text-gray-400 mb-1">Gerenciamento</h3>
              <p className="text-xs font-black text-amber-500 uppercase tracking-tight">Alterar Dados Cadastrais</p>
            </div>
            <button 
              onClick={handleStartEdit}
              className="bg-amber-100 text-amber-700 px-5 py-3 rounded-2xl text-[10px] font-black uppercase shadow-sm hover:scale-105 transition-all mt-4 w-full"
            >
              Editar Cadastro
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="text-[10px] font-black uppercase text-gray-400 mb-1 tracking-widest">Modo de Acesso</h3>
              <p className="text-xs font-black text-[#004481] uppercase">{isKioskMode ? 'Modo Quiosque Ativo' : 'Acesso Individual'}</p>
            </div>
            <button 
              onClick={onToggleKiosk}
              className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase transition-all shadow-md ${isKioskMode ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'}`}
            >
              {isKioskMode ? 'Desativar Quiosque' : 'Ativar Quiosque'}
            </button>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6">Gerenciamento de Setores</h3>
          
          <div className="flex gap-2 mb-6">
            <div className="flex-1 relative">
              <input 
                type="text" 
                value={newSector} 
                onChange={e => setNewSector(e.target.value)} 
                onKeyDown={e => { if(e.key === 'Enter') handleAddSector(); }}
                placeholder="Ex: PRODUÇÃO, RH, VENDAS..." 
                className="input-field pr-16 uppercase font-black" 
              />
              <button 
                onClick={handleAddSector}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#004481] text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-lg hover:scale-110 active:scale-90 transition-all z-10"
                title="Adicionar Setor"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {(company.sectors || []).map(s => (
              <div key={s.id} className="p-3 bg-gray-50 rounded-xl flex justify-between items-center border border-gray-100 group hover:border-[#004481]/30">
                <span className="text-[9px] font-black text-gray-700 uppercase">{s.name}</span>
                <button 
                  onClick={() => onUpdateSectors(company.sectors.filter(x => x.id !== s.id))} 
                  className="text-gray-300 hover:text-red-500 text-[14px] font-black transition-colors"
                >
                  ×
                </button>
              </div>
            ))}
            {(company.sectors || []).length === 0 && (
               <div className="col-span-full py-10 text-center text-[10px] font-black uppercase text-gray-300 italic border-2 border-dashed border-gray-50 rounded-2xl">
                  Nenhum setor cadastrado. Use o campo acima para adicionar.
               </div>
            )}
          </div>
        </div>
        
        <button onClick={onLogout} className="w-full text-center text-red-500 font-black text-[10px] uppercase tracking-widest pt-4 hover:underline">Sair do Sistema</button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      {view === 'login' && (
        <div className="bg-white p-10 rounded-[40px] shadow-2xl border border-gray-100 text-center animate-fade-in">
          <h2 className="text-2xl font-black uppercase text-[#004481] mb-8">Login Gestor</h2>
          <div className="space-y-4">
            <input value={loginCode} onChange={e => setLoginCode(e.target.value)} placeholder="CÓDIGO UNIDADE" className="input-field text-center font-black tracking-widest" />
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} value={loginPass} onChange={e => setLoginPass(e.target.value)} placeholder="SENHA" className="input-field text-center font-black" />
              <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-4 text-gray-400">
                {showPassword ? '👁️' : '🙈'}
              </button>
            </div>
            <button onClick={() => { if(!onLogin(loginCode, loginPass)) alert('Acesso Negado'); }} className="btn-premium bg-[#004481] text-white w-full py-5">Entrar no Painel</button>
            <div className="flex flex-col gap-3 pt-4">
              <button onClick={() => setView('register')} className="text-[10px] font-black uppercase text-[#004481]">Não tem cadastro? Registrar Unidade</button>
              <button onClick={() => setView('recovery_cnpj')} className="text-[10px] font-black uppercase text-gray-400">Esqueci minha senha</button>
            </div>
          </div>
        </div>
      )}

      {(view === 'register' || view === 'edit') && (
        <div className="bg-white p-10 rounded-[40px] shadow-2xl border border-gray-100 animate-fade-in overflow-hidden">
          <h2 className="text-xl font-black uppercase text-[#004481] mb-8 text-center">
            {view === 'edit' ? 'Editar Dados da Unidade' : 'Registrar Nova Unidade'}
          </h2>
          <form className="space-y-4 max-h-[70vh] overflow-y-auto px-2 custom-scrollbar" onSubmit={e => {
            e.preventDefault();
            if(formData.password !== formData.confirmPassword) return alert("Senhas não conferem!");
            const { confirmPassword, ...rest } = formData;
            
            if (view === 'edit') {
               onUpdateCompany(rest);
               alert("Alterações salvas com sucesso!");
               setView('dashboard');
            } else {
               onRegister({ ...rest, sectors: [] });
            }
          }}>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-2">Razão Social</label>
              <input required placeholder="Razão Social" value={formData.razaoSocial} onChange={e => setFormData({...formData, razaoSocial: e.target.value})} className="input-field" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-2">Nome Fantasia</label>
              <input required placeholder="Nome Fantasia" value={formData.nomeFantasia} onChange={e => setFormData({...formData, nomeFantasia: e.target.value})} className="input-field" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-2">CNPJ</label>
              <input required placeholder="CNPJ" value={formData.cnpj} onChange={e => setFormData({...formData, cnpj: applyMask(e.target.value, 'cnpj')})} className="input-field" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 relative">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-2">CEP</label>
                <input required placeholder="CEP" value={formData.cep} onChange={e => handleCepChange(e.target.value)} className={`input-field ${isFetchingCep ? 'border-indigo-400 animate-pulse' : ''}`} />
                {isFetchingCep && <span className="absolute right-4 top-10 text-[8px] font-black text-indigo-500">BUSCANDO...</span>}
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-2">Número</label>
                <input required placeholder="Número" value={formData.numero} onChange={e => setFormData({...formData, numero: e.target.value})} className="input-field" />
              </div>
            </div>
            <input required placeholder="Logradouro" value={formData.logradouro} readOnly className="input-field bg-gray-50 opacity-70" />
            <input required placeholder="Bairro" value={formData.bairro} readOnly className="input-field bg-gray-50 opacity-70" />
            <div className="grid grid-cols-2 gap-4">
              <input required placeholder="Cidade" value={formData.cidade} readOnly className="input-field bg-gray-50 opacity-70" />
              <input required placeholder="UF" value={formData.uf} readOnly className="input-field bg-gray-50 opacity-70" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-2">Tel. Fixo</label>
                <input required placeholder="Telefone Fixo" value={formData.telefoneFixo} onChange={e => setFormData({...formData, telefoneFixo: applyMask(e.target.value, 'phone')})} className="input-field" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-2">Celular</label>
                <input required placeholder="Celular" value={formData.telefoneCelular} onChange={e => setFormData({...formData, telefoneCelular: applyMask(e.target.value, 'phone')})} className="input-field" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-2">Total de Funcionários</label>
              <input required type="number" placeholder="Total de Funcionários" value={formData.totalEmployees || ''} onChange={e => setFormData({...formData, totalEmployees: parseInt(e.target.value) || 0})} className="input-field" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-2">Senha</label>
                <input required type="password" placeholder="Senha" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="input-field" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-2">Confirmar</label>
                <input required type="password" placeholder="Confirmar" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} className="input-field" />
              </div>
            </div>
            <div className="space-y-1 pt-2 border-t border-gray-100">
              <label className="text-[9px] font-black text-indigo-600 uppercase tracking-widest px-2">Pergunta de Segurança (Recuperação)</label>
              <select className="input-field" value={formData.securityQuestion} onChange={e => setFormData({...formData, securityQuestion: e.target.value})}>
                {SECURITY_QUESTIONS.map(q => <option key={q} value={q}>{q}</option>)}
              </select>
              <input required placeholder="Sua Resposta" value={formData.securityAnswer} onChange={e => setFormData({...formData, securityAnswer: e.target.value})} className="input-field" />
            </div>
            <button type="submit" className="btn-premium bg-emerald-600 text-white w-full py-5 shadow-xl mt-4">
               {view === 'edit' ? 'Salvar Alterações' : 'Concluir Registro'}
            </button>
            <button type="button" onClick={() => setView(view === 'edit' ? 'dashboard' : 'login')} className="w-full text-[10px] font-black uppercase text-gray-400 py-2">Cancelar</button>
          </form>
        </div>
      )}

      {view === 'recovery_cnpj' && (
        <div className="bg-white p-10 rounded-[40px] shadow-2xl border border-gray-100 text-center animate-fade-in">
          <h2 className="text-xl font-black uppercase text-[#004481] mb-6">Recuperar Senha</h2>
          <div className="space-y-4">
            <input value={recoveryCNPJ} onChange={e => setRecoveryCNPJ(applyMask(e.target.value, 'cnpj'))} placeholder="00.000.000/0000-00" className="input-field text-center font-black tracking-widest" />
            <button onClick={() => {
              const cleanCNPJ = recoveryCNPJ.replace(/\D/g, '');
              const found = allCompanies.find(c => c.cnpj.replace(/\D/g, '') === cleanCNPJ);
              if (!found) return alert("Empresa não encontrada.");
              setRecoveryCompany(found);
              setView('recovery_question');
            }} className="btn-premium bg-[#004481] text-white w-full py-5 shadow-xl">Continuar</button>
            <button onClick={() => setView('login')} className="w-full text-[10px] font-black uppercase text-gray-400 py-2">Voltar</button>
          </div>
        </div>
      )}

      {view === 'recovery_question' && recoveryCompany && (
        <div className="bg-white p-10 rounded-[40px] shadow-2xl border border-gray-100 text-center animate-fade-in">
          <h2 className="text-xl font-black uppercase text-[#004481] mb-4">Verificação</h2>
          <p className="text-sm font-bold text-gray-800 mb-6">{recoveryCompany.securityQuestion}</p>
          <div className="space-y-4">
            <input value={recoveryAnswer} onChange={e => setRecoveryAnswer(e.target.value)} placeholder="SUA RESPOSTA" className="input-field text-center font-black" />
            <button onClick={() => {
               if (recoveryAnswer.toLowerCase().trim() === recoveryCompany.securityAnswer.toLowerCase().trim()) setView('recovery_reset');
               else alert("Incorreto.");
            }} className="btn-premium bg-[#004481] text-white w-full py-5 shadow-xl">Verificar</button>
          </div>
        </div>
      )}

      {view === 'recovery_reset' && (
        <div className="bg-white p-10 rounded-[40px] shadow-2xl border border-gray-100 text-center animate-fade-in">
          <h2 className="text-xl font-black uppercase text-[#004481] mb-8">Nova Senha</h2>
          <div className="space-y-4">
            <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="NOVA SENHA" className="input-field text-center font-black" />
            <input type="password" value={confirmNewPass} onChange={e => setConfirmNewPass(e.target.value)} placeholder="CONFIRMAR" className="input-field text-center font-black" />
            <button onClick={() => {
              if (newPass !== confirmNewPass) return alert("Senhas diferentes.");
              onResetPassword(recoveryCompany!.id, newPass);
              alert("Senha alterada com sucesso! Acessando painel...");
              // O login automático é tratado no App.tsx
            }} className="btn-premium bg-emerald-500 text-white w-full py-5 shadow-xl">Salvar e Acessar Painel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
