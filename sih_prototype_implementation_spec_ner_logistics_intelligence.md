# Implementation Specification: AI-Powered Smart Logistics & Accessibility Intelligence Platform for North Eastern Region (NER)

**Project Identifier:** SIH-NER-LOGISTICS-AI  
**Target Environment:** Antigravity / AI Agent Execution & Rapid Prototyping  
**Primary Tech Stack:** Next.js (App Router), Supabase (PostGIS, Auth, Realtime), Vercel, Tailwind CSS  
**Primary Focus:** North Eastern Region (NER) Infrastructure, Terrain-Aware Dynamic Routing, & Emergency Supply Chain Accessibility  

---

## 1. System Architecture Overview

```
                        +-----------------------------------------+
                        |      Field Officials / Citizens         |
                        | (Next.js PWA / Mobile - IndexedDB)      |
                        +--------------------+--------------------+
                                             | Geo-tagged Reports &
                                             | Photos (Supabase Storage)
                                             v
+------------------------+      +---------------------------------+      +------------------------+
| Weather APIs           | ---> |        NEXT.JS APP ROUTER       | <--- | GPS Trackers /         |
| (Open-Meteo / IMD)     |      |    (Server Actions & API)       |      | Telematics Simulators  |
+------------------------+      +----------------+----------------+      +------------------------+
                                                 |
                                                 v
+------------------------+      +---------------------------------+      +------------------------+
| GIS Map Layers         | ---> |       SUPABASE PLATFORM         | ---> | Vercel Deployment      |
| (Mapbox / Leaflet)     |      |  - Postgres + PostGIS Spatial   |      | - Serverless/Edge      |
+------------------------+      |  - Supabase Realtime Engine     |      | - Global CDN           |
                                |  - Row Level Security (RLS)     |      +------------------------+
                                +---------------------------------+
```

---

## 2. Technology Stack Strategy (Production & Prototype-Optimized)

| Layer | Recommended Stack | Rationale for Next.js + Supabase Architecture |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js 14+ (App Router)** | Server Components for speed, SSR/SSG, built-in API Route Handlers, and seamless Vercel integration. |
| **Styling & UI** | **Tailwind CSS + Lucide React + Shadcn/ui** | Rapid prototyping, dark-mode geospatial dashboard UI components. |
| **GIS Mapping** | **React-Leaflet / Leaflet.js / Mapbox GL** | Interactive map layers. Client-side dynamic import (`ssr: false`) handles SSR safely in Next.js. |
| **Backend & APIs** | **Next.js Route Handlers + Python Microservice** | Route handlers for lightweight APIs; external Python FastAPI (or Supabase Edge Functions) for NetworkX routing calculations. |
| **Database & GIS** | **Supabase (PostgreSQL + PostGIS)** | Native geospatial indexing (`ST_DWithin`, `ST_Distance`), built-in Auth, and instant API generation. |
| **Real-time Engine** | **Supabase Realtime (WebSockets)** | Instant broadcast of GPS vehicle movement and active road blockade alerts to dashboard listeners. |
| **Media Storage** | **Supabase Storage** | Public/Private buckets for field evidence photos (landslides, flooded bridges). |
| **Hosting & CI/CD** | **Vercel** | Zero-config deployment for Next.js, automatic preview builds, edge caching, and global delivery. |
| **PWA & Offline** | **Workbox / `@ducanh2912/next-pwa`** | Caches app shell and queues field incident uploads in IndexedDB during offline conditions. |

---

## 3. Mock Dataset & Geography Matrix (North Eastern Region)

To ensure realistic demonstration during SIH judging, the system comes pre-configured with key strategic corridors across all 8 NER states:

