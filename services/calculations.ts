
import { ScoreLevel, RiskLevel } from '../types';

/**
 * NR-01 Risk Matrix
 * Gravity (1-3) x Probability (1-4)
 * Score range: 1 to 12.
 */
export const calculateMatrixRisk = (gravity: number, probability: number): RiskLevel => {
  // Garantimos que os valores estejam dentro do range antes do cálculo
  const g = Math.max(1, Math.min(3, gravity));
  const p = Math.max(1, Math.min(4, probability));
  const score = g * p;

  // Escala Sugerida para NR-01 (G 1-3 x P 1-4):
  // 1-2: Baixo
  // 3-5: Médio
  // 6-8: Alto
  // 9-12: Crítico
  if (score <= 2.5) return RiskLevel.BAIXO;
  if (score <= 5.5) return RiskLevel.MEDIO;
  if (score <= 8.5) return RiskLevel.ALTO;
  return RiskLevel.CRITICO;
};

/**
 * Conversão de valores médios para classificação textual simplificada
 */
export const getLevelFromAverage = (avg: number): RiskLevel => {
  if (avg < 1.5) return RiskLevel.BAIXO;
  if (avg < 2.5) return RiskLevel.MEDIO;
  if (avg < 3.5) return RiskLevel.ALTO;
  return RiskLevel.CRITICO;
};

/**
 * Converts raw answer (0-4) to a Gravity Score (1-3)
 */
export const getCorrectedScore = (value: number, isInverted: boolean): ScoreLevel => {
  let riskValue: number;
  if (isInverted) {
    riskValue = 4 - value;
  } else {
    riskValue = value;
  }

  if (riskValue >= 3) return ScoreLevel.ALTA;
  if (riskValue === 2) return ScoreLevel.MEDIA;
  return ScoreLevel.BAIXA;
};
