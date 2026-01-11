import React, { useState, useEffect, useMemo } from 'react';
import Layout from './components/Layout';
import Survey from './components/Survey';
import AdminPanel from './components/AdminPanel';
import DiagnosticPanel from './components/DiagnosticPanel';
import PsychologistSecurityHandler from './components/PsychologistSecurity';
import PsychologistProfileEditor from './components/PsychologistProfile';
import Logo from './components/Logo';
import { Company, SurveyResponse, CompanyStatus, PsychologistProfile, ProbabilityAssessments, DiagnosticReportsState } from './types';
import * as db from './services/firebaseService';

const App: React.FC = () => {
  const [role, setRole] = useState<'employee' | 'hr' | 'psychologist' | null>(null);
  const [activeCompanyId, setActiveCompanyId] = useState<string | null>(null);
  const [adminInitialView, setAdminInitialView] = useState<'login' | 'register'>('login');
  const [isKioskMode, setIsKioskMode] = useState<boolean>(() => localStorage.getItem('kiosk_active') === 'true');
  const [isPsychologistAuthenticated, setIsPsychologistAuthenticated] = useState(false);
  const [psychologistTab, setPsychologistTab] = useState<'diagnostic' | 'profile'>('diagnostic');
  const [isLoading, setIsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);

  const [companies, setCompanies] = useState<Company[]>([]);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [psychologistProfile, setPsychologistProfile] = useState<PsychologistProfile | null>(null);
  const [probAssessments, setProbAssessments] = useState<ProbabilityAssessments>({});
  const [diagReports, setDiagReports] = useState<DiagnosticReportsState>({});

  const loadAllData = async () => {
    setIsLoading(true);
    setConnectionError(false);

    const timeout = setTimeout(() => {
      if (isLoading) setConnectionError(true);
    }, 12000);

    try {
      const unsubCompanies = db.subscribeCompanies(setCompanies);
      const unsubResponses = db.subscribeResponses(setResponses as any);

      const profile = await db.fetchPsychologistProfile();
      const techData = await db.fetchAllTechnicalData();

      setPsychologistProfile(profile as any);
      setDiagReports(techData.reports);
      setProbAssessments(techData.probs);

      clearTimeout(timeout);
      setIsLoading(false);

      return () => {
        unsubCompanies();
        unsubResponses();
      };
    } catch (error) {
      console.error("Erro crítico na conexão Firebase:", error);
      setConnectionError(true);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const currentCompany = useMemo(() =>
    companies.find(c => c.id === activeCompanyId) || null,
    [companies, activeCompanyId]
  );

  // FUNÇÃO PARA VALIDAR TOKEN ANTES DE REGISTRAR EMPRESA
  const handleRegisterWithToken = () => {
    const token = prompt('Digite o token de cadastro fornecido no contrato:')?.toUpperCase().trim();

    if (!token) return; // Usuário cancelou

    // Validar token
    const validTokens = JSON.parse(localStorage.getItem('validTokens') || '[]');
    const foundToken = validTokens.find((t: any) => 
      t.token === token && 
      !t.used && 
      t.expiresAt > Date.now()
    );

    if (!foundToken) {
      alert('❌ Token inválido, expirado ou já utilizado.\n\nContate o responsável técnico para obter um novo token.');
      return;
    }

    // Token válido! Abrir formulário de cadastro
    alert('✅ Token válido! Prossiga com o cadastro da empresa.');
    setAdminInitialView('register');
    setRole('hr');

    // Guardar o token para marcar como usado após cadastro
    localStorage.setItem('currentToken', token);
  };

  const handleRegister = async (data: any) => {
    const accessCode = `#Emp-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const newCompany: Company = {
      ...data,
      id: Date.now().toString(),
      accessCode,
      status: CompanyStatus.ABERTO,
      sectors: []
    };

    await db.saveCompany(newCompany);

    // ✅ MARCAR TOKEN COMO USADO
    const currentToken = localStorage.getItem('currentToken');
    if (currentToken) {
      const validTokens = JSON.parse(localStorage.getItem('validTokens') || '[]');
      const updatedTokens = validTokens.map((t: any) => 
        t.token === currentToken 
          ? { ...t, used: true, usedAt: Date.now(), usedBy: newCompany.nomeFantasia }
          : t
      );
      localStorage.setItem('validTokens', JSON.stringify(updatedTokens));
      localStorage.removeItem('currentToken');
    }

    setActiveCompanyId(newCompany.id);
    setAdminInitialView('login');
    return accessCode;
  };

  const handleUpdateCompanyData = async (updatedData: Partial<Company>) => {
    if (!activeCompanyId) return;
    await db.updateCompanyData(activeCompanyId, updatedData);
  };

  const handleLogin = (code: string, pass?: string) => {
    const found = companies.find(c => c.accessCode.toUpperCase() === code.toUpperCase());
    if (found && (!pass || found.password === pass)) {
      setActiveCompanyId(found.id);
      return found;
    }
    return null;
  };

  const handleLogout = () => {
    setActiveCompanyId(null);
    setRole(null);
    setIsPsychologistAuthenticated(false);
  };

  const handleSaveDiag = async (companyId: string, sectorId: string, report: any) => {
    await db.saveDiagnosticReport(companyId, sectorId, report);
    setDiagReports(prev => ({
      ...prev,
      [companyId]: {
        ...(prev[companyId] || {}),
        [sectorId]: [{ ...report, isMain: true }]
      }
    }));
  };

  const handleSaveProbability = async (cid: string, sid: string, scores: any) => {
    await db.saveProbability(cid, sid, scores);
    setProbAssessments(prev => ({...prev, [cid]: {...(prev[cid] || {}), [sid]: scores}}));
  };

  const handleSaveProfile = async (profile: PsychologistProfile) => {
    await db.savePsychologistProfile(profile);
    setPsychologistProfile(profile);
  };

  if (connectionError) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <div className="bg-red-50 p-8 rounded-[40px] border border-red-100 max-w-sm">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-black text-gray-900 uppercase mb-2">Erro de Conexão</h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase leading-relaxed mb-6">
            Não foi possível sincronizar com o banco de dados. Verifique sua internet e as regras do Firebase.
          </p>
          <button onClick={() => window.location.reload()} className="btn-premium bg-[#004481] text-white w-full py-4">
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
        <Logo size="md" className="animate-pulse mb-6" />
        <p className="text-[10px] font-black text-[#004481] uppercase tracking-widest">Sincronizando Banco...</p>
      </div>
    );
  }

  return (
    <Layout role={role || 'employee'} onRoleChange={() => {}}>
      {!role ? (
        <div className="min-h-full flex flex-col items-center justify-center animate-fade-in py-10">
          <div className="mb-12 text-center flex flex-col items-center">
            <Logo size="lg" className="mb-8" />
            <h1 className="text-3xl font-black text-[#004481] uppercase tracking-tighter">Educa Mente</h1>
          </div>
          <div className="w-full max-w-xs space-y-4 px-4">
            <button onClick={() => setRole('employee')} className="btn-premium bg-[#004481] text-white w-full py-5 shadow-xl">
              Sou Colaborador
            </button>
            <button onClick={() => { setAdminInitialView('login'); setRole('hr'); }} className="btn-premium bg-white border-2 border-[#004481] text-[#004481] w-full py-5">
              Sou Gestor
            </button>
            <button onClick={() => setRole('psychologist')} className="btn-premium bg-indigo-900 text-white w-full py-5">
              Responsável Técnico
            </button>

            {/* BOTÃO REGISTRAR EMPRESA COM VALIDAÇÃO DE TOKEN */}
            <button onClick={handleRegisterWithToken} className="text-[10px] font-black text-[#004481] uppercase tracking-widest w-full text-center mt-4 hover:underline">
              Registrar Empresa
            </button>
          </div>
        </div>
      ) : role === 'employee' ? (
        <Survey 
          currentCompany={currentCompany} 
          onLogin={handleLogin} 
          onSubmit={async r => {
            try {
              await db.saveSurveyResponse(r);
            } catch (e) {
              console.error("Falha ao salvar resposta:", e);
            }
          }} 
          onBack={handleLogout} 
          onExitKiosk={() => { setIsKioskMode(false); handleLogout(); }} 
          isKioskMode={isKioskMode} 
          allResponses={responses} 
        />
      ) : role === 'hr' ? (
        <AdminPanel 
          company={currentCompany} 
          allCompanies={companies} 
          responses={responses} 
          onRegister={handleRegister} 
          onUpdateCompany={handleUpdateCompanyData} 
          onResetPassword={async (id, pass) => {
            await db.updateCompanyData(id, { password: pass });
            setActiveCompanyId(id);
          }} 
          onLogin={handleLogin} 
          onUpdateSectors={s => activeCompanyId && db.updateCompanyData(activeCompanyId, { sectors: s })} 
          onToggleKiosk={() => setIsKioskMode(!isKioskMode)} 
          isKioskMode={isKioskMode} 
          onLogout={handleLogout} 
          initialView={adminInitialView} 
        />
      ) : (
        !isPsychologistAuthenticated ? (
          <PsychologistSecurityHandler onLoginSuccess={() => setIsPsychologistAuthenticated(true)} onBack={handleLogout} />
        ) : (
          <div className="space-y-6">
            <div className="flex bg-white p-2 rounded-2xl shadow-sm border border-gray-100 mb-6 gap-2 print:hidden">
              <button 
                onClick={() => setPsychologistTab('diagnostic')} 
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  psychologistTab === 'diagnostic' ? 'bg-[#004481] text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'
                }`}
              >
                Diagnóstico NR-01
              </button>
              <button 
                onClick={() => setPsychologistTab('profile')} 
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  psychologistTab === 'profile' ? 'bg-[#004481] text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'
                }`}
              >
                Meu Perfil (RT)
              </button>
              <button onClick={handleLogout} className="px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50">
                Sair
              </button>
            </div>
            {psychologistTab === 'diagnostic' ? (
              <DiagnosticPanel
                companies={companies}
                responses={responses}
                probabilityAssessments={probAssessments}
                diagnosticReports={diagReports}
                psychologistProfile={psychologistProfile}
                onSave={handleSaveDiag}
                onSaveProbability={handleSaveProbability}
              />
            ) : (
              <PsychologistProfileEditor profile={psychologistProfile} onSave={handleSaveProfile} />
            )}
          </div>
        )
      )}
    </Layout>
  );
};

export default App;
