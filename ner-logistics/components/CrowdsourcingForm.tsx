'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useLanguage } from '@/context/LanguageContext';
import { MapPin, Upload, Wifi, WifiOff, CheckCircle, AlertCircle, Loader2, Camera } from 'lucide-react';

interface OfflineReport {
  id: string;
  title: string;
  state: string;
  district: string;
  highway: string;
  incident_type: string;
  severity: string;
  description: string;
  reporter_name: string;
  lat: number;
  lng: number;
  created_at: string;
  photoDataUrl?: string;
}

const DB_NAME = 'ner_logistics_offline';
const STORE_NAME = 'pending_reports';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    req.onsuccess = (e) => resolve((e.target as IDBOpenDBRequest).result);
    req.onerror = () => reject(req.error);
  });
}

async function saveToIndexedDB(report: OfflineReport): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(report);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getPendingReports(): Promise<OfflineReport[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

async function deleteFromIndexedDB(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

const NER_STATES = ['Assam', 'Meghalaya', 'Nagaland', 'Manipur', 'Mizoram', 'Tripura', 'Arunachal Pradesh', 'Sikkim'];

export default function CrowdsourcingForm() {
  const { t } = useLanguage();
  const supabase = createClient();
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [locationStatus, setLocationStatus] = useState<'idle' | 'locating' | 'success' | 'error'>('idle');

  const [form, setForm] = useState({
    title: '',
    state: 'Assam',
    district: '',
    highway: '',
    incident_type: 'LANDSLIDE',
    severity: 'MODERATE',
    description: '',
    reporter_name: '',
    lat: 0,
    lng: 0,
    photoDataUrl: '',
  });

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOnline(navigator.onLine);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadPendingCount = useCallback(async () => {
    const reports = await getPendingReports();
    setPendingCount(reports.length);
  }, []);

  useEffect(() => {
    loadPendingCount();
  }, [loadPendingCount]);

  const detectLocation = () => {
    if (!navigator.geolocation) return;
    setLocationStatus('locating');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({ ...f, lat: pos.coords.latitude, lng: pos.coords.longitude }));
        setLocationStatus('success');
      },
      () => setLocationStatus('error'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const report: OfflineReport = {
      ...form,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };

    if (!isOnline) {
      await saveToIndexedDB(report);
      await loadPendingCount();
      setForm({ title: '', state: 'Assam', district: '', highway: '', incident_type: 'LANDSLIDE', severity: 'MODERATE', description: '', reporter_name: '', lat: 0, lng: 0, photoDataUrl: '' });
      setSyncStatus('idle');
      return;
    }

    await syncReport(report);
  };

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((f) => ({ ...f, photoDataUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const syncReport = async (report: OfflineReport) => {
    setSyncStatus('syncing');

    let imageUrl = null;
    if (report.photoDataUrl) {
      try {
        const response = await fetch(report.photoDataUrl);
        const blob = await response.blob();
        const filename = `${report.id}-${Date.now()}.jpg`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('incident-evidence')
          .upload(filename, blob, { contentType: blob.type });

        if (!uploadError && uploadData) {
          const { data: publicUrlData } = supabase.storage
            .from('incident-evidence')
            .getPublicUrl(filename);
          imageUrl = publicUrlData.publicUrl;
        }
      } catch (err) {
        console.error("Image upload failed", err);
      }
    }

    const { error } = await supabase.from('incidents').insert({
      title: report.title,
      state: report.state,
      district: report.district,
      highway: report.highway,
      incident_type: report.incident_type,
      severity: report.severity,
      description: report.description,
      reporter_name: report.reporter_name,
      location: `SRID=4326;POINT(${report.lng} ${report.lat})`,
      status: 'ACTIVE',
      image_url: imageUrl,
    });

    if (error) {
      setSyncStatus('error');
      await saveToIndexedDB(report);
      await loadPendingCount();
    } else {
      setSyncStatus('success');
      setForm({ title: '', state: 'Assam', district: '', highway: '', incident_type: 'LANDSLIDE', severity: 'MODERATE', description: '', reporter_name: '', lat: 0, lng: 0, photoDataUrl: '' });
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  const syncAllPending = useCallback(async () => {
    if (!isOnline) return;
    setSyncStatus('syncing');
    const reports = await getPendingReports();
    let success = 0;
    for (const report of reports) {
      let imageUrl = null;
      if (report.photoDataUrl) {
        try {
          const response = await fetch(report.photoDataUrl);
          const blob = await response.blob();
          const filename = `${report.id}-${Date.now()}.jpg`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('incident-evidence')
            .upload(filename, blob, { contentType: blob.type });

          if (!uploadError && uploadData) {
            const { data: publicUrlData } = supabase.storage
              .from('incident-evidence')
              .getPublicUrl(filename);
            imageUrl = publicUrlData.publicUrl;
          }
        } catch (err) {
          console.error("Image upload failed", err);
        }
      }

      const { error } = await supabase.from('incidents').insert({
        title: report.title,
        state: report.state,
        district: report.district,
        highway: report.highway,
        incident_type: report.incident_type,
        severity: report.severity,
        description: report.description,
        reporter_name: report.reporter_name,
        location: `SRID=4326;POINT(${report.lng} ${report.lat})`,
        status: 'ACTIVE',
        image_url: imageUrl,
      });
      if (!error) {
        await deleteFromIndexedDB(report.id);
        success++;
      }
    }
    await loadPendingCount();
    setSyncStatus(success > 0 ? 'success' : 'error');
    setTimeout(() => setSyncStatus('idle'), 3000);
  }, [isOnline, supabase, loadPendingCount]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && pendingCount > 0) {
      syncAllPending();
    }
  }, [isOnline, pendingCount, syncAllPending]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-white text-lg">{t.report.title}</h2>
          <p className="text-slate-400 text-sm mt-1">{t.report.subtitle}</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
          isOnline
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
          {isOnline ? t.report.onlineBadge : t.report.offlineBadge}
        </div>
      </div>

      {/* Pending Sync Banner */}
      {pendingCount > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Upload className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400 text-sm font-semibold">
              {pendingCount} — {t.report.offlineQueue}
            </span>
          </div>
          {isOnline && (
            <button
              onClick={syncAllPending}
              className="text-xs bg-yellow-500 text-black font-bold px-3 py-1.5 rounded-lg hover:bg-yellow-400 transition-colors"
            >
              {t.report.syncNow}
            </button>
          )}
        </div>
      )}

      {/* Sync Status */}
      {syncStatus === 'syncing' && (
        <div className="flex items-center gap-2 text-blue-400 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          {t.report.syncing}
        </div>
      )}
      {syncStatus === 'success' && (
        <div className="flex items-center gap-2 text-emerald-400 text-sm">
          <CheckCircle className="w-4 h-4" />
          {t.report.syncSuccess}
        </div>
      )}
      {syncStatus === 'error' && (
        <div className="flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          {t.common.error} — {t.report.offlineQueue}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Location Detection */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <label className="block text-sm text-slate-400 mb-3 font-medium">{t.report.yourLocation}</label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={detectLocation}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-all duration-200"
            >
              {locationStatus === 'locating' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <MapPin className="w-4 h-4" />
              )}
              {t.report.detectLocation}
            </button>
            {locationStatus === 'success' && (
              <span className="text-emerald-400 text-sm font-mono">
                {form.lat.toFixed(5)}°N, {form.lng.toFixed(5)}°E
              </span>
            )}
            {locationStatus === 'error' && (
              <span className="text-red-400 text-xs">{t.report.locationDenied}</span>
            )}
          </div>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm text-slate-400 mb-1">{t.report.incidentTitle} *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value.slice(0, 200) }))}
              placeholder={t.report.placeholderTitle}
              className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-600"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">{t.report.incidentType} *</label>
            <select
              value={form.incident_type}
              onChange={(e) => setForm((f) => ({ ...f, incident_type: e.target.value }))}
              className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            >
              <option value="LANDSLIDE">{t.report.landslide}</option>
              <option value="FLOOD">{t.report.flood}</option>
              <option value="BRIDGE_FAILURE">{t.report.bridgeFailure}</option>
              <option value="TRAFFIC_CONGESTION">{t.report.congestion}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">{t.report.severity} *</label>
            <select
              value={form.severity}
              onChange={(e) => setForm((f) => ({ ...f, severity: e.target.value }))}
              className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            >
              <option value="LOW">{t.report.low}</option>
              <option value="MODERATE">{t.report.moderate}</option>
              <option value="CRITICAL">{t.report.critical}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">{t.report.state} *</label>
            <select
              value={form.state}
              onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
              className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            >
              {NER_STATES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">{t.report.district} *</label>
            <input
              type="text"
              required
              value={form.district}
              onChange={(e) => setForm((f) => ({ ...f, district: e.target.value.slice(0, 100) }))}
              placeholder={t.report.placeholderDistrict}
              className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-600"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">{t.report.highway} *</label>
            <input
              type="text"
              required
              value={form.highway}
              onChange={(e) => setForm((f) => ({ ...f, highway: e.target.value.slice(0, 50) }))}
              placeholder={t.report.placeholderHighway}
              className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-600"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">{t.report.reporterName}</label>
            <input
              type="text"
              value={form.reporter_name}
              onChange={(e) => setForm((f) => ({ ...f, reporter_name: e.target.value.slice(0, 100) }))}
              placeholder={t.report.placeholderReporter}
              className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-600"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm text-slate-400 mb-1">{t.report.photoEvidence}</label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 cursor-pointer text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors border border-slate-600">
                <Camera className="w-4 h-4" />
                {t.report.captureUpload}
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment" 
                  onChange={handleImageCapture} 
                  className="hidden" 
                />
              </label>
              {form.photoDataUrl && (
                <img src={form.photoDataUrl} alt="Preview" className="h-12 w-12 object-cover rounded shadow border border-slate-600" />
              )}
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm text-slate-400 mb-1">{t.report.description}</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value.slice(0, 1000) }))}
              placeholder={t.report.placeholderDescription}
              className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-600 resize-none"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5 flex items-center justify-center gap-2"
        >
          {isOnline ? (
            <>
              <Upload className="w-4 h-4" />
              {t.report.submit}
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4" />
              {t.report.saveOffline}
            </>
          )}
        </button>
      </form>
    </div>
  );
}
