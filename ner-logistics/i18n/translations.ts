// Multilingual translations for NER Logistics Intelligence Platform
// Languages: English (en), Hindi (hi), Assamese (as), Bengali (bn), Manipuri (mni)

export type Language = 'en' | 'hi' | 'as' | 'bn' | 'mni';

export interface Translations {
  appName: string;
  appSubtitle: string;
  stats: {
    activeIncidents: string;
    fleetVehicles: string;
    corridorsMonitored: string;
    statesCovered: string;
    live: string;
    sihTagline: string;
    footer: string;
  };
  nav: {
    map: string;
    routing: string;
    fleet: string;
    report: string;
    alerts: string;
  };
  auth: {
    login: string;
    logout: string;
    title: string;
    subtitle: string;
    adminDispatcher: string;
    adminDispatcherDesc: string;
    fieldOfficer: string;
    fieldOfficerDesc: string;
    publicReporter: string;
    publicReporterDesc: string;
    securedBadge: string;
  };
  map: {
    title: string;
    mapLayers: string;
    roadStatus: string;
    layerIncidents: string;
    layerSupplyHubs: string;
    layerWeather: string;
    green: string;
    yellow: string;
    red: string;
    noIncidents: string;
    healthScore: string;
    etaClearance: string;
    reportedBy: string;
    verify: string;
    clear: string;
    hubType: string;
    rain24h: string;
    peakHourly: string;
    soilMoisture: string;
    maxWind: string;
    temperature: string;
    humidity: string;
    monsoonAlert: string;
    clearWeather: string;
    lightRain: string;
    moderateRain: string;
    heavyRain: string;
    photoEvidenceAlt: string;
  };
  routing: {
    title: string;
    subtitle: string;
    modelFeatures: string;
    formulaCaption: string;
    selectCorridor: string;
    selectRoutePlaceholder: string;
    analyze: string;
    primaryRoute: string;
    alternateRoute: string;
    distance: string;
    estimatedTime: string;
    delayForecast: string;
    riskLevel: string;
    riskBreakdown: string;
    rainfall: string;
    landslide: string;
    degradation: string;
    recommended: string;
    aiRecommended: string;
    liveWeatherData: string;
    distanceLabel: string;
    estTimeLabel: string;
    delayLabel: string;
    showSegments: string;
    hideSegments: string;
    segmentsCount: string;
    segment: string;
    liveEnvData: string;
    modelExplainability: string;
    rainfallImpact: string;
    soilSaturation: string;
    terrainSlope: string;
    windHumidity: string;
    monsoonSeason: string;
    risk: string;
    fetchingWeather: string;
    step1: string;
    step2: string;
    step3: string;
    step4: string;
    emptyPrompt: string;
    emptySubtext: string;
  };
  fleet: {
    title: string;
    activeFleets: string;
    vehicle: string;
    commodity: string;
    speed: string;
    status: string;
    priority: string;
    origin: string;
    destination: string;
    driver: string;
    gpsUpdate: string;
    highPriority: string;
    mediumPriority: string;
    normalPriority: string;
    geofenceAlert: string;
    vehiclesInDanger: string;
    lastUpdated: string;
  };
  report: {
    title: string;
    subtitle: string;
    yourLocation: string;
    detectLocation: string;
    locationDenied: string;
    incidentType: string;
    incidentTitle: string;
    severity: string;
    description: string;
    reporterName: string;
    highway: string;
    district: string;
    state: string;
    submit: string;
    saveOffline: string;
    offlineQueue: string;
    syncing: string;
    syncSuccess: string;
    syncNow: string;
    photoEvidence: string;
    captureUpload: string;
    onlineBadge: string;
    offlineBadge: string;
    landslide: string;
    flood: string;
    bridgeFailure: string;
    congestion: string;
    low: string;
    moderate: string;
    critical: string;
    placeholderTitle: string;
    placeholderDistrict: string;
    placeholderHighway: string;
    placeholderReporter: string;
    placeholderDescription: string;
  };
  status: {
    inTransit: string;
    idle: string;
    delayed: string;
    arrived: string;
    active: string;
    verified: string;
    cleared: string;
  };
  common: {
    loading: string;
    error: string;
    refresh: string;
    close: string;
    hours: string;
    km: string;
    kmph: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    appName: 'NER LogisticsAI',
    appSubtitle: 'Smart Logistics & Accessibility Intelligence Platform for North Eastern Region',
    stats: {
      activeIncidents: 'Active Incidents',
      fleetVehicles: 'Fleet Vehicles',
      corridorsMonitored: 'Corridors Monitored',
      statesCovered: 'States Covered',
      live: 'LIVE',
      sihTagline: 'SIH 2026 · NER Infrastructure',
      footer: 'NER LogisticsAI · SIH 2026 · Powered by Supabase + Next.js + PostGIS',
    },
    nav: {
      map: 'GIS Map',
      routing: 'Risk Routing',
      fleet: 'Fleet Tracker',
      report: 'Report Incident',
      alerts: 'Alerts',
    },
    auth: {
      login: 'Login',
      logout: 'Logout',
      title: 'Platform Authentication',
      subtitle: 'Select a demo role to test RBAC features',
      adminDispatcher: 'Admin Dispatcher',
      adminDispatcherDesc: 'Full command center access, verify & clear incidents',
      fieldOfficer: 'Field Officer',
      fieldOfficerDesc: 'Submit incidents, view fleet status & sync offline reports',
      publicReporter: 'Public Reporter',
      publicReporterDesc: 'Read-only road accessibility map, public report submissions',
      securedBadge: 'Logs in securely via Supabase Auth + RLS',
    },
    map: {
      title: 'Real-Time GIS Accessibility Map',
      mapLayers: 'Map Layers',
      roadStatus: 'Road Status',
      layerIncidents: 'Active Incidents',
      layerSupplyHubs: 'Supply Hubs',
      layerWeather: 'Weather Overlay',
      green: 'Clear (Score 80-100)',
      yellow: 'Restricted (Score 50-79)',
      red: 'Blocked (Score 0-49)',
      noIncidents: 'No active incidents in this area',
      healthScore: 'Health Score',
      etaClearance: 'ETA Clearance',
      reportedBy: 'Reported by',
      verify: '✓ Verify',
      clear: '✕ Clear',
      hubType: 'Hub',
      rain24h: '24h Rainfall',
      peakHourly: 'Peak Hourly',
      soilMoisture: 'Soil Moisture',
      maxWind: 'Max Wind',
      temperature: 'Temperature',
      humidity: 'Rel. Humidity',
      monsoonAlert: 'Active Monsoon Season',
      clearWeather: 'Clear Sky',
      lightRain: 'Light Rain',
      moderateRain: 'Moderate Rain',
      heavyRain: 'Heavy Rain',
      photoEvidenceAlt: 'Incident Evidence',
    },
    routing: {
      title: 'AI-Powered Dynamic Risk Routing',
      subtitle: 'Logistic Regression · Trained on NER historical incidents · Real-time Open-Meteo weather',
      modelFeatures: 'ML Model Features',
      formulaCaption: 'σ = sigmoid · Trained on 33+ verified NER incidents (2022–2024) + Open-Meteo historical',
      selectCorridor: 'Select NER Corridor',
      selectRoutePlaceholder: 'Select a route...',
      analyze: 'Analyze Routes',
      primaryRoute: 'Primary Route',
      alternateRoute: 'AI Risk-Aware Alternate',
      distance: 'Distance',
      estimatedTime: 'Estimated Time',
      delayForecast: 'Delay Forecast',
      riskLevel: 'Risk Level',
      riskBreakdown: 'Risk Breakdown',
      rainfall: 'Rainfall',
      landslide: 'Landslide',
      degradation: 'Road Degradation',
      recommended: 'RECOMMENDED',
      aiRecommended: 'AI RECOMMENDED',
      liveWeatherData: 'Live weather data',
      distanceLabel: 'Distance',
      estTimeLabel: 'Est. Time',
      delayLabel: 'Delay',
      showSegments: 'Show segment analysis',
      hideSegments: 'Hide segment analysis',
      segmentsCount: 'segments',
      segment: 'Segment',
      liveEnvData: 'Live Environmental Data',
      modelExplainability: 'Risk Contribution (Model Explainability)',
      rainfallImpact: 'Rainfall Impact',
      soilSaturation: 'Soil Saturation',
      terrainSlope: 'Terrain (Slope+Elev)',
      windHumidity: 'Wind + Humidity',
      monsoonSeason: 'Monsoon Season',
      risk: 'risk',
      fetchingWeather: 'Fetching live weather from Open-Meteo for each waypoint…',
      step1: 'Loading environmental data',
      step2: 'Running ML inference',
      step3: 'Computing edge weights',
      step4: 'Comparing routes',
      emptyPrompt: 'Select a corridor and click "Analyze Routes"',
      emptySubtext: 'AI will fetch live weather for each waypoint',
    },
    fleet: {
      title: 'Essential Commodity Fleet Tracker',
      activeFleets: 'Active Fleets',
      vehicle: 'Vehicle',
      commodity: 'Commodity',
      speed: 'Speed',
      status: 'Status',
      priority: 'Priority',
      origin: 'Origin',
      destination: 'Destination',
      driver: 'Driver',
      gpsUpdate: 'GPS update: 3s',
      highPriority: 'HIGH',
      mediumPriority: 'MEDIUM',
      normalPriority: 'NORMAL',
      geofenceAlert: '⚠️ Geofence Alert: Vehicle entering high-risk zone!',
      vehiclesInDanger: 'Vehicles in danger zone',
      lastUpdated: 'Last Updated',
    },
    report: {
      title: 'Report Road Incident',
      subtitle: 'Works offline — data syncs when connection restores',
      yourLocation: 'Your Location',
      detectLocation: 'Detect My Location',
      locationDenied: 'Location access denied',
      incidentType: 'Incident Type',
      incidentTitle: 'Incident Title',
      severity: 'Severity',
      description: 'Description',
      reporterName: 'Your Name / Unit',
      highway: 'Highway / Road',
      district: 'District',
      state: 'State',
      submit: 'Submit Report',
      saveOffline: 'Save Offline',
      offlineQueue: 'Saved Offline — Pending Sync',
      syncing: 'Syncing to server...',
      syncSuccess: 'Synced successfully!',
      syncNow: 'Sync Now',
      photoEvidence: 'Attach Photo Evidence',
      captureUpload: 'Capture / Upload',
      onlineBadge: 'Online',
      offlineBadge: 'Offline Mode',
      landslide: 'Landslide',
      flood: 'Flood',
      bridgeFailure: 'Bridge Failure',
      congestion: 'Traffic Congestion',
      low: 'Low',
      moderate: 'Moderate',
      critical: 'Critical',
      placeholderTitle: 'e.g., Landslide blocking NH-27',
      placeholderDistrict: 'e.g., Nagaon',
      placeholderHighway: 'e.g., NH-27',
      placeholderReporter: 'e.g., Ranbir Das / NDRF Unit 3',
      placeholderDescription: 'Describe the incident in detail...',
    },
    status: {
      inTransit: 'In Transit',
      idle: 'Idle',
      delayed: 'Delayed',
      arrived: 'Arrived',
      active: 'Active',
      verified: 'Verified',
      cleared: 'Cleared',
    },
    common: {
      loading: 'Loading...',
      error: 'Error loading data',
      refresh: 'Refresh',
      close: 'Close',
      hours: 'hrs',
      km: 'km',
      kmph: 'km/h',
    },
  },

