import { NextRequest, NextResponse } from 'next/server';

// ─────────────────────────────────────────────────────────────
//  MODEL WEIGHTS — loaded from trained model JSON
//  Falls back to hardcoded calibrated weights if file not found
//  (weights were derived from Open-Meteo historical + NER events)
// ─────────────────────────────────────────────────────────────

// Fallback weights (pre-calibrated for NER terrain, used before
// first training run or if model_weights.json isn't present yet)
const FALLBACK_WEIGHTS = {
  weights: [
    2.85,   // f0: 24h rainfall (strongest predictor)
    1.92,   // f1: peak hourly rainfall
    2.10,   // f2: soil moisture (saturated soil = high risk)
    1.65,   // f3: slope angle
    0.58,   // f4: elevation (high-pass = some additional risk)
    0.42,   // f5: wind speed
    0.75,   // f6: humidity
    0.95,   // f7: monsoon season flag
  ],
  bias: -4.20,
  normalization: {
    precip_mm_24h_max: 150.0,
    peak_hr_rainfall_max: 30.0,
    soil_moisture_max: 0.5,
    slope_max: 10.0,
    elevation_max: 5000.0,
    wind_max: 80.0,
  },
  thresholds: { LOW: 0.25, MODERATE: 0.50, HIGH: 0.70, CRITICAL: 0.85 },
};

// Dynamic import of trained model weights
async function loadModelWeights() {
  try {
    // Use dynamic require so it's read at request time
    const fs = await import('fs');
    const path = await import('path');
    const weightsPath = path.join(process.cwd(), 'data', 'model_weights.json');
    if (!fs.existsSync(weightsPath)) return FALLBACK_WEIGHTS;
    const raw = fs.readFileSync(weightsPath, 'utf-8');
    const parsed = JSON.parse(raw);
    return parsed;
  } catch {
    return FALLBACK_WEIGHTS;
  }
}

// ─────────────────────────────────────────────────────────────
//  FEATURE ENGINEERING
// ─────────────────────────────────────────────────────────────
interface FeatureInput {
  precip_mm_24h: number;
  peak_hr_rainfall_mm: number;
  soil_moisture: number;
  slope: number;
  elevation_m: number;
  wind_max_kmph: number;
  mean_humidity_pct: number;
  is_monsoon: boolean;
}

function buildFeatures(input: FeatureInput, norm: typeof FALLBACK_WEIGHTS['normalization']): number[] {
  return [
    Math.min(input.precip_mm_24h / norm.precip_mm_24h_max, 1.0),
    Math.min(input.peak_hr_rainfall_mm / norm.peak_hr_rainfall_max, 1.0),
    Math.min(input.soil_moisture / norm.soil_moisture_max, 1.0),
    Math.min(input.slope / norm.slope_max, 1.0),
    Math.min(input.elevation_m / norm.elevation_max, 1.0),
    Math.min(input.wind_max_kmph / norm.wind_max, 1.0),
    input.mean_humidity_pct / 100.0,
    input.is_monsoon ? 1.0 : 0.0,
  ];
}

function sigmoid(x: number): number {
  return 1.0 / (1.0 + Math.exp(-x));
}

function dotProduct(a: number[], b: number[]): number {
  return a.reduce((sum, val, i) => sum + val * b[i], 0);
}

type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

function classifyRisk(prob: number, thresholds: typeof FALLBACK_WEIGHTS['thresholds']): RiskLevel {
  if (prob >= thresholds.CRITICAL)  return 'CRITICAL';
  if (prob >= thresholds.HIGH)      return 'HIGH';
  if (prob >= thresholds.MODERATE)  return 'MODERATE';
  return 'LOW';
}

// ─────────────────────────────────────────────────────────────
//  ROUTE SEGMENT PREDICTION
// ─────────────────────────────────────────────────────────────
interface RouteSegmentInput {
  name: string;
  waypoint: string;
  distanceKm: number;
  lat: number;
  lng: number;
  slope: number;
  elevation_m: number;
  // These come from live weather API
  precip_mm_24h?: number;
  peak_hr_rainfall_mm?: number;
  soil_moisture?: number;
  wind_max_kmph?: number;
  mean_humidity_pct?: number;
  is_monsoon?: boolean;
}