1. **NH-27 / NH-37 Corridor:** Guwahati (Assam) $\rightarrow$ Nagaon $\rightarrow$ Jorhat $\rightarrow$ Dibrugarh.
2. **Shillong Strategic Highway:** Guwahati (Assam) $\rightarrow$ Shillong (Meghalaya) $\rightarrow$ Dawki / Jowai.
3. **Barak Valley Supply Route:** Shillong $\rightarrow$ Silchar (Assam) $\rightarrow$ Agartala (Tripura).
4. **Nagaland-Manipur Corridor:** Dimapur (Nagaland) $\rightarrow$ Kohima $\rightarrow$ Imphal (Manipur).
5. **Mizoram Link:** Silchar (Assam) $\rightarrow$ Aizawl (Mizoram).
6. **Arunachal Highway:** Tezpur (Assam) $\rightarrow$ Bhalukpong $\rightarrow$ Tawang (Arunachal Pradesh).
7. **Sikkim Lifeline:** Siliguri (WB) $\rightarrow$ Rangpo $\rightarrow$ Gangtok (Sikkim).

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

$$
\text{Edge Weight} = \text{Distance (km)} \times \left(1 + \alpha \cdot \text{Rainfall (mm/hr)} + \beta \cdot \text{Landslide Risk Score} + \gamma \cdot \text{Road Degradation}\right)
$$

  * Where $\alpha = 0.05$, $\beta = 0.25$, $\gamma = 0.15$.
* **Outputs:** Primary Route, AI Risk-Aware Alternate Route, Delay Forecast (+hrs), Risk Breakdown.

### Feature C: Essential Commodity Fleet Tracking
* **Objective:** Track vehicles carrying priority payloads (Oxygen cylinders, Vaccines, Rice, Cement, Military/Disaster Aid).
* **Capabilities:**
  * Simulated GPS feeds emitting coordinate streams to Supabase Realtime every 3 seconds.
  * Geofence triggering: Alert if a truck enters a designated "Red/High Landslide Risk" zone using PostGIS `ST_DWithin`.
  * Automated ETA calculation dynamic to route accessibility updates.

### Feature D: Offline Field Crowdsourcing & Verification
* **Objective:** Allow local officers/drivers in zero-network areas to report blockages.
* **Capabilities:**
  * Geo-location auto-capture via browser HTML5 Geolocation API.
  * Offline storage in `IndexedDB`.
  * Auto-sync to central server as soon as connection reaches active status.
  * Admin verification workflow (Approve report $\rightarrow$ Instantly update map graph via Supabase Realtime).

### Feature E: Multilingual Alert & Localization System
* **Supported Languages:** English, Hindi (हिंदी), Assamese (অসমীয়া), Bengali (বাংলা), Manipuri (মৈতৈলোন্).
* **Delivery Methods:** On-screen notifications, simulated SMS payload, low-bandwidth push banners.

---

## 5. Supabase Database & PostGIS Setup

Execute this SQL script in your Supabase SQL Editor to initialize the database with geospatial query support:

```sql
-- 1. Enable PostGIS Extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Incidents Table (Geo-tagged Disruption Reports)
CREATE TABLE public.incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  state TEXT NOT NULL,
  district TEXT NOT NULL,
  highway TEXT NOT NULL,
  incident_type TEXT CHECK (incident_type IN ('LANDSLIDE', 'FLOOD', 'BRIDGE_FAILURE', 'TRAFFIC_CONGESTION')),
  severity TEXT CHECK (severity IN ('LOW', 'MODERATE', 'CRITICAL')),
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'VERIFIED', 'CLEARED')),
  location GEOMETRY(Point, 4326) NOT NULL,
  estimated_clearance_hours INT DEFAULT 6,
  reporter_name TEXT,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for Spatial Proximity Queries
CREATE INDEX idx_incidents_geo ON public.incidents USING GIST (location);

-- 3. Vehicles Table (Live Fleet Tracking)
CREATE TABLE public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_number TEXT UNIQUE NOT NULL,
  driver_name TEXT NOT NULL,
  commodity_type TEXT NOT NULL,
  priority_level TEXT CHECK (priority_level IN ('HIGH', 'MEDIUM', 'NORMAL')),
  origin_name TEXT NOT NULL,
  destination_name TEXT NOT NULL,
  current_location GEOMETRY(Point, 4326),
  speed_kmph NUMERIC(5, 2) DEFAULT 0.0,
  status TEXT DEFAULT 'IN_TRANSIT' CHECK (status IN ('IDLE', 'IN_TRANSIT', 'DELAYED', 'ARRIVED')),
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vehicles_geo ON public.vehicles USING GIST (current_location);

-- 4. Enable Supabase Realtime on Vehicles and Incidents
ALTER PUBLICATION supabase_realtime ADD TABLE public.incidents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.vehicles;

-- 5. PostGIS Function: Find Incidents Near Route Point (Radius in Meters)
CREATE OR REPLACE FUNCTION get_incidents_near_point(lat FLOAT, lon FLOAT, radius_meters FLOAT)
RETURNS SETOF public.incidents AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.incidents
  WHERE ST_DWithin(
    location,
    ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography,
    radius_meters
  )
  AND status = 'ACTIVE';
END;
$$ LANGUAGE plpgsql;
```

