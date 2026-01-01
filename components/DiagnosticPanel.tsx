
import React, { useState, useMemo, useEffect } from 'react';
import { Company, SurveyResponse, ProbabilityAssessments, DiagnosticReportsState, RiskLevel, DiagnosticReport, PsychologistProfile } from '../types';
import { QUESTIONS, THEME_NAMES } from '../constants';
import { getCorrectedScore, calculateMatrixRisk } from '../services/calculations';
import PrintReport from './PrintReport';
import { 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  Radar as RadarComponent
} from 'recharts';

interface DiagnosticPanelProps {
  companies: Company[];
  responses: SurveyResponse[];
  probabilityAssessments: ProbabilityAssessments;
  diagnosticReports: DiagnosticReportsState;
  psychologistProfile: PsychologistProfile | null;
  onSave: (companyId: string, sectorId: string, report: DiagnosticReport) => void;
  onSaveProbability: (companyId: string, sectorId: string, scores: { [topicIdx: number]: number }) => void;
}

const DiagnosticPanel: React.FC<DiagnosticPanelProps> = ({ 
  companies, responses, probabilityAssessments, diagnosticReports, psychologistProfile, onSave, onSaveProbability 
}) => {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(companies[0]?.id || '');
  const [selectedSectorId, setSelectedSectorId] = useState<string>('all');
  const [activeThemeIdx, setActiveThemeIdx] = useState<number>(0);
  useEffect(() => {
            if (companies.length > 0 && !selectedCompanyId) {
              setSelectedCompanyId(companies[0].id);
            } else if (companies.length > 0 && !companies.some(c => c.id === selectedCompanyId)) {
              setSelectedCompanyId(companies[0].id);
            } else if (companies.length === 0) {
              setSelectedCompanyId('');
            }
          }, [companies, selectedCompanyId]);
  
  const [fontesGeradoras, setFontesGeradoras] = useState<{ [topicIdx: number]: string }>({});
  const [customAgravos, setCustomAgravos] = useState<{ [topicIdx: number]: string }>({});
  const [customMedidas, setCustomMedidas] = useState<{ [topicIdx: number]: string }>({});

  const selectedCompany = companies.find(c => c.id === selectedCompanyId);
  
  // Sincroniza dados locais com o que vem do banco de dados
  useEffect(() => {
    if (selectedCompanyId && selectedSectorId) {
      const history = diagnosticReports[selectedCompanyId]?.[selectedSectorId] || [];
      const main = history.find(h => h.isMain) || history[history.length - 1];
      if (main) {
        setFontesGeradoras(main.fontesGeradoras || {});
      }
    }
  }, [selectedCompanyId, selectedSectorId, diagnosticReports]);

  const diagnosticData = useMemo(() => {
    if (!selectedCompany) return null;
    const filteredResponses = responses.filter(r => 
      r.companyId === selectedCompanyId && 
      (selectedSectorId === 'all' || r.sectorId === selectedSectorId)
    );

    return THEME_NAMES.map((label, themeIdx) => {
      const start = themeIdx * 10;
      const blockQuestions = QUESTIONS.slice(start, start + 10);
      let blockSum = 0, blockCount = 0;

      blockQuestions.forEach(q => {
        filteredResponses.forEach(r => {
          if (r.answers[q.id] !== undefined) {
            blockSum += getCorrectedScore(r.answers[q.id], q.isInverted);
            blockCount++;
          }
        });
      });

      const avgGravity = blockCount > 0 ? blockSum / blockCount : 1.0;
      const probValue = selectedSectorId !== 'all' 
        ? (probabilityAssessments[selectedCompanyId]?.[selectedSectorId]?.[themeIdx] || 2)
        : 2;

      return {
        themeIdx, label, avgGravity, probValue,
        risk: calculateMatrixRisk(avgGravity, probValue)
      };
    });
  }, [selectedCompanyId, selectedSectorId, responses, probabilityAssessments]);

  const radarData = useMemo(() => diagnosticData?.map(d => ({
    subject: d.label, A: d.avgGravity, fullMark: 3
  })), [diagnosticData]);

  const getRiskColor = (risk: RiskLevel) => {
    switch (risk) {
      case RiskLevel.BAIXO: return '#10b981';
      case RiskLevel.MEDIO: return '#f59e0b';
      case RiskLevel.ALTO: return '#f97316';
      case RiskLevel.CRITICO: return '#ef4444';
      default: return '#94a3b8';
    }
  };

  const handleSaveAll = () => {
    if (selectedSectorId === 'all') return alert("Selecione um setor específico para salvar o laudo.");
    const report: DiagnosticReport = {
      timestamp: new Date().toISOString(),
      author: psychologistProfile?.nomeCompleto || "RT",
      agravosSaude: Object.values(customAgravos).join('; '),
      medidasControle: Object.values(customMedidas).join('; '),
      fontesGeradoras: { ...fontesGeradoras },
      isMain: true
    };
    onSave(selectedCompanyId, selectedSectorId, report);
    alert("Relatório salvo na nuvem com sucesso!");
  };

  if (!selectedCompany) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-100">
      <PrintReport 
        company={selectedCompany}
        sectorName={selectedSectorId === 'all' ? 'VISÃO GERAL' : selectedCompany.sectors.find(s => s.id === selectedSectorId)?.name || ''}
        profile={psychologistProfile}
        themes={diagnosticData || []}
        fontesGeradoras={fontesGeradoras}
        agravosPorTema={customAgravos}
        medidasPorTema={customMedidas}
      />
      
      <div className="flex flex-col h-full print:hidden">
        <div className="flex-none bg-[#004481] p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-lg font-black uppercase">Análise Técnica NR-01</h2>
            <p className="text-[9px] font-bold opacity-60 uppercase">Cockpit do Responsável Técnico</p>
          </div>
          <div className="flex gap-3">
<select
              value={selectedCompanyId}
              onChange={e => {
                setSelectedCompanyId(e.target.value); // Atualiza a empresa selecionada
                setSelectedSectorId('all'); // Reseta o setor para 'Geral' ao mudar de empresa
              }}
              className="bg-white/10 border border-white/20 p-2 rounded-xl text-[10px] font-bold uppercase"
            >
              {/* Se não houver empresas, mostra uma opção "Nenhuma Empresa" */}
              {companies.length === 0 && <option value="" className="text-black">Nenhuma Empresa</option>}
              {/* Mapeia todas as empresas para criar as opções do seletor */}
              {companies.map(c => (
                <option key={c.id} value={c.id} className="text-black">{c.nomeFantasia}</option>
              ))}
            </select>
            <select value={selectedSectorId} onChange={e => setSelectedSectorId(e.target.value)} className="bg-white/10 border border-white/20 p-2 rounded-xl text-[10px] font-bold uppercase">
              <option value="all" className="text-black">Geral</option>
              {selectedCompany.sectors.map(s => <option key={s.id} value={s.id} className="text-black">{s.name}</option>)}
            </select>
            <button onClick={handleSaveAll} className="bg-white text-[#004481] px-5 py-2 rounded-xl text-[10px] font-black uppercase">Salvar Nuvem</button>
            <button onClick={() => window.print()} className="bg-emerald-500 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase shadow-lg">Gerar PDF</button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar de Temas */}
          <div className="w-64 bg-gray-50 border-r border-gray-100 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {diagnosticData?.map((theme, idx) => (
              <button key={idx} onClick={() => setActiveThemeIdx(idx)} className={`w-full p-3 rounded-xl text-left border transition-all ${activeThemeIdx === idx ? 'bg-white border-[#004481] shadow-sm' : 'border-transparent opacity-60'}`}>
                <span className="text-[8px] font-black text-gray-400 block uppercase">Tema {idx + 1}</span>
                <span className="text-[10px] font-bold text-gray-800 leading-tight">{theme.label}</span>
              </button>
            ))}
          </div>

          {/* Área de Edição */}
          <div className="flex-1 overflow-y-auto p-8 bg-white custom-scrollbar">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-black text-gray-900 leading-tight">{THEME_NAMES[activeThemeIdx]}</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Definição técnica do laudo</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-2">Fonte Geradora</label>
                    <input 
                      value={fontesGeradoras[activeThemeIdx] || ''} 
                      onChange={e => setFontesGeradoras({...fontesGeradoras, [activeThemeIdx]: e.target.value})} 
                      className="input-field" 
                      placeholder="Descreva a situação de risco..." 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-2">Agravos Potenciais</label>
                    <textarea 
                      value={customAgravos[activeThemeIdx] || ''} 
                      onChange={e => setCustomAgravos({...customAgravos, [activeThemeIdx]: e.target.value})} 
                      className="input-field h-20" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-2">Medidas de Controle</label>
                    <textarea 
                      value={customMedidas[activeThemeIdx] || ''} 
                      onChange={e => setCustomMedidas({...customMedidas, [activeThemeIdx]: e.target.value})} 
                      className="input-field h-20" 
                    />
                  </div>
                </div>

                <div className="bg-[#004481]/5 p-5 rounded-3xl border border-[#004481]/10">
                  <p className="text-[10px] font-black text-[#004481] uppercase tracking-widest mb-3">Probabilidade (P)</p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map(v => (
                      <button 
                        key={v} 
                        onClick={() => selectedSectorId !== 'all' && onSaveProbability(selectedCompanyId, selectedSectorId, { ...(probabilityAssessments[selectedCompanyId]?.[selectedSectorId] || {}), [activeThemeIdx]: v })}
                        className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${ (probabilityAssessments[selectedCompanyId]?.[selectedSectorId]?.[activeThemeIdx] || 2) === v ? 'bg-[#004481] text-white' : 'bg-white text-gray-300 border border-gray-100' }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center bg-gray-50 rounded-[40px] p-8">
                <div className="w-full h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" tick={{fontSize: 8}} />
                      <RadarComponent dataKey="A" stroke="#004481" fill="#004481" fillOpacity={0.1} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-6 text-center">
                   <p className="text-[9px] font-black text-gray-400 uppercase">Risco NR-01</p>
                   <p className="text-3xl font-black uppercase" style={{ color: getRiskColor(diagnosticData![activeThemeIdx].risk) }}>
                     {diagnosticData![activeThemeIdx].risk}
                   </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticPanel;
