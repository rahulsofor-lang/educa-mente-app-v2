import React, { useState, useMemo } from 'react';
import { SurveyResponse, Company, ProbabilityAssessments, RiskLevel } from '../types';
import { THEME_NAMES, QUESTIONS } from '../constants';
import { getCorrectedScore, calculateMatrixRisk } from '../services/calculations';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  allCompanies: Company[];
  responses: SurveyResponse[];
  probabilityAssessments: ProbabilityAssessments;
  role: 'hr' | 'psychologist';
  currentCompanyId: string | null;
}

const Dashboard: React.FC<DashboardProps> = ({ allCompanies, responses, probabilityAssessments, role, currentCompanyId }) => {
  const selectedCompany = allCompanies.find(c => c.id === currentCompanyId);

  const stats = useMemo(() => {
    if (!selectedCompany) return null;
    const filteredRes = responses.filter(r => r.companyId === selectedCompany.id);
    const themes = [];

    for (let i = 0; i < 9; i++) {
      const blockQuestions = QUESTIONS.slice(i * 10, (i + 1) * 10);
      let sum = 0, count = 0;

      blockQuestions.forEach(q => {
        filteredRes.forEach(r => {
          if (r.answers[q.id] !== undefined) {
            sum += getCorrectedScore(r.answers[q.id], q.isInverted);
            count++;
          }
        });
      });

      const avgGrav = count > 0 ? sum / count : 1;
      // Probabilidade média entre os setores avaliados pelo RT
      const companyProbs = probabilityAssessments[selectedCompany.id] || {};
      const probValues = Object.values(companyProbs).map(p => p[i] || 2);
      const avgProb = probValues.length > 0 ? probValues.reduce((a, b) => a + b, 0) / probValues.length : 2;

      themes.push({
        label: THEME_NAMES[i],
        avgGravity: avgGrav,
        probValue: avgProb,
        risk: calculateMatrixRisk(avgGrav, avgProb)
      });
    }

    return themes;
  }, [selectedCompany, responses, probabilityAssessments]);

  if (!selectedCompany) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-[32px] border shadow-sm">
          <span className="text-[9px] font-black uppercase text-gray-400">Total de Respostas</span>
          <div className="text-2xl font-black text-[#004481]">{responses.filter(r => r.companyId === selectedCompany.id).length}</div>
        </div>
        <div className="bg-white p-6 rounded-[32px] border shadow-sm col-span-2">
          <span className="text-[9px] font-black uppercase text-gray-400">Status da Unidade</span>
          <div className="text-2xl font-black text-emerald-500">{selectedCompany.status.toUpperCase()}</div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[40px] border shadow-sm h-[400px]">
        <h3 className="text-sm font-black text-gray-800 uppercase mb-6">Matriz de Risco Ocupacional (Média)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={stats || []}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="label" axisLine={false} tick={{fontSize: 8, fontWeight: 800}} interval={0} height={60} />
            <YAxis domain={[0, 3]} axisLine={false} />
            <Tooltip />
            <Bar dataKey="avgGravity" radius={[10, 10, 0, 0]} barSize={30}>
              {stats?.map((entry, index) => {
                const score = entry.avgGravity * entry.probValue;
                const color = score > 8.5 ? '#ef4444' : score > 5.5 ? '#f97316' : score > 2.5 ? '#f59e0b' : '#10b981';
                return <Cell key={`cell-${index}`} fill={color} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;