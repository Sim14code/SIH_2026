'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useLanguage } from '@/context/LanguageContext';
import { Truck, AlertTriangle, Clock, MapPin, Package, Zap } from 'lucide-react';

interface Vehicle {
  id: string;
  vehicle_number: string;
  driver_name: string;
  commodity_type: string;
  priority_level: 'HIGH' | 'MEDIUM' | 'NORMAL';
  origin_name: string;
  destination_name: string;
  lat: number;
  lng: number;
  speed_kmph: number;
  status: 'IDLE' | 'IN_TRANSIT' | 'DELAYED' | 'ARRIVED';
  last_updated: string;
  geofenceAlert?: boolean;
}

const HIGH_RISK_ZONES = [
  { lat: 93.6000, lng: 26.5700, name: 'NH-27 Nagaon Landslide', radiusKm: 15 },
  { lat: 94.1100, lng: 25.6700, name: 'Kohima-Imphal Critical Zone', radiusKm: 20 },
  { lat: 92.8000, lng: 24.8000, name: 'Cachar Flood Zone', radiusKm: 25 },
  { lat: 92.6500, lng: 27.0000, name: 'Bhalukpong Bridge Zone', radiusKm: 10 },
];

function haversineDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function isInHighRiskZone(lat: number, lng: number): boolean {
  return HIGH_RISK_ZONES.some(
    (zone) => haversineDistanceKm(lat, lng, zone.lng, zone.lat) < zone.radiusKm
  );
}

