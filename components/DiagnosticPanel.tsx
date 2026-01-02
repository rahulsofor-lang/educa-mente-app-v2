import React, { useState, useMemo, useEffect } from 'react';
import { Company, SurveyResponse, ProbabilityAssessments, DiagnosticReportsState, RiskLevel, DiagnosticReport, PsychologistProfile } from '../types';
import { QUESTIONS, THEME_NAMES } from '../constants';
import { getCorrectedScore, calculateMatrixRisk } from '../services/calculations';
import PrintReport from './PrintReport';
import {
  BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer
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
  const [menuOpen, setMenuOpen] = useState(false);

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
        {/* HEADER - Responsivo */}
        <div className="flex-none bg-[#004481] p-4 sm:p-6 text-white">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-black uppercase">Análise Técnica NR-01</h2>
              <p className="text-[9px] font-bold opacity-60 uppercase">Cockpit do Responsável Técnico</p>
            </div>

            {/* Botão Hamburger (visível apenas em mobile/tablet) */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="sm:hidden flex items-center justify-center w-10 h-10 bg-white/20 rounded-lg hover:bg-white/30 transition-all"
              title="Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>

            {/* Controles (desktop) */}
            <div className="hidden sm:flex gap-2 flex-wrap">
              <select
                value={selectedCompanyId}
                onChange={e => {
                  setSelectedCompanyId(e.target.value);
                  setSelectedSectorId('all');
                }}
                className="bg-white/10 border border-white/20 p-2 rounded-xl text-[10px] font-bold uppercase text-white"
              >
                {companies.length === 0 && <option value="" className="text-black">Nenhuma Empresa</option>}
                {companies.map(c => (
                  <option key={c.id} value={c.id} className="text-black">{c.nomeFantasia}</option>
                ))}
              </select>
              <select
                value={selectedSectorId}
                onChange={e => setSelectedSectorId(e.target.value)}
                className="bg-white/10 border border-white/20 p-2 rounded-xl text-[10px] font-bold uppercase text-white"
              >
                <option value="all" className="text-black">Geral</option>
                {selectedCompany.sectors.map(s => (
                  <option key={s.id} value={s.id} className="text-black">{s.name}</option>
                ))}
              </select>
              <button
                onClick={handleSaveAll}
                className="bg-white text-[#004481] px-4 sm:px-5 py-2 rounded-xl text-[10px] font-black uppercase hover:scale-105 transition-all"
              >
                Salvar Nuvem
              </button>
              <button
                onClick={() => window.print()}
                className="bg-emerald-500 text-white px-4 sm:px-5 py-2 rounded-xl text-[10px] font-black uppercase shadow-lg hover:scale-105 transition-all"
              >
                Gerar PDF
              </button>
            </div>
          </div>

          {/* Menu Mobile (abre quando clica no hamburger) */}
          {menuOpen && (
            <div className="sm:hidden mt-4 space-y-3 pb-4 border-t border-white/20 pt-4">
              <select
                value={selectedCompanyId}
                onChange={e => {
                  setSelectedCompanyId(e.target.value);
                  setSelectedSectorId('all');
                  setMenuOpen(false);
                }}
                className="w-full bg-white/10 border border-white/20 p-2 rounded-xl text-[10px] font-bold uppercase text-white"
              >
                {companies.length === 0 && <option value="" className="text-black">Nenhuma Empresa</option>}
                {companies.map(c => (
                  <option key={c.id} value={c.id} className="text-black">{c.nomeFantasia}</option>
                ))}
              </select>
              <select
                value={selectedSectorId}
                onChange={e => setSelectedSectorId(e.target.value)}
                className="w-full bg-white/10 border border-white/20 p-2 rounded-xl text-[10px] font-bold uppercase text-white"
              >
                <option value="all" className="text-black">Geral</option>
                {selectedCompany.sectors.map(s => (
                  <option key={s.id} value={s.id} className="text-black">{s.name}</option>
                ))}
              </select>
              <button
                onClick={() => {
                  handleSaveAll();
                  setMenuOpen(false);
                }}
                className="w-full bg-white text-[#004481] px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:scale-105 transition-all"
              >
                Salvar Nuvem
              </button>
              <button
                onClick={() => {
                  window.print();
                  setMenuOpen(false);
                }}
                className="w-full bg-emerald-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-lg hover:scale-105 transition-all"
              >
                Gerar PDF
              </button>
            </div>
          )}
        </div>

        {/* CONTEÚDO PRINCIPAL - Responsivo */}
        <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">
          {/* Sidebar de Temas (desktop) / Abas (mobile) */}
          <div className="hidden lg:flex lg:w-64 bg-gray-50 border-r border-gray-100 overflow-y-auto p-4 space-y-2 custom-scrollbar flex-col">
            {diagnosticData?.map((theme, idx) => (
              <button
                key={idx}
                onClick={() => setActiveThemeIdx(idx)}
                className={`w-full p-3 rounded-xl text-left border transition-all ${
                  activeThemeIdx === idx
                    ? 'bg-white border-[#004481] shadow-sm'
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <span className="text-[8px] font-black text-gray-400 block uppercase">Tema {idx + 1}</span>
                <span className="text-[10px] font-bold text-gray-800 leading-tight">{theme.label}</span>
              </button>
            ))}
          </div>

          {/* Abas Horizontais (mobile/tablet) */}
          <div className="lg:hidden w-full bg-gray-50 border-b border-gray-100 overflow-x-auto p-2 flex gap-2 custom-scrollbar">
            {diagnosticData?.map((theme, idx) => (
              <button
                key={idx}
                onClick={() => setActiveThemeIdx(idx)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all whitespace-nowrap ${
                  activeThemeIdx === idx
                    ? 'bg-[#004481] text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200'
                }`}
              >
                {theme.label.substring(0, 12)}...
              </button>
            ))}
          </div>

          {/* Área de Edição */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-white custom-scrollbar">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 max-w-6xl">
              {/* Coluna Esquerda - Formulário */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">
                    {THEME_NAMES[activeThemeIdx]}
                  </h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                    Definição técnica do laudo
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Fonte Geradora */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-2">
                      Fonte Geradora
                    </label>
                    <input
                      value={fontesGeradoras[activeThemeIdx] || ''}
                      onChange={e =>
                        setFontesGeradoras({
                          ...fontesGeradoras,
                          [activeThemeIdx]: e.target.value
                        })
                      }
                      className="input-field w-full"
                      placeholder="Descreva a situação de risco..."
                    />
                  </div>

                  {/* Agravos Potenciais */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-2">
                      Agravos Potenciais
                    </label>
                    <textarea
                      value={customAgravos[activeThemeIdx] || ''}
                      onChange={e =>
                        setCustomAgravos({
                          ...customAgravos,
                          [activeThemeIdx]: e.target.value
                        })
                      }
                      className="input-field w-full h-20 resize-none"
                      placeholder="Descreva os possíveis agravos à saúde..."
                    />
                  </div>

                  {/* Medidas de Controle */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-2">
                      Medidas de Controle
                    </label>
                    <textarea
                      value={customMedidas[activeThemeIdx] || ''}
                      onChange={e =>
                        setCustomMedidas({
                          ...customMedidas,
                          [activeThemeIdx]: e.target.value
                        })
                      }
                      className="input-field w-full h-20 resize-none"
                      placeholder="Descreva as medidas de controle recomendadas..."
                    />
                  </div>
                </div>

                {/* Probabilidade */}
                <div className="bg-[#004481]/5 p-5 rounded-3xl border border-[#004481]/10">
                  <p className="text-[10px] font-black text-[#004481] uppercase tracking-widest mb-3">
                    Probabilidade (P)
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map(v => (
                      <button
                        key={v}
                        onClick={() =>
                          selectedSectorId !== 'all' &&
                          onSaveProbability(selectedCompanyId, selectedSectorId, {
                            ...(probabilityAssessments[selectedCompanyId]?.[selectedSectorId] || {}),
                            [activeThemeIdx]: v
                          })
                        }
                        className={`py-3 rounded-xl text-xs font-black transition-all ${
                          (probabilityAssessments[selectedCompanyId]?.[selectedSectorId]?.[activeThemeIdx] || 2) === v
                            ? 'bg-[#004481] text-white'
                            : 'bg-white text-gray-300 border border-gray-100 hover:border-[#004481]'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Coluna Direita - Gráfico */}
              <div className="flex flex-col items-center justify-center bg-gray-50 rounded-[40px] p-4 sm:p-8">
                <div className="w-full h-64 sm:h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={radarData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis type="number" domain={[0, 3]} tick={{ fontSize: 10 }} />
                      <YAxis type="category" dataKey="subject" tick={{ fontSize: 9 }} width={100} />
                      <Tooltip />
                      <Bar dataKey="A" fill="#004481" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-6 text-center">
                  <p className="text-[9px] font-black text-gray-400 uppercase">Risco NR-01</p>
                  <p
                    className="text-3xl font-black uppercase mt-2"
                    style={{ color: getRiskColor(diagnosticData![activeThemeIdx].risk) }}
                  >
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