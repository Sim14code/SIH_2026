'use client';

import { useState } from 'react';
import { useAuth, UserRole } from '@/context/AuthContext';
import { Shield, ShieldAlert, Users, Loader2 } from 'lucide-react';

export default function AuthModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { loginAs, isLoading } = useAuth();
  const [loadingRole, setLoadingRole] = useState<UserRole | null>(null);

  if (!isOpen) return null;

  const handleDemoLogin = async (role: UserRole) => {
    setLoadingRole(role);
    await loginAs(role);
    setLoadingRole(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          ✕
        </button>

        <div className="text-center mb-6">
          <Shield className="w-12 h-12 text-blue-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-white">Platform Authentication</h2>
          <p className="text-sm text-slate-400 mt-1">Select a demo role to test RBAC features</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => handleDemoLogin('ADMIN_DISPATCHER')}
            disabled={isLoading}
            className="w-full flex items-center justify-between p-4 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-left transition-colors group"
          >
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-red-400" />
              <div>
                <div className="text-white font-bold text-sm group-hover:text-red-400 transition-colors">Admin Dispatcher</div>
                <div className="text-slate-400 text-xs mt-0.5">Full access, verify/clear incidents</div>
              </div>
            </div>
            {loadingRole === 'ADMIN_DISPATCHER' && <Loader2 className="w-4 h-4 text-red-400 animate-spin" />}
          </button>

          <button
            onClick={() => handleDemoLogin('FIELD_OFFICER')}
            disabled={isLoading}
            className="w-full flex items-center justify-between p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-left transition-colors group"
          >
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-emerald-400" />
              <div>
                <div className="text-white font-bold text-sm group-hover:text-emerald-400 transition-colors">Field Officer</div>
                <div className="text-slate-400 text-xs mt-0.5">Submit incidents, view fleet status</div>
              </div>
            </div>
            {loadingRole === 'FIELD_OFFICER' && <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />}
          </button>

          <button
            onClick={() => handleDemoLogin('PUBLIC_REPORTER')}
            disabled={isLoading}
            className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-600 bg-slate-800 hover:bg-slate-700 text-left transition-colors group"
          >
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-slate-400" />
              <div>
                <div className="text-white font-bold text-sm">Public Reporter</div>
                <div className="text-slate-400 text-xs mt-0.5">Read-only map, report submissions</div>
              </div>
            </div>
            {loadingRole === 'PUBLIC_REPORTER' && <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />}
          </button>
        </div>
        
        <div className="mt-6 pt-4 border-t border-slate-800 text-center text-xs text-slate-500">
          Logs in securely via Supabase Auth + RLS
        </div>
      </div>
    </div>
  );
}