---

## 6. Antigravity Build Execution Blueprint (Next.js + Supabase + Vercel)

When generating code using an automated agent or AI editor, execute in the following sequential order:

### Phase 1: Next.js Project & Supabase Integration Setup
1. Initialize Next.js project: `npx create-next-app@latest ner-logistics --typescript --tailwind --app`.
2. Install dependencies:
   ```bash
   npm install @supabase/supabase-js @supabase/ssr leaflet react-leaflet lucide-react recharts clsx tailwind-merge
   npm install -D @types/leaflet
   ```
3. Set up environment file `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

### Phase 2: Supabase Client Utility (`lib/supabase/client.ts`)
```typescript
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

### Phase 3: Dynamic Map Component with SSR Handling (`components/Map.tsx`)
Because Leaflet relies on the browser `window` object, dynamic importing with `ssr: false` is mandatory in Next.js:

```tsx
// components/MapWrapper.tsx
'use client';

import dynamic from 'next/dynamic';

const DynamicMap = dynamic(() => import('./MapContainerComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-900 flex items-center justify-center text-slate-400">
      Loading GIS Map Engine...
    </div>
  ),
});

export default function MapWrapper() {
  return <DynamicMap />;
}
```

### Phase 4: Supabase Realtime Listener Integration Component
```tsx
// components/LiveFleetTracker.tsx
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function LiveFleetTracker() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    // Initial fetch
    const fetchVehicles = async () => {
      const { data } = await supabase.from('vehicles').select('*');
      if (data) setVehicles(data);
    };

    fetchVehicles();

    // Subscribe to Realtime Updates
    const channel = supabase
      .channel('realtime_vehicles')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'vehicles' },
        (payload) => {
          console.log('Realtime telemetry update:', payload);
          fetchVehicles(); // Refresh positions
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="p-4 bg-slate-800 text-white rounded-lg">
      <h3 className="font-bold text-emerald-400 mb-2">Active Essential Fleets ({vehicles.length})</h3>
      <ul className="space-y-2 text-sm">
        {vehicles.map((v) => (
          <li key={v.id} className="border-b border-slate-700 pb-1 flex justify-between">
            <span>{v.vehicle_number} ({v.commodity_type})</span>
            <span className="text-amber-400">{v.speed_kmph} km/h</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Phase 5: Vercel Deployment Checklist
1. Connect GitHub repository to Vercel.
2. Configure environment variables in Vercel Dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Verify build command: `next build`.
4. Test Edge/Serverless Route Handlers on live Vercel domain (`https://ner-logistics.vercel.app`).

---

## 7. SIH Pitch & Demonstration Highlights

When presenting this prototype to SIH evaluators, emphasize these primary innovations:

1. **PostGIS & Terrain-Aware Dynamic Cost Factor:** Show how traditional maps direct a truck onto a shorter road that is secretly prone to landslides, whereas this platform recalculates using PostGIS spatial queries and real-time precipitation risk.
2. **Supabase Realtime Telemetry:** Demonstrate moving a vehicle location in Supabase or via a test mobile phone feed and seeing the map marker instantly shift across the dashboard without browser refresh.
3. **Bandwidth Resilience & Vercel Edge Performance:** Demonstrate switching off network in Chrome DevTools, submitting an incident report, and seeing it queue offline before syncing back to Supabase.