interface SegmentPrediction {
  name: string;
  waypoint: string;
  distanceKm: number;
  risk_probability: number;
  risk_level: RiskLevel;
  feature_contributions: {
    rainfall: number;
    soil_moisture: number;
    slope_elevation: number;
    wind_humidity: number;
    monsoon: number;
  };
  edge_weight: number;
  weather: {
    precip_mm_24h: number;
    soil_moisture: number;
    wind_kmph: number;
    humidity_pct: number;
  };
}

interface RoutePrediction {
  route_name: string;
  segments: SegmentPrediction[];
  total_distance_km: number;
  weighted_risk_score: number;
  overall_risk_level: RiskLevel;
  overall_risk_probability: number;
  estimated_time_hrs: number;
  delay_forecast_hrs: number;
  model_version: string;
  model_accuracy: number;
  predicted_at: string;
  weather_source: 'live' | 'fallback';
}

// NER waypoint metadata for default slope/elevation
const WAYPOINT_METADATA: Record<string, { slope: number; elevation_m: number }> = {
  'Guwahati':   { slope: 1, elevation_m: 52 },
  'Nagaon':     { slope: 2, elevation_m: 55 },
  'Dimapur':    { slope: 3, elevation_m: 271 },
  'Kohima':     { slope: 7, elevation_m: 1444 },
  'Imphal':     { slope: 5, elevation_m: 786 },
  'Shillong':   { slope: 7, elevation_m: 1496 },
  'Nongpoh':    { slope: 6, elevation_m: 870 },
  'Silchar':    { slope: 3, elevation_m: 29 },
  'Aizawl':     { slope: 8, elevation_m: 1132 },
  'Tezpur':     { slope: 2, elevation_m: 48 },
  'Bhalukpong': { slope: 5, elevation_m: 210 },
  'Bomdila':    { slope: 7, elevation_m: 2217 },
  'Sela Pass':  { slope: 9, elevation_m: 4170 },
  'Tawang':     { slope: 8, elevation_m: 2669 },
  'Siliguri':   { slope: 1, elevation_m: 122 },
  'Rangpo':     { slope: 6, elevation_m: 325 },
  'Gangtok':    { slope: 7, elevation_m: 1650 },
  'Jiribam':    { slope: 4, elevation_m: 100 },
  'Dirang':     { slope: 7, elevation_m: 1560 },
  'Kalimpong':  { slope: 6, elevation_m: 1250 },
  'Jorabat':    { slope: 2, elevation_m: 82 },
  'Barapani':   { slope: 5, elevation_m: 950 },
  'Jorhat':     { slope: 2, elevation_m: 116 },
};

const BASE_SPEED_KMPH = 45;

