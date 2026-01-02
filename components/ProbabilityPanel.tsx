// src/components/ProbabilityPanel.tsx
import React, { useState, useEffect } from 'react';
import { SurveyResponse, Company } from '../types';
import { OPTIONS } from '../constants';

interface ProbabilityPanelProps {
  /** empresa/​setor já selecionado no DiagnosticPanel */
  companyId: string;
  sectorId: string;
  /** respostas já gravadas (para sugerir) */
  previousResponses: SurveyResponse[];
  /** callback para salvar a pontuação (1‑3) */
  onSave: (topicIdx: number, score: number) => void;
}

/**
 * Painel que exibe a mensagem de boas‑vindas e, abaixo,
 * a lista de tópicos (temas) com botões de pontuação.
 * Em telas pequenas os botões ficam em duas colunas,
 * em telas maiores ocupam a largura total.
 */
const ProbabilityPanel: React.FC<ProbabilityPanelProps> = ({
  companyId,
  sectorId,
  previousResponses,
  onSave,
}) => {
  const [selectedTopic, setSelectedTopic] = useState<number | null>(null);
  const [suggestedScore, setSuggestedScore] = useState<number | null>(null);

  // Quando o usuário troca de tema, tenta puxar a última pontuação já salva
  useEffect(() => {
    if (selectedTopic === null) return;

    const last = previousResponses
      .filter(r => r.companyId === companyId && r.sectorId === sectorId)
      .reverse()
      .find(r => r.answers[selectedTopic] !== undefined);

    setSuggestedScore(last?.answers[selectedTopic] ?? null);
  }, [selectedTopic, companyId, sectorId, previousResponses]);

  const topics = [
    'Condições de Trabalho',
    'Carga Mental',
    'Relações Interpessoais',
    'Organização do Trabalho',
    // ... adicione quantos tópicos precisar (máx. 10 por tema)
  ];

  const handleScore = (score: number) => {
    if (selectedTopic !== null) {
      onSave(selectedTopic, score);
      setSuggestedScore(score); // já salva a sugestão para a próxima vez
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 sm:p-8 bg-white rounded-3xl border border-gray-100 shadow-sm text-center animate-fade-in">
      {/* Cabeçalho */}
      <div className="bg-indigo-50 w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-[#004481]">
        <svg className="w-10 h-10 sm:w-12 sm:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      <h3 className="text-xl sm:text-2xl font-black text-gray-900 uppercase tracking-tight mb-2">
        Avaliação Técnica Integrada
      </h3>

      <p className="text-xs sm:text-sm text-gray-400 font-bold uppercase tracking-widest leading-relaxed max-w-xs mx-auto">
        A avaliação de probabilidade agora é feita diretamente na Matriz de Risco do Laudo NR‑01 para maior precisão técnica.
      </p>

      {/* Lista de tópicos */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {topics.map((t, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedTopic(idx)}
            className={`
              p-4 rounded-xl border
              ${selectedTopic === idx ? 'border-[#004481] bg-[#004481]/5' : 'border-gray-200'}
              hover:border-[#004481] transition-colors
            `}
          >
            <span className="block text-[10px] font-black text-gray-600 uppercase">{t}</span>
          </button>
        ))}
      </div>

      {/* Área de pontuação – aparece só quando um tópico foi escolhido */}
      {selectedTopic !== null && (
        <div className="mt-6">
          <p className="text-[10px] font-black text-gray-500 uppercase mb-2">
            Pontue o tópico <span className="text-[#004481]">{topics[selectedTopic]}</span>
          </p>

          {/* Sugestão de pontuação já salva */}
          {suggestedScore !== null && (
            <p className="text-[9px] text-gray-500 mb-2">
              Última pontuação registrada: <span className="font-black">{suggestedScore}</span>
            </p>
          )}

          <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
            {[1, 2, 3].map(v => (
              <button
                key={v}
                onClick={() => handleScore(v)}
                className={`
                  py-2 rounded-xl text-sm font-black
                  ${suggestedScore === v ? 'bg-[#004481] text-white' : 'bg-white text-gray-400 border border-gray-100'}
                  hover:bg-[#004481] hover:text-white transition-all
                `}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProbabilityPanel;