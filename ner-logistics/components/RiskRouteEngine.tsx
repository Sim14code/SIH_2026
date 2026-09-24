'use client';

import { useState, useCallback } from 'react';
import {
  TrendingUp, AlertTriangle, Clock, Navigation, ChevronDown,
  BarChart3, Brain, CloudRain, Wind, Droplets, Mountain,
  RefreshCw, CheckCircle, Loader2, Thermometer, Activity,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { NER_CORRIDORS_GEO, type Corridor } from '@/lib/corridors';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

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

// ─────────────────────────────────────────────────────────────
// Styling helpers
// ─────────────────────────────────────────────────────────────
const RISK_COLORS: Record<RiskLevel, { text: string; bg: string; border: string; bar: string; badge: string }> = {
  LOW:      { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', bar: 'bg-emerald-500', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  MODERATE: { text: 'text-yellow-400',  bg: 'bg-yellow-500/10',  border: 'border-yellow-500/30',  bar: 'bg-yellow-500',  badge: 'bg-yellow-500/20  text-yellow-300  border-yellow-500/30'  },
  HIGH:     { text: 'text-orange-400',  bg: 'bg-orange-500/10',  border: 'border-orange-500/30',  bar: 'bg-orange-500',  badge: 'bg-orange-500/20  text-orange-300  border-orange-500/30'  },
  CRITICAL: { text: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/30',     bar: 'bg-red-500',     badge: 'bg-red-500/20     text-red-300     border-red-500/30'     },
};

function ProbabilityGauge({ prob, level }: { prob: number; level: RiskLevel }) {
  const pct = Math.round(prob * 100);
  const color = RISK_COLORS[level];
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" fill="none" stroke="#1e293b" strokeWidth="8" />
        <circle
          cx="50" cy="50" r="40" fill="none"
          stroke={level === 'LOW' ? '#10b981' : level === 'MODERATE' ? '#f59e0b' : level === 'HIGH' ? '#f97316' : '#ef4444'}
          strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute text-center">
        <div className={`text-lg font-black ${color.text}`}>{pct}%</div>
        <div className="text-slate-500 text-xs">risk</div>
      </div>
    </div>
  );
}

function WeatherBadge({ icon: Icon, label, value, unit }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  unit: string;
}) {
  return (
    <div className="flex items-center gap-2 bg-slate-800/60 rounded-xl px-3 py-2 border border-slate-700/40">
      <Icon className="w-3.5 h-3.5 text-slate-400" />
      <div>
        <div className="text-xs text-slate-500">{label}</div>
        <div className="text-sm font-bold text-white">{value}<span className="text-slate-400 text-xs ml-0.5">{unit}</span></div>
      </div>
    </div>
  );
}

function ContributionBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-400">{label}</span>
        <span className="text-slate-300 font-mono">{value}%</span>
      </div>
      <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function SegmentRow({ seg }: { seg: SegmentPrediction }) {
  const [open, setOpen] = useState(false);
  const c = RISK_COLORS[seg.risk_level];

  return (
    <div className={`rounded-xl border ${c.border} ${c.bg} overflow-hidden transition-all duration-200`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${c.bar}`} />
          <span className="text-sm font-medium text-slate-200">{seg.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${c.badge}`}>
            {Math.round(seg.risk_probability * 100)}%
          </span>
          <span className="text-slate-400 text-xs">{seg.distanceKm}km</span>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-slate-700/30 pt-3 space-y-4 animate-in slide-in-from-top-2 duration-200">
          {/* Live Weather */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Live Environmental Data</p>
            <div className="grid grid-cols-2 gap-2">
              <WeatherBadge icon={CloudRain}   label="Rainfall 24h"   value={seg.weather.precip_mm_24h}              unit="mm"   />
              <WeatherBadge icon={Droplets}    label="Soil Moisture"  value={(seg.weather.soil_moisture * 100).toFixed(1)} unit="%"  />
              <WeatherBadge icon={Wind}        label="Wind Speed"     value={seg.weather.wind_kmph}                  unit="km/h" />
              <WeatherBadge icon={Thermometer} label="Humidity"       value={seg.weather.humidity_pct.toFixed(0)}    unit="%"    />
            </div>
          </div>

          {/* Feature Contributions */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Risk Contribution (Model Explainability)</p>
            <div className="space-y-2">
              <ContributionBar label="Rainfall Impact"      value={seg.feature_contributions.rainfall}       color="bg-cyan-500"   />
              <ContributionBar label="Soil Saturation"      value={seg.feature_contributions.soil_moisture}  color="bg-blue-500"   />
              <ContributionBar label="Terrain (Slope+Elev)" value={seg.feature_contributions.slope_elevation} color="bg-amber-500"  />
              <ContributionBar label="Wind + Humidity"      value={seg.feature_contributions.wind_humidity}  color="bg-purple-500" />
              <ContributionBar label="Monsoon Season"       value={seg.feature_contributions.monsoon}        color="bg-pink-500"   />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RouteCard({ prediction, isRecommended }: { prediction: RoutePrediction; isRecommended: boolean }) {
  const [showSegments, setShowSegments] = useState(false);
  const c = RISK_COLORS[prediction.overall_risk_level];

  return (
    <div className={`relative rounded-2xl border p-5 ${c.bg} ${c.border} transition-all duration-300 ${isRecommended ? 'ring-2 ring-emerald-500/50' : ''}`}>
      {isRecommended && (
        <div className="absolute -top-3 left-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold px-3 py-1 rounded-full tracking-wider shadow-lg shadow-emerald-500/30 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          AI RECOMMENDED
        </div>
      )}

      <div className="flex items-start justify-between mb-5">
        <div className="flex-1 pr-4">
          <h3 className="font-bold text-white text-base mb-1">{prediction.route_name}</h3>
          <div className={`text-sm font-semibold ${c.text}`}>{prediction.overall_risk_level} RISK</div>
          {prediction.weather_source === 'live' && (
            <div className="flex items-center gap-1 mt-1">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-emerald-400 text-xs">Live weather data</span>
            </div>
          )}
        </div>
        <ProbabilityGauge prob={prediction.overall_risk_probability} level={prediction.overall_risk_level} />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label: 'Distance', value: `${prediction.total_distance_km}`, unit: 'km', color: 'text-slate-200' },
          { label: 'Est. Time', value: `${prediction.estimated_time_hrs}`, unit: 'hrs', color: 'text-blue-300' },
          { label: 'Delay', value: `+${prediction.delay_forecast_hrs}`, unit: 'hrs', color: prediction.delay_forecast_hrs > 0 ? 'text-orange-400' : 'text-emerald-400' },
        ].map(({ label, value, unit, color }) => (
          <div key={label} className="bg-slate-900/50 rounded-xl p-3 text-center border border-slate-700/20">
            <div className={`text-xl font-black ${color}`}>{value}</div>
            <div className="text-slate-500 text-xs">{label} ({unit})</div>
          </div>
        ))}
      </div>

      {/* Model info */}
      <div className="flex items-center gap-2 mb-4 text-xs text-slate-500">
        <Brain className="w-3 h-3 text-blue-400" />
        <span>Model v{prediction.model_version}</span>
        {prediction.model_accuracy > 0 && (
          <span className="text-blue-400">• {(prediction.model_accuracy * 100).toFixed(1)}% test accuracy</span>
        )}
      </div>

      {/* Segment breakdown toggle */}
      <button
        onClick={() => setShowSegments(!showSegments)}
        className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 transition-colors bg-slate-800/40 rounded-xl px-3 py-2 border border-slate-700/30"
      >
        <span className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5" />
          {showSegments ? 'Hide' : 'Show'} segment analysis ({prediction.segments.length} segments)
        </span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showSegments ? 'rotate-180' : ''}`} />
      </button>

      {showSegments && (
        <div className="mt-3 space-y-2 animate-in slide-in-from-top-4 duration-300">
          {prediction.segments.map((seg, i) => (
            <SegmentRow key={i} seg={seg} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────
export default function RiskRouteEngine() {
  const { t } = useLanguage();
  const [selectedCorridorId, setSelectedCorridorId] = useState(NER_CORRIDORS_GEO[0].id);
  const [predictions, setPredictions] = useState<RoutePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastAnalyzed, setLastAnalyzed] = useState<string | null>(null);

  const handleAnalyze = useCallback(async () => {
    const corridor = NER_CORRIDORS_GEO.find((c: Corridor) => c.id === selectedCorridorId);
    if (!corridor) return;

    setIsLoading(true);
    setError(null);
    setPredictions([]);

    try {
      const body = {
        routes: [
          { name: corridor.primary.name,   segments: corridor.primary.segments   },
          { name: corridor.alternate.name, segments: corridor.alternate.segments },
        ],
      };

      const res = await fetch('/api/risk-predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error((errData as { error?: string }).error || 'Prediction API error');
      }

      const data = await res.json() as { predictions: RoutePrediction[] };
      setPredictions(data.predictions);
      setLastAnalyzed(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get predictions');
    } finally {
      setIsLoading(false);
    }
  }, [selectedCorridorId]);

  const recommendedIndex = predictions.length === 2
    ? (predictions[0].overall_risk_probability <= predictions[1].overall_risk_probability ? 0 : 1)
    : -1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-xl">
            <Brain className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="font-bold text-white text-lg">AI-Powered Dynamic Risk Routing</h2>
            <p className="text-slate-400 text-xs mt-0.5">
              Logistic Regression · Trained on NER historical incidents · Real-time Open-Meteo weather
            </p>
          </div>
        </div>
        {lastAnalyzed && (
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {lastAnalyzed}
          </span>
        )}
      </div>

      {/* Formula explanation */}
      <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-4 text-xs font-mono text-slate-400 space-y-1">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-semibold text-slate-300 font-sans">ML Model Features</span>
        </div>
        <div>P(risk) = σ(w₀·RF₂₄ₕ + w₁·PeakRF + w₂·SoilMoisture + w₃·Slope + w₄·Elevation + w₅·Wind + w₆·Humidity + w₇·Monsoon + b)</div>
        <div className="text-slate-500">σ = sigmoid · Trained on 33+ verified NER incidents (2022–2024) + Open-Meteo historical</div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <label className="block text-sm text-slate-400 mb-2">{t.routing.selectCorridor}</label>
          <select
            value={selectedCorridorId}
            onChange={(e) => { setSelectedCorridorId(e.target.value); setPredictions([]); }}
            className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          >
            {NER_CORRIDORS_GEO.map((c: Corridor) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={handleAnalyze}
            disabled={isLoading}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 whitespace-nowrap"
          >
            {isLoading ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Analyzing…</>
            ) : (
              <><TrendingUp className="w-4 h-4" />{t.routing.analyze}</>
            )}
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-blue-400 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Fetching live weather from Open-Meteo for each waypoint…</span>
          </div>
          <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-4 space-y-2">
            {['Loading environmental data', 'Running ML inference', 'Computing edge weights', 'Comparing routes'].map((step, i) => (
              <div key={step} className={`flex items-center gap-2 text-xs transition-all duration-500`}
                   style={{ opacity: isLoading ? 1 : 0, animationDelay: `${i * 0.5}s` }}>
                <Loader2 className="w-3 h-3 animate-spin text-blue-400" />
                <span className="text-slate-400">{step}…</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-400 text-sm font-semibold">Prediction Error</p>
            <p className="text-red-300/70 text-xs mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {predictions.length === 2 && !isLoading && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Summary comparison */}
          <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Navigation className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-white text-sm">Route Comparison</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs">
              {predictions.map((p, i) => (
                <div key={i} className={`flex items-start gap-2 ${i === recommendedIndex ? 'text-emerald-300' : 'text-slate-400'}`}>
                  {i === recommendedIndex ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" /> : <span className="w-3.5" />}
                  <div>
                    <p className="font-medium">{p.route_name}</p>
                    <p className="text-slate-500">{p.total_distance_km}km · {p.estimated_time_hrs}h · {Math.round(p.overall_risk_probability * 100)}% risk</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {predictions.map((p, i) => (
              <RouteCard key={i} prediction={p} isRecommended={i === recommendedIndex} />
            ))}
          </div>

          <button
            onClick={handleAnalyze}
            className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors mx-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh with latest weather
          </button>
        </div>
      )}

      {/* Empty state */}
      {predictions.length === 0 && !isLoading && !error && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-600 gap-3">
          <Mountain className="w-14 h-14 opacity-20" />
          <p className="text-sm text-center">
            Select a corridor and click &quot;{t.routing.analyze}&quot;<br />
            <span className="text-xs text-slate-700">AI will fetch live weather for each waypoint</span>
          </p>
        </div>
      )}
    </div>
  );
}
