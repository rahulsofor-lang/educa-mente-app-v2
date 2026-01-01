
import React from 'react';

const ControlMeasures: React.FC = () => {
  const actions = [
    { month: 'Janeiro', action: 'Workshop sobre Comunicação Não-Violenta', target: 'Lideranças' },
    { month: 'Fevereiro', action: 'Campanha de Conscientização: Assédio não é brincadeira', target: 'Todos' },
    { month: 'Março', action: 'Roda de Conversa: Saúde Mental das Mulheres no Trabalho', target: 'Feminino' },
    { month: 'Abril', action: 'Treinamento sobre Diversidade e Inclusão', target: 'Todos' },
    { month: 'Maio', action: 'Semana da Saúde Mental: Palestras e Dinâmicas', target: 'Todos' },
    { month: 'Junho', action: 'Auditoria Interna dos Canais de Denúncia', target: 'Compliance/RH' },
    { month: 'Julho', action: 'Treinamento de Primeiros Socorros Psicológicos', target: 'RH/Gestores' },
    { month: 'Agosto', action: 'Pesquisa de Clima Intermediária', target: 'Todos' },
    { month: 'Setembro', action: 'Setembro Amarelo: Prevenção ao Suicídio e Burnout', target: 'Todos' },
    { month: 'Outubro', action: 'Dinâmica de Grupo: Fortalecimento de Vínculos', target: 'Setores Críticos' },
    { month: 'Novembro', action: 'Avaliação de Impacto das Medidas NR-01', target: 'Psicólogo/RH' },
    { month: 'Dezembro', action: 'Planejamento de Ações para o Próximo Ciclo', target: 'Comitê' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-indigo-600 p-8 text-white">
        <h2 className="text-2xl font-bold mb-2">Plano de Ação e Medidas de Controle</h2>
        <p className="opacity-80">Calendário proposto para promoção de saúde mental e prevenção de riscos psicossociais.</p>
      </div>
      <div className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-x divide-y divide-gray-100">
          {actions.map((item, idx) => (
            <div key={idx} className="p-6 hover:bg-gray-50 transition-colors">
              <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">{item.month}</span>
              <h4 className="font-bold text-gray-800 mt-2 mb-1">{item.action}</h4>
              <p className="text-sm text-gray-500">Público-alvo: <span className="text-gray-700 font-medium">{item.target}</span></p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ControlMeasures;