// Fetch weather for a waypoint
async function fetchWeatherForWaypoint(
  lat: number,
  lng: number,
  name: string
): Promise<{ precip_mm_24h: number; peak_hr_rainfall_mm: number; soil_moisture: number; wind_max_kmph: number; mean_humidity_pct: number; is_monsoon: boolean } | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const url = `${baseUrl}/api/weather?lat=${lat}&lng=${lng}&name=${encodeURIComponent(name)}`;
    const res = await fetch(url, { next: { revalidate: 1800 } });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      precip_mm_24h: data.precip_mm_24h ?? 0,
      peak_hr_rainfall_mm: data.peak_hr_rainfall_mm ?? 0,
      soil_moisture: data.soil_moisture ?? 0.28,
      wind_max_kmph: data.wind_max_kmph ?? 0,
      mean_humidity_pct: data.mean_humidity_pct ?? 70,
      is_monsoon: data.is_monsoon ?? false,
    };
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Validate structure
  const b = body as Record<string, unknown>;
  if (!b.routes || !Array.isArray(b.routes)) {
    return NextResponse.json(
      { error: 'body.routes must be an array of route objects' },
      { status: 400 }
    );
  }

  const model = await loadModelWeights();

  const results: RoutePrediction[] = [];
  let weatherSource: 'live' | 'fallback' = 'fallback';

  for (const route of (b.routes as unknown[])) {
    const r = route as Record<string, unknown>;
    const routeName = String(r.name || 'Unknown Route').slice(0, 100);
    const segments = (r.segments as RouteSegmentInput[] | undefined) || [];

    const segmentPredictions: SegmentPrediction[] = [];
    let totalDistance = 0;

    for (const seg of segments) {
      const meta = WAYPOINT_METADATA[seg.waypoint] || { slope: 5, elevation_m: 500 };
      const slope = seg.slope ?? meta.slope;
      const elevation = seg.elevation_m ?? meta.elevation_m;

      // Fetch live weather or use provided values
      let weatherVals = {
        precip_mm_24h: seg.precip_mm_24h ?? 0,
        peak_hr_rainfall_mm: seg.peak_hr_rainfall_mm ?? 0,
        soil_moisture: seg.soil_moisture ?? 0.28,
        wind_max_kmph: seg.wind_max_kmph ?? 0,
        mean_humidity_pct: seg.mean_humidity_pct ?? 70,
        is_monsoon: seg.is_monsoon ?? false,
      };

      if (seg.lat && seg.lng && !seg.precip_mm_24h) {
        const live = await fetchWeatherForWaypoint(seg.lat, seg.lng, seg.waypoint || seg.name);
        if (live) {
          weatherVals = live;
          weatherSource = 'live';
        }
      }

      const featureInput: FeatureInput = {
        precip_mm_24h: weatherVals.precip_mm_24h,
        peak_hr_rainfall_mm: weatherVals.peak_hr_rainfall_mm,
        soil_moisture: weatherVals.soil_moisture,
        slope,
        elevation_m: elevation,
        wind_max_kmph: weatherVals.wind_max_kmph,
        mean_humidity_pct: weatherVals.mean_humidity_pct,
        is_monsoon: weatherVals.is_monsoon,
      };

      const features = buildFeatures(featureInput, model.normalization);
      const logit = dotProduct(features, model.weights) + model.bias;
      const riskProb = sigmoid(logit);
      const riskLevel = classifyRisk(riskProb, model.thresholds);

      // Feature contributions for explainability
      const contribs = features.map((f, i) => f * model.weights[i]);
      const totalContrib = contribs.reduce((a, b) => a + Math.abs(b), 0) || 1;

      // Edge weight (enhanced formula using ML probability)
      // Base formula from spec + ML-derived risk multiplier
      const ALPHA = 0.05, BETA = 0.25, GAMMA = 0.15;
      const specWeight = seg.distanceKm * (
        1 +
        ALPHA * weatherVals.precip_mm_24h +
        BETA * (slope) +
        GAMMA * (slope * 0.5)
      );
      // Blend spec formula with ML probability for final edge weight
      const mlMultiplier = 1 + (riskProb * 3);
      const edgeWeight = (specWeight + seg.distanceKm * mlMultiplier) / 2;

      segmentPredictions.push({
        name: seg.name,
        waypoint: seg.waypoint,
        distanceKm: seg.distanceKm,
        risk_probability: Math.round(riskProb * 10000) / 10000,
        risk_level: riskLevel,
        feature_contributions: {
          rainfall:       Math.round(Math.abs(contribs[0] + contribs[1]) / totalContrib * 100),
          soil_moisture:  Math.round(Math.abs(contribs[2]) / totalContrib * 100),
          slope_elevation: Math.round(Math.abs(contribs[3] + contribs[4]) / totalContrib * 100),
          wind_humidity:  Math.round(Math.abs(contribs[5] + contribs[6]) / totalContrib * 100),
          monsoon:        Math.round(Math.abs(contribs[7]) / totalContrib * 100),
        },
        edge_weight: Math.round(edgeWeight * 100) / 100,
        weather: {
          precip_mm_24h: weatherVals.precip_mm_24h,
          soil_moisture: Math.round(weatherVals.soil_moisture * 1000) / 1000,
          wind_kmph: weatherVals.wind_max_kmph,
          humidity_pct: weatherVals.mean_humidity_pct,
        },
      });

      totalDistance += seg.distanceKm;
    }

    // Overall route stats
    const totalWeight = segmentPredictions.reduce((s, seg) => s + seg.edge_weight, 0);
    const weightedProb = segmentPredictions.reduce(
      (sum, seg) => sum + seg.risk_probability * seg.distanceKm, 0
    ) / (totalDistance || 1);

    const baseTimeHrs = totalDistance / BASE_SPEED_KMPH;
    const estimatedTimeHrs = totalWeight / BASE_SPEED_KMPH;
    const delayHrs = Math.max(0, estimatedTimeHrs - baseTimeHrs);

    results.push({
      route_name: routeName,
      segments: segmentPredictions,
      total_distance_km: totalDistance,
      weighted_risk_score: Math.round(totalWeight * 100) / 100,
      overall_risk_probability: Math.round(weightedProb * 10000) / 10000,
      overall_risk_level: classifyRisk(weightedProb, model.thresholds),
      estimated_time_hrs: Math.round(estimatedTimeHrs * 100) / 100,
      delay_forecast_hrs: Math.round(delayHrs * 100) / 100,
      model_version: model.version || 'fallback',
      model_accuracy: model.test_accuracy || 0,
      predicted_at: new Date().toISOString(),
      weather_source: weatherSource,
    });
  }

  return NextResponse.json(
    { predictions: results, model_version: model.version || 'fallback' },
    {
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'no-store',
      },
    }
  );
}

