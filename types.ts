
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
 * NR-01 Risk levels (Matrix result)
 */
export enum RiskLevel {
  BAIXO = 'Baixo',
  MEDIO = 'Médio',
  ALTO = 'Alto',
  CRITICO = 'Crítico'
}

export interface Sector {
  id: string;
  name: string;
}

export interface Company {
  id: string;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  cep: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  uf: string;
  telefoneFixo: string;
  telefoneCelular: string;
  totalEmployees: number;
  accessCode: string;
  status: CompanyStatus;
  sectors: Sector[];
  password?: string;
  securityQuestion: string;
  securityAnswer: string;
}

export interface SurveyResponse {
  id: string;
  companyId: string;
  completedAt: string;
  sectorId: string;
  jobFunction: string;
  answers: { [questionId: number]: number };
}

// Alias de compatibilidade para evitar erro em arquivos órfãos no GitHub
export type Evaluation = SurveyResponse;

/**
 * Technical diagnostic report structure
 */
export interface DiagnosticReport {
  timestamp: string;
  author: string;
  agravosSaude: string;
  medidasControle: string;
  fontesGeradoras: { [topicIdx: number]: string };
  isMain?: boolean;
}

/**
 * State holding history of reports per company and sector
 */
export type DiagnosticReportsState = {
  [companyId: string]: {
    [sectorId: string]: DiagnosticReport[];
  };
};

/**
 * State holding probability scores (1-3) per company/sector/theme
 */
export type ProbabilityAssessments = {
  [companyId: string]: {
    [sectorId: string]: {
      [topicIdx: number]: number;
    };
  };
};

/**
 * Profile of the technical professional (Psychologist)
 */
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