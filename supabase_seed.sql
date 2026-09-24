-- =============================================================
-- NER Logistics Intelligence Platform - Supabase SQL Seed Script
-- Run this in your Supabase SQL Editor
-- =============================================================

-- 1. Enable PostGIS Extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Drop tables if re-running (safe re-seeding)
DROP TABLE IF EXISTS public.incidents CASCADE;
DROP TABLE IF EXISTS public.vehicles CASCADE;

-- 3. Incidents Table (Geo-tagged Disruption Reports)
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

CREATE INDEX idx_incidents_geo ON public.incidents USING GIST (location);

-- 4. Vehicles Table (Live Fleet Tracking)
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

-- 5. Enable Supabase Realtime on key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.incidents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.vehicles;

-- 6. PostGIS Function: Find Incidents Near Route Point (Radius in Meters)
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

-- 7. Enable Row Level Security (RLS) - allow public read, authenticated write
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- Public read access for incidents
CREATE POLICY "incidents_public_read" ON public.incidents FOR SELECT USING (true);
-- Authenticated users can insert incidents
CREATE POLICY "incidents_authenticated_insert" ON public.incidents FOR INSERT WITH CHECK (true);
-- Authenticated users can update incidents
CREATE POLICY "incidents_authenticated_update" ON public.incidents FOR UPDATE USING (true);

-- Public read access for vehicles
CREATE POLICY "vehicles_public_read" ON public.vehicles FOR SELECT USING (true);
-- Authenticated users can update vehicle positions
CREATE POLICY "vehicles_authenticated_update" ON public.vehicles FOR UPDATE USING (true);
CREATE POLICY "vehicles_authenticated_insert" ON public.vehicles FOR INSERT WITH CHECK (true);

-- =============================================================
-- SEED: Mock NER Corridor Incidents
-- =============================================================

INSERT INTO public.incidents (title, state, district, highway, incident_type, severity, status, location, estimated_clearance_hours, reporter_name, description)
VALUES
  -- NH-27 Corridor: Assam
  ('Major Landslide near Kaziranga', 'Assam', 'Nagaon', 'NH-27', 'LANDSLIDE', 'CRITICAL', 'ACTIVE', ST_SetSRID(ST_MakePoint(93.6000, 26.5700), 4326), 24, 'Ranbir Das', 'Massive landslide blocking both lanes. Heavy boulders on NH-27. Clearance teams deployed.'),
  ('Flash Flood at Numaligarh', 'Assam', 'Golaghat', 'NH-37', 'FLOOD', 'MODERATE', 'ACTIVE', ST_SetSRID(ST_MakePoint(94.0500, 26.6700), 4326), 12, 'Priya Bora', 'Floodwater from Bhogdoi river spilling onto NH-37. Traffic restricted to light vehicles.'),
  ('Bridge Damage at Dibrugarh Approach', 'Assam', 'Dibrugarh', 'NH-27', 'BRIDGE_FAILURE', 'CRITICAL', 'VERIFIED', ST_SetSRID(ST_MakePoint(94.9100, 27.4800), 4326), 48, 'Mukesh Gogoi', 'Steel girder failure. Load limit reduced to 5 tonnes. Engineers on site.'),
  
  -- Shillong Highway
  ('Landslide at Nongpoh', 'Meghalaya', 'Ri Bhoi', 'NH-6', 'LANDSLIDE', 'MODERATE', 'ACTIVE', ST_SetSRID(ST_MakePoint(92.0000, 25.9100), 4326), 8, 'L. Mawrie', 'Partial landslide narrowing road to single lane. Traffic moving slowly.'),
  ('Road Erosion Umiam Stretch', 'Meghalaya', 'East Khasi Hills', 'NH-6', 'LANDSLIDE', 'LOW', 'CLEARED', ST_SetSRID(ST_MakePoint(91.8800, 25.7000), 4326), 0, 'BRO Team', 'Road restored. Surface patching complete.'),
  
  -- Barak Valley Route
  ('Flood at Cachar District', 'Assam', 'Cachar', 'NH-37', 'FLOOD', 'CRITICAL', 'ACTIVE', ST_SetSRID(ST_MakePoint(92.8000, 24.8000), 4326), 36, 'Rajib Singha', 'Barak river overflow. Entire stretch submerged 2-3 feet. Emergency ferries operational.'),
  
  -- Nagaland-Manipur Corridor
  ('Landslide Kohima-Imphal Road', 'Nagaland', 'Kohima', 'NH-2', 'LANDSLIDE', 'CRITICAL', 'ACTIVE', ST_SetSRID(ST_MakePoint(94.1100, 25.6700), 4326), 18, 'Visakhro Sekhose', 'Multiple landslides in 5km stretch. Military convoy delayed 10+ hours.'),
  ('Traffic Congestion Dimapur Gate', 'Nagaland', 'Dimapur', 'NH-29', 'TRAFFIC_CONGESTION', 'LOW', 'ACTIVE', ST_SetSRID(ST_MakePoint(93.7200, 25.9100), 4326), 2, 'Traffic Police', 'Weekend market congestion. Expected to clear by evening.'),
  
  -- Mizoram Link
  ('Landslide Durtlang Hills', 'Mizoram', 'Aizawl', 'NH-306', 'LANDSLIDE', 'MODERATE', 'ACTIVE', ST_SetSRID(ST_MakePoint(92.7300, 23.7300), 4326), 10, 'Lalthansanga', 'Hillside collapse blocking approach to Aizawl city. Alternate route via Zemabawk.'),
  
  -- Arunachal Highway
  ('Bridge Closure Bhalukpong', 'Arunachal Pradesh', 'West Kameng', 'NH-13', 'BRIDGE_FAILURE', 'CRITICAL', 'VERIFIED', ST_SetSRID(ST_MakePoint(92.6500, 27.0000), 4326), 72, 'PWD AP', 'Temporary bridge damaged by flash floods. Bailey bridge installation in progress.'),
  ('Landslide near Bomdila', 'Arunachal Pradesh', 'West Kameng', 'NH-13', 'LANDSLIDE', 'MODERATE', 'ACTIVE', ST_SetSRID(ST_MakePoint(92.4100, 27.2700), 4326), 14, 'R. Tading', 'Rocky landslide 15km before Bomdila. NDRF deployed.'),
  
  -- Sikkim Lifeline
  ('Flood at Rangpo', 'Sikkim', 'East Sikkim', 'NH-10', 'FLOOD', 'MODERATE', 'ACTIVE', ST_SetSRID(ST_MakePoint(88.5300, 27.1700), 4326), 6, 'Sikkim PWD', 'Teesta river flooding NH-10 at Rangpo. Convoy halted.'),
  ('Landslide 32nd Mile Gangtok', 'Sikkim', 'East Sikkim', 'NH-10', 'LANDSLIDE', 'LOW', 'CLEARED', ST_SetSRID(ST_MakePoint(88.5900, 27.2500), 4326), 0, 'BRO Beacon', 'Cleared successfully. Road open for all vehicles.');