// GET for single-point quick risk estimate (for map overlays)
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const latStr = searchParams.get('lat');
  const lngStr = searchParams.get('lng');
  const slopeStr = searchParams.get('slope') || '5';
  const elevStr = searchParams.get('elevation') || '500';

  if (!latStr || !lngStr) {
    return NextResponse.json({ error: 'lat and lng required' }, { status: 400 });
  }

  const lat = parseFloat(latStr);
  const lng = parseFloat(lngStr);
  const slope = Math.min(10, Math.max(0, parseFloat(slopeStr)));
  const elevation = Math.min(5000, Math.max(0, parseFloat(elevStr)));

  if (isNaN(lat) || isNaN(lng) || lat < 20 || lat > 30 || lng < 85 || lng > 98) {
    return NextResponse.json({ error: 'Invalid NER coordinates' }, { status: 400 });
  }

  try {
    const model = await loadModelWeights();
    const weather = await fetchWeatherForWaypoint(lat, lng, 'point');
    const month = new Date().getMonth() + 1;
    const isMonsoon = month >= 5 && month <= 10;

    const featureInput: FeatureInput = {
      precip_mm_24h: weather?.precip_mm_24h ?? 0,
      peak_hr_rainfall_mm: weather?.peak_hr_rainfall_mm ?? 0,
      soil_moisture: weather?.soil_moisture ?? 0.28,
      slope,
      elevation_m: elevation,
      wind_max_kmph: weather?.wind_max_kmph ?? 0,
      mean_humidity_pct: weather?.mean_humidity_pct ?? 70,
      is_monsoon: isMonsoon,
    };

    const features = buildFeatures(featureInput, model.normalization);
    const logit = dotProduct(features, model.weights) + model.bias;
    const prob = sigmoid(logit);

    return NextResponse.json({
      lat, lng, slope, elevation,
      risk_probability: Math.round(prob * 10000) / 10000,
      risk_level: classifyRisk(prob, model.thresholds),
      weather,
      predicted_at: new Date().toISOString(),
    }, {
      headers: { 'X-Content-Type-Options': 'nosniff' },
    });
  } catch {
    return NextResponse.json({ error: 'Prediction service unavailable' }, { status: 503 });
  }
}
