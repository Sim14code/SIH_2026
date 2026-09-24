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