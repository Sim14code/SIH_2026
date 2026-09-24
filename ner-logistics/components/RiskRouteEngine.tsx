'use client';

import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { NER_CORRIDORS, buildRouteResult, RouteResult } from '@/lib/risk-calculator';
import { TrendingUp, AlertTriangle, Clock, Navigation, ChevronDown, BarChart3 } from 'lucide-react';

function getRiskColor(level: RouteResult['riskLevel']): string {
  const colors: Record<RouteResult['riskLevel'], string> = {
    LOW: 'text-emerald-400',
    MODERATE: 'text-yellow-400',
    HIGH: 'text-orange-400',
    CRITICAL: 'text-red-400',
  };
  return colors[level];
}

function getRiskBg(level: RouteResult['riskLevel']): string {
  const colors: Record<RouteResult['riskLevel'], string> = {
    LOW: 'bg-emerald-500/10 border-emerald-500/30',
    MODERATE: 'bg-yellow-500/10 border-yellow-500/30',
    HIGH: 'bg-orange-500/10 border-orange-500/30',
    CRITICAL: 'bg-red-500/10 border-red-500/30',
  };
  return colors[level];
}

function RiskBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function RouteCard({ result, isRecommended, t }: { result: RouteResult; isRecommended: boolean; t: { routing: { primaryRoute: string; alternateRoute: string; distance: string; estimatedTime: string; delayForecast: string; riskLevel: string; riskBreakdown: string; rainfall: string; landslide: string; degradation: string; recommended: string } }; }) {
  const maxContrib = Math.max(
    result.riskBreakdown.rainfallContribution,
    result.riskBreakdown.landslideContribution,
    result.riskBreakdown.degradationContribution,
    1
  );

  return (
    <div className={`relative rounded-2xl border p-5 transition-all duration-300 ${getRiskBg(result.riskLevel)} ${isRecommended ? 'ring-2 ring-emerald-500/50' : ''}`}>
      {isRecommended && (
        <div className="absolute -top-3 left-4 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full tracking-wider shadow-lg shadow-emerald-500/30">
          ✓ {t.routing.recommended}
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-white text-base">{result.name}</h3>
          <div className={`text-sm font-semibold mt-1 ${getRiskColor(result.riskLevel)}`}>
            {result.riskLevel} RISK
          </div>
        </div>
        <Navigation className={`w-5 h-5 ${getRiskColor(result.riskLevel)}`} />
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-slate-800/50 rounded-xl p-3 text-center">
          <div className="text-emerald-400 font-bold text-lg">{result.totalDistanceKm}</div>
          <div className="text-slate-400 text-xs">{t.routing.distance} (km)</div>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-3 text-center">
          <div className="text-blue-400 font-bold text-lg">{result.estimatedTimeHrs}h</div>
          <div className="text-slate-400 text-xs">{t.routing.estimatedTime}</div>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-3 text-center">
          <div className={`font-bold text-lg ${result.delayForecastHrs > 0 ? 'text-orange-400' : 'text-emerald-400'}`}>
            +{result.delayForecastHrs}h
          </div>
          <div className="text-slate-400 text-xs">{t.routing.delayForecast}</div>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t.routing.riskBreakdown}</p>
        {[
          { label: t.routing.rainfall, value: result.riskBreakdown.rainfallContribution, color: 'bg-cyan-500' },
          { label: t.routing.landslide, value: result.riskBreakdown.landslideContribution, color: 'bg-red-500' },
          { label: t.routing.degradation, value: result.riskBreakdown.degradationContribution, color: 'bg-orange-500' },
        ].map(({ label, value, color }) => (
          <div key={label}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300">{label}</span>
              <span className="text-slate-400 font-mono">{value.toFixed(1)}</span>
            </div>
            <RiskBar value={value} max={maxContrib} color={color} />
          </div>
        ))}
      </div>

      {/* Segment Details */}
      <details className="mt-4 group">
        <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-300 transition-colors flex items-center gap-1">
          <ChevronDown className="w-3 h-3 group-open:rotate-180 transition-transform" />
          View segment details
        </summary>
        <div className="mt-2 space-y-1">
          {result.segments.map((seg, i) => (
            <div key={i} className="flex justify-between text-xs bg-slate-800/30 rounded-lg px-3 py-2">
              <span className="text-slate-300">{seg.name}</span>
              <span className="text-slate-400 font-mono">{seg.distanceKm}km | RF:{seg.rainfallMmHr} LS:{seg.landslideRiskScore}</span>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}

export default function RiskRouteEngine() {
  const { t } = useLanguage();
  const [selectedCorridorId, setSelectedCorridorId] = useState(NER_CORRIDORS[0].id);
  const [primaryResult, setPrimaryResult] = useState<RouteResult | null>(null);
  const [alternateResult, setAlternateResult] = useState<RouteResult | null>(null);
  const [analyzed, setAnalyzed] = useState(false);

  const handleAnalyze = () => {
    const corridor = NER_CORRIDORS.find((c) => c.id === selectedCorridorId);
    if (!corridor) return;
    const primary = buildRouteResult(corridor.primary.name, corridor.primary.segments);
    const alternate = buildRouteResult(corridor.alternate.name, corridor.alternate.segments);
    setPrimaryResult(primary);
    setAlternateResult(alternate);
    setAnalyzed(true);
  };

  const recommendedRoute = primaryResult && alternateResult
    ? (primaryResult.riskWeight <= alternateResult.riskWeight ? 'primary' : 'alternate')
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-500/20 rounded-xl">
          <BarChart3 className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h2 className="font-bold text-white text-lg">{t.routing.title}</h2>
          <p className="text-slate-400 text-sm">Formula: Distance × (1 + 0.05·RF + 0.25·LS + 0.15·RD)</p>
        </div>
      </div>

      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <label className="block text-sm text-slate-400 mb-2">{t.routing.selectCorridor}</label>
          <select
            value={selectedCorridorId}
            onChange={(e) => { setSelectedCorridorId(e.target.value); setAnalyzed(false); }}
            className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          >
            {NER_CORRIDORS.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </div>
        <button
          onClick={handleAnalyze}
          className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 flex items-center gap-2"
        >
          <TrendingUp className="w-4 h-4" />
          {t.routing.analyze}
        </button>
      </div>

      {analyzed && primaryResult && alternateResult && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <RouteCard
            result={primaryResult}
            isRecommended={recommendedRoute === 'primary'}
            t={t}
          />
          <RouteCard
            result={alternateResult}
            isRecommended={recommendedRoute === 'alternate'}
            t={t}
          />
        </div>
      )}

      {!analyzed && (
        <div className="flex flex-col items-center justify-center py-16 text-slate-500">
          <TrendingUp className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-sm">Select a corridor and click &quot;{t.routing.analyze}&quot; to compare routes</p>
        </div>
      )}
    </div>
  );
}
