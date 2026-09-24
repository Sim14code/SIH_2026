# Implementation Specification: AI-Powered Smart Logistics & Accessibility Intelligence Platform for North Eastern Region (NER)

**Project Identifier:** SIH-NER-LOGISTICS-AI  
**Target Environment:** Antigravity / AI Agent Execution & Rapid Prototyping  
**Primary Focus:** North Eastern Region (NER) Infrastructure, Terrain-Aware Dynamic Routing, & Emergency Supply Chain Accessibility  

---

## 1. System Architecture Overview

```
                        +-----------------------------------------+
                        |      Field Officials / Citizens         |
                        | (PWA / Mobile - Offline PWA Cache)      |
                        +--------------------+--------------------+
                                             | Geo-tagged Reports &
                                             | Incident Uploads
                                             v
+------------------------+      +---------------------------------+      +------------------------+
| Weather APIs           | ---> |                                 | <--- | GPS Trackers /         |
| (OpenWeather/IMD Mock) |      |        FASTAPI BACKEND          |      | Telematics Simulators  |
+------------------------+      |  (Python AI/ML Core Service)    |      +------------------------+
                                |                                 |
+------------------------+ ---> |  - Dynamic Routing Engine (A*)  | ---> +------------------------+
| GIS Map Layers         |      |  - Landslide/Flood Risk Model   |      | Web Dashboard          |
| (Mapbox / Leaflet)     |      |  - Multilingual Alert Engine    |      | (React + Tailwind CSS) |
+------------------------+      +----------------+----------------+      +------------------------+
                                                 |
                                                 v
                                    +--------------------------+
                                    | SQLite / PostGIS DB      |
                                    | (Geo-Spatial Indexing)   |
                                    +--------------------------+
```

---

## 2. Technology Stack Strategy (Prototype-Optimized)

| Layer | Recommended Stack | Rationale for Prototyping |
| :--- | :--- | :--- |
| **Frontend Dashboard** | React 18, Tailwind CSS, Lucide React, Recharts | Fast UI layout, interactive dashboards, rich component ecosystem |
| **GIS Mapping** | Leaflet.js / React-Leaflet or Mapbox GL JS | Free tile rendering, custom GeoJSON overlay support for terrain/landslides |
| **Backend API** | FastAPI (Python 3.11) | Native support for async APIs, integrated ML models, and geospatial math |
| **AI/ML Core** | Scikit-learn, XGBoost, NetworkX, GeoPandas | Graph-based dynamic shortest path algorithm with risk penalty multipliers |
| **Database** | SQLite + SpatiaLite (or PostgreSQL + PostGIS) | Minimal setup overhead, full GIS support for boundary & route queries |
| **Real-time Engine** | WebSockets / Server-Sent Events (SSE) | Live vehicle tracking simulation and instant disruption popups |
| **PWA / Offline** | Workbox JS + IndexedDB | Local submission queuing when field users lack cellular connectivity |

---

## 3. Mock Dataset & Geography Matrix (North Eastern Region)

# AI Agent Instruction Guide: Real Datasets & Live APIs for NER Logistics Platform

**Target Audience:** AI Coding Agents (Antigravity / Cursor / Automated Editors) & Core Engineers  
**Project Context:** SIH-NER-LOGISTICS-AI (Smart Logistics & Accessibility Intelligence Platform for North Eastern Region)

---

## 1. Executive Instructions for AI Agent

When implementing real data pipelines and training machine learning models for this platform:
1. **Never hardcode static mock nodes for routing when real OSM graph layers are available.**
2. **Implement graceful fallback logic:** If live APIs (e.g., Open-Meteo or Mapbox) are unreachable or rate-limited, fail over to local GeoJSON caches without crashing the user interface.
3. **Use standardized spatial coordinates:** All geographical queries must be normalized to EPSG:4326 (`WGS 84`) lat/lon coordinates.

---

## 2. Machine Learning Training Datasets (Offline Data Sourcing)

To train predictive models for landslide susceptibility, flood blockages, and terrain travel delays across the 8 NER states, source and assemble data from these official repositories:

| Category | Dataset Name | Provider / Source | Data Format & Resolution | Key Features / Variable Name |
| :--- | :--- | :--- | :--- | :--- |
| **Disruption Labels (Ground Truth)** | Landslide Atlas of India | ISRO Bhuvan / GSI | Shapefile (`.shp`), GeoJSON | `event_date`, `latitude`, `longitude`, `severity_class` |
| **Susceptibility Baseline** | Indian Landslide Susceptibility Map (ILSM) | IIT Delhi HydroSense Lab (Zenodo) | GeoTIFF (`.tif`), 100m grid | `susceptibility_score` (Range: 0.0 to 1.0) |
| **Historical Rainfall** | IMD Gridded Daily Rainfall Data | India Meteorological Dept. (IMD) | NetCDF (`.nc`), $0.25^\circ \times 0.25^\circ$ | `rain_mm` (Daily accumulated rainfall) |
| **Reanalysis Precipitation** | ERA5 / NASA POWER | Copernicus / NASA | NetCDF / JSON API | `precipitation_sum`, `soil_moisture_level_1` |
| **Elevation & Terrain** | NASA SRTM / Copernicus DEM | OpenTopography / USGS | GeoTIFF (`.tif`), 30m grid | `elevation_m`, `slope_degrees`, `aspect` |
| **Road & Hydro Infrastructure** | OSM Regional Extract (North-East) | Geofabrik OpenStreetMap | `.osm.pbf` / GeoJSON | `highway_type`, `surface`, `bridge`, `waterway_dist` |

---

## 3. Feature Matrix Assembly for ML Model Training

Agents should construct a combined tabular dataset for supervised classification (e.g., predicting `disruption_occurred` = 0 or 1):

### Target Data Schema (`train_dataset.csv` / Pandas Dataframe)

```python
import pandas as pd
import numpy as np

# Representation of the dataset schema required for XGBoost / RandomForest training
data_schema = {
    "latitude": "float64",           # Point latitude
    "longitude": "float64",          # Point longitude
    "elevation_m": "float32",        # From NASA SRTM DEM
    "slope_degrees": "float32",      # Calculated gradient from DEM
    "susceptibility_score": "float32", # From IIT Delhi ILSM GeoTIFF
    "rain_current_day_mm": "float32",# From IMD NetCDF grid
    "rain_3day_accum_mm": "float32", # Rolling 72-hr rainfall accumulation
    "dist_to_river_m": "float32",    # Distance to nearest OSM river/waterway
    "highway_category": "category",  # Primary, Secondary, Trunk, Tertiary
    "road_surface": "category",     # Paved, Unpaved, Gravel
    "disruption_occurred": "int8"    # TARGET: 1 (Landslide/Flood Blocked), 0 (Clear)
}
```

### Quickstart Script: Automated IMD Rainfall Extraction

Use this Python script to pull historical daily rainfall grids directly into the project:

```python
import xarray as xr
import imdpyme as imd

def download_ner_rainfall_data(year: int):
    """
    Downloads IMD daily rainfall grid and clips it to North Eastern Region boundary.
    NER Bounding Box: Lat 21.5N to 29.5N, Lon 87.5E to 97.5E
    """
    data = imd.get_data('rain', year, year, sub_dir='data')
    grid = data.to_xarray()
    
    # Clip to NER Geographic Bounding Box
    ner_grid = grid.sel(lat=slice(21.5, 29.5), lon=slice(87.5, 97.5))
    ner_grid.to_netcdf(f"data/ner_rainfall_{year}.nc")
    print(f"Successfully downloaded and saved NER rainfall for {year}")

if __name__ == "__main__":
    download_ner_rainfall_data(2023)
```

---

## 4. Live API Integrations (Real-Time Ingestion)

To provide live updates, connect the FastAPI backend directly to these live endpoints:

