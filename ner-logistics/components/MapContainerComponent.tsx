'use client';

import { useEffect, useState, useCallback } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, CircleMarker, Marker, Circle, Popup, Polyline, LayerGroup, useMap } from 'react-leaflet';
import { createClient } from '@/lib/supabase/client';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
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
  image_url?: string;
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
  image_url?: string;
}

interface SupplyHub {
  id: string;
  name: string;
  type: string;
  lat: number;
  lng: number;
}

interface Corridor {
  name: string;
  points: [number, number][];
  routeGeometry?: [number, number][];
  healthScore: number;
}

interface StationWeatherData {
  name: string;
  state: string;
  lat: number;
  lng: number;
  precip_mm_24h: number;
  peak_hr_rainfall_mm: number;
  soil_moisture: number;
  wind_max_kmph: number;
  temp_max_c: number;
  temp_min_c: number;
  mean_humidity_pct: number;
  is_monsoon: boolean;
  forecast_precip_next_24h: number;
  weather_condition: string;
}

const WEATHER_STATIONS = [
  { name: 'Guwahati', state: 'Assam', lat: 26.1445, lng: 91.7362 },
  { name: 'Shillong', state: 'Meghalaya', lat: 25.5788, lng: 91.8933 },
  { name: 'Sela Pass', state: 'Arunachal Pradesh', lat: 27.5100, lng: 92.0800 },
  { name: 'Tawang', state: 'Arunachal Pradesh', lat: 27.5860, lng: 91.8596 },
  { name: 'Kohima', state: 'Nagaland', lat: 25.6700, lng: 94.1100 },
  { name: 'Imphal', state: 'Manipur', lat: 24.8170, lng: 93.9368 },
  { name: 'Aizawl', state: 'Mizoram', lat: 23.7272, lng: 92.7176 },
  { name: 'Silchar', state: 'Assam (Barak)', lat: 24.8333, lng: 92.7789 },
  { name: 'Agartala', state: 'Tripura', lat: 23.8315, lng: 91.2868 },
  { name: 'Gangtok', state: 'Sikkim', lat: 27.3314, lng: 88.6138 },
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

function createWeatherBadgeIcon(st: StationWeatherData) {
  let conditionIcon = '☀️';
  if (st.precip_mm_24h > 50 || st.weather_condition === 'HEAVY_RAIN') conditionIcon = '⛈️';
  else if (st.precip_mm_24h > 15 || st.weather_condition === 'MODERATE_RAIN') conditionIcon = '🌧️';
  else if (st.precip_mm_24h > 2 || st.weather_condition === 'LIGHT_RAIN') conditionIcon = '🌦️';
  else if (st.wind_max_kmph > 35) conditionIcon = '💨';
  else if (st.mean_humidity_pct > 80) conditionIcon = '💧';

  const isSevere = st.precip_mm_24h > 30;
  const isModerate = st.precip_mm_24h > 10;
  const badgeBorder = isSevere ? '#ef4444' : isModerate ? '#06b6d4' : '#10b981';
  const badgeGlow = isSevere ? 'rgba(239, 68, 68, 0.5)' : isModerate ? 'rgba(6, 182, 212, 0.4)' : 'rgba(16, 185, 129, 0.25)';
  const precipColor = isSevere ? '#f87171' : isModerate ? '#38bdf8' : '#34d399';

  return L.divIcon({
    className: 'custom-weather-marker',
    html: `
      <div style="
        background: rgba(15, 23, 42, 0.92);
        backdrop-filter: blur(8px);
        border: 1.5px solid ${badgeBorder};
        border-radius: 9999px;
        padding: 3px 8px;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        color: #ffffff;
        font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
        font-size: 11px;
        font-weight: 600;
        white-space: nowrap;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.5), 0 0 12px ${badgeGlow};
        cursor: pointer;
        transform: translate(-50%, -50%);
      ">
        <span style="font-size: 13px;">${conditionIcon}</span>
        <span style="color: #e2e8f0;">${st.name}</span>
        <span style="color: ${precipColor}; font-weight: 700; background: rgba(0,0,0,0.3); padding: 1px 5px; border-radius: 6px;">${st.precip_mm_24h.toFixed(1)}mm</span>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

export default function MapContainerComponent() {
  const [incidents, setIncidents] = useState<ParsedIncident[]>([]);
  const [supplyHubs, setSupplyHubs] = useState<SupplyHub[]>([]);
  const [corridors, setCorridors] = useState<Corridor[]>([]);
  const [weatherData, setWeatherData] = useState<StationWeatherData[]>([]);
  const [weatherLoading, setWeatherLoading] = useState(false);
  
  const [showIncidents, setShowIncidents] = useState(true);
  const [showSupplyHubs, setShowSupplyHubs] = useState(true);
  const [showWeather, setShowWeather] = useState(false);

  const { t } = useLanguage();
  const { role } = useAuth();
  const supabase = createClient();

  const fetchIncidents = useCallback(async () => {
    let query = supabase.from('incidents').select('*').order('created_at', { ascending: false });
    
    // PUBLIC_REPORTER only sees VERIFIED incidents
    if (role === 'PUBLIC_REPORTER') {
      query = query.eq('status', 'VERIFIED');
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch incidents');
      return;
    }

    if (data) {
      const parsed: ParsedIncident[] = data.map((inc: Record<string, unknown>) => {
        let lat = 26.1445;
        let lng = 91.7362;
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
          image_url: inc.image_url as string | undefined,
        };
      });
      setIncidents(parsed);
    }
  }, [supabase, role]);

  const handleUpdateIncidentStatus = async (id: string, newStatus: string) => {
    if (role !== 'ADMIN_DISPATCHER') return;
    
    const { error } = await supabase
      .from('incidents')
      .update({ status: newStatus })
      .eq('id', id);
      
    if (error) {
      console.error('Error updating incident:', error);
      alert('Failed to update incident status.');
    } else {
      fetchIncidents(); // Refresh immediately instead of waiting for realtime
    }
  };

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

  const fetchRoutes = useCallback(async () => {
    const { data: dbCorridors, error } = await supabase.from('corridors').select('*');
    if (error || !dbCorridors) {
      console.error('Failed to fetch corridors from Supabase', error);
      return;
    }

    const updatedCorridors = await Promise.all(
      dbCorridors.map(async (dbCorridor) => {
        const corridor: Corridor = {
          name: dbCorridor.name,
          points: dbCorridor.waypoints as [number, number][],
          healthScore: dbCorridor.default_health_score
        };

        try {
          const coordString = corridor.points.map(p => `${p[1]},${p[0]}`).join(';');
          const url = `https://router.project-osrm.org/route/v1/driving/${coordString}?overview=full&geometries=geojson`;
          const res = await fetch(url);
          if (!res.ok) throw new Error('OSRM fetch failed');
          const data = await res.json();
          
          if (data.routes && data.routes.length > 0) {
            const geometry = data.routes[0].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]);
            return { ...corridor, routeGeometry: geometry as [number, number][] };
          }
          return corridor;
        } catch (err) {
          console.error(`Failed to fetch route for ${corridor.name}:`, err);
          return corridor;
        }
      })
    );
    setCorridors(updatedCorridors);
  }, [supabase]);

  const fetchWeatherData = useCallback(async () => {
    setWeatherLoading(true);
    try {
      const results = await Promise.all(
        WEATHER_STATIONS.map(async (st) => {
          try {
            const res = await fetch(`/api/weather?lat=${st.lat}&lng=${st.lng}&name=${encodeURIComponent(st.name)}`);
            if (!res.ok) throw new Error('Failed');
            const data = await res.json();
            return {
              name: st.name,
              state: st.state,
              lat: st.lat,
              lng: st.lng,
              precip_mm_24h: Number(data.precip_mm_24h ?? 0),
              peak_hr_rainfall_mm: Number(data.peak_hr_rainfall_mm ?? 0),
              soil_moisture: Number(data.soil_moisture ?? 0.25),
              wind_max_kmph: Number(data.wind_max_kmph ?? 0),
              temp_max_c: Number(data.temp_max_c ?? 25),
              temp_min_c: Number(data.temp_min_c ?? 18),
              mean_humidity_pct: Number(data.mean_humidity_pct ?? 70),
              is_monsoon: Boolean(data.is_monsoon),
              forecast_precip_next_24h: Number(data.forecast_precip_next_24h ?? 0),
              weather_condition: String(data.weather_condition || 'CLEAR'),
            };
          } catch {
            return {
              name: st.name,
              state: st.state,
              lat: st.lat,
              lng: st.lng,
              precip_mm_24h: 4.5,
              peak_hr_rainfall_mm: 1.2,
              soil_moisture: 0.32,
              wind_max_kmph: 14,
              temp_max_c: 24,
              temp_min_c: 18,
              mean_humidity_pct: 78,
              is_monsoon: true,
              forecast_precip_next_24h: 0.8,
              weather_condition: 'LIGHT_RAIN',
            };
          }
        })
      );
      setWeatherData(results);
    } finally {
      setWeatherLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIncidents();
    fetchHubs();
    fetchRoutes();

    const channel = supabase
      .channel('map_incidents_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'incidents' }, () => {
        fetchIncidents();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchIncidents, fetchHubs, fetchRoutes, supabase]);

  // Fetch weather data when weather layer is activated
  useEffect(() => {
    if (showWeather && weatherData.length === 0 && !weatherLoading) {
      fetchWeatherData();
    }
  }, [showWeather, weatherData.length, weatherLoading, fetchWeatherData]);

  return (
    <div className="relative w-full h-full">
      {/* Layer Controls */}
      <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2 bg-slate-900/90 backdrop-blur-sm rounded-xl p-3 border border-slate-700/50 shadow-xl min-w-[190px]">
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
            <span className="text-xs text-slate-300 group-hover:text-white transition-colors flex items-center gap-1.5">
              {label}
              {key === 'weather' && weatherLoading && (
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block" />
              )}
            </span>
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
        {corridors.map((corridor) => (
          <Polyline
            key={corridor.name}
            positions={corridor.routeGeometry || corridor.points}
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
                    {inc.image_url && (
                      <div className="mt-2 mb-2">
                        <img src={inc.image_url} alt="Incident Evidence" className="w-full h-32 object-cover rounded-md border border-slate-200" />
                      </div>
                    )}
                    {inc.estimated_clearance_hours > 0 && (
                      <p className="text-xs text-gray-500">⏱ ETA Clearance: {inc.estimated_clearance_hours}h</p>
                    )}
                    {inc.reporter_name && (
                      <p className="text-xs text-gray-400 mt-1">Reported by: {inc.reporter_name}</p>
                    )}
                    
                    {role === 'ADMIN_DISPATCHER' && (
                      <div className="mt-3 flex gap-2 pt-2 border-t border-gray-200">
                        {inc.status === 'ACTIVE' && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleUpdateIncidentStatus(inc.id, 'VERIFIED'); }}
                            className="flex-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-xs font-bold py-1.5 px-2 rounded transition-colors"
                          >
                            ✓ Verify
                          </button>
                        )}
                        {inc.status !== 'CLEARED' && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleUpdateIncidentStatus(inc.id, 'CLEARED'); }}
                            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-1.5 px-2 rounded transition-colors"
                          >
                            ✕ Clear
                          </button>
                        )}
                      </div>
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

        {/* Live Weather Overlay Layer */}
        {showWeather && (
          <LayerGroup>
            {weatherData.map((st) => (
              <div key={st.name}>
                {/* Ambient Precipitation Halo */}
                <Circle
                  center={[st.lat, st.lng]}
                  radius={st.precip_mm_24h > 30 ? 30000 : st.precip_mm_24h > 10 ? 20000 : 12000}
                  pathOptions={{
                    color: st.precip_mm_24h > 30 ? '#ef4444' : st.precip_mm_24h > 10 ? '#0284c7' : '#059669',
                    fillColor: st.precip_mm_24h > 30 ? '#ef4444' : st.precip_mm_24h > 10 ? '#38bdf8' : '#10b981',
                    fillOpacity: st.precip_mm_24h > 30 ? 0.22 : 0.14,
                    weight: 1.5,
                    dashArray: '3, 4',
                  }}
                />

                {/* Weather Station Badge */}
                <Marker
                  position={[st.lat, st.lng]}
                  icon={createWeatherBadgeIcon(st)}
                >
                  <Popup>
                    <div className="font-sans text-sm min-w-[220px] p-1">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-2">
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm leading-none">{st.name}</h4>
                          <span className="text-[11px] text-slate-500">{st.state}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase ${
                          st.precip_mm_24h > 30 ? 'bg-red-100 text-red-700' :
                          st.precip_mm_24h > 10 ? 'bg-cyan-100 text-cyan-800' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          {st.weather_condition.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-700">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">🌧️ 24h Rainfall:</span>
                          <strong className="font-semibold text-slate-900">{st.precip_mm_24h.toFixed(1)} mm</strong>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">⚡ Peak Hourly:</span>
                          <span className="font-medium text-slate-800">{st.peak_hr_rainfall_mm.toFixed(1)} mm/hr</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">💧 Soil Moisture:</span>
                          <span className="font-medium text-slate-800">{(st.soil_moisture * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">💨 Max Wind:</span>
                          <span className="font-medium text-slate-800">{st.wind_max_kmph.toFixed(1)} km/h</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">🌡️ Temperature:</span>
                          <span className="font-medium text-slate-800">{st.temp_min_c.toFixed(0)}°C – {st.temp_max_c.toFixed(0)}°C</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">🌫️ Rel. Humidity:</span>
                          <span className="font-medium text-slate-800">{st.mean_humidity_pct.toFixed(0)}%</span>
                        </div>
                        {st.is_monsoon && (
                          <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center gap-1.5 text-cyan-700 text-[11px] font-semibold">
                            <span>☔</span> Active Monsoon Season
                          </div>
                        )}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              </div>
            ))}
          </LayerGroup>
        )}
      </MapContainer>
    </div>
  );
}