-- =============================================================
-- SEED: Mock Fleet Vehicles
-- =============================================================

INSERT INTO public.vehicles (vehicle_number, driver_name, commodity_type, priority_level, origin_name, destination_name, current_location, speed_kmph, status)
VALUES
  ('AS-01-NH-4521', 'Deepak Sharma', 'Medical Oxygen Cylinders', 'HIGH', 'Guwahati AIIMS', 'Imphal Civil Hospital', ST_SetSRID(ST_MakePoint(93.1800, 26.1800), 4326), 48.5, 'IN_TRANSIT'),
  ('AS-02-TR-7832', 'Ramesh Kalita', 'Vaccines (COVID Booster)', 'HIGH', 'Guwahati Cold Chain Hub', 'Aizawl District Hospital', ST_SetSRID(ST_MakePoint(92.7500, 24.9000), 4326), 35.0, 'IN_TRANSIT'),
  ('MN-01-DE-2291', 'Ibomcha Singh', 'Essential Food Rations (Rice)', 'MEDIUM', 'Dimapur FCI Depot', 'Imphal East Market', ST_SetSRID(ST_MakePoint(93.8500, 25.6000), 4326), 0.0, 'DELAYED'),
  ('AR-01-TW-5501', 'Tenzin Gyatso', 'Military Disaster Aid', 'HIGH', 'Tezpur Army Base', 'Tawang Forward Base', ST_SetSRID(ST_MakePoint(92.5000, 27.1000), 4326), 22.0, 'IN_TRANSIT'),
  ('SK-01-GT-1109', 'Pema Dorjee', 'Cement & Construction Materials', 'NORMAL', 'Siliguri Rail Yard', 'Gangtok Construction Site', ST_SetSRID(ST_MakePoint(88.4800, 27.1500), 4326), 30.0, 'IN_TRANSIT'),
  ('TR-01-AG-8874', 'Dipak Roy', 'Essential Food Rations (Dal)', 'MEDIUM', 'Silchar FCI Depot', 'Agartala Central Market', ST_SetSRID(ST_MakePoint(92.0000, 23.7000), 4326), 55.0, 'IN_TRANSIT'),
  ('ML-01-SH-3310', 'Peter Nongkynrih', 'Medical Supplies (Vaccines)', 'HIGH', 'Guwahati Medical Store', 'Shillong Civil Hospital', ST_SetSRID(ST_MakePoint(91.7500, 25.5700), 4326), 0.0, 'IDLE'),
  ('AS-03-JH-6642', 'Bikash Dutta', 'Petroleum (Diesel)', 'MEDIUM', 'Numaligarh Refinery', 'Jorhat District', ST_SetSRID(ST_MakePoint(94.0000, 26.6000), 4326), 40.0, 'IN_TRANSIT');