### A. Live Weather API (Open-Meteo - Free, No Key Required)
* **Endpoint Base:** `https://api.open-meteo.com/v1/forecast`
* **Purpose:** Real-time rainfall and wind speed fetching for hill state coordinates.

### B. Map Vectors & Live Traffic
* **OpenStreetMap Overpass API:** `https://overpass-api.de/api/interpreter`
* **Mapbox Traffic API / Vector Tiles:** `https://api.mapbox.com/v4/mapbox.mapbox-traffic-v1`

### C. Live Vehicle Telemetry (Traccar GPS Client)
* **Protocol:** HTTP POST / WebSockets
* **Data Stream:** Receives continuous JSON/Query payloads from field drivers' phones.

---

## 5. Backend Code Implementation Specifications

AI Agents must generate backend service modules following these exact specifications:

### Module 1: Live Weather Ingestion (`app/services/weather_service.py`)

```python
import requests
from typing import Dict, Any

class WeatherService:
    BASE_URL = "https://api.open-meteo.com/v1/forecast"

    @classmethod
    def get_live_metrics(cls, lat: float, lon: float) -> Dict[str, Any]:
        """
        Fetches current weather metrics and evaluates immediate hazard level.
        """
        params = {
            "latitude": lat,
            "longitude": lon,
            "current": "temperature_2m,rain,showers,wind_speed_10m",
            "timezone": "Asia/Kolkata"
        }
        try:
            response = requests.get(cls.BASE_URL, params=params, timeout=4)
            response.raise_for_status()
            data = response.json().get("current", {})
            
            rainfall_mm = data.get("rain", 0.0) + data.get("showers", 0.0)
            
            return {
                "temperature": data.get("temperature_2m"),
                "rainfall_mm": rainfall_mm,
                "wind_speed_kmh": data.get("wind_speed_10m"),
                "is_hazard_alert": rainfall_mm > 12.0  # Threshold for landslide risk
            }
        except Exception as e:
            # Fallback for network issues or offline mode
            return {
                "temperature": 22.0,
                "rainfall_mm": 0.0,
                "wind_speed_kmh": 5.0,
                "is_hazard_alert": False,
                "error": str(e)
            }
```

### Module 2: OSM Highway Graph & Routing (`app/services/routing_service.py`)

```python
import osmnx as ox
import networkx as nx
from typing import List, Tuple

class DynamicRoutingEngine:
    def __init__(self, region_name: str = "Meghalaya, India"):
        # Load real road graph from OpenStreetMap
        self.graph = ox.graph_from_place(region_name, network_type="drive")
        
    def compute_risk_aware_route(
        self, 
        orig_coords: Tuple[float, float], 
        dest_coords: Tuple[float, float],
        blocked_nodes: List[int] = None
    ):
        """
        Computes dynamic shortest route while penalizing or bypassing blocked/high-risk nodes.
        """
        orig_node = ox.distance.nearest_nodes(self.graph, X=orig_coords[1], Y=orig_coords[0])
        dest_node = ox.distance.nearest_nodes(self.graph, X=dest_coords[1], Y=dest_coords[0])
        
        working_graph = self.graph.copy()
        
        # Dynamically remove blocked nodes (e.g. active landslides)
        if blocked_nodes:
            for node in blocked_nodes:
                if working_graph.has_node(node):
                    working_graph.remove_node(node)
                    
        # Calculate optimal path
        path = nx.shortest_path(working_graph, orig_node, dest_node, weight="length")
        
        # Convert path nodes back to coordinate list for map rendering
        route_coords = [(working_graph.nodes[n]['y'], working_graph.nodes[n]['x']) for n in path]
        return route_coords
```

### Module 3: GPS Telemetry Webhook (`app/api/gps_router.py`)