  hi: {
    appName: 'NER लॉजिस्टिक्सAI',
    appSubtitle: 'पूर्वोत्तर क्षेत्र के लिए स्मार्ट लॉजिस्टिक्स एवं सुगम्यता बुद्धिमत्ता मंच',
    stats: {
      activeIncidents: 'सक्रिय घटनाएं',
      fleetVehicles: 'परिवहन वाहन',
      corridorsMonitored: 'निगरानी गलियारे',
      statesCovered: 'कवर किए गए राज्य',
      live: 'लाइव',
      sihTagline: 'SIH 2026 · पूर्वोत्तर अवसंरचना',
      footer: 'NER लॉजिस्टिक्सAI · SIH 2026 · सुपबेस + नेक्स्ट.जेएस + पोस्टजीआईएस द्वारा संचालित',
    },
    nav: {
      map: 'जीआईएस मानचित्र',
      routing: 'जोखिम मार्गनिर्धारण',
      fleet: 'वाहन ट्रैकर',
      report: 'घटना रिपोर्ट',
      alerts: 'अलर्ट',
    },
    auth: {
      login: 'लॉग इन करें',
      logout: 'लॉग आउट',
      title: 'मंच प्रमाणीकरण',
      subtitle: 'आरबीएसी सुविधाओं का परीक्षण करने के लिए डेमो भूमिका चुनें',
      adminDispatcher: 'प्रशासक प्रेषक (Admin)',
      adminDispatcherDesc: 'पूर्ण कमांड केंद्र नियंत्रण, घटनाओं को सत्यापित व साफ़ करें',
      fieldOfficer: 'क्षेत्रीय अधिकारी (Field)',
      fieldOfficerDesc: 'घटनाएं दर्ज करें, वाहन स्थिति देखें और ऑफलाइन सिंक करें',
      publicReporter: 'नागरिक रिपोर्टर (Public)',
      publicReporterDesc: 'केवल-पढ़ने योग्य मानचित्र, सार्वजनिक रिपोर्ट सबमिशन',
      securedBadge: 'सुपबेस ऑथ + आरएलएस द्वारा सुरक्षित रूप से लॉग इन',
    },
    map: {
      title: 'रियल-टाइम जीआईएस सुगम्यता मानचित्र',
      mapLayers: 'मानचित्र परतें',
      roadStatus: 'सड़क स्थिति',
      layerIncidents: 'सक्रिय घटनाएं',
      layerSupplyHubs: 'आपूर्ति केंद्र',
      layerWeather: 'मौसम ओवरले',
      green: 'सुगम (स्कोर 80-100)',
      yellow: 'प्रतिबंधित (स्कोर 50-79)',
      red: 'अवरुद्ध (स्कोर 0-49)',
      noIncidents: 'इस क्षेत्र में कोई सक्रिय घटना नहीं',
      healthScore: 'स्वास्थ्य स्कोर',
      etaClearance: 'अनुमानित निकासी समय',
      reportedBy: 'द्वारा रिपोर्ट किया गया',
      verify: '✓ सत्यापित करें',
      clear: '✕ साफ़ करें',
      hubType: 'केंद्र',
      rain24h: '24 घंटे वर्षा',
      peakHourly: 'चरम प्रति घंटा',
      soilMoisture: 'मृदा नमी',
      maxWind: 'अधिकतम हवा',
      temperature: 'तापमान',
      humidity: 'सापेक्ष आर्द्रता',
      monsoonAlert: 'सक्रिय मानसून ऋतु अलर्ट',
      clearWeather: 'साफ मौसम',
      lightRain: 'हल्की बारिश',
      moderateRain: 'मध्यम बारिश',
      heavyRain: 'भारी बारिश',
      photoEvidenceAlt: 'घटना का साक्ष्य',
    },
    routing: {
      title: 'एआई-संचालित गतिशील जोखिम मार्गनिर्धारण',
      subtitle: 'लॉजिस्टिक रिग्रेशन · पूर्वोत्तर की ऐतिहासिक घटनाओं पर प्रशिक्षित · रियल-टाइम ओपन-मेटियो मौसम',
      modelFeatures: 'एमएल मॉडल विशेषताएं',
      formulaCaption: 'σ = सिग्मॉइड · 33+ सत्यापित पूर्वोत्तर घटनाओं (2022–2024) + ओपन-मेटियो इतिहास पर प्रशिक्षित',
      selectCorridor: 'NER कॉरिडोर चुनें',
      selectRoutePlaceholder: 'एक मार्ग चुनें...',
      analyze: 'मार्गों का विश्लेषण करें',
      primaryRoute: 'प्राथमिक मार्ग',
      alternateRoute: 'एआई जोखिम-जागरूक वैकल्पिक',
      distance: 'दूरी',
      estimatedTime: 'अनुमानित समय',
      delayForecast: 'विलंब पूर्वानुमान',
      riskLevel: 'जोखिम स्तर',
      riskBreakdown: 'जोखिम विवरण',
      rainfall: 'वर्षा',
      landslide: 'भूस्खलन',
      degradation: 'सड़क क्षरण',
      recommended: 'अनुशंसित',
      aiRecommended: 'एआई अनुशंसित',
      liveWeatherData: 'लाइव मौसम डेटा',
      distanceLabel: 'दूरी',
      estTimeLabel: 'अनुमानित समय',
      delayLabel: 'विलंब',
      showSegments: 'खंड विश्लेषण देखें',
      hideSegments: 'खंड विश्लेषण छिपाएं',
      segmentsCount: 'खंड',
      segment: 'खंड',
      liveEnvData: 'लाइव पर्यावरणीय डेटा',
      modelExplainability: 'जोखिम योगदान (मॉडल व्याख्यात्मकता)',
      rainfallImpact: 'वर्षा का प्रभाव',
      soilSaturation: 'मृदा संतृप्ति',
      terrainSlope: 'ढलान एवं ऊंचाई',
      windHumidity: 'हवा और आर्द्रता',
      monsoonSeason: 'मानसून मौसम',
      risk: 'जोखिम',
      fetchingWeather: 'प्रत्येक वेपॉइंट के लिए ओपन-मेटियो से लाइव मौसम प्राप्त किया जा रहा है…',
      step1: 'पर्यावरणीय डेटा लोड हो रहा है',
      step2: 'एमएल मॉडल निष्कर्ष निकाला जा रहा है',
      step3: 'मार्ग भार गणना की जा रही है',
      step4: 'वैकल्पिक मार्गों की तुलना की जा रही है',
      emptyPrompt: 'एक कॉरिडोर चुनें और "मार्गों का विश्लेषण करें" पर क्लिक करें',
      emptySubtext: 'एआई प्रत्येक वेपॉइंट के लिए लाइव मौसम डेटा प्राप्त करेगा',
    },
    fleet: {
      title: 'आवश्यक वस्तु वाहन ट्रैकर',
      activeFleets: 'सक्रिय बेड़े',
      vehicle: 'वाहन',
      commodity: 'वस्तु',
      speed: 'गति',
      status: 'स्थिति',
      priority: 'प्राथमिकता',
      origin: 'उद्गम',
      destination: 'गंतव्य',
      driver: 'चालक',
      gpsUpdate: 'जीपीएस अद्यतन: 3 से',
      highPriority: 'उच्च',
      mediumPriority: 'मध्यम',
      normalPriority: 'सामान्य',
      geofenceAlert: '⚠️ जियोफेंस अलर्ट: वाहन उच्च-जोखिम क्षेत्र में प्रवेश कर रहा है!',
      vehiclesInDanger: 'खतरे के क्षेत्र में वाहन',
      lastUpdated: 'अंतिम अद्यतन',
    },
    report: {
      title: 'सड़क घटना रिपोर्ट करें',
      subtitle: 'ऑफलाइन काम करता है — कनेक्शन बहाल होने पर डेटा सिंक होता है',
      yourLocation: 'आपका स्थान',
      detectLocation: 'मेरा स्थान पहचानें',
      locationDenied: 'स्थान अनुमति अस्वीकृत',
      incidentType: 'घटना प्रकार',
      incidentTitle: 'घटना का शीर्षक',
      severity: 'गंभीरता',
      description: 'विवरण',
      reporterName: 'आपका नाम / इकाई',
      highway: 'राजमार्ग / सड़क',
      district: 'जिला',
      state: 'राज्य',
      submit: 'रिपोर्ट सबमिट करें',
      saveOffline: 'ऑफलाइन सहेजें',
      offlineQueue: 'ऑफलाइन सहेजा — सिंक प्रतीक्षारत',
      syncing: 'सर्वर से सिंक हो रहा है...',
      syncSuccess: 'सफलतापूर्वक सिंक हुआ!',
      syncNow: 'अभी सिंक करें',
      photoEvidence: 'फ़ोटो साक्ष्य संलग्न करें',
      captureUpload: 'फ़ोटो लें / अपलोड करें',
      onlineBadge: 'ऑनलाइन',
      offlineBadge: 'ऑफलाइन मोड',
      landslide: 'भूस्खलन',
      flood: 'बाढ़',
      bridgeFailure: 'पुल क्षति',
      congestion: 'यातायात जाम',
      low: 'कम',
      moderate: 'मध्यम',
      critical: 'गंभीर',
      placeholderTitle: 'उदा., NH-27 पर भूस्खलन अवरोध',
      placeholderDistrict: 'उदा., नगांव',
      placeholderHighway: 'उदा., NH-27',
      placeholderReporter: 'उदा., रणबीर दास / एनडीआरएफ यूनिट 3',
      placeholderDescription: 'घटना का विस्तार से वर्णन करें...',
    },
    status: {
      inTransit: 'पारगमन में',
      idle: 'निष्क्रिय',
      delayed: 'विलंबित',
      arrived: 'पहुंचा',
      active: 'सक्रिय',
      verified: 'सत्यापित',
      cleared: 'साफ',
    },
    common: {
      loading: 'लोड हो रहा है...',
      error: 'डेटा लोड करने में त्रुटि',
      refresh: 'ताज़ा करें',
      close: 'बंद करें',
      hours: 'घंटे',
      km: 'कि.मी.',
      kmph: 'कि.मी./घंटा',
    },
  },

