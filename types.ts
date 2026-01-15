// types.ts

// =============================================================================
// ENUMS E TIPOS BÁSICOS (CONSOLIDADOS)
// =============================================================================

export enum CompanyStatus {
  ABERTO = 'Aberto',
  FECHADO = 'Fechado'
}

/**
 * NR-01 Severity level based on raw answers (1-3)
 */
export enum ScoreLevel {
  BAIXA = 1,
  MEDIA = 2,
  ALTA = 3
}

/**
 * NR-01 Risk levels (Matrix result) - Reintroduzido como ENUM para compatibilidade
 */
export enum RiskLevel {
  BAIXO = 'Baixo',
  MEDIO = 'Médio',
  ALTO = 'Alto',
  CRITICO = 'Crítico'
}

// =============================================================================
// INTERFACES BÁSICAS
// =============================================================================

export interface Sector {
  id: string;
  name: string;
}

export interface Company {
  id: string;
  nomeFantasia: string;
  razaoSocial: string;
  cnpj: string;
  accessCode: string;
  password: string;
  cep: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  sectors: Sector[];
  functions: string[]; // ✅ ADICIONADO: Lista de funções globais da empresa
  totalEmployees?: number;
  uf?: string;

  // ✅ ADICIONADOS: Campos de telefone e segurança que estavam faltando
  telefoneFixo: string;
  telefoneCelular: string;
  securityQuestion: string;
  securityAnswer: string;
  status: CompanyStatus; // ✅ ADICIONADO: Status da empresa
}

export interface SurveyResponse {
  id: string;
  companyId: string;
  sectorId: string;
  jobFunction: string;
  completedAt: string; // Ou Date, dependendo de como você armazena
  answers: { [questionId: number]: number };
  respostas?: { topico: string; gravidadeNum: number }[];
}

export interface ProbabilityAssessment {
  id: string;
  companyId: string;
  sectorId: string;
  scores: { [factorId: number]: number }; // Ex: { '0': 2, '1': 3, ... }
}

// =============================================================================
// INTERFACE DIAGNOSTIC REPORT
// =============================================================================

export interface DiagnosticReport {
  id?: string;
  companyId: string;
  sectorId: string;
  isMain?: boolean;

  author?: string;
  dataElaboracao?: string;
  funcoes?: string[];

  agravosSaude?: string;
  medidasControle?: string;
  conclusao?: string;

  fontesGeradoras: { [factorId: number]: string };

  createdAt?: Date | any;
  updatedAt?: Date | any;
}

// =============================================================================
// INTERFACE PSYCHOLOGIST
// =============================================================================

export interface Psychologist {
  id: string;
  nomeCompleto: string;
  email: string;
  crp: string;
  telefone: string;
  endereco?: string;
  logradouro?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  senha?: string;
  primeiroAcesso?: boolean;
  perguntaSeguranca?: string;
  respostaSeguranca?: string;
}

// =============================================================================
// TIPOS E INTERFACES PARA ANÁLISE DE RISCO
// =============================================================================

export type SeverityLevel = 'Baixa' | 'Média' | 'Alta' | 'Crítica';
export type ProbabilityLevel = 'Improvável' | 'Possível' | 'Provável';
export type RiskMatrixLevel = 'Baixo' | 'Médio' | 'Alto' | 'Crítico'; // Mantido como type para flexibilidade

export interface RiskFactor {
  id: number;
  key: string;
  label: string;
  startQuestion: number;
  endQuestion: number;
}

export interface FactorAnalysis {
  factor: RiskFactor;
  gravidade: SeverityLevel;
  gravidadeScore: number;
  probabilidade: ProbabilityLevel;
  probabilidadeScore: number;
  matriz: RiskMatrixLevel;
}

export interface SectorAnalysisData {
  company: Company;
  sectorId: string;
  sectorName: string;
  funcoes: string[];
  totalRespondentes: number;
  dataElaboracao: string;
  factors: FactorAnalysis[];

  gravityStats: GravityStats;
  riskMatrixStats: RiskMatrixStats;
  themes: {
    label: string;
    avgGravity: number;
    probValue: number;
    risk: RiskMatrixLevel;
  }[];
}

export interface RiskAnalysisResult {
  topico: string;
  fonteGeradora: string;
  gravidade: number;
  probabilidade: number;
  risco: number;
  classificacao: { texto: string; cor: string };
}

export interface Evaluation {
  id: string;
  companyId: string;
  sectorId: string;
  jobFunction: string;
  completedAt: string;
  respostas: { topico: string; gravidadeNum: number }[];
}

// =============================================================================
// ESTATÍSTICAS
// =============================================================================

export interface GravityStats {
  baixa: number;
  media: number;
  alta: number;
}

export interface RiskMatrixStats {
  baixo: number;
  medio: number;
  alto: number;
  critico: number;
}

// =============================================================================
// TIPOS DO APP.TSX (PARA COMPATIBILIDADE)
// =============================================================================

export interface PsychologistProfile {
  nomeCompleto: string;
  crp: string;
  email: string;
  telefone: string;
  cep: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  uf: string;
}

export type ProbabilityAssessments = {
  [companyId: string]: {
    [sectorId: string]: {
      [topicIdx: number]: number;
    };
  };
};

export type DiagnosticReportsState = {
  [companyId: string]: {
    [sectorId: string]: DiagnosticReport[];
  };
};