```python
from fastapi import APIRouter, Request, HTTPException
from typing import Dict

router = APIRouter(prefix="/api/v1/telemetry", tags=["GPS Telemetry"])

# In-memory store for prototype vehicle positions
vehicle_positions: Dict[str, dict] = {}

@router.post("/traccar/feed")
@router.get("/traccar/feed")
async def receive_gps_feed(request: Request):
    """
    Receives real-time telemetry from Traccar Client app on smartphones or OBD devices.
    """
    params = request.query_params
    device_id = params.get("id") or "UNKNOWN_VEHICLE"
    
    try:
        lat = float(params.get("lat"))
        lon = float(params.get("lon"))
        speed = float(params.get("speed", 0.0))
        
        position_data = {
            "device_id": device_id,
            "latitude": lat,
            "longitude": lon,
            "speed_kmh": speed,
            "timestamp": params.get("timestamp")
        }
        
        vehicle_positions[device_id] = position_data
        
        return {"status": "success", "received": position_data}
    except (TypeError, ValueError):
        raise HTTPException(status_code=400, detail="Invalid GPS coordinates format")
```

---

## 6. Real-Data System Verification Protocol

Follow this checklist to verify that the real data integration is functioning correctly:

```
[ ] 1. Open-Meteo Integration Test:
    Execute: curl "http://localhost:8000/api/v1/weather?lat=27.5861&lon=91.8594"
    Expected Outcome: Returns live precipitation data for Tawang without 4xx/5xx errors.

[ ] 2. OSM Graph Route Calculation:
    Execute: Run DynamicRoutingEngine for Guwahati -> Shillong.
    Expected Outcome: Returns an array of valid coordinate pairs tracing NH-40.

[ ] 3. Live Traccar GPS Streaming:
    Action: Install Traccar Client on phone, configure server target to http://<HOST-IP>:8000/api/v1/telemetry/traccar/feed.
    Expected Outcome: Moving phone updates live marker on Leaflet frontend map within 5 seconds.

[ ] 4. Dynamic Re-routing Test:
    Action: Trigger block incident on Sonapur Tunnel (NH-6).
    Expected Outcome: Routing engine recalculates and selects alternate highway around East Jaintia Hills.
```
---

## 4. Feature Specifications & Technical Requirements

### Feature A: Real-Time Accessibility & GIS Map Engine
* **Objective:** Render current accessibility status across state and district boundaries in the NER.
* **Logic:**
  * Color-code roads based on health score:
    * **Green (Score 80-100):** Clear passage.
    * **Yellow (Score 50-79):** High rainfall/Slight risk, heavy vehicles restricted.
    * **Red (Score 0-49):** Blocked due to Landslide/Flood/Bridge Damage.
  * Layer toggles for:
    1. Active Incidents & Landslide Hotspots.
    2. Medical & Essential Supply Hubs.
    3. Weather Precipitation Overlay.

### Feature B: AI-Powered Dynamic Risk & Route Engine
* **Objective:** Calculate route recommendations that minimize total travel time while severely penalizing high-risk landslide/flood corridors.
* **Mathematical Weighting Formula:**
  $$\text{Edge Weight} = \text{Distance (km)} \times \left(1 + \alpha \cdot \text{Rainfall (mm/hr)} + \beta \cdot \text{Landslide Risk Score} + \gamma \cdot \text{Road Degradation}\right)$$
  * Where $\alpha = 0.05$, $\beta = 0.25$, $\gamma = 0.15$.
* **Outputs:** Primary Route, AI Risk-Aware Alternate Route, Delay Forecast (+hrs), Risk Breakdown.

### Feature C: Essential Commodity Fleet Tracking
* **Objective:** Track vehicles carrying priority payloads (Oxygen cylinders, Vaccines, Rice, Cement, Military/Disaster Aid).
* **Capabilities:**
  * Simulated GPS feeds emitting coordinate stream every 3 seconds.
  * Geofence triggering: Alert if a truck enters a designated "Red/High Landslide Risk" zone.
  * Automated ETA calculation dynamic to route accessibility updates.

### Feature D: Offline Field Crowdsourcing & Verification
* **Objective:** Allow local officers/drivers in zero-network areas to report blockages.
* **Capabilities:**
  * Geo-location auto-capture via browser HTML5 Geolocation API.
  * Offline storage in `IndexedDB`.
  * Auto-sync to central server as soon as connection reaches active status.
  * Admin verification workflow (Approve report $\rightarrow$ Instantly update map graph).

