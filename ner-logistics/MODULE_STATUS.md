# NER Logistics MVP - Detailed Module Status Audit

## 1. Problem Statement Alignment

Based on the original SIH 2026 problem statement for the NER Smart Logistics Intelligence Platform, here is a detailed breakdown of **What's Done** and **What Needs to be Done**:

### What's Done (Achieved Requirements)
- ✅ **Real-time Accessibility Monitoring (Req a):** `MapContainerComponent` provides a live GIS map (via `react-leaflet`) that visualizes active road incidents and supply hubs.
- ✅ **Disruption Prediction (Req b):** The `RiskRouteEngine` and `/api/risk-predict` module proactively evaluate terrain slope, live weather, and soil moisture to predict landslides and floods using a multi-factor risk model.
- ✅ **Centralized Dashboard (Req g):** The `page.tsx` layout successfully provides a unified dashboard for visualizing district-wise connectivity, bottlenecks, and real-time fleet operations.
- ✅ **Offline Support & Field Reporting (Req f & h):** `CrowdsourcingForm` enables geo-tagged reporting and seamlessly synchronizes data using `IndexedDB` when offline, flushing to the cloud when networks return.
- ✅ **Multilingual Support (Req h):** Localized language context (`LanguageToggle.tsx`) is implemented to support diverse NER dialects.
- ✅ **Weather API Integration (Expected Solution):** `/api/weather` fully integrates with Open-Meteo for accurate, localized environmental data.

### What Needs to be Done (Pending Requirements)
- ❌ **Photo/Media Uploads for Field Reports (Req f):** The current `CrowdsourcingForm` captures text and geo-tags, but lacks the ability for officials to upload *photographs* or video evidence of incidents.
- ❌ **Real GPS Ingestion (Req d):** Vehicle movement in `LiveFleetTracker` is currently simulated via a loop (`Math.random()`). We must replace this with a real IoT/GPS webhook endpoint for live telematics.
- ❌ **Automated Push Notifications (Req e):** While the UI shows visual alerts for geofence breaches, there is no system (like SMS, WhatsApp, or email) to proactively send *automated push alerts* to stakeholders.
- ❌ **Dynamic Alternate Routing (Req c):** The app currently evaluates risk on *hardcoded* geographic corridors. It needs a routing graph (e.g., PostGIS `pgRouting`) to dynamically generate true alternative routes on the fly.
- ❌ **Gov & Transport DB Integration (Expected Solution):** Integration with external government transport databases or APIs (like Vahan/Sarathi) is missing.

---

## 2. Header & Summary Metrics

**Overall MVP Completion Percentage:** ~85% (Supabase integration resolved)

**Summary Count Table:**

| Status | Count | Modules |
| :--- | :---: | :--- |
| **[🟢 Fully Operational]** | 4 | Weather API, Offline Crowdsourcing Form, Database/Persistence, Map View |
| **[🟡 Partially Operational]** | 2 | Risk Route Engine, Live Fleet Tracker |
| **[🟠 Mocked Data]** | 1 | Geographic Corridors Data |
| **[🔵 Just UI / Shell]** | 0 | (All UI components now have functional data bindings) |
| **[🔴 Broken / Todo]** | 0 | (Major blockers resolved) |

---

## 3. Categorized Module Audit

### Database / Persistence
- **Status:** `[🟢 Fully Operational]`
- **Entry File:** `lib/supabase/client.ts`
- **Current Implementation:** Properly configured to use `@supabase/ssr` with valid environment variables. Connects to the remote PostGIS-enabled database and powers real-time channel subscriptions.
- **Gaps & Mocked Elements:** None at the connection layer.
- **Dependencies / Blockers:** None. Resolved.

### UI & Maps
- **Status:** `[🟢 Fully Operational]`
- **Entry File:** `components/MapContainerComponent.tsx`
- **Current Implementation:** Renders `react-leaflet` dynamically. Parses incoming PostGIS geometries (`ST_AsGeoJSON`) to place map markers for real-time incidents. Uses real-time Postgres subscriptions.
- **Gaps & Mocked Elements:** `SUPPLY_HUBS` and `NER_CORRIDORS_LINES` are currently hardcoded constants rather than being fetched from the database.
- **Dependencies / Blockers:** None.

### External Integrations (Weather Data)
- **Status:** `[🟢 Fully Operational]`
- **Entry File:** `app/api/weather/route.ts`
- **Current Implementation:** Fully functional integration with the Open-Meteo API. Fetches historical and forecast data, factoring in Indian Standard Time and monsoon detection.
- **Gaps & Mocked Elements:** None observed. Robust error handling and fallback default values are present.
- **Dependencies / Blockers:** Relies entirely on the Open-Meteo external endpoint availability.