const STATUS_COLORS: Record<Vehicle['status'], string> = {
  IN_TRANSIT: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  IDLE: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  DELAYED: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  ARRIVED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

const PRIORITY_COLORS: Record<Vehicle['priority_level'], string> = {
  HIGH: 'text-red-400',
  MEDIUM: 'text-yellow-400',
  NORMAL: 'text-slate-400',
};

const COMMODITY_ICONS: Record<string, string> = {
  'Medical Oxygen Cylinders': '🫁',
  'Vaccines (COVID Booster)': '💉',
  'Essential Food Rations (Rice)': '🍚',
  'Military Disaster Aid': '🪖',
  'Cement & Construction Materials': '🏗️',
  'Essential Food Rations (Dal)': '🫘',
  'Medical Supplies (Vaccines)': '💊',
  'Petroleum (Diesel)': '⛽',
};

export default function LiveFleetTracker() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [geofenceAlerts, setGeofenceAlerts] = useState<string[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const simulatorRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { t } = useLanguage();
  const supabase = createClient();

  const parseVehicles = useCallback((data: Record<string, unknown>[]): Vehicle[] => {
    return data.map((v) => {
      let lat = 26.1445;
      let lng = 91.7362;
      if (v.current_location && typeof v.current_location === 'object') {
        const loc = v.current_location as Record<string, unknown>;
        if (loc.coordinates && Array.isArray(loc.coordinates)) {
          lng = (loc.coordinates as number[])[0];
          lat = (loc.coordinates as number[])[1];
        }
      }
      const inDanger = isInHighRiskZone(lat, lng);
      if (inDanger && !geofenceAlerts.includes(v.id as string)) {
        setGeofenceAlerts((prev) => [...new Set([...prev, v.id as string])]);
      }
      return {
        id: v.id as string,
        vehicle_number: v.vehicle_number as string,
        driver_name: v.driver_name as string,
        commodity_type: v.commodity_type as string,
        priority_level: v.priority_level as Vehicle['priority_level'],
        origin_name: v.origin_name as string,
        destination_name: v.destination_name as string,
        lat,
        lng,
        speed_kmph: Number(v.speed_kmph) || 0,
        status: v.status as Vehicle['status'],
        last_updated: v.last_updated as string,
        geofenceAlert: inDanger,
      };
    });
  }, [geofenceAlerts]);

  const fetchVehicles = useCallback(async () => {
    const { data } = await supabase.from('vehicles').select('*').order('priority_level');
    if (data) setVehicles(parseVehicles(data as Record<string, unknown>[]));
  }, [supabase, parseVehicles]);

  useEffect(() => {
    fetchVehicles();

    const channel = supabase
      .channel('realtime_vehicles_tracker')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vehicles' }, () => {
        fetchVehicles();
      })
      .subscribe();

    simulatorRef.current = setInterval(async () => {
      const { data } = await supabase.from('vehicles').select('id, current_location, speed_kmph, status');
      if (!data) return;

      for (const v of data) {
        if (v.status === 'ARRIVED' || v.status === 'IDLE') continue;
        const loc = v.current_location as Record<string, unknown> | null;
        if (!loc?.coordinates) continue;
        const coords = loc.coordinates as [number, number];
        const newLng = coords[0] + (Math.random() - 0.48) * 0.005;
        const newLat = coords[1] + (Math.random() - 0.48) * 0.004;
        const newSpeed = Math.max(0, Number(v.speed_kmph) + (Math.random() - 0.5) * 5);
        await supabase
          .from('vehicles')
          .update({
            current_location: `SRID=4326;POINT(${newLng} ${newLat})`,
            speed_kmph: newSpeed.toFixed(1),
            last_updated: new Date().toISOString(),
          })
          .eq('id', v.id);
      }
    }, 3000);

    return () => {
      supabase.removeChannel(channel);
      if (simulatorRef.current) clearInterval(simulatorRef.current);
    };
  }, [supabase, fetchVehicles]);

  const alertVehicles = vehicles.filter((v) => v.geofenceAlert);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 rounded-xl">
            <Truck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="font-bold text-white text-lg">{t.fleet.title}</h2>
            <p className="text-slate-400 text-sm">{t.fleet.activeFleets}: {vehicles.length} • {t.fleet.gpsUpdate}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-xs text-emerald-400 font-medium">{t.stats.live}</span>
        </div>
      </div>

      {/* Geofence Alerts Banner */}
      {alertVehicles.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3 animate-pulse">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-400 text-sm">{t.fleet.geofenceAlert}</p>
            <p className="text-red-300/70 text-xs mt-1">
              {t.fleet.vehiclesInDanger}: {alertVehicles.map(v => v.vehicle_number).join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* Fleet Grid */}
      <div className="grid grid-cols-1 gap-3">
        {vehicles.map((vehicle) => (
          <div
            key={vehicle.id}
            onClick={() => setSelectedVehicle(selectedVehicle === vehicle.id ? null : vehicle.id)}
            className={`rounded-xl border p-4 cursor-pointer transition-all duration-200 hover:border-slate-500 ${
              vehicle.geofenceAlert
                ? 'bg-red-500/5 border-red-500/40'
                : 'bg-slate-800/50 border-slate-700/50'
            } ${selectedVehicle === vehicle.id ? 'ring-2 ring-blue-500/50' : ''}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{COMMODITY_ICONS[vehicle.commodity_type] || '🚛'}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm font-mono">{vehicle.vehicle_number}</span>
                    {vehicle.geofenceAlert && (
                      <AlertTriangle className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                    )}
                    <span className={`text-xs font-semibold ${PRIORITY_COLORS[vehicle.priority_level]}`}>
                      {vehicle.priority_level === 'HIGH' ? t.fleet.highPriority : vehicle.priority_level === 'MEDIUM' ? t.fleet.mediumPriority : t.fleet.normalPriority}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs">{vehicle.commodity_type}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 justify-end mb-1">
                  <Zap className="w-3 h-3 text-yellow-400" />
                  <span className="font-mono font-bold text-white text-sm">{vehicle.speed_kmph.toFixed(1)}</span>
                  <span className="text-slate-400 text-xs">{t.common.kmph}</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_COLORS[vehicle.status]}`}>
                  {t.status[vehicle.status === 'IN_TRANSIT' ? 'inTransit' : vehicle.status === 'IDLE' ? 'idle' : vehicle.status === 'DELAYED' ? 'delayed' : 'arrived']}
                </span>
              </div>
            </div>

            {/* Expanded Details */}
            {selectedVehicle === vehicle.id && (
              <div className="mt-3 pt-3 border-t border-slate-700/50 grid grid-cols-2 gap-3 text-xs animate-in slide-in-from-top-2 duration-200">
                <div className="flex items-center gap-2 text-slate-300">
                  <MapPin className="w-3 h-3 text-emerald-400" />
                  <span><span className="text-slate-500">{t.fleet.origin}:</span> {vehicle.origin_name}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <MapPin className="w-3 h-3 text-blue-400" />
                  <span><span className="text-slate-500">{t.fleet.destination}:</span> {vehicle.destination_name}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Package className="w-3 h-3 text-purple-400" />
                  <span><span className="text-slate-500">{t.fleet.driver}:</span> {vehicle.driver_name}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{new Date(vehicle.last_updated).toLocaleTimeString()}</span>
                </div>
                <div className="col-span-2 text-slate-400 font-mono">
                  GPS: {vehicle.lat.toFixed(4)}°N, {vehicle.lng.toFixed(4)}°E
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {vehicles.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-slate-500">
          <Truck className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-sm">{t.common.loading}</p>
        </div>
      )}
    </div>
  );
}