### Feature E: Multilingual Alert & Localization System
* **Supported Languages:** English, Hindi (हिंदी), Assamese (অসমীয়া), Bengali (বাংলা), Manipuri (মৈতৈলোন্).
* **Delivery Methods:** On-screen notifications, simulated SMS payload, low-bandwidth push banners.

---

## 5. Core Data Schemas

### 1. Incident Model (`incidents.json` / Database Table)
```json
{
  "id": "INC-NER-2026-089",
  "title": "Major Landslide near Sonapur Tunnel",
  "state": "Meghalaya",
  "district": "East Jaintia Hills",
  "highway": "NH-6",
  "location": { "lat": 25.1182, "lng": 92.3654 },
  "type": "LANDSLIDE",
  "severity": "CRITICAL",
  "status": "ACTIVE",
  "reported_at": "2026-09-24T08:30:00Z",
  "estimated_clearance_hours": 14,
  "reporter": "Field Officer - Jowai Sector",
  "description": "Debris completely blocking both lanes. Clearance heavy machinery dispatched.",
  "image_url": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500"
}
```

### 2. Vehicle Fleet Model (`vehicles.json` / Database Table)
```json
{
  "vehicle_id": "AS-01-GC-4482",
  "driver_name": "Rajesh Kalita",
  "commodity": "Emergency Medical Supplies & Vaccines",
  "priority": "HIGH",
  "origin": "Guwahati Medical Hub",
  "destination": "Imphal Civil Hospital",
  "current_location": { "lat": 26.1445, "lng": 91.7362 },
  "speed_kmph": 42,
  "status": "IN_TRANSIT",
  "assigned_route_id": "ROUTE-GHY-IMP-ALT1",
  "eta": "2026-09-25T04:15:00Z"
}
```

---

## 6. Antigravity Build Execution Blueprint

When generating code using an automated agent or AI editor, execute in the following sequential order:

### Phase 1: Base Application & Layout
1. Set up React + Vite project with Tailwind CSS setup.
2. Build responsive layout shell featuring:
   * **Header:** Title, State Quick-Selector, Language Selector, Alert Ticker.
   * **Sidebar:** Overview Stats, Active Alerts, Emergency Contact Directory.
   * **Main Area:** Tabs for `[GIS Map View, Route Planner, Fleet Live Tracking, Incident Upload, Analytics]`.

### Phase 2: Interactive GIS Map & Layers (`Leaflet.js`)
1. Render Leaflet Map centered at `(26.2006, 92.9376)` with Zoom Level `7`.
2. Add Custom GeoJSON polyline layers representing key NER highways.
3. Render custom marker icons for:
   * 🛑 Blocked Nodes / Landslides (Red pulse icon).
   * 🚚 Active Essential Trucks (Animated green truck icon).
   * 🏥 Logistics / Relief Hubs (Blue hospital/warehouse icon).

### Phase 3: Dynamic AI Routing Engine Implementation
1. Construct a graph network (`NetworkX` in Python backend or `js-graph-algorithms` in JS).
2. Implement custom route computation function:
   * **Input:** `Origin`, `Destination`, `Commodity Category`, `Avoid High-Risk Areas (Boolean)`.
   * **Output:** Comparison view between **Standard Route** (Shortest) vs. **AI-Optimized Route** (Safest & Fastest considering live delays).

### Phase 4: Field Reporter PWA Module
1. Build intuitive form with options: Dropdown (Incident Type), Photo upload mock, Auto-location fetch button.
2. Implement `localStorage`/`IndexedDB` fallbacks to simulate submission when offline.
3. Add sync indicator: "3 Reports Pending Upload (Offline)".

### Phase 5: Analytics Dashboard & Emergency Matrix
1. Add Recharts components showing:
   * District-wise Connectivity Index (% Accessible).
   * Average Delay Time by State (Bar Chart).
   * Supply Chain Vulnerability Index.

