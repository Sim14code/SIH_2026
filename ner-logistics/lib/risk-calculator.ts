// Risk scoring formula from spec:
// Edge Weight = Distance (km) × (1 + α·Rainfall(mm/hr) + β·LandslideRisk + γ·RoadDegradation)
// α = 0.05, β = 0.25, γ = 0.15

export interface RouteSegment {
  name: string;
  distanceKm: number;
  rainfallMmHr: number;
  landslideRiskScore: number; // 0-10
  roadDegradationScore: number; // 0-10
}

export interface RouteResult {
  name: string;
  segments: RouteSegment[];
  totalDistanceKm: number;
  riskWeight: number;
  estimatedTimeHrs: number;
  delayForecastHrs: number;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  riskBreakdown: {
    rainfallContribution: number;
    landslideContribution: number;
    degradationContribution: number;
  };
}

const ALPHA = 0.05; // rainfall weight
const BETA = 0.25;  // landslide risk weight
const GAMMA = 0.15; // road degradation weight
const BASE_SPEED_KMPH = 45; // average NER mountain road speed

export function calculateEdgeWeight(segment: RouteSegment): number {
  const { distanceKm, rainfallMmHr, landslideRiskScore, roadDegradationScore } = segment;
  return distanceKm * (
    1 +
    ALPHA * rainfallMmHr +
    BETA * landslideRiskScore +
    GAMMA * roadDegradationScore
  );
}

export function calculateRouteRisk(segments: RouteSegment[]): RouteResult['riskBreakdown'] & { totalWeight: number; totalDistance: number } {
  let totalWeight = 0;
  let totalDistance = 0;
  let rainfallContrib = 0;
  let landslideContrib = 0;
  let degradationContrib = 0;

  for (const seg of segments) {
    const baseWeight = seg.distanceKm;
    const rfContrib = ALPHA * seg.rainfallMmHr * seg.distanceKm;
    const lsContrib = BETA * seg.landslideRiskScore * seg.distanceKm;
    const rdContrib = GAMMA * seg.roadDegradationScore * seg.distanceKm;

    totalWeight += baseWeight + rfContrib + lsContrib + rdContrib;
    totalDistance += seg.distanceKm;
    rainfallContrib += rfContrib;
    landslideContrib += lsContrib;
    degradationContrib += rdContrib;
  }

  return { totalWeight, totalDistance, rainfallContribution: rainfallContrib, landslideContribution: landslideContrib, degradationContribution: degradationContrib };
}

function getRiskLevel(riskMultiplier: number): RouteResult['riskLevel'] {
  if (riskMultiplier < 1.5) return 'LOW';
  if (riskMultiplier < 2.5) return 'MODERATE';
  if (riskMultiplier < 4.0) return 'HIGH';
  return 'CRITICAL';
}

export function buildRouteResult(name: string, segments: RouteSegment[]): RouteResult {
  const risk = calculateRouteRisk(segments);
  const riskMultiplier = risk.totalWeight / risk.totalDistance;
  const estimatedTimeHrs = risk.totalWeight / BASE_SPEED_KMPH;
  const baseTimeHrs = risk.totalDistance / BASE_SPEED_KMPH;
  const delayForecastHrs = Math.max(0, estimatedTimeHrs - baseTimeHrs);

  return {
    name,
    segments,
    totalDistanceKm: risk.totalDistance,
    riskWeight: risk.totalWeight,
    estimatedTimeHrs: parseFloat(estimatedTimeHrs.toFixed(2)),
    delayForecastHrs: parseFloat(delayForecastHrs.toFixed(2)),
    riskLevel: getRiskLevel(riskMultiplier),
    riskBreakdown: {
      rainfallContribution: parseFloat(risk.rainfallContribution.toFixed(2)),
      landslideContribution: parseFloat(risk.landslideContribution.toFixed(2)),
      degradationContribution: parseFloat(risk.degradationContribution.toFixed(2)),
    },
  };
}