### Core Business Logic (Risk Route Engine)
- **Status:** `[🟡 Partially Operational]`
- **Entry File:** `components/RiskRouteEngine.tsx`, `app/api/risk-predict/route.ts`
- **Current Implementation:** Connects UI to a live risk-prediction API which fetches real weather data per waypoint and computes risk. Visualizes explainable AI breakdown.
- **Gaps & Mocked Elements:** Relies heavily on `FALLBACK_WEIGHTS` (hardcoded heuristics) if the trained ML model file is missing. Terrain slopes and elevations are hardcoded.
- **Dependencies / Blockers:** Requires the real trained machine learning model output file (`model_weights.json`) and migration of corridors to PostGIS.

### Operations (Live Fleet Tracking)
- **Status:** `[🟡 Partially Operational]`
- **Entry File:** `components/LiveFleetTracker.tsx`
- **Current Implementation:** Fetches vehicles from Supabase and sets up a `realtime` Postgres subscription. Calculates live geofence alerts for high-risk zones using the Haversine formula.
- **Gaps & Mocked Elements:** Still uses an active `setInterval` alongside `Math.random()` to continuously mutate coordinates in the Supabase database (simulating GPS).
- **Dependencies / Blockers:** Needs a real IoT / GPS tracking ingest webhook (e.g., MQTT or REST endpoint from vehicle telematics).

### Data Ingestion (Crowdsourcing Form)
- **Status:** `[🟢 Fully Operational]`
- **Entry File:** `components/CrowdsourcingForm.tsx`
- **Current Implementation:** Robust offline-first reporting system using `navigator.geolocation` and `IndexedDB`. Flushes to Supabase once online.
- **Gaps & Mocked Elements:** Uses `setTimeout` for a brief 3-second visual reset of the sync status. Lacks photo upload feature as required by problem statement.
- **Dependencies / Blockers:** None.

---

## 4. Global Technical Debt & Stubs Inventory

**Mocked Data / Fake Logic:**
- **GPS Simulation:** `Math.random()` simulation loops in `LiveFleetTracker.tsx`.
- **Static Geometries:** `lib/corridors.ts`, `WAYPOINT_METADATA`, and `SUPPLY_HUBS`. Should live in PostGIS.
- **ML Fallbacks:** `FALLBACK_WEIGHTS` hardcoded in `app/api/risk-predict/route.ts`.

**TODOs, FIXMEs & Hacks:**
- **Security / CSP:** `app/layout.tsx` contains a `TODO(security)` comment indicating a CSP nonce-based policy needs to be added.
- **UI Lifecycle:** `setTimeout` is used for status lifecycle visual resets in `CrowdsourcingForm.tsx`.

**Missing API / Error Handling:**
- **Authentication/RBAC:** There is no authentication or role-based access control. The reporting system is open to public submissions.
- **Error Boundaries:** `MapContainerComponent` has no specialized error boundary specifically catching database query failures.

---

## 5. Actionable Completion Roadmap

### Phase 1: Problem Statement Fulfillment (Feature Completeness)
1. **Media Uploads:** Integrate Supabase Storage to allow image/video uploads within the `CrowdsourcingForm` so field officials can attach photographic evidence of incidents.
2. **Automated Alerting Pipeline:** Implement an edge function or cron job that listens to new critical incidents in Supabase and triggers SMS/Email/WhatsApp alerts via providers like Twilio or Resend.
3. **True Alternate Routing:** Set up `pgRouting` in the Supabase PostGIS database to dynamically calculate optimal, risk-weighted detour paths instead of evaluating predefined hardcoded arrays.

### Phase 2: Integration & Real Data Pipeline
1. **Remove Simulator Loop:** Strip the `setInterval` and `Math.random()` fake GPS movement logic from `LiveFleetTracker.tsx`. Set up an external ingest endpoint (REST/MQTT) for real fleet telemetry data.
2. **Dynamic Corridors & Hubs:** Migrate static arrays to Supabase `PostGIS` geometries.
3. **Model Integration:** Verify and commit the properly trained `model_weights.json` for accurate ML inferences.

### Phase 3: Production Readiness & Hardening
1. **Authentication:** Implement Supabase Auth so forms and dashboards are protected by a user session or API keys.
2. **Security Headers:** Address the `TODO` in `app/layout.tsx` by adding a proper Content Security Policy (CSP).
3. **Telemetry Edge Cases:** Handle edge cases gracefully where `navigator.geolocation` permission is denied by users on the incident reporting form (needs a manual map-pin fallback UI).
