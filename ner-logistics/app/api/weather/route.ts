import { NextRequest, NextResponse } from 'next/server';

export interface WeatherData {
  location: string;
  lat: number;
  lng: number;
  timestamp: string;
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

// Allow-list of valid NER waypoints for input validation
const VALID_COORDS = {
  lat: { min: 20.0, max: 30.0 },
  lng: { min: 85.0, max: 98.0 },
};

function isValidNERCoordinate(lat: number, lng: number): boolean {
  return (
    lat >= VALID_COORDS.lat.min && lat <= VALID_COORDS.lat.max &&
    lng >= VALID_COORDS.lng.min && lng <= VALID_COORDS.lng.max
  );
}

function getCurrentIndianDate(): string {
  const now = new Date();
  // IST = UTC + 5:30
  const ist = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
  return ist.toISOString().split('T')[0];
}

function getPreviousDate(dateStr: string): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

function getMonthFromDate(dateStr: string): number {
  return parseInt(dateStr.split('-')[1], 10);
}

function getWeatherCondition(precipMm: number, windKmph: number, humidity: number): string {
  if (precipMm > 50) return 'HEAVY_RAIN';
  if (precipMm > 20) return 'MODERATE_RAIN';
  if (precipMm > 5)  return 'LIGHT_RAIN';
  if (windKmph > 50) return 'HIGH_WIND';
  if (humidity > 85) return 'HUMID';
  return 'CLEAR';
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const latStr = searchParams.get('lat');
  const lngStr = searchParams.get('lng');
  const locationName = searchParams.get('name') || 'Unknown';

  // Input validation
  if (!latStr || !lngStr) {
    return NextResponse.json(
      { error: 'lat and lng query parameters are required' },
      { status: 400 }
    );
  }

  const lat = parseFloat(latStr);
  const lng = parseFloat(lngStr);

  if (isNaN(lat) || isNaN(lng) || !isValidNERCoordinate(lat, lng)) {
    return NextResponse.json(
      { error: 'Coordinates must be valid NER region values (lat 20-30, lng 85-98)' },
      { status: 400 }
    );
  }

  // Sanitize location name — no HTML or special chars
  const safeName = locationName.replace(/[^a-zA-Z0-9\s\-]/g, '').slice(0, 50);

  try {
    const today = getCurrentIndianDate();
    const yesterday = getPreviousDate(today);

    // Fetch historical (yesterday = most recent complete day) + forecast (today/tomorrow)
    const [histResponse, forecastResponse] = await Promise.all([
      fetch(
        `https://archive-api.open-meteo.com/v1/archive` +
        `?latitude=${lat}&longitude=${lng}` +
        `&start_date=${yesterday}&end_date=${yesterday}` +
        `&hourly=precipitation,temperature_2m,soil_moisture_0_to_7cm,` +
        `wind_speed_10m,relative_humidity_2m` +
        `&daily=precipitation_sum,wind_speed_10m_max,temperature_2m_max,` +
        `temperature_2m_min` +
        `&timezone=Asia%2FKolkata`,
        { next: { revalidate: 1800 } } // cache 30 min
      ),
      fetch(
        `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${lat}&longitude=${lng}` +
        `&hourly=precipitation_probability,precipitation` +
        `&daily=precipitation_sum,wind_speed_10m_max` +
        `&forecast_days=2` +
        `&timezone=Asia%2FKolkata`,
        { next: { revalidate: 1800 } }
      ),
    ]);

    if (!histResponse.ok || !forecastResponse.ok) {
      throw new Error('Weather API upstream error');
    }

    const histData = await histResponse.json();
    const forecastData = await forecastResponse.json();

    // Parse historical
    const daily = histData.daily || {};
    const hourly = histData.hourly || {};

    const precip24h   = (daily.precipitation_sum?.[0] ?? 0) || 0;
    const windMax     = (daily.wind_speed_10m_max?.[0] ?? 0) || 0;
    const tempMax     = (daily.temperature_2m_max?.[0] ?? 25) || 25;
    const tempMin     = (daily.temperature_2m_min?.[0] ?? 15) || 15;

    const smVals      = (hourly.soil_moisture_0_to_7cm || []).filter((x: number | null) => x != null) as number[];
    const soilMoisture = smVals.length ? smVals.reduce((a: number, b: number) => a + b, 0) / smVals.length : 0.28;

    const hrPrecip    = (hourly.precipitation || []).filter((x: number | null) => x != null) as number[];
    const peakHrRain  = hrPrecip.length ? Math.max(...hrPrecip) : 0;

    const humVals     = (hourly.relative_humidity_2m || []).filter((x: number | null) => x != null) as number[];
    const meanHumidity = humVals.length ? humVals.reduce((a: number, b: number) => a + b, 0) / humVals.length : 70;

    // Parse forecast for next 24h precipitation
    const fcastDaily = forecastData.daily || {};
    const forecastPrecip = (fcastDaily.precipitation_sum?.[1] ?? 0) || 0; // tomorrow

    const month = getMonthFromDate(today);
    const isMonsoon = month >= 5 && month <= 10;

    const weatherData: WeatherData = {
      location: safeName,
      lat,
      lng,
      timestamp: new Date().toISOString(),
      precip_mm_24h: Math.round(precip24h * 100) / 100,
      peak_hr_rainfall_mm: Math.round(peakHrRain * 100) / 100,
      soil_moisture: Math.round(soilMoisture * 10000) / 10000,
      wind_max_kmph: Math.round(windMax * 10) / 10,
      temp_max_c: Math.round(tempMax * 10) / 10,
      temp_min_c: Math.round(tempMin * 10) / 10,
      mean_humidity_pct: Math.round(meanHumidity * 10) / 10,
      is_monsoon: isMonsoon,
      forecast_precip_next_24h: Math.round(forecastPrecip * 100) / 100,
      weather_condition: getWeatherCondition(precip24h, windMax, meanHumidity),
    };

    return NextResponse.json(weatherData, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
        'X-Content-Type-Options': 'nosniff',
      },
    });

  } catch (err) {
    // Do NOT expose internal error details to client
    console.error('[weather API] Error fetching Open-Meteo data:', err);
    return NextResponse.json(
      { error: 'Weather service temporarily unavailable' },
      { status: 503 }
    );
  }
}
