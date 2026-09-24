import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const SUPPLY_HUBS = [
  { name: 'Guwahati Medical Hub', lat: 26.1445, lng: 91.7362, type: 'Medical' },
  { name: 'Dimapur FCI Depot', lat: 25.9097, lng: 93.7228, type: 'Food' },
  { name: 'Silchar Supply Hub', lat: 24.8333, lng: 92.7789, type: 'General' },
  { name: 'Shillong Cold Chain Hub', lat: 25.5788, lng: 91.8933, type: 'Medical' },
  { name: 'Aizawl District Hub', lat: 23.7272, lng: 92.7176, type: 'General' },
  { name: 'Imphal Army Hub', lat: 24.817, lng: 93.9368, type: 'Military' },
  { name: 'Tezpur Army Base', lat: 26.6638, lng: 92.8001, type: 'Military' },
  { name: 'Gangtok Supply Depot', lat: 27.3314, lng: 88.6138, type: 'General' },
];

async function seed() {
  console.log('Attempting to insert supply hubs...');
  
  // Try inserting directly
  const { data, error } = await supabase
    .from('supply_hubs')
    .upsert(SUPPLY_HUBS.map(hub => ({
      name: hub.name,
      type: hub.type,
      location: `SRID=4326;POINT(${hub.lng} ${hub.lat})`
    })), { onConflict: 'name' });

  if (error) {
    console.error('Error inserting hubs. Table might not exist:', error);
    
    // Check if it's a "relation does not exist" error
    if (error.code === '42P01') {
      console.log('The "supply_hubs" table does not exist in your Supabase database.');
      console.log('Please run the following SQL in your Supabase SQL Editor:');
      console.log(`
CREATE TABLE supply_hubs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,
  location geometry(Point, 4326) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
      `);
    }
  } else {
    console.log('Successfully seeded supply hubs into the database!');
  }
}

seed();