  as: {
    appName: 'NER লজিষ্টিক্সAI',
    appSubtitle: 'উত্তৰ-পূৰ্বাঞ্চলৰ বাবে স্মাৰ্ট লজিষ্টিক্স আৰু সুলভতা বুদ্ধিমত্তা মঞ্চ',
    stats: {
      activeIncidents: 'সক্ৰিয় ঘটনাসমূহ',
      fleetVehicles: 'পৰিবহণ যান-বাহন',
      corridorsMonitored: 'নিৰীক্ষণ কৰা কৰিডোৰ',
      statesCovered: 'আৱৰা ৰাজ্যসমূহ',
      live: 'লাইভ',
      sihTagline: 'SIH 2026 · উত্তৰ-পূব আন্তঃগাঁথনি',
      footer: 'NER লজিষ্টিক্সAI · SIH 2026 · চুপাবেচ + নেক্সট.জেএছ + পোষ্টজিআইএছ দ্বাৰা পৰিচালিত',
    },
    nav: {
      map: 'জিআইএছ মানচিত্ৰ',
      routing: 'বিপদ মাৰ্গ',
      fleet: 'বহৰ ট্ৰেকাৰ',
      report: 'ঘটনা জনাওক',
      alerts: 'সতৰ্কবাৰ্তা',
    },
    auth: {
      login: 'লগ ইন কৰক',
      logout: 'লগ আউট',
      title: 'প্লেটফৰ্ম প্ৰমাণীকৰণ',
      subtitle: 'আৰবিএচি সুবিধা পৰীক্ষা কৰিবলৈ ডেমো ভূমিকা বাছক',
      adminDispatcher: 'প্ৰশাসক প্ৰেৰক (Admin)',
      adminDispatcherDesc: 'সম্পূৰ্ণ নিয়ন্ত্ৰণ, ঘটনাৰ সত্যতা নিৰ্ধাৰণ আৰু নিষ্কাশন',
      fieldOfficer: 'ক্ষেত্ৰ বিষয়া (Field Officer)',
      fieldOfficerDesc: 'ঘটনা দাখিল কৰক, যান-বাহন অৱস্থা চাওক আৰু অফলাইন সিংক কৰক',
      publicReporter: 'ৰাইজৰ প্ৰতিবেদক (Public)',
      publicReporterDesc: 'কেৱল পঢ়িব পৰা মানচিত্ৰ আৰু ৰাজহুৱা ৰিপোৰ্ট দাখিল',
      securedBadge: 'চুপাবেচ অথ + আৰএলএছ দ্বাৰা সুৰক্ষিতভাৱে লগ ইন',
    },
    map: {
      title: 'ৰিয়েল-টাইম জিআইএছ সুলভতা মানচিত্ৰ',
      mapLayers: 'মানচিত্ৰ স্তৰসমূহ',
      roadStatus: 'পথৰ অৱস্থা',
      layerIncidents: 'সক্ৰিয় ঘটনাসমূহ',
      layerSupplyHubs: 'যোগান কেন্দ্ৰ',
      layerWeather: 'বতৰ ওভাৰলে',
      green: 'স্পষ্ট (স্কোৰ 80-100)',
      yellow: 'সীমিত (স্কোৰ 50-79)',
      red: 'অৱৰুদ্ধ (স্কোৰ 0-49)',
      noIncidents: 'এই অঞ্চলত কোনো সক্ৰিয় ঘটনা নাই',
      healthScore: 'স্বাস্থ্য স্কোৰ',
      etaClearance: 'আনুমানিক পৰিষ্কাৰ সময়',
      reportedBy: 'প্ৰতিবেদক',
      verify: '✓ সত্যাপন কৰক',
      clear: '✕ নিষ্কাশন কৰক',
      hubType: 'কেন্দ্ৰ',
      rain24h: '২৪ ঘণ্টাৰ বৰষুণ',
      peakHourly: 'সৰ্বাধিক প্ৰতি ঘণ্টা',
      soilMoisture: 'মাটিৰ আৰ্দ্ৰতা',
      maxWind: 'সৰ্বোচ্চ বতাহ',
      temperature: 'উত্তাপ',
      humidity: 'আপেক্ষিক আৰ্দ্ৰতা',
      monsoonAlert: 'সক্ৰিয় বাৰিষা কালৰ সতৰ্কবাৰ্তা',
      clearWeather: 'পৰিষ্কাৰ বতৰ',
      lightRain: 'পাতলীয়া বৰষুণ',
      moderateRain: 'মজলীয়া বৰষুণ',
      heavyRain: 'প্ৰবল বৰষুণ',
      photoEvidenceAlt: 'ঘটনাৰ প্ৰমাণ',
    },
    routing: {
      title: 'এআই-চালিত গতিশীল বিপদ মাৰ্গনিৰ্ধাৰণ',
      subtitle: 'লজিষ্টিক ৰিগ্ৰেছন · উত্তৰ-পূবৰ ঐতিহাসিক ঘটনাৰ ওপৰত প্ৰশিক্ষিত · প্ৰত্যক্ষ অপেন-মেটিঅ\' বতৰ',
      modelFeatures: 'এমএল মডেলৰ বৈশিষ্টসমূহ',
      formulaCaption: 'σ = চিগময়ড · ৩৩+ পৰীক্ষিত উত্তৰ-পূব ঘটনা (২০২২–২০২৪) + অপেন-মেটিঅ\'ৰ ওপৰত প্ৰশিক্ষিত',
      selectCorridor: 'NER কৰিডোৰ বাছক',
      selectRoutePlaceholder: 'এটা মাৰ্গ বাছক...',
      analyze: 'মাৰ্গ বিশ্লেষণ কৰক',
      primaryRoute: 'প্ৰাথমিক মাৰ্গ',
      alternateRoute: 'এআই বিকল্প মাৰ্গ',
      distance: 'দূৰত্ব',
      estimatedTime: 'আনুমানিক সময়',
      delayForecast: 'পলম পূৰ্বানুমান',
      riskLevel: 'বিপদৰ স্তৰ',
      riskBreakdown: 'বিপদৰ বিৱৰণ',
      rainfall: 'বৰষুণ',
      landslide: 'ভূমিস্খলন',
      degradation: 'পথ ক্ষয়',
      recommended: 'পৰামৰ্শিত',
      aiRecommended: 'এআই পৰামৰ্শিত',
      liveWeatherData: 'প্ৰত্যক্ষ বতৰৰ তথ্য',
      distanceLabel: 'দূৰত্ব',
      estTimeLabel: 'আনুমানিক সময়',
      delayLabel: 'পলম',
      showSegments: 'খণ্ড বিশ্লেষণ চাওক',
      hideSegments: 'খণ্ড বিশ্লেষণ লুকুৱাওক',
      segmentsCount: 'টা খণ্ড',
      segment: 'খণ্ড',
      liveEnvData: 'প্ৰত্যক্ষ পৰিৱেশৰ তথ্য',
      modelExplainability: 'বিপদৰ অৱদান (মডেল ব্যাখ্যা)',
      rainfallImpact: 'বৰষুণৰ প্ৰভাৱ',
      soilSaturation: 'মাটিৰ সংপৃক্ততা',
      terrainSlope: 'ঢাল আৰু উচ্চতা',
      windHumidity: 'বতাহ আৰু আৰ্দ্ৰতা',
      monsoonSeason: 'বাৰিষা ঋতু',
      risk: 'বিপদ',
      fetchingWeather: 'প্ৰতিটো ৱেপইন্টৰ বাবে অপেন-মেটিঅ\'ৰ পৰা প্ৰত্যক্ষ বতৰ সংগ্ৰহ কৰা হৈছে…',
      step1: 'পৰিৱেশ তথ্য লোড কৰা হৈছে',
      step2: 'এমএল অনুমান চলোৱা হৈছে',
      step3: 'মাৰ্গৰ ভাৰ গণনা কৰা হৈছে',
      step4: 'মাৰ্গসমূহ তুলনা কৰা হৈছে',
      emptyPrompt: 'এটা কৰিডোৰ বাছক আৰু "মাৰ্গ বিশ্লেষণ কৰক"ত ক্লিক কৰক',
      emptySubtext: 'এআইয়ে প্ৰতিটো ৱেপইন্টৰ বাবে লাইভ বতৰ সংগ্ৰহ কৰিব',
    },
    fleet: {
      title: 'অত্যাৱশ্যকীয় সামগ্ৰী বহৰ ট্ৰেকাৰ',
      activeFleets: 'সক্ৰিয় বহৰ',
      vehicle: 'বাহন',
      commodity: 'সামগ্ৰী',
      speed: 'গতি',
      status: 'অৱস্থা',
      priority: 'অগ্ৰাধিকাৰ',
      origin: 'উৎপত্তিস্থল',
      destination: 'গন্তব্য',
      driver: 'চালক',
      gpsUpdate: 'জিপিএছ আপডেট: ৩ ছে',
      highPriority: 'উচ্চ',
      mediumPriority: 'মজলীয়া',
      normalPriority: 'সাধাৰণ',
      geofenceAlert: '⚠️ জিওফেন্স সতৰ্কতা: বাহন উচ্চ-বিপদ অঞ্চলত প্ৰৱেশ কৰিছে!',
      vehiclesInDanger: 'বিপদ সংকুল স্থানত থকা বাহনসমূহ',
      lastUpdated: 'শেষ আপডেট',
    },
    report: {
      title: 'পথ ঘটনা জনাওক',
      subtitle: 'অফলাইনত কাম কৰে — সংযোগ পুনৰুদ্ধাৰ হলে ডেটা সিংক হয়',
      yourLocation: 'আপোনাৰ অৱস্থান',
      detectLocation: 'মোৰ অৱস্থান চিনাক্ত কৰক',
      locationDenied: 'অৱস্থানৰ অনুমতি নাকচ কৰা হৈছে',
      incidentType: 'ঘটনাৰ প্ৰকাৰ',
      incidentTitle: 'ঘটনাৰ শীৰ্ষক',
      severity: 'গুৰুত্ব',
      description: 'বিৱৰণ',
      reporterName: 'আপোনাৰ নাম / একক',
      highway: 'ৰাজপথ / পথ',
      district: 'জিলা',
      state: 'ৰাজ্য',
      submit: 'ৰিপোৰ্ট দাখিল কৰক',
      saveOffline: 'অফলাইনত সংৰক্ষণ কৰক',
      offlineQueue: 'অফলাইনত সংৰক্ষিত — সিংক বাকী',
      syncing: 'চাৰ্ভাৰলৈ সিংক হৈ আছে...',
      syncSuccess: 'সফলতাৰে সিংক হ\'ল!',
      syncNow: 'এতিয়াই সিংক কৰক',
      photoEvidence: 'ফটো প্ৰমাণ সংলগ্ন কৰক',
      captureUpload: 'ফটো তোলক / আপলোড',
      onlineBadge: 'অনলাইন',
      offlineBadge: 'অফলাইন মোড',
      landslide: 'ভূমিস্খলন',
      flood: 'বান',
      bridgeFailure: 'দলং ক্ষতিগ্ৰস্ত',
      congestion: 'যানজট',
      low: 'কম',
      moderate: 'মধ্যম',
      critical: 'গুৰুতৰ',
      placeholderTitle: 'উদাহৰণস্বৰূপে, NH-27ত ভূমিস্খলনৰ অৱৰোধ',
      placeholderDistrict: 'উদাহৰণস্বৰূপে, নগাঁও',
      placeholderHighway: 'উদাহৰণস্বৰূপে, NH-27',
      placeholderReporter: 'উদাহৰণস্বৰূপে, ৰণবীৰ দাস / এনডিআৰএফ গোট ৩',
      placeholderDescription: 'ঘটনাটোৰ বিষয়ে বিতংকৈ উল্লেখ কৰক...',
    },
    status: {
      inTransit: 'পথত',
      idle: 'নিষ্ক্ৰিয়',
      delayed: 'পলমিত',
      arrived: 'উপস্থিত',
      active: 'সক্ৰিয়',
      verified: 'সত্যাপিত',
      cleared: 'পৰিষ্কাৰ',
    },
    common: {
      loading: 'লোড হৈ আছে...',
      error: 'ডেটা লোড কৰাত ত্ৰুটি',
      refresh: 'তাজা কৰক',
      close: 'বন্ধ কৰক',
      hours: 'ঘণ্টা',
      km: 'কি.মি.',
      kmph: 'কি.মি./ঘণ্টা',
    },
  },

  bn: {
    appName: 'NER লজিস্টিক্সAI',
    appSubtitle: 'উত্তর-পূর্বাঞ্চলের জন্য স্মার্ট লজিস্টিক্স ও অ্যাক্সেসিবিলিটি ইন্টেলিজেন্স প্ল্যাটফর্ম',
    stats: {
      activeIncidents: 'সক্রিয় ঘটনাসমূহ',
      fleetVehicles: 'যানবাহন ফ্লিট',
      corridorsMonitored: 'নজরদারিকৃত করিডোর',
      statesCovered: 'আওতাভুক্ত রাজ্য',
      live: 'লাইভ',
      sihTagline: 'SIH 2026 · উত্তর-পূর্ব পরিকাঠামো',
      footer: 'NER লজিস্টিক্সAI · SIH 2026 · সুপাবেস + নেক্সট.জেএস + পোস্টজিআইএস চালিত',
    },
    nav: {
      map: 'জিআইএস মানচিত্র',
      routing: 'ঝুঁকি রুটিং',
      fleet: 'ফ্লিট ট্র্যাকার',
      report: 'ঘটনা রিপোর্ট',
      alerts: 'সতর্কতা',
    },
    auth: {
      login: 'লগ ইন',
      logout: 'লগ আউট',
      title: 'প্ল্যাটফর্ম প্রমাণীকরণ',
      subtitle: 'আরবিএসি ফিচার পরীক্ষা করতে ডেমো ভূমিকা নির্বাচন করুন',
      adminDispatcher: 'অ্যাডমিন প্রেরক (Admin Dispatcher)',
      adminDispatcherDesc: 'পূর্ণ কমান্ড সেন্টার নিয়ন্ত্রণ, ঘটনা যাচাই ও নিষ্কৃতি',
      fieldOfficer: 'ফিল্ড অফিসার (Field Officer)',
      fieldOfficerDesc: 'ঘটনা জমা দিন, ফ্লিট স্থিতি দেখুন এবং অফলাইন সিংক করুন',
      publicReporter: 'পাবলিক রিপোর্টার (Public)',
      publicReporterDesc: 'শুধুমাত্র পাঠযোগ্য মানচিত্র এবং পাবলিক রিপোর্ট জমা',
      securedBadge: 'সুপাবেস অথ + আরএলএস দ্বারা সুরক্ষিতভাবে লগইন',
    },
    map: {
      title: 'রিয়েল-টাইম জিআইএস অ্যাক্সেসিবিলিটি মানচিত্র',
      mapLayers: 'মানচিত্রের স্তরসমূহ',
      roadStatus: 'রাস্তার অবস্থা',
      layerIncidents: 'সক্রিয় ঘটনাসমূহ',
      layerSupplyHubs: 'সরবরাহ কেন্দ্র',
      layerWeather: 'আবহাওয়া ওভারলে',
      green: 'পরিষ্কার (স্কোর 80-100)',
      yellow: 'সীমিত (স্কোর 50-79)',
      red: 'অবরুদ্ধ (স্কোর 0-49)',
      noIncidents: 'এই এলাকায় কোনো সক্রিয় ঘটনা নেই',
      healthScore: 'স্বাস্থ্য স্কোর',
      etaClearance: 'আনুমানিক নিষ্কৃতি সময়',
      reportedBy: 'প্রতিবেদক',
      verify: '✓ যাচাই করুন',
      clear: '✕ পরিষ্কার করুন',
      hubType: 'কেন্দ্র',
      rain24h: '২৪ ঘণ্টার বৃষ্টিপাত',
      peakHourly: 'সর্বোচ্চ প্রতি ঘণ্টা',
      soilMoisture: 'মাটির আর্দ্রতা',
      maxWind: 'সর্বোচ্চ বাতাস',
      temperature: 'তাপমাত্রা',
      humidity: 'আপেক্ষিক আর্দ্রতা',
      monsoonAlert: 'সক্রিয় বর্ষাকালীন সতর্কতা',
      clearWeather: 'পরিষ্কার আকাশ',
      lightRain: 'হালকা বৃষ্টি',
      moderateRain: 'মাঝারি বৃষ্টি',
      heavyRain: 'ভারী বৃষ্টি',
      photoEvidenceAlt: 'ঘটনার প্রমাণ',
    },
    routing: {
      title: 'এআই-চালিত গতিশীল ঝুঁকি রুটিং',
      subtitle: 'লজিস্টিক রিগ্রেশন · উত্তর-পূর্বের ঐতিহাসিক ঘটনার উপর প্রশিক্ষিত · রিয়েল-টাইম ওপেন-মেটিও আবহাওয়া',
      modelFeatures: 'এমএল মডেলের বৈশিষ্ট্য',
      formulaCaption: 'σ = সিগময়েড · ৩৩+ যাচাইকৃত উত্তর-পূর্ব ঘটনা (২০২২–২০২৪) + ওপেন-মেটিও ডেটার উপর প্রশিক্ষিত',
      selectCorridor: 'NER করিডোর নির্বাচন করুন',
      selectRoutePlaceholder: 'একটি রুট নির্বাচন করুন...',
      analyze: 'রুট বিশ্লেষণ করুন',
      primaryRoute: 'প্রাথমিক রুট',
      alternateRoute: 'এআই বিকল্প রুট',
      distance: 'দূরত্ব',
      estimatedTime: 'আনুমানিক সময়',
      delayForecast: 'বিলম্ব পূর্বাভাস',
      riskLevel: 'ঝুঁকির মাত্রা',
      riskBreakdown: 'ঝুঁকির বিস্তারিত',
      rainfall: 'বৃষ্টিপাত',
      landslide: 'ভূমিধস',
      degradation: 'রাস্তার অবনতি',
      recommended: 'প্রস্তাবিত',
      aiRecommended: 'এআই প্রস্তাবিত',
      liveWeatherData: 'লাইভ আবহাওয়ার তথ্য',
      distanceLabel: 'দূরত্ব',
      estTimeLabel: 'আনুমানিক সময়',
      delayLabel: 'বিলম্ব',
      showSegments: 'সেগমেন্ট বিশ্লেষণ দেখুন',
      hideSegments: 'সেগমেন্ট বিশ্লেষণ লুকান',
      segmentsCount: 'টি সেগমেন্ট',
      segment: 'সেগমেন্ট',
      liveEnvData: 'লাইভ পরিবেশগত তথ্য',
      modelExplainability: 'ঝুঁকির কারণ (মডেল ব্যাখ্যাযোগ্যতা)',
      rainfallImpact: 'বৃষ্টিপাতের প্রভাব',
      soilSaturation: 'মাটির স্যাচুরেশন',
      terrainSlope: 'ঢাল এবং উচ্চতা',
      windHumidity: 'বাতাস ও আর্দ্রতা',
      monsoonSeason: 'বর্ষা মৌসুম',
      risk: 'ঝুঁকি',
      fetchingWeather: 'প্রতিটি ওয়েপয়েন্টের জন্য ওপেন-মেটিও থেকে লাইভ আবহাওয়া সংগ্রহ করা হচ্ছে…',
      step1: 'পরিবেশগত তথ্য লোড হচ্ছে',
      step2: 'এমএল ইনফারেন্স পরিচালনা করা হচ্ছে',
      step3: 'রুটের গুরুত্ব হিসাব করা হচ্ছে',
      step4: 'রুটগুলির তুলনা করা হচ্ছে',
      emptyPrompt: 'একটি করিডোর নির্বাচন করুন এবং "রুট বিশ্লেষণ করুন" এ ক্লিক করুন',
      emptySubtext: 'এআই প্রতিটি ওয়েপয়েন্টের জন্য লাইভ আবহাওয়া সংগ্রহ করবে',
    },
    fleet: {
      title: 'অপরিহার্য পণ্য ফ্লিট ট্র্যাকার',
      activeFleets: 'সক্রিয় বহর',
      vehicle: 'যানবাহন',
      commodity: 'পণ্য',
      speed: 'গতি',
      status: 'অবস্থা',
      priority: 'অগ্রাধিকার',
      origin: 'উৎস',
      destination: 'গন্তব্য',
      driver: 'চালক',
      gpsUpdate: 'জিপিএস আপডেট: ৩ সে',
      highPriority: 'উচ্চ',
      mediumPriority: 'মাঝারি',
      normalPriority: 'সাধারণ',
      geofenceAlert: '⚠️ জিওফেন্স সতর্কতা: যানবাহন উচ্চ-ঝুঁকি এলাকায় প্রবেশ করছে!',
      vehiclesInDanger: 'ঝুঁকিপূর্ণ এলাকায় থাকা যানবাহন',
      lastUpdated: 'সর্বশেষ আপডেট',
    },
    report: {
      title: 'সড়ক ঘটনা রিপোর্ট করুন',
      subtitle: 'অফলাইনে কাজ করে — সংযোগ পুনরুদ্ধার হলে ডেটা সিংক হয়',
      yourLocation: 'আপনার অবস্থান',
      detectLocation: 'আমার অবস্থান সনাক্ত করুন',
      locationDenied: 'অবস্থানের অনুমতি প্রত্যাখ্যান করা হয়েছে',
      incidentType: 'ঘটনার ধরন',
      incidentTitle: 'ঘটনার শিরোনাম',
      severity: 'তীব্রতা',
      description: 'বিবরণ',
      reporterName: 'আপনার নাম / ইউনিট',
      highway: 'মহাসড়ক / রাস্তা',
      district: 'জেলা',
      state: 'রাজ্য',
      submit: 'রিপোর্ট জমা দিন',
      saveOffline: 'অফলাইনে সংরক্ষণ করুন',
      offlineQueue: 'অফলাইনে সংরক্ষিত — সিংক অপেক্ষারত',
      syncing: 'সার্ভারে সিংক হচ্ছে...',
      syncSuccess: 'সফলভাবে সিংক হয়েছে!',
      syncNow: 'এখনই সিংক করুন',
      photoEvidence: 'ছবির প্রমাণ সংযুক্ত করুন',
      captureUpload: 'ছবি তুলুন / আপলোড',
      onlineBadge: 'অনলাইন',
      offlineBadge: 'অফলাইন মোড',
      landslide: 'ভূমিধস',
      flood: 'বন্যা',
      bridgeFailure: 'সেতু ক্ষতিগ্রস্ত',
      congestion: 'যানজট',
      low: 'কম',
      moderate: 'মাঝারি',
      critical: 'গুরুতর',
      placeholderTitle: 'যেমন, NH-27 এ ভূমিধসের কারণে পথ অবরুদ্ধ',
      placeholderDistrict: 'যেমন, নগাঁও',
      placeholderHighway: 'যেমন, NH-27',
      placeholderReporter: 'যেমন, রণবীর দাস / এনডিআরএফ ইউনিট ৩',
      placeholderDescription: 'ঘটনাটি বিস্তারিতভাবে বর্ণনা করুন...',
    },
    status: {
      inTransit: 'পথে আছে',
      idle: 'নিষ্ক্রিয়',
      delayed: 'বিলম্বিত',
      arrived: 'পৌঁছেছে',
      active: 'সক্রিয়',
      verified: 'যাচাইকৃত',
      cleared: 'পরিষ্কার',
    },
    common: {
      loading: 'লোড হচ্ছে...',
      error: 'ডেটা লোড করতে ত্রুটি',
      refresh: 'রিফ্রেশ',
      close: 'বন্ধ করুন',
      hours: 'ঘণ্টা',
      km: 'কি.মি.',
      kmph: 'কি.মি./ঘণ্টা',
    },
  },

  mni: {
    appName: 'NER লগিস্টিক্সAI',
    appSubtitle: 'মণিপুৰ অমসুং উত্তৰ-পূৰ্বাঞ্চলগী স্মাৰ্ট লগিস্টিক্স প্লেটফৰ্ম',
    stats: {
      activeIncidents: 'চাল্লবা ওইনবাসিং',
      fleetVehicles: 'গাৰি ফ্লিটশিং',
      corridorsMonitored: 'য়েংশিল্লিবা লম্বীশিং',
      statesCovered: 'কোনশিল্লিবা ৰাজ্যশিং',
      live: 'লাইভ',
      sihTagline: 'SIH 2026 · অৱাং নোংপোক ইনফ্রাস্ট্রাকচার',
      footer: 'NER লগিস্টিক্সAI · SIH 2026 · সুপাবেস + নেক্সট.জেএস + পোস্টজিআইএস',
    },
    nav: {
      map: 'জিআইএস মেপ',
      routing: 'ৰিস্ক ৰুটিং',
      fleet: 'ফ্লিট ট্ৰেকৰ',
      report: 'ওইনবা রিপোৰ্ট',
      alerts: 'এলাৰ্ট',
    },
    auth: {
      login: 'লগ ইন তৌবিয়ু',
      logout: 'লগ আউট',
      title: 'প্লেটফৰ্ম ওথেনটিকেশন',
      subtitle: 'আরবিএসি ফীচরশিং য়েংনবা দেমো রোল খল্লিয়ু',
      adminDispatcher: 'এডমিন ডিস্পেচর (Admin)',
      adminDispatcherDesc: 'কমান্ড সেন্টার কন্ত্রোল, ওইনবা চুমলে হায়বা অমসুং ক্লিয়ার তৌবা',
      fieldOfficer: 'ফিল্ড ওফিসার (Field)',
      fieldOfficerDesc: 'ওইনবা রিপোৰ্ট তৌবিয়ু, গাৰি য়েংবিয়ু অমসুং অফলাইন সিংক',
      publicReporter: 'মীয়ামগী রিপোর্টার (Public)',
      publicReporterDesc: 'মেপ য়েংবা খক্তা অমসুং পব্লিক রিপোৰ্ট',
      securedBadge: 'সুপাবেস ওথ + আরএলএস না সেফ ওইনা লগইন তৌই',
    },
    map: {
      title: 'ৰিয়েল-টাইম জিআইএস মেপ',
      mapLayers: 'মেপ লেয়ারশিং',
      roadStatus: 'লম্বীগী ফীভম',
      layerIncidents: 'চাল্লবা ওইনবাসিং',
      layerSupplyHubs: 'সাপ্লাই হাব',
      layerWeather: 'ৱেদৰ ওভাৰলে',
      green: 'চামু (স্কোৰ 80-100)',
      yellow: 'লিমিটেড (স্কোৰ 50-79)',
      red: 'বন্ধ (স্কোৰ 0-49)',
      noIncidents: 'মফম অদুদা ওইনবা য়াওদে',
      healthScore: 'হেল্থ স্কোর',
      etaClearance: 'ক্লিয়ার তৌবগী মতম',
      reportedBy: 'রিপোৰ্ট তৌরিবসি',
      verify: '✓ চুম্লে হায়বা',
      clear: '✕ ক্লিয়ার তৌবিয়ু',
      hubType: 'হাব',
      rain24h: '২৪ পুংগী নোং চুবা',
      peakHourly: 'পীক পুং অমদা',
      soilMoisture: 'লৈবাক্কী অচেতপা',
      maxWind: 'নুংশিৎকী ৱেগ',
      temperature: 'টেম্পারেচার',
      humidity: 'হিউমিডিটি',
      monsoonAlert: 'নোংজু মতমগী এলাৰ্ট',
      clearWeather: 'নুংঙাইবা বতৰ',
      lightRain: 'অচম্বা নোং',
      moderateRain: 'ময়াম নোং',
      heavyRain: 'কনবা নোং',
      photoEvidenceAlt: 'ওইনবাগী খুদম',
    },
    routing: {
      title: 'এআই ডায়নামিক ৰিস্ক ৰুটিং',
      subtitle: 'লজিস্টিক রিগ্রেশন · অৱাং নোংপোক্কী লৈবাক ওইনবাদা ত্রেন তৌবা · রিয়েল-টাইম অপেন-মেতিও ৱেদৰ',
      modelFeatures: 'এমএল মডেলগী মচাকশিং',
      formulaCaption: 'σ = সিগময়ড · ৩৩+ ভেরিফায়েদ অৱাং নোংপোক ওইনবা (২০২২–২০২৪) + অপেন-মেতিওদা ত্রেন তৌবা',
      selectCorridor: 'NER কৰিডোৰ শেলগৎপী',
      selectRoutePlaceholder: 'লম্বী অমা খল্লিয়ু...',
      analyze: 'ৰুট এনেলাইজ তৌবিয়ু',
      primaryRoute: 'প্ৰাইমৰি ৰুট',
      alternateRoute: 'এআই অলটৰনেট ৰুট',
      distance: 'হেক্তা',
      estimatedTime: 'অনুমান তাইবদা',
      delayForecast: 'ডিলে ফোৰকাস্ট',
      riskLevel: 'ৰিস্ক লেভেল',
      riskBreakdown: 'ৰিস্ক ব্ৰেকডাউন',
      rainfall: 'হিং হাউবা',
      landslide: 'মপু হৌবা',
      degradation: 'লমদা থৌনা',
      recommended: 'ৰেকমেন্ডেড',
      aiRecommended: 'এআই না রিকমেন্ড তৌবা',
      liveWeatherData: 'লাইভ ৱেদৰগী ডেটা',
      distanceLabel: 'হেক্তা',
      estTimeLabel: 'মতম',
      delayLabel: 'দেরি',
      showSegments: 'সেগমেন্তশিং য়েংবিয়ু',
      hideSegments: 'সেগমেন্তশিং লোৎথোকপিয়ু',
      segmentsCount: 'সেগমেন্তশিং',
      segment: 'সেগমেন্ত',
      liveEnvData: 'লাইভ ইনভায়রনমেন্টাল ডেটা',
      modelExplainability: 'রিস্ক কন্ট্রিবিউশন (এক্সপ্লেইনেবল এআই)',
      rainfallImpact: 'নোং চুবগী ইমপ্যাক্ট',
      soilSaturation: 'লৈবাক্কী ময়ুর',
      terrainSlope: 'চিংগী স্লোপ অমসুং ৱাংবা',
      windHumidity: 'নুংশিৎ অমসুং হিউমিডিটি',
      monsoonSeason: 'মনসুন সিজন',
      risk: 'ৰিস্ক',
      fetchingWeather: 'ৱেপোইন্ট খুদিংগী ওপেন-মেতিওদগী লাইভ ৱেদৰ পুখৎলক্লি…',
      step1: 'এনভায়রনমেন্টাল ডেটা লোড তৌরি',
      step2: 'এমএল ইনফারেঞ্চ তৌরি',
      step3: 'রুট ৱেট ক্যালকুলেট তৌরি',
      step4: 'রুটশিং চাংদম্নরি',
      emptyPrompt: 'কৰিডোৰ অমা শেলগৎপী অমসুং "ৰুট এনেলাইজ তৌবিয়ু" দা নম্বিয়ু',
      emptySubtext: 'এআইনা ৱেপইন্ট খুদিংমক্কী লাইভ ৱেদৰ পুখৎলক্কনি',
    },
    fleet: {
      title: 'এসেন্সিয়েল ফ্লিট ট্ৰেকৰ',
      activeFleets: 'চাল্লবা ফ্লিটসিং',
      vehicle: 'গাৰি',
      commodity: 'মৈথিলোন',
      speed: 'ৱেগ',
      status: 'থৌদাং',
      priority: 'প্রায়ৰিটি',
      origin: 'হাউবা মফম',
      destination: 'ফাউবা মফম',
      driver: 'দ্রাইভার',
      gpsUpdate: 'জিপিএস আপডেট: ৩ সে',
      highPriority: 'হাই',
      mediumPriority: 'মেডিয়াম',
      normalPriority: 'নরমাল',
      geofenceAlert: '⚠️ জিওফেন্স এলাৰ্ট: গাৰি হাই-ৰিস্ক এৰিয়াদা ফংলে!',
      vehiclesInDanger: 'ডেঞ্জার জোনদা য়াওরিবা গাৰিশিং',
      lastUpdated: 'শেষ আপডেট',
    },
    report: {
      title: 'লমদা ওইনবা রিপোৰ্ট তৌবিয়ু',
      subtitle: 'অফলাইনদা থবক তৌই — কনেকশন ফাউবদা ডেটা সিংক অৈ',
      yourLocation: 'নংগী মফম',
      detectLocation: 'এই মফম ফাউবিয়ু',
      locationDenied: 'লোকেশনগী অযাবা ফংদে',
      incidentType: 'ওইনবাগী মতিক',
      incidentTitle: 'ওইনবাগী মমিং',
      severity: 'থাজবা',
      description: 'মতিক মপাং',
      reporterName: 'নংগী মিং / য়ুনিট',
      highway: 'হাইৱে / লমদা',
      district: 'জিলা',
      state: 'ৰাজ্য',
      submit: 'রিপোৰ্ট পীবিয়ু',
      saveOffline: 'অফলাইনদা সেভ তৌবিয়ু',
      offlineQueue: 'অফলাইনদা সেভ অৈ — সিংক য়াউৰি',
      syncing: 'সাৰভৰদা সিংক হৈ আছে...',
      syncSuccess: 'সিংক অৈ!',
      syncNow: 'হৌজিক সিংক তৌবিয়ু',
      photoEvidence: 'ফোটো এভিডেন্স য়াওহনবিয়ু',
      captureUpload: 'ফোটো কাপ্পু / অপলোড',
      onlineBadge: 'অনলাইন',
      offlineBadge: 'অফলাইন মোড',
      landslide: 'মপু হৌবা',
      flood: 'এরোইবা',
      bridgeFailure: 'পাল্লা থৌনা',
      congestion: 'গাৰি জাম',
      low: 'থুনা',
      moderate: 'মধ্যম',
      critical: 'থাজবা',
      placeholderTitle: 'যেমন, NH-27 তা মপু হৌবনা লম্বী থিংজিনবা',
      placeholderDistrict: 'যেমন, নগাঁও',
      placeholderHighway: 'যেমন, NH-27',
      placeholderReporter: 'যেমন, রণবীর দাস / এনডিআরএফ ৩',
      placeholderDescription: 'ওইনবা অসি কুপ্না শন্দোক্না ইবিয়ু...',
    },
    status: {
      inTransit: 'লমদাদা',
      idle: 'তাকবা',
      delayed: 'দেরি অৈ',
      arrived: 'ফাউবা',
      active: 'চাল্লবা',
      verified: 'থাজনবা',
      cleared: 'চামু',
    },
    common: {
      loading: 'লোড হৈ আছে...',
      error: 'ডেটা লোড তৌবদা থৌনা',
      refresh: 'ৰিফ্ৰেশ',
      close: 'বন্ধ তৌবিয়ু',
      hours: 'ঘন্টা',
      km: 'কি.মি.',
      kmph: 'কি.মি./ঘন্টা',
    },
  },
};
