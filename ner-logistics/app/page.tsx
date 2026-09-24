'use client';

import { useState } from 'react';
import {
  MapIcon,
  TrendingUp,
  Truck,
  Radio,
  Globe2,
  Activity,
  ChevronRight,
  Shield,
  Mountain,
  CloudRain,
} from 'lucide-react';
import MapWrapper from '@/components/MapWrapper';
import RiskRouteEngine from '@/components/RiskRouteEngine';
import LiveFleetTracker from '@/components/LiveFleetTracker';
import CrowdsourcingForm from '@/components/CrowdsourcingForm';
import LanguageToggle from '@/components/LanguageToggle';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import AuthModal from '@/components/AuthModal';
import { useEffect } from 'react';

type Tab = 'map' | 'routing' | 'fleet' | 'report';

const STATS = [
  { icon: Mountain, label: 'Active Incidents', value: '13', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
  { icon: Truck, label: 'Fleet Vehicles', value: '8', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  { icon: CloudRain, label: 'Corridors Monitored', value: '7', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  { icon: Shield, label: 'States Covered', value: '8', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
];

export default function HomePage() {
  const { t } = useLanguage();
  const { user, role, logout, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('map');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    if (role === 'FIELD_OFFICER') setActiveTab('report');
  }, [role]);

  const allTabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'map', label: t.nav.map, icon: MapIcon },
    { id: 'routing', label: t.nav.routing, icon: TrendingUp },
    { id: 'fleet', label: t.nav.fleet, icon: Truck },
    { id: 'report', label: t.nav.report, icon: Radio },
  ];

  const tabs = allTabs.filter(tab => {
    if (role === 'PUBLIC_REPORTER') return tab.id === 'map' || tab.id === 'report';
    if (role === 'FIELD_OFFICER') return tab.id === 'map' || tab.id === 'report' || tab.id === 'fleet';
    return true; // ADMIN_DISPATCHER sees all
  });

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <Globe2 className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full animate-pulse border-2 border-slate-900" />
              </div>
              <div>
                <h1 className="text-white font-bold text-base leading-tight tracking-tight">
                  {t.appName}
                </h1>
                <p className="text-slate-500 text-xs hidden sm:block">
                  SIH 2026 · NER Infrastructure
                </p>
              </div>
            </div>

            {/* Live indicator & Auth Profile */}
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs text-emerald-400 font-semibold tracking-wider">LIVE</span>
              </div>
              
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-bold text-white">{user?.full_name}</div>
                    <div className="text-xs text-emerald-400">{role.replace('_', ' ')}</div>
                  </div>
                  <button onClick={logout} className="text-xs bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg border border-slate-700 transition-colors">
                    Logout
                  </button>
                </div>
              ) : (
                <button onClick={() => setIsAuthModalOpen(true)} className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg font-semibold shadow-lg shadow-blue-500/20 transition-all">
                  Login
                </button>
              )}

              {/* Language Toggle */}
              <LanguageToggle />
            </div>
          </div>
        </div>
      </header>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      <main className="flex-1 max-w-screen-2xl mx-auto w-full px-4 sm:px-6 py-6">
        {/* Hero Stats Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {STATS.map(({ icon: Icon, label, value, color, bg }) => (
            <div
              key={label}
              className={`flex items-center gap-3 rounded-xl border p-4 ${bg} transition-all duration-200 hover:scale-105`}
            >
              <div className={`p-2 rounded-lg bg-slate-900/50`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <div>
                <div className={`text-2xl font-bold ${color}`}>{value}</div>
                <div className="text-slate-400 text-xs leading-tight">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 bg-slate-900/50 border border-slate-800/50 rounded-2xl p-1.5 mb-6 overflow-x-auto">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                activeTab === id
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {activeTab === id && <ChevronRight className="w-3 h-3 opacity-70" />}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="animate-in fade-in duration-300">
          {activeTab === 'map' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-white text-lg">{t.map.title}</h2>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-1.5 bg-emerald-500 rounded-full inline-block" />
                    {t.map.green}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-1.5 bg-yellow-500 rounded-full inline-block" />
                    {t.map.yellow}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-1.5 bg-red-500 rounded-full inline-block" />
                    {t.map.red}
                  </span>
                </div>
              </div>
              <div className="h-[calc(100vh-340px)] min-h-[450px] rounded-2xl overflow-hidden border border-slate-800/50 shadow-2xl">
                <MapWrapper />
              </div>
            </div>
          )}

          {activeTab === 'routing' && (
            <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6">
              <RiskRouteEngine />
            </div>
          )}

          {activeTab === 'fleet' && (
            <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6">
              <LiveFleetTracker />
            </div>
          )}

          {activeTab === 'report' && (
            <div className="max-w-2xl mx-auto bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6">
              <CrowdsourcingForm />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 py-4 text-center text-xs text-slate-600">
        <p>NER LogisticsAI · SIH 2026 · Powered by Supabase + Next.js + PostGIS</p>
      </footer>
    </div>
  );
}
