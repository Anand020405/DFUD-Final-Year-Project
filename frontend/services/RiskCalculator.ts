/**
 * Risk Calculator Service
 * Implements clinical risk formula combining AI and clinical inputs
 */

export interface ClinicalInputs {
  bloodSugar: number; // mg/dL (70-200+)
  tempDifference: number; // °C
}

export interface RiskAssessment {
  riskScore: number;
  riskLevel: 'Low' | 'Moderate' | 'High';
  color: string;
  advice: string;
  aiConfidence: number;
  clinicalScore: number;
}

export class RiskCalculator {
  /**
   * Calculate risk score using formula:
   * RiskScore = (AI_Confidence × 0.6) + (Clinical_Inputs × 0.4)
   */
  static calculateRisk(
    aiConfidence: number,
    clinicalInputs: ClinicalInputs
  ): RiskAssessment {
    // Calculate clinical score from inputs
    const clinicalScore = this.calculateClinicalScore(clinicalInputs);

    // Combined risk score
    let riskScore = (aiConfidence * 0.6) + (clinicalScore * 0.4);

    // Override logic: Force High Risk if conditions met
    const { bloodSugar, tempDifference } = clinicalInputs;
    if (tempDifference >= 2.2 || bloodSugar >= 200) {
      riskScore = 0.9; // Force high risk
    }

    // Determine risk level and color
    const riskLevel = this.getRiskLevel(riskScore);
    const color = this.getRiskColor(riskLevel);
    const advice = this.getAdvice(riskLevel);

    return {
      riskScore,
      riskLevel,
      color,
      advice,
      aiConfidence,
      clinicalScore
    };
  }

  /**
   * Calculate clinical score from blood sugar and temp difference
   */
  private static calculateClinicalScore(inputs: ClinicalInputs): number {
    const { bloodSugar, tempDifference } = inputs;

    // Normalize blood sugar (70-200 range)
    const sugarNormalized = Math.min(Math.max((bloodSugar - 70) / 130, 0), 1);

    // Normalize temp difference (0-5 range)
    const tempNormalized = Math.min(tempDifference / 5.0, 1);

    // Average both scores
    return (sugarNormalized + tempNormalized) / 2;
  }

  /**
   * Determine risk level from score
   */
  private static getRiskLevel(score: number): 'Low' | 'Moderate' | 'High' {
    if (score < 0.4) return 'Low';
    if (score < 0.7) return 'Moderate';
    return 'High';
  }

  /**
   * Get color for risk level
   */
  private static getRiskColor(level: 'Low' | 'Moderate' | 'High'): string {
    switch (level) {
      case 'Low':
        return '#22c55e'; // Green
      case 'Moderate':
        return '#eab308'; // Yellow
      case 'High':
        return '#ef4444'; // Red
    }
  }

  /**
   * Get actionable advice for risk level
   */
  private static getAdvice(level: 'Low' | 'Moderate' | 'High'): string {
    switch (level) {
      case 'Low':
        return 'Wash feet daily with mild soap. Inspect feet regularly for any changes. Keep skin moisturized.';
      case 'Moderate':
        return 'Monitor closely for changes. Schedule a check-up with your healthcare provider within a week. Avoid walking barefoot.';
      case 'High':
        return 'Contact specialist immediately. Urgent medical attention needed. Do not delay - seek care today.';
    }
  }
}