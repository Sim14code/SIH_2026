'use client';

import { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline, LayerGroup, useMap } from 'react-leaflet';
import { createClient } from '@/lib/supabase/client';
import { useLanguage } from '@/context/LanguageContext';
import 'leaflet/dist/leaflet.css';

interface Incident {
  id: string;
  title: string;
  state: string;
  district: string;
  highway: string;
  incident_type: 'LANDSLIDE' | 'FLOOD' | 'BRIDGE_FAILURE' | 'TRAFFIC_CONGESTION';
  severity: 'LOW' | 'MODERATE' | 'CRITICAL';
  status: 'ACTIVE' | 'VERIFIED' | 'CLEARED';
  lat: number;
  lng: number;
  estimated_clearance_hours: number;
  reporter_name: string;
  description: string;
  created_at: string;
}

interface ParsedIncident {
  id: string;
  title: string;
  state: string;
  district: string;
  highway: string;
  incident_type: Incident['incident_type'];
  severity: Incident['severity'];
  status: Incident['status'];
  lat: number;
  lng: number;
  estimated_clearance_hours: number;
  reporter_name: string;
  description: string;
  created_at: string;
}

interface SupplyHub {
  id: string;
  name: string;
  type: string;
  lat: number;
  lng: number;
}

// NER corridors as polylines (simplified)
const NER_CORRIDORS_LINES = [
  { name: 'NH-27 Brahmaputra Corridor', points: [[26.1445, 91.7362], [26.3516, 92.6804], [26.7509, 94.2177], [27.4830, 94.9120]] as [number, number][], healthScore: 55 },
  { name: 'Shillong Highway NH-6', points: [[26.1445, 91.7362], [25.9100, 92.0000], [25.5788, 91.8933]] as [number, number][], healthScore: 45 },
  { name: 'Barak Valley Route', points: [[25.5788, 91.8933], [24.8333, 92.7789], [23.8315, 91.2868]] as [number, number][], healthScore: 30 },
  { name: 'Nagaland-Manipur NH-2', points: [[25.9097, 93.7228], [25.6700, 94.1100], [24.8170, 93.9368]] as [number, number][], healthScore: 40 },
  { name: 'Mizoram Link NH-306', points: [[24.8333, 92.7789], [23.7272, 92.7176]] as [number, number][], healthScore: 60 },
  { name: 'Arunachal Highway NH-13', points: [[26.6638, 92.8001], [27.0000, 92.6500], [27.2700, 92.4100], [27.5860, 91.8596]] as [number, number][], healthScore: 35 },
  { name: 'Sikkim Lifeline NH-10', points: [[26.7221, 88.3952], [27.1700, 88.5300], [27.3314, 88.6138]] as [number, number][], healthScore: 50 },
];

function getCorridorColor(score: number): string {
  if (score >= 80) return '#10b981'; // green
  if (score >= 50) return '#f59e0b'; // yellow
  return '#ef4444'; // red
}

function getSeverityColor(severity: string, status: string): string {
  if (status === 'CLEARED') return '#10b981';
  if (severity === 'CRITICAL') return '#ef4444';
  if (severity === 'MODERATE') return '#f59e0b';
  return '#3b82f6';
}

function getIncidentIcon(type: string): string {
  const icons: Record<string, string> = {
    LANDSLIDE: '🏔️',
    FLOOD: '🌊',
    BRIDGE_FAILURE: '🌉',
    TRAFFIC_CONGESTION: '🚦',
  };
  return icons[type] || '⚠️';
}

function MapRecenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function MapContainerComponent() {
  const [incidents, setIncidents] = useState<ParsedIncident[]>([]);
  const [supplyHubs, setSupplyHubs] = useState<SupplyHub[]>([]);
  const [showIncidents, setShowIncidents] = useState(true);
  const [showSupplyHubs, setShowSupplyHubs] = useState(true);
  const [showWeather, setShowWeather] = useState(false);
  const { t } = useLanguage();
  const supabase = createClient();

  const fetchIncidents = useCallback(async () => {
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch incidents');
      return;
    }

    if (data) {
      const parsed: ParsedIncident[] = data.map((inc: Record<string, unknown>) => {
        let lat = 26.1445;
        let lng = 91.7362;
        // Parse PostGIS geometry — Supabase returns lat/lng from ST_AsGeoJSON or as-is
        if (inc.location && typeof inc.location === 'object') {
          const loc = inc.location as Record<string, unknown>;
          if (loc.coordinates && Array.isArray(loc.coordinates)) {
            lng = (loc.coordinates as number[])[0];
            lat = (loc.coordinates as number[])[1];
          }
        }
        return {
          id: inc.id as string,
          title: inc.title as string,
          state: inc.state as string,
          district: inc.district as string,
          highway: inc.highway as string,
          incident_type: inc.incident_type as ParsedIncident['incident_type'],
          severity: inc.severity as ParsedIncident['severity'],
          status: inc.status as ParsedIncident['status'],
          lat,
          lng,
          estimated_clearance_hours: inc.estimated_clearance_hours as number,
          reporter_name: inc.reporter_name as string,
          description: inc.description as string,
          created_at: inc.created_at as string,
        };
      });
      setIncidents(parsed);
    }
  }, [supabase]);

  const fetchHubs = useCallback(async () => {
    const { data, error } = await supabase.from('supply_hubs').select('*');
    
    if (error) {
      console.error('Failed to fetch supply hubs');
      return;
    }

    if (data) {
      const parsedHubs: SupplyHub[] = data.map((hub: Record<string, unknown>) => {
        let lat = 0;
        let lng = 0;
        if (hub.location && typeof hub.location === 'object') {
          const loc = hub.location as Record<string, unknown>;
          if (loc.coordinates && Array.isArray(loc.coordinates)) {
            lng = (loc.coordinates as number[])[0];
            lat = (loc.coordinates as number[])[1];
          }
        }
        return {
          id: hub.id as string,
          name: hub.name as string,
          type: hub.type as string,
          lat,
          lng
        };
      });
      setSupplyHubs(parsedHubs);
    }
  }, [supabase]);

  useEffect(() => {
    fetchIncidents();
    fetchHubs();

    // Realtime subscription for live updates
    const channel = supabase
      .channel('map_incidents_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'incidents' }, () => {
        fetchIncidents();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchIncidents, supabase]);

  return (
    <div className="relative w-full h-full">
      {/* Layer Controls */}
      <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2 bg-slate-900/90 backdrop-blur-sm rounded-xl p-3 border border-slate-700/50 shadow-xl min-w-[180px]">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Map Layers</p>
        {[
          { key: 'incidents', label: t.map.layerIncidents, value: showIncidents, set: setShowIncidents, color: 'bg-red-500' },
          { key: 'hubs', label: t.map.layerSupplyHubs, value: showSupplyHubs, set: setShowSupplyHubs, color: 'bg-blue-500' },
          { key: 'weather', label: t.map.layerWeather, value: showWeather, set: setShowWeather, color: 'bg-cyan-500' },
        ].map(({ key, label, value, set, color }) => (
          <label key={key} className="flex items-center gap-2 cursor-pointer group">
            <div
              onClick={() => set(!value)}
              className={`w-9 h-5 rounded-full transition-colors duration-200 relative ${value ? color : 'bg-slate-600'}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${value ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </div>
            <span className="text-xs text-slate-300 group-hover:text-white transition-colors">{label}</span>
          </label>
        ))}

        {/* Legend */}
        <div className="mt-2 pt-2 border-t border-slate-700">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Road Status</p>
          {[
            { color: '#10b981', label: t.map.green },
            { color: '#f59e0b', label: t.map.yellow },
            { color: '#ef4444', label: t.map.red },
          ].map(({ color, label }) => (
            <div key={color} className="flex items-center gap-2 mb-1">
              <div className="w-3 h-2 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-xs text-slate-400">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <MapContainer
        center={[26.0, 92.5]}
        zoom={7}
        className="w-full h-full rounded-xl"
        style={{ background: '#0f172a' }}
      >
        {/* Dark tile layer */}
        <TileLayer
          url={`https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png?key=${process.env.NEXT_PUBLIC_CARTO_API_KEY}`}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        {/* NER Corridor Road Lines */}
        {NER_CORRIDORS_LINES.map((corridor) => (
          <Polyline
            key={corridor.name}
            positions={corridor.points}
            color={getCorridorColor(corridor.healthScore)}
            weight={5}
            opacity={0.85}
          >
            <Popup>
              <div className="font-sans text-sm">
                <strong>{corridor.name}</strong><br />
                <span>Health Score: </span>
                <span style={{ color: getCorridorColor(corridor.healthScore), fontWeight: 'bold' }}>
                  {corridor.healthScore}/100
                </span>
              </div>
            </Popup>
          </Polyline>
        ))}

        {/* Active Incidents Layer */}
        {showIncidents && (
          <LayerGroup>
            {incidents.map((inc) => (
              <CircleMarker
                key={inc.id}
                center={[inc.lat, inc.lng]}
                radius={inc.severity === 'CRITICAL' ? 14 : inc.severity === 'MODERATE' ? 10 : 7}
                fillColor={getSeverityColor(inc.severity, inc.status)}
                color={getSeverityColor(inc.severity, inc.status)}
                weight={2}
                opacity={0.9}
                fillOpacity={0.7}
              >
                <Popup>
                  <div className="font-sans text-sm max-w-xs">
                    <div className="font-bold text-base mb-1">
                      {getIncidentIcon(inc.incident_type)} {inc.title}
                    </div>
                    <div className="text-gray-600 text-xs mb-2">
                      {inc.district}, {inc.state} | {inc.highway}
                    </div>
                    <div className={`inline-block px-2 py-0.5 rounded text-xs font-bold mb-2 ${
                      inc.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                      inc.severity === 'MODERATE' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {inc.severity} · {inc.status}
                    </div>
                    <p className="text-gray-700 text-xs mb-1">{inc.description}</p>
                    {inc.estimated_clearance_hours > 0 && (
                      <p className="text-xs text-gray-500">⏱ ETA Clearance: {inc.estimated_clearance_hours}h</p>
                    )}
                    {inc.reporter_name && (
                      <p className="text-xs text-gray-400 mt-1">Reported by: {inc.reporter_name}</p>
                    )}
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </LayerGroup>
        )}

        {/* Supply Hubs Layer */}
        {showSupplyHubs && (
          <LayerGroup>
            {supplyHubs.map((hub) => (
              <CircleMarker
                key={hub.id || hub.name}
                center={[hub.lat, hub.lng]}
                radius={8}
                fillColor="#3b82f6"
                color="#60a5fa"
                weight={2}
                opacity={1}
                fillOpacity={0.85}
              >
                <Popup>
                  <div className="font-sans text-sm">
                    <strong>📦 {hub.name}</strong><br />
                    <span className="text-xs text-gray-500">Type: {hub.type} Hub</span>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </LayerGroup>
        )}
      </MapContainer>
    </div>
  );
}