// Mock corridor data for the NER routes
export const NER_CORRIDORS = [
  {
    id: 'guwahati-imphal',
    label: 'Guwahati → Imphal (via Dimapur)',
    primary: {
      name: 'NH-27/NH-2 Primary Route',
      segments: [
        { name: 'Guwahati → Nagaon', distanceKm: 120, rainfallMmHr: 15, landslideRiskScore: 2, roadDegradationScore: 3 },
        { name: 'Nagaon → Dimapur', distanceKm: 95, rainfallMmHr: 20, landslideRiskScore: 4, roadDegradationScore: 4 },
        { name: 'Dimapur → Kohima', distanceKm: 74, rainfallMmHr: 28, landslideRiskScore: 7, roadDegradationScore: 6 },
        { name: 'Kohima → Imphal', distanceKm: 140, rainfallMmHr: 22, landslideRiskScore: 6, roadDegradationScore: 5 },
      ] as RouteSegment[],
    },
    alternate: {
      name: 'Alt Route (via Jiribam)',
      segments: [
        { name: 'Guwahati → Silchar', distanceKm: 145, rainfallMmHr: 18, landslideRiskScore: 3, roadDegradationScore: 4 },
        { name: 'Silchar → Jiribam', distanceKm: 110, rainfallMmHr: 12, landslideRiskScore: 2, roadDegradationScore: 5 },
        { name: 'Jiribam → Imphal', distanceKm: 220, rainfallMmHr: 8, landslideRiskScore: 2, roadDegradationScore: 4 },
      ] as RouteSegment[],
    },
  },
  {
    id: 'guwahati-shillong',
    label: 'Guwahati → Shillong',
    primary: {
      name: 'NH-6 Direct Route',
      segments: [
        { name: 'Guwahati → Nongpoh', distanceKm: 55, rainfallMmHr: 30, landslideRiskScore: 6, roadDegradationScore: 5 },
        { name: 'Nongpoh → Shillong', distanceKm: 45, rainfallMmHr: 35, landslideRiskScore: 5, roadDegradationScore: 4 },
      ] as RouteSegment[],
    },
    alternate: {
      name: 'Alt via Jorabat-Barapani',
      segments: [
        { name: 'Guwahati → Jorabat', distanceKm: 15, rainfallMmHr: 12, landslideRiskScore: 1, roadDegradationScore: 2 },
        { name: 'Jorabat → Barapani', distanceKm: 60, rainfallMmHr: 18, landslideRiskScore: 3, roadDegradationScore: 3 },
        { name: 'Barapani → Shillong', distanceKm: 20, rainfallMmHr: 22, landslideRiskScore: 2, roadDegradationScore: 2 },
      ] as RouteSegment[],
    },
  },
  {
    id: 'tezpur-tawang',
    label: 'Tezpur → Tawang (Arunachal)',
    primary: {
      name: 'NH-13 Primary',
      segments: [
        { name: 'Tezpur → Bhalukpong', distanceKm: 55, rainfallMmHr: 18, landslideRiskScore: 3, roadDegradationScore: 4 },
        { name: 'Bhalukpong → Bomdila', distanceKm: 95, rainfallMmHr: 25, landslideRiskScore: 7, roadDegradationScore: 7 },
        { name: 'Bomdila → Sela Pass', distanceKm: 80, rainfallMmHr: 5, landslideRiskScore: 8, roadDegradationScore: 6 },
        { name: 'Sela Pass → Tawang', distanceKm: 85, rainfallMmHr: 3, landslideRiskScore: 6, roadDegradationScore: 5 },
      ] as RouteSegment[],
    },
    alternate: {
      name: 'Dirang Bypass Route',
      segments: [
        { name: 'Tezpur → Bhalukpong', distanceKm: 55, rainfallMmHr: 18, landslideRiskScore: 3, roadDegradationScore: 4 },
        { name: 'Bhalukpong → Dirang', distanceKm: 125, rainfallMmHr: 15, landslideRiskScore: 5, roadDegradationScore: 6 },
        { name: 'Dirang → Tawang (Military Road)', distanceKm: 100, rainfallMmHr: 4, landslideRiskScore: 4, roadDegradationScore: 5 },
      ] as RouteSegment[],
    },
  },
  {
    id: 'siliguri-gangtok',
    label: 'Siliguri → Gangtok (Sikkim)',
    primary: {
      name: 'NH-10 Primary',
      segments: [
        { name: 'Siliguri → Rangpo', distanceKm: 68, rainfallMmHr: 22, landslideRiskScore: 5, roadDegradationScore: 4 },
        { name: 'Rangpo → Gangtok', distanceKm: 40, rainfallMmHr: 28, landslideRiskScore: 6, roadDegradationScore: 5 },
      ] as RouteSegment[],
    },
    alternate: {
      name: 'Kalimpong Bypass',
      segments: [
        { name: 'Siliguri → Kalimpong', distanceKm: 55, rainfallMmHr: 18, landslideRiskScore: 3, roadDegradationScore: 4 },
        { name: 'Kalimpong → Gangtok (via Algarah)', distanceKm: 75, rainfallMmHr: 20, landslideRiskScore: 4, roadDegradationScore: 4 },
      ] as RouteSegment[],
    },
  },
];
