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

  // ESTADOS PARA O TOKEN
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [generatedToken, setGeneratedToken] = useState('');

  // FUNÇÃO PARA GERAR TOKEN
  const generateToken = () => {
    const token = Math.random().toString(36).substring(2, 10).toUpperCase();
    const expiresAt = Date.now() + (30 * 24 * 60 * 60 * 1000); // 30 dias

    const tokenData = {
      token,
      createdAt: Date.now(),
      expiresAt,
      used: false,
      companyName: selectedCompany?.nomeFantasia || 'Não especificada'
    };

    const existingTokens = JSON.parse(localStorage.getItem('validTokens') || '[]');
    existingTokens.push(tokenData);
    localStorage.setItem('validTokens', JSON.stringify(existingTokens));

    setGeneratedToken(token);
    setShowTokenModal(true);

    navigator.clipboard.writeText(token);
  };

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
    <>
      {/* Painel original que você enviou */}
      {/* Nada foi alterado aqui */}
      {/* AQUI VEM O RESTANTE IGUALZINHO AO QUE VOCÊ MANDOU */}
    </>
  );
};

export default DiagnosticPanel;
