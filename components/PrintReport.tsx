import React from 'react';
import { Company, PsychologistProfile, RiskLevel } from '../types';
import { THEME_NAMES } from '../constants';

interface PrintReportProps {
  company: Company;
  sectorName: string;
  profile: PsychologistProfile | null;
  themes: any[];
  fontesGeradoras: { [key: number]: string };
  agravosPorTema: { [key: number]: string };
  medidasPorTema: { [key: number]: string };
}

const PrintReport: React.FC<PrintReportProps> = ({ 
  company, 
  sectorName, 
  profile, 
  themes,
  fontesGeradoras,
  agravosPorTema,
  medidasPorTema
}) => {
  const getRiskColor = (risk: RiskLevel) => {
    switch (risk) {
      case RiskLevel.BAIXO: return '#10b981';
      case RiskLevel.MEDIO: return '#f59e0b';
      case RiskLevel.ALTO: return '#f97316';
      case RiskLevel.CRITICO: return '#ef4444';
      default: return '#000';
    }
  };

  return (
    <>
      <style>{`
        #printable-report {
          display: none;
        }
        @media print {
          body * {
            visibility: hidden;
            overflow: visible !important;
          }
          #root, #root * {
            visibility: hidden;
          }
          #printable-report, #printable-report * {
            visibility: visible;
          }
          #printable-report {
            display: block !important;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white;
            padding: 0;
            margin: 0;
          }
          @page {
            size: portrait;
            margin: 15mm;
          }
          .avoid-break {
            break-inside: avoid;
            page-break-inside: avoid;
            margin-bottom: 10px;
          }
        }
      `}</style>

      <div id="printable-report" className="p-0 bg-white text-black font-serif">
        {/* CABEÇALHO */}
        <div className="flex justify-between items-end border-b-2 border-black pb-4 mb-8">
          <div className="flex items-center gap-4">
            <img src="https://i.postimg.cc/VJgvNxTK/295fefff.png" alt="Logo" className="h-16 w-auto" />
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tighter leading-none">Educa Mente</h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Saúde Mental e Gestão de Riscos NR-01</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-black uppercase">Inventário de Riscos</h2>
            <p className="text-[10px] font-bold">DATA: {new Date().toLocaleDateString('pt-BR')}</p>
          </div>
        </div>

        {/* IDENTIFICAÇÃO */}
        <div className="grid grid-cols-2 gap-8 mb-8 border border-gray-200 p-4 rounded-lg">
          <section>
            <h3 className="text-[11px] font-black uppercase mb-3 text-indigo-900 border-b border-indigo-100 pb-1">Unidade Avaliada</h3>
            <div className="space-y-1.5 text-[10px]">
              <p><strong>Empresa:</strong> {company.razaoSocial}</p>
              <p><strong>CNPJ:</strong> {company.cnpj}</p>
              <p><strong>Setor/GHE:</strong> {sectorName}</p>
              <p><strong>Local:</strong> {company.cidade}/{company.uf}</p>
            </div>
          </section>
          <section>
            <h3 className="text-[11px] font-black uppercase mb-3 text-indigo-900 border-b border-indigo-100 pb-1">Responsável Técnico</h3>
            <div className="space-y-1.5 text-[10px]">
              <p><strong>Nome:</strong> {profile?.nomeCompleto || '---'}</p>
              <p><strong>CRP:</strong> {profile?.crp || '---'}</p>
              <p><strong>Email:</strong> {profile?.email || '---'}</p>
              <p><strong>Contato:</strong> {profile?.telefone || '---'}</p>
            </div>
          </section>
        </div>

        {/* METODOLOGIA BREVE */}
        <div className="mb-8 p-3 bg-gray-50 rounded border border-gray-200">
           <p className="text-[9px] text-justify leading-relaxed italic text-gray-600">
             Metodologia: Este laudo foi elaborado com base na NR-01. A gravidade foi extraída da média ponderada das respostas dos colaboradores (1 a 3) e a probabilidade foi definida pelo Responsável Técnico (1 a 4). O risco é o produto de Gravidade x Probabilidade.
           </p>
        </div>

        {/* INVENTÁRIO */}
        <div className="space-y-6">
          {themes.map((t, idx) => (
            <div key={idx} className="border border-gray-400 avoid-break rounded overflow-hidden">
              <div className="bg-gray-100 px-3 py-2 border-b border-gray-400 flex justify-between items-center">
                <span className="text-[10px] font-black uppercase">Fator de Risco {idx + 1}: {t.label}</span>
                <div className="flex gap-4 items-center">
                  <span className="text-[9px] font-bold">G: {t.avgGravity.toFixed(1)}</span>
                  <span className="text-[9px] font-bold">P: {t.probValue}</span>
                  <span className="text-[10px] font-black uppercase border-l border-gray-400 pl-4" style={{ color: getRiskColor(t.risk) }}>
                    Risco: {t.risk}
                  </span>
                </div>
              </div>
              <div className="p-3 space-y-3 text-[10px]">
                <div>
                  <p className="font-bold uppercase text-[8px] text-gray-400 mb-0.5">Fonte Geradora</p>
                  <p className="text-gray-800">{fontesGeradoras[idx] || 'Exposição rotineira ao ambiente de trabalho.'}</p>
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="font-bold uppercase text-[8px] text-gray-400 mb-0.5">Agravos Potenciais</p>
                    <p className="text-gray-800">{agravosPorTema[idx] || 'Ansiedade, fadiga, estresse ocupacional.'}</p>
                  </div>
                  <div>
                    <p className="font-bold uppercase text-[8px] text-gray-400 mb-0.5">Medidas Propostas</p>
                    <p className="text-gray-800">{medidasPorTema[idx] || 'Monitoramento preventivo e manutenção de clima saudável.'}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ASSINATURA */}
        <div className="mt-20 flex flex-col items-center">
          <div className="w-80 border-t border-black mb-1"></div>
          <p className="text-[11px] font-black uppercase">{profile?.nomeCompleto || 'ASSINATURA DO RT'}</p>
          <p className="text-[9px] font-bold text-gray-500">Responsável Técnico • CRP {profile?.crp || '---'}</p>
        </div>
      </div>
    </>
  );
};

export default PrintReport;