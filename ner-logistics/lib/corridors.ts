// NER Corridor definitions with full geographic metadata
// Each segment has waypoint name + lat/lng so the risk API
// can fetch real-time Open-Meteo weather per location

export interface SegmentWithGeo {
  name: string;
  waypoint: string;        // matches WAYPOINT_METADATA key in risk-predict API
  distanceKm: number;
  lat: number;
  lng: number;
  slope: number;           // terrain slope proxy 0-10
  elevation_m: number;
}

export interface CorridorRoute {
  name: string;
  segments: SegmentWithGeo[];
}

export interface Corridor {
  id: string;
  label: string;
  primary: CorridorRoute;
  alternate: CorridorRoute;
}

export const NER_CORRIDORS_GEO: Corridor[] = [
  {
    id: 'guwahati-imphal',
    label: 'Guwahati → Imphal (via Dimapur)',
    primary: {
      name: 'NH-27/NH-2 Primary Route',
      segments: [
        { name: 'Guwahati → Nagaon',    waypoint: 'Nagaon',   distanceKm: 120, lat: 26.3516, lng: 92.6804, slope: 2, elevation_m: 55    },
        { name: 'Nagaon → Dimapur',     waypoint: 'Dimapur',  distanceKm: 95,  lat: 25.9097, lng: 93.7228, slope: 3, elevation_m: 271   },
        { name: 'Dimapur → Kohima',     waypoint: 'Kohima',   distanceKm: 74,  lat: 25.6700, lng: 94.1100, slope: 7, elevation_m: 1444  },
        { name: 'Kohima → Imphal',      waypoint: 'Imphal',   distanceKm: 140, lat: 24.8170, lng: 93.9368, slope: 5, elevation_m: 786   },
      ],
    },
    alternate: {
      name: 'Alt Route (via Jiribam)',
      segments: [
        { name: 'Guwahati → Silchar',   waypoint: 'Silchar',  distanceKm: 145, lat: 24.8333, lng: 92.7789, slope: 3, elevation_m: 29    },
        { name: 'Silchar → Jiribam',    waypoint: 'Jiribam',  distanceKm: 110, lat: 24.7500, lng: 93.0500, slope: 4, elevation_m: 100   },
        { name: 'Jiribam → Imphal',     waypoint: 'Imphal',   distanceKm: 220, lat: 24.8170, lng: 93.9368, slope: 5, elevation_m: 786   },
      ],
    },
  },
  {
    id: 'guwahati-shillong',
    label: 'Guwahati → Shillong',
    primary: {
      name: 'NH-6 Direct Route',
      segments: [
        { name: 'Guwahati → Nongpoh',   waypoint: 'Nongpoh',  distanceKm: 55,  lat: 25.9100, lng: 92.0000, slope: 6, elevation_m: 870   },
        { name: 'Nongpoh → Shillong',   waypoint: 'Shillong', distanceKm: 45,  lat: 25.5788, lng: 91.8933, slope: 7, elevation_m: 1496  },
      ],
    },
    alternate: {
      name: 'Alt via Jorabat-Barapani',
      segments: [
        { name: 'Guwahati → Jorabat',   waypoint: 'Jorabat',  distanceKm: 15,  lat: 26.0800, lng: 91.8200, slope: 2, elevation_m: 82    },
        { name: 'Jorabat → Barapani',   waypoint: 'Barapani', distanceKm: 60,  lat: 25.7000, lng: 91.9000, slope: 5, elevation_m: 950   },
        { name: 'Barapani → Shillong',  waypoint: 'Shillong', distanceKm: 20,  lat: 25.5788, lng: 91.8933, slope: 7, elevation_m: 1496  },
      ],
    },
  },
  {
    id: 'tezpur-tawang',
    label: 'Tezpur → Tawang (Arunachal)',
    primary: {
      name: 'NH-13 Primary',
      segments: [
        { name: 'Tezpur → Bhalukpong',  waypoint: 'Bhalukpong', distanceKm: 55, lat: 27.0000, lng: 92.6500, slope: 5, elevation_m: 210   },
        { name: 'Bhalukpong → Bomdila', waypoint: 'Bomdila',    distanceKm: 95, lat: 27.2700, lng: 92.4100, slope: 7, elevation_m: 2217  },
        { name: 'Bomdila → Sela Pass',  waypoint: 'Sela Pass',  distanceKm: 80, lat: 27.5100, lng: 92.0800, slope: 9, elevation_m: 4170  },
        { name: 'Sela Pass → Tawang',   waypoint: 'Tawang',     distanceKm: 85, lat: 27.5860, lng: 91.8596, slope: 8, elevation_m: 2669  },
      ],
    },
    alternate: {
      name: 'Dirang Bypass Route',
      segments: [
        { name: 'Tezpur → Bhalukpong',            waypoint: 'Bhalukpong', distanceKm: 55,  lat: 27.0000, lng: 92.6500, slope: 5, elevation_m: 210  },
        { name: 'Bhalukpong → Dirang',             waypoint: 'Dirang',     distanceKm: 125, lat: 27.3500, lng: 92.2400, slope: 7, elevation_m: 1560 },
        { name: 'Dirang → Tawang (Military Road)', waypoint: 'Tawang',     distanceKm: 100, lat: 27.5860, lng: 91.8596, slope: 8, elevation_m: 2669 },
      ],
    },
  },
  {
    id: 'siliguri-gangtok',
    label: 'Siliguri → Gangtok (Sikkim)',
    primary: {
      name: 'NH-10 Primary',
      segments: [
        { name: 'Siliguri → Rangpo',  waypoint: 'Rangpo',  distanceKm: 68, lat: 27.1700, lng: 88.5300, slope: 6, elevation_m: 325  },
        { name: 'Rangpo → Gangtok',   waypoint: 'Gangtok', distanceKm: 40, lat: 27.3314, lng: 88.6138, slope: 7, elevation_m: 1650 },
      ],
    },
    alternate: {
      name: 'Kalimpong Bypass',
      segments: [
        { name: 'Siliguri → Kalimpong',          waypoint: 'Kalimpong', distanceKm: 55, lat: 27.0600, lng: 88.4700, slope: 6, elevation_m: 1250 },
        { name: 'Kalimpong → Gangtok (Algarah)', waypoint: 'Gangtok',   distanceKm: 75, lat: 27.3314, lng: 88.6138, slope: 7, elevation_m: 1650 },
      ],
    },
  },
  {
    id: 'silchar-aizawl',
    label: 'Silchar → Aizawl (Mizoram)',
    primary: {
      name: 'NH-306 Primary',
      segments: [
        { name: 'Silchar → Jiribam',   waypoint: 'Jiribam', distanceKm: 110, lat: 24.7500, lng: 93.0500, slope: 4, elevation_m: 100  },
        { name: 'Jiribam → Aizawl',   waypoint: 'Aizawl',  distanceKm: 140, lat: 23.7272, lng: 92.7176, slope: 8, elevation_m: 1132 },
      ],
    },
    alternate: {
      name: 'Via Lunglei (South Mizoram)',
      segments: [
        { name: 'Silchar → Saiha',  waypoint: 'Silchar', distanceKm: 100, lat: 24.8333, lng: 92.7789, slope: 3, elevation_m: 29   },
        { name: 'Saiha → Aizawl',  waypoint: 'Aizawl',  distanceKm: 200, lat: 23.7272, lng: 92.7176, slope: 8, elevation_m: 1132 },
      ],
    },
  },
];