---

## 7. Sample Interactive Component Template (React & Map Integration)

Use this functional React code structure as the reference standard for building the front-end map dashboard:

```jsx
import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { AlertTriangle, Truck, Navigation, ShieldCheck, DynamicForm } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// NER Coordinates Baseline
const NER_CENTER = [26.2006, 92.9376];

export default function LogisticsDashboard() {
  const [activeTab, setActiveTab] = useState('map');
  const [selectedDistrict, setSelectedDistrict] = useState('All');

  const incidents = [
    { id: 1, name: "NH-6 Sonapur Blockade", lat: 25.1182, lng: 92.3654, status: "Critical" },
    { id: 2, name: "NH-29 Kohima Landslide", lat: 25.6747, lng: 94.1100, status: "Moderate" }
  ];

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 font-sans">
      {/* Sidebar */}
      <div className="w-80 bg-slate-800 border-r border-slate-700 p-4 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="text-emerald-400 w-7 h-7" />
          <h1 className="font-bold text-lg leading-tight">NER-LogiShield AI</h1>
        </div>
        <p className="text-xs text-slate-400">
          Smart Logistics & Accessibility Intelligence Platform for North Eastern Region
        </p>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2 my-2">
          <div className="bg-slate-700/50 p-3 rounded-lg border border-slate-600">
            <span className="text-xs text-slate-400">Open Blockades</span>
            <p className="text-xl font-bold text-amber-400">14</p>
          </div>
          <div className="bg-slate-700/50 p-3 rounded-lg border border-slate-600">
            <span className="text-xs text-slate-400">Active Cargo</span>
            <p className="text-xl font-bold text-emerald-400">128</p>
          </div>
        </div>

        {/* Control Navigation */}
        <nav className="flex flex-col gap-1">
          <button 
            onClick={() => setActiveTab('map')}
            className={`flex items-center gap-3 px-3 py-2 rounded font-medium text-sm transition ${activeTab === 'map' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-700 text-slate-300'}`}>
            <Navigation className="w-4 h-4" /> Live Connectivity Map
          </button>
          <button 
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-3 px-3 py-2 rounded font-medium text-sm transition ${activeTab === 'reports' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-700 text-slate-300'}`}>
            <AlertTriangle className="w-4 h-4" /> Incident Feed & Field Upload
          </button>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="h-14 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between px-6">
          <span className="text-sm font-semibold text-slate-300">Region: North Eastern India (8 States)</span>
          <div className="flex gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-950 text-emerald-400 border border-emerald-800">
              ● Server Connected
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-950 text-indigo-300 border border-indigo-800">
              Offline Cache Ready
            </span>
          </div>
        </header>

        {/* Dynamic Display Body */}
        <div className="flex-1 relative">
          {activeTab === 'map' && (
            <div className="w-full h-full">
              <MapContainer center={NER_CENTER} zoom={7} className="w-full h-full">
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {incidents.map((inc) => (
                  <Marker key={inc.id} position={[inc.lat, inc.lng]}>
                    <Popup>
                      <div className="text-slate-900 p-1">
                        <strong className="block text-sm">{inc.name}</strong>
                        <span className="text-xs text-red-600 font-bold">Status: {inc.status} Blockade</span>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## 8. SIH Pitch & Demonstration Highlights

When presenting this prototype to SIH evaluators, emphasize these primary innovations:

1. **Terrain-Aware Dynamic Cost Factor:** Show how traditional maps (e.g. Google Maps) might direct a truck onto a shorter road that is secretly prone to landslides, whereas this platform recalculates around real-time IMD precipitation risk.
2. **Bandwidth Resilience:** Demonstrate switching off network in Chrome DevTools, submitting an incident report, and seeing it sync seamlessly once online.
3. **Multilingual Inclusivity:** Show emergency alert broadcasts rendering instantly in Assamese and Bengali for regional ground drivers.