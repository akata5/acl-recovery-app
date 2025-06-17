// Constants for risk assessment
const STRENGTH_THRESHOLDS = {
  QUAD_MIN_PERCENT: 80, // Quad strength should be at least 80% of bodyweight
  HAMSTRING_MIN_PERCENT: 50, // Hamstring strength should be at least 50% of bodyweight
  LSI_MIN_PERCENT: 90, // Limb Symmetry Index should be at least 90%
};

// Calculate Limb Symmetry Index (LSI)
const calculateLSI = (injuredLimb, nonInjuredLimb) => {
  if (!injuredLimb || !nonInjuredLimb) return 0;
  return (injuredLimb / nonInjuredLimb) * 100;
};

// Calculate strength as percentage of bodyweight
const calculateStrengthPercentage = (strength, bodyweight) => {
  if (!strength || !bodyweight) return 0;
  return (strength / bodyweight) * 100;
};

// Calculate risk score (0-100, where 100 is highest risk)
const calculateRiskScore = (metrics) => {
  let riskScore = 0;
  const factors = [];

  // Quad strength risk assessment
  const quadPercentage = calculateStrengthPercentage(metrics.quadStrength, metrics.bodyweight);
  if (quadPercentage < STRENGTH_THRESHOLDS.QUAD_MIN_PERCENT) {
    riskScore += 30;
    factors.push({
      factor: 'Quad Strength',
      value: `${quadPercentage.toFixed(1)}% of bodyweight`,
      threshold: `${STRENGTH_THRESHOLDS.QUAD_MIN_PERCENT}%`,
      risk: 'High'
    });
  } else if (quadPercentage < STRENGTH_THRESHOLDS.QUAD_MIN_PERCENT + 10) {
    riskScore += 15;
    factors.push({
      factor: 'Quad Strength',
      value: `${quadPercentage.toFixed(1)}% of bodyweight`,
      threshold: `${STRENGTH_THRESHOLDS.QUAD_MIN_PERCENT}%`,
      risk: 'Moderate'
    });
  }

  // Hamstring strength risk assessment
  const hamstringPercentage = calculateStrengthPercentage(metrics.hamstringStrength, metrics.bodyweight);
  if (hamstringPercentage < STRENGTH_THRESHOLDS.HAMSTRING_MIN_PERCENT) {
    riskScore += 25;
    factors.push({
      factor: 'Hamstring Strength',
      value: `${hamstringPercentage.toFixed(1)}% of bodyweight`,
      threshold: `${STRENGTH_THRESHOLDS.HAMSTRING_MIN_PERCENT}%`,
      risk: 'High'
    });
  } else if (hamstringPercentage < STRENGTH_THRESHOLDS.HAMSTRING_MIN_PERCENT + 10) {
    riskScore += 12;
    factors.push({
      factor: 'Hamstring Strength',
      value: `${hamstringPercentage.toFixed(1)}% of bodyweight`,
      threshold: `${STRENGTH_THRESHOLDS.HAMSTRING_MIN_PERCENT}%`,
      risk: 'Moderate'
    });
  }

  // LSI risk assessment
  const quadLSI = calculateLSI(metrics.injuredQuadStrength, metrics.nonInjuredQuadStrength);
  const hamstringLSI = calculateLSI(metrics.injuredHamstringStrength, metrics.nonInjuredHamstringStrength);
  const averageLSI = (quadLSI + hamstringLSI) / 2;

  if (averageLSI < STRENGTH_THRESHOLDS.LSI_MIN_PERCENT) {
    riskScore += 25;
    factors.push({
      factor: 'Limb Symmetry Index',
      value: `${averageLSI.toFixed(1)}%`,
      threshold: `${STRENGTH_THRESHOLDS.LSI_MIN_PERCENT}%`,
      risk: 'High'
    });
  } else if (averageLSI < STRENGTH_THRESHOLDS.LSI_MIN_PERCENT + 5) {
    riskScore += 12;
    factors.push({
      factor: 'Limb Symmetry Index',
      value: `${averageLSI.toFixed(1)}%`,
      threshold: `${STRENGTH_THRESHOLDS.LSI_MIN_PERCENT}%`,
      risk: 'Moderate'
    });
  }

  // Time since surgery risk assessment
  const monthsSinceSurgery = (new Date() - new Date(metrics.surgeryDate)) / (1000 * 60 * 60 * 24 * 30);
  if (monthsSinceSurgery < 6) {
    riskScore += 20;
    factors.push({
      factor: 'Time Since Surgery',
      value: `${monthsSinceSurgery.toFixed(1)} months`,
      threshold: '6 months',
      risk: 'High'
    });
  } else if (monthsSinceSurgery < 9) {
    riskScore += 10;
    factors.push({
      factor: 'Time Since Surgery',
      value: `${monthsSinceSurgery.toFixed(1)} months`,
      threshold: '9 months',
      risk: 'Moderate'
    });
  }

  return {
    riskScore: Math.min(100, riskScore),
    riskLevel: riskScore >= 70 ? 'High' : riskScore >= 40 ? 'Moderate' : 'Low',
    factors,
    recommendations: generateRecommendations(factors, metrics)
  };
};

// Generate personalized recommendations based on risk factors
const generateRecommendations = (factors, metrics) => {
  const recommendations = [];

  // Strength-based recommendations
  const quadPercentage = calculateStrengthPercentage(metrics.quadStrength, metrics.bodyweight);
  const hamstringPercentage = calculateStrengthPercentage(metrics.hamstringStrength, metrics.bodyweight);

  if (quadPercentage < STRENGTH_THRESHOLDS.QUAD_MIN_PERCENT) {
    recommendations.push({
      priority: 'High',
      category: 'Strength',
      recommendation: 'Focus on quad strengthening exercises. Consider increasing resistance in leg press and squat variations.'
    });
  }

  if (hamstringPercentage < STRENGTH_THRESHOLDS.HAMSTRING_MIN_PERCENT) {
    recommendations.push({
      priority: 'High',
      category: 'Strength',
      recommendation: 'Prioritize hamstring strengthening. Include Nordic curls and hamstring curls in your routine.'
    });
  }

  // LSI-based recommendations
  const quadLSI = calculateLSI(metrics.injuredQuadStrength, metrics.nonInjuredQuadStrength);
  const hamstringLSI = calculateLSI(metrics.injuredHamstringStrength, metrics.nonInjuredHamstringStrength);

  if (quadLSI < STRENGTH_THRESHOLDS.LSI_MIN_PERCENT || hamstringLSI < STRENGTH_THRESHOLDS.LSI_MIN_PERCENT) {
    recommendations.push({
      priority: 'High',
      category: 'Symmetry',
      recommendation: 'Focus on single-leg exercises to improve limb symmetry. Consider reducing load on the non-injured leg.'
    });
  }

  // Time-based recommendations
  const monthsSinceSurgery = (new Date() - new Date(metrics.surgeryDate)) / (1000 * 60 * 60 * 24 * 30);
  if (monthsSinceSurgery < 6) {
    recommendations.push({
      priority: 'High',
      category: 'Timing',
      recommendation: 'Avoid high-impact activities and focus on controlled strengthening exercises.'
    });
  }

  return recommendations;
};

export const assessRisk = (metrics) => {
  return calculateRiskScore(metrics);
}; 