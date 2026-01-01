
// Constants and helper functions for the application

export const THEME_NAMES = [
  "Assédio e Violência",
  "Carga de Trabalho",
  "Reconhecimento e Carreira",
  "Clima Organizacional",
  "Autonomia e Controle",
  "Metas e Pressão",
  "Insegurança no Trabalho",
  "Comunicação e Conflitos",
  "Equilíbrio Vida Pessoal"
];

export const OPTIONS = [
  { value: 0, label: 'Nunca' },
  { value: 1, label: 'Raramente' },
  { value: 2, label: 'Às vezes' },
  { value: 3, label: 'Frequentemente' },
  { value: 4, label: 'Sempre' },
];

export const getScoreText = (score: number) => {
  if (score <= 1.5) return 'Baixo';
  if (score <= 2.5) return 'Médio';
  if (score <= 3.5) return 'Alto';
  return 'Crítico';
};

export const QUESTIONS = [
  // TEMA 1: Assédio e Violência (1-10)
  { id: 1, text: "Você já presenciou ou sofreu comentários ofensivos, piadas ou insinuações inadequadas no ambiente de trabalho?", isInverted: false },
  { id: 2, text: "Você se sente à vontade para relatar situações de assédio moral ou sexual na empresa sem medo de represálias?", isInverted: true },
  { id: 3, text: "Existe um canal seguro e sigiloso para denunciar assédio na empresa?", isInverted: true },
  { id: 4, text: "Você já recebeu tratamento desrespeitoso ou humilhante de colegas ou superiores?", isInverted: false },
  { id: 5, text: "Você sente que há favoritismo ou perseguição por parte da liderança?", isInverted: false },
  { id: 6, text: "Há casos conhecidos de assédio moral ou sexual que não foram devidamente investigados ou punidos?", isInverted: false },
  { id: 7, text: "A empresa realiza treinamentos ou campanhas de conscientização sobre assédio?", isInverted: true },
  { id: 8, text: "O RH e os gestores demonstram comprometimento real com a prevenção do assédio?", isInverted: true },
  { id: 9, text: "Você já foi forçado(a) a realizar tarefas humilhantes ou degradantes?", isInverted: false },
  { id: 10, text: "Existe uma cultura de 'brincadeiras' que desrespeitam funcionários? Já foi vítima de alguma delas?", isInverted: false },

  // TEMA 2: Carga de Trabalho (11-20)
  { id: 11, text: "Você sente que sua carga de trabalho diária é superior à sua capacidade de execução dentro do horário normal?", isInverted: false },
  { id: 12, text: "Você frequentemente precisa fazer horas extras ou levar trabalho para casa?", isInverted: false },
  { id: 13, text: "As demandas e prazos estabelecidos são realistas e atingíveis?", isInverted: true },
  { id: 14, text: "Você sente que a empresa respeita seus limites físicos e mentais?", isInverted: true },
  { id: 15, text: "Você recebe pausas adequadas ao longo do dia?", isInverted: true },
  { id: 16, text: "Existe um equilíbrio entre tarefas administrativas e operacionais?", isInverted: true },
  { id: 17, text: "Há redistribuição de tarefas quando há sobrecarga em algum setor ou equipe?", isInverted: true },
  { id: 18, text: "Você já teve sintomas físicos ou emocionais (como ansiedade, exaustão, insônia) devido ao excesso de trabalho?", isInverted: false },
  { id: 19, text: "Existe flexibilidade para gerenciar sua própria carga de trabalho?", isInverted: true },
  { id: 20, text: "A equipe é dimensionada corretamente para a demanda da empresa?", isInverted: true },

  // TEMA 3: Reconhecimento e Carreira (21-30)
  { id: 21, text: "Você sente que seu esforço e desempenho são reconhecidos pela liderança?", isInverted: true },
  { id: 22, text: "A empresa possui políticas claras de promoção e progressão de carreira?", isInverted: true },
  { id: 23, text: "As avaliações de desempenho são justas e transparentes?", isInverted: true },
  { id: 24, text: "Você sente que há igualdade no reconhecimento entre diferentes áreas ou equipes?", isInverted: true },
  { id: 25, text: "A empresa oferece incentivos financeiros ou não financeiros pelo bom desempenho?", isInverted: true },
  { id: 26, text: "Você recebe feedback construtivo regularmente?", isInverted: true },
  { id: 27, text: "Existe uma cultura de valorização dos funcionários?", isInverted: true },
  { id: 28, text: "Você já se sentiu desmotivado(a) por falta de reconhecimento?", isInverted: false },
  { id: 29, text: "A empresa celebra conquistas individuais e coletivas?", isInverted: true },
  { id: 30, text: "O plano de benefícios da empresa é condizente com suas necessidades e expectativas?", isInverted: true },

  // TEMA 4: Clima Organizacional (31-40)
  { id: 31, text: "O ambiente de trabalho é amigável e colaborativo?", isInverted: true },
  { id: 32, text: "Existe um sentimento de confiança entre os colegas de trabalho?", isInverted: true },
  { id: 33, text: "Você se sente confortável para expressar suas opiniões na equipe?", isInverted: true },
  { id: 34, text: "Os gestores promovem um ambiente saudável e respeitoso?", isInverted: true },
  { id: 35, text: "Existe transparência na comunicação da empresa?", isInverted: true },
  { id: 36, text: "Você sente que pode contar com seus colegas em momentos de dificuldade?", isInverted: true },
  { id: 37, text: "Há um senso de propósito e pertencimento entre os funcionários?", isInverted: true },
  { id: 38, text: "Conflitos são resolvidos de forma justa e eficiente?", isInverted: true },
  { id: 39, text: "O ambiente físico do local de trabalho é confortável e seguro?", isInverted: true },
  { id: 40, text: "A cultura organizacional da empresa está alinhada com seus valores pessoais?", isInverted: true },

  // TEMA 5: Autonomia e Controle (41-50)
  { id: 41, text: "Você tem liberdade para tomar decisões sobre suas tarefas diárias?", isInverted: true },
  { id: 42, text: "Seu trabalho permite flexibilidade para adaptar sua rotina conforme necessário?", isInverted: true },
  { id: 43, text: "Você sente que tem voz ativa na empresa?", isInverted: true },
  { id: 44, text: "A empresa confia em sua capacidade de autogestão?", isInverted: true },
  { id: 45, text: "Você recebe instruções claras sobre suas responsabilidades?", isInverted: true },
  { id: 46, text: "O excesso de controle ou burocracia interfere no seu desempenho?", isInverted: false },
  { id: 47, text: "Suas sugestões são ouvidas e consideradas pela liderança?", isInverted: true },
  { id: 48, text: "Você tem acesso às ferramentas e recursos necessários para desempenhar bem seu trabalho?", isInverted: true },
  { id: 49, text: "Você sente que pode propor melhorias sem medo de represálias?", isInverted: true },
  { id: 50, text: "O excesso de supervisão impacta sua produtividade ou bem-estar?", isInverted: false },

  // TEMA 6: Metas e Pressão (51-60)
  { id: 51, text: "As metas da empresa são realistas e atingíveis?", isInverted: true },
  { id: 52, text: "Você sente que há pressão excessiva para alcançar resultados?", isInverted: false },
  { id: 53, text: "A cobrança por metas impacta sua saúde mental ou emocional?", isInverted: false },
  { id: 54, text: "Existe apoio da liderança para lidar com desafios relacionados às metas?", isInverted: true },
  { id: 55, text: "Você sente que pode negociar prazos ou objetivos quando necessário?", isInverted: true },
  { id: 56, text: "A competitividade entre os funcionários é estimulada de maneira saudável?", isInverted: true },
  { id: 57, text: "Você já sentiu medo de punição por não atingir metas?", isInverted: false },
  { id: 58, text: "O sistema de avaliação de metas é transparente?", isInverted: true },
  { id: 59, text: "Você tem tempo suficiente para cumprir suas demandas com qualidade?", isInverted: true },
  { id: 60, text: "A pressão por resultados impacta negativamente o ambiente de trabalho?", isInverted: false },

  // TEMA 7: Insegurança no Trabalho (61-70)
  { id: 61, text: "Você já sentiu que seu emprego está ameaçado sem justificativa clara?", isInverted: false },
  { id: 62, text: "A empresa faz cortes ou demissões repentinas sem aviso prévio?", isInverted: false },
  { id: 63, text: "Há comunicação clara sobre a estabilidade da empresa e dos empregos?", isInverted: true },
  { id: 64, text: "Você já sofreu ameaças veladas ou diretas no ambiente de trabalho?", isInverted: false },
  { id: 65, text: "Você sente que há transparência nas políticas de desligamento?", isInverted: true },
  { id: 66, text: "Mudanças organizacionais impactaram seu sentimento de segurança no trabalho?", isInverted: false },
  { id: 67, text: "Você já presenciou casos de demissões injustas?", isInverted: false },
  { id: 68, text: "O medo da demissão afeta seu desempenho?", isInverted: false },
  { id: 69, text: "A empresa oferece suporte psicológico para funcionários inseguros?", isInverted: true },
  { id: 70, text: "Você já evitou expressar sua opinião por medo de represálias?", isInverted: false },

  // TEMA 8: Comunicação e Conflitos (71-80)
  { id: 71, text: "Conflitos internos são resolvidos de maneira justa?", isInverted: true },
  { id: 72, text: "A comunicação entre equipes e departamentos é eficiente?", isInverted: true },
  { id: 73, text: "Você já evitou colegas ou superiores devido a desentendimentos?", isInverted: false },
  { id: 74, text: "Existe um canal aberto para feedback entre colaboradores e liderança?", isInverted: true },
  { id: 75, text: "A falta de comunicação já comprometeu seu trabalho?", isInverted: false },
  { id: 76, text: "Você sente que há rivalidade desnecessária entre setores?", isInverted: false },
  { id: 77, text: "Há treinamentos sobre comunicação assertiva e gestão de conflitos?", isInverted: true },
  { id: 78, text: "Você sente que pode expressar suas dificuldades sem ser julgado?", isInverted: true },
  { id: 79, text: "A empresa promove um ambiente de diálogo aberto?", isInverted: true },
  { id: 80, text: "O RH está presente e atuante na mediação de conflitos?", isInverted: true },

  // TEMA 9: Equilíbrio Vida Pessoal (81-90)
  { id: 81, text: "Você sente que a sua jornada de trabalho permite equilíbrio com sua vida pessoal?", isInverted: true },
  { id: 82, text: "Você sente que tem tempo para sua família e lazer?", isInverted: true },
  { id: 83, text: "O trabalho impacta negativamente sua saúde mental?", isInverted: false },
  { id: 84, text: "Você tem flexibilidade para lidar com questões pessoais urgentes?", isInverted: true },
  { id: 85, text: "A empresa oferece suporte para equilíbrio entre trabalho e vida pessoal?", isInverted: true },
  { id: 86, text: "Você consegue se desconectar do trabalho fora do expediente?", isInverted: true },
  { id: 87, text: "Você sente que sua vida pessoal é respeitada pela empresa?", isInverted: true },
  { id: 88, text: "Há incentivo ao bem-estar e qualidade de vida no trabalho?", isInverted: true },
  { id: 89, text: "O estresse profissional afeta sua vida familiar?", isInverted: false },
  { id: 90, text: "O ambiente corporativo valoriza o descanso e recuperação dos funcionários?", isInverted: true }
];