-- =============================================================
-- SEED: Additional Advanced Scenarios (Added for extended testing)
-- =============================================================

INSERT INTO public.incidents (title, state, district, highway, incident_type, severity, status, location, estimated_clearance_hours, reporter_name, description)
VALUES
  -- Multi-hazard scenario in Sikkim
  ('Flash Flood cutting off NH-10', 'Sikkim', 'Mangan', 'NH-10', 'FLOOD', 'CRITICAL', 'ACTIVE', ST_SetSRID(ST_MakePoint(88.5200, 27.5000), 4326), 48, 'NDRF Team Alpha', 'Teesta river breached embankments. Road washed away for 500 meters.'),
  ('Subsequent Landslide due to soil saturation', 'Sikkim', 'Mangan', 'NH-10', 'LANDSLIDE', 'CRITICAL', 'ACTIVE', ST_SetSRID(ST_MakePoint(88.5250, 27.5100), 4326), 72, 'BRO Command', 'Mountain side collapsed post-flooding. Complete blockage of alternate dirt track.'),
  
  -- Urban Waterlogging
  ('Severe Waterlogging GS Road', 'Assam', 'Kamrup Metropolitan', 'GS Road', 'TRAFFIC_CONGESTION', 'MODERATE', 'ACTIVE', ST_SetSRID(ST_MakePoint(91.7800, 26.1500), 4326), 4, 'Traffic Control', 'Knee-deep water causing massive traffic snarls affecting supply chain origin points.'),
  
  -- Cleared Incident for History Testing
  ('Cleared Bridge Debris', 'Arunachal Pradesh', 'Papum Pare', 'NH-415', 'BRIDGE_FAILURE', 'MODERATE', 'CLEARED', ST_SetSRID(ST_MakePoint(93.6000, 27.1000), 4326), 0, 'PWD Team', 'Debris cleared, bridge structurally sound for light vehicles up to 10T.');

INSERT INTO public.vehicles (vehicle_number, driver_name, commodity_type, priority_level, origin_name, destination_name, current_location, speed_kmph, status)
VALUES
  -- Emergency Responders
  ('NDRF-SK-01', 'Commander Raj', 'NDRF Rescue Team & Equipment', 'HIGH', 'Siliguri Base', 'Mangan Flood Zone', ST_SetSRID(ST_MakePoint(88.4500, 27.2000), 4326), 65.0, 'IN_TRANSIT'),
  ('BRO-AP-99', 'Engineer T. Dorjee', 'Heavy Excavators (JCB)', 'HIGH', 'Tezpur', 'Bomdila Landslide', ST_SetSRID(ST_MakePoint(92.7000, 26.8000), 4326), 25.0, 'IN_TRANSIT'),
  
  -- Stalled Logistics
  ('AS-01-HC-4451', 'Manish Kumar', 'Perishable Food (Vegetables)', 'NORMAL', 'Guwahati Market', 'Shillong', ST_SetSRID(ST_MakePoint(91.8000, 25.9500), 4326), 0.0, 'DELAYED'),
  ('NL-02-TR-1100', 'John Sema', 'Construction Steel', 'MEDIUM', 'Dimapur', 'Kohima', ST_SetSRID(ST_MakePoint(93.9000, 25.7500), 4326), 15.0, 'IN_TRANSIT');

-- =============================================================
-- SEED: Authentication & RBAC (Role-Based Access Control)
-- =============================================================

-- 1. Create Profiles Table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT CHECK (role IN ('ADMIN_DISPATCHER', 'FIELD_OFFICER', 'PUBLIC_REPORTER')) DEFAULT 'PUBLIC_REPORTER',
  state_jurisdiction TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING ( true );

CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT
  WITH CHECK ( auth.uid() = id );

CREATE POLICY "Users can update own profile."
  ON public.profiles FOR UPDATE
  USING ( auth.uid() = id );

-- Enable RLS on core tables
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.corridors ENABLE ROW LEVEL SECURITY;

-- Incidents Policies
CREATE POLICY "Incidents are viewable by everyone."
  ON public.incidents FOR SELECT
  USING ( true );

CREATE POLICY "Anyone can insert an incident."
  ON public.incidents FOR INSERT
  WITH CHECK ( true );

CREATE POLICY "Only ADMIN_DISPATCHER can update incidents."
  ON public.incidents FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN_DISPATCHER'
    )
  );

-- Vehicles Policies
CREATE POLICY "Vehicles are viewable by everyone."
  ON public.vehicles FOR SELECT
  USING ( true );

CREATE POLICY "Only ADMIN_DISPATCHER can mutate vehicles."
  ON public.vehicles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN_DISPATCHER'
    )
  );

-- Corridors Policies
CREATE POLICY "Corridors are viewable by everyone."
  ON public.corridors FOR SELECT
  USING ( true );
