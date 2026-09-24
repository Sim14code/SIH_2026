// Multilingual translations for NER Logistics Intelligence Platform
// Languages: English, Hindi, Assamese, Bengali, Manipuri

export type Language = 'en' | 'hi' | 'as' | 'bn' | 'mni';

export interface Translations {
  appName: string;
  appSubtitle: string;
  nav: {
    map: string;
    routing: string;
    fleet: string;
    report: string;
    alerts: string;
  };
  map: {
    title: string;
    layerIncidents: string;
    layerSupplyHubs: string;
    layerWeather: string;
    green: string;
    yellow: string;
    red: string;
    noIncidents: string;
  };
  routing: {
    title: string;
    selectCorridor: string;
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
    geofenceAlert: string;
    lastUpdated: string;
  };
  report: {
    title: string;
    subtitle: string;
    yourLocation: string;
    detectLocation: string;
    incidentType: string;
    severity: string;
    description: string;
    reporterName: string;
    highway: string;
    district: string;
    state: string;
    submit: string;
    offlineQueue: string;
    syncing: string;
    syncSuccess: string;
    landslide: string;
    flood: string;
    bridgeFailure: string;
    congestion: string;
    low: string;
    moderate: string;
    critical: string;
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
    nav: {
      map: 'GIS Map',
      routing: 'Risk Routing',
      fleet: 'Fleet Tracker',
      report: 'Report Incident',
      alerts: 'Alerts',
    },
    map: {
      title: 'Real-Time GIS Accessibility Map',
      layerIncidents: 'Active Incidents',
      layerSupplyHubs: 'Supply Hubs',
      layerWeather: 'Weather Overlay',
      green: 'Clear (Score 80-100)',
      yellow: 'Restricted (Score 50-79)',
      red: 'Blocked (Score 0-49)',
      noIncidents: 'No active incidents in this area',
    },
    routing: {
      title: 'AI-Powered Dynamic Risk Routing',
      selectCorridor: 'Select NER Corridor',
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
      geofenceAlert: '⚠️ Geofence Alert: Vehicle entering high-risk zone!',
      lastUpdated: 'Last Updated',
    },
    report: {
      title: 'Report Road Incident',
      subtitle: 'Works offline — data syncs when connection restores',
      yourLocation: 'Your Location',
      detectLocation: 'Detect My Location',
      incidentType: 'Incident Type',
      severity: 'Severity',
      description: 'Description',
      reporterName: 'Your Name / Unit',
      highway: 'Highway / Road',
      district: 'District',
      state: 'State',
      submit: 'Submit Report',
      offlineQueue: 'Saved Offline — Pending Sync',
      syncing: 'Syncing to server...',
      syncSuccess: 'Synced successfully!',
      landslide: 'Landslide',
      flood: 'Flood',
      bridgeFailure: 'Bridge Failure',
      congestion: 'Traffic Congestion',
      low: 'Low',
      moderate: 'Moderate',
      critical: 'Critical',
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
    nav: {
      map: 'जीआईएस मानचित्र',
      routing: 'जोखिम मार्गनिर्धारण',
      fleet: 'वाहन ट्रैकर',
      report: 'घटना रिपोर्ट',
      alerts: 'अलर्ट',
    },
    map: {
      title: 'रियल-टाइम जीआईएस सुगम्यता मानचित्र',
      layerIncidents: 'सक्रिय घटनाएं',
      layerSupplyHubs: 'आपूर्ति केंद्र',
      layerWeather: 'मौसम ओवरले',
      green: 'सुगम (स्कोर 80-100)',
      yellow: 'प्रतिबंधित (स्कोर 50-79)',
      red: 'अवरुद्ध (स्कोर 0-49)',
      noIncidents: 'इस क्षेत्र में कोई सक्रिय घटना नहीं',
    },
    routing: {
      title: 'एआई-संचालित गतिशील जोखिम मार्गनिर्धारण',
      selectCorridor: 'NER कॉरिडोर चुनें',
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
      geofenceAlert: '⚠️ जियोफेंस अलर्ट: वाहन उच्च-जोखिम क्षेत्र में प्रवेश कर रहा है!',
      lastUpdated: 'अंतिम अद्यतन',
    },
    report: {
      title: 'सड़क घटना रिपोर्ट करें',
      subtitle: 'ऑफलाइन काम करता है — कनेक्शन बहाल होने पर डेटा सिंक होता है',
      yourLocation: 'आपका स्थान',
      detectLocation: 'मेरा स्थान पहचानें',
      incidentType: 'घटना प्रकार',
      severity: 'गंभीरता',
      description: 'विवरण',
      reporterName: 'आपका नाम / इकाई',
      highway: 'राजमार्ग / सड़क',
      district: 'जिला',
      state: 'राज्य',
      submit: 'रिपोर्ट सबमिट करें',
      offlineQueue: 'ऑफलाइन सहेजा — सिंक प्रतीक्षारत',
      syncing: 'सर्वर से सिंक हो रहा है...',
      syncSuccess: 'सफलतापूर्वक सिंक हुआ!',
      landslide: 'भूस्खलन',
      flood: 'बाढ़',
      bridgeFailure: 'पुल क्षति',
      congestion: 'यातायात जाम',
      low: 'कम',
      moderate: 'मध्यम',
      critical: 'गंभीर',
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
    nav: {
      map: 'জিআইএছ মানচিত্ৰ',
      routing: 'বিপদ মাৰ্গ',
      fleet: 'বহৰ ট্ৰেকাৰ',
      report: 'ঘটনা জনাওক',
      alerts: 'সতৰ্কবাৰ্তা',
    },
    map: {
      title: 'ৰিয়েল-টাইম জিআইএছ সুলভতা মানচিত্ৰ',
      layerIncidents: 'সক্ৰিয় ঘটনাসমূহ',
      layerSupplyHubs: 'যোগান কেন্দ্ৰ',
      layerWeather: 'বতৰ ওভাৰলে',
      green: 'স্পষ্ট (স্কোৰ 80-100)',
      yellow: 'সীমিত (স্কোৰ 50-79)',
      red: 'অৱৰুদ্ধ (স্কোৰ 0-49)',
      noIncidents: 'এই অঞ্চলত কোনো সক্ৰিয় ঘটনা নাই',
    },
    routing: {
      title: 'এআই-চালিত গতিশীল বিপদ মাৰ্গনিৰ্ধাৰণ',
      selectCorridor: 'NER কৰিডোৰ বাছক',
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
      geofenceAlert: '⚠️ জিওফেন্স সতৰ্কতা: বাহন উচ্চ-বিপদ অঞ্চলত প্ৰৱেশ কৰিছে!',
      lastUpdated: 'শেষ আপডেট',
    },
    report: {
      title: 'পথ ঘটনা জনাওক',
      subtitle: 'অফলাইনত কাম কৰে — সংযোগ পুনৰুদ্ধাৰ হলে ডেটা সিংক হয়',
      yourLocation: 'আপোনাৰ অৱস্থান',
      detectLocation: 'মোৰ অৱস্থান চিনাক্ত কৰক',
      incidentType: 'ঘটনাৰ প্ৰকাৰ',
      severity: 'গুৰুত্ব',
      description: 'বিৱৰণ',
      reporterName: 'আপোনাৰ নাম / একক',
      highway: 'ৰাজপথ / পথ',
      district: 'জিলা',
      state: 'ৰাজ্য',
      submit: 'ৰিপোৰ্ট দাখিল কৰক',
      offlineQueue: 'অফলাইনত সংৰক্ষিত — সিংক বাকী',
      syncing: 'চাৰ্ভাৰলৈ সিংক হৈ আছে...',
      syncSuccess: 'সফলতাৰে সিংক হ\'ল!',
      landslide: 'ভূমিস্খলন',
      flood: 'বান',
      bridgeFailure: 'দলং ক্ষতিগ্ৰস্ত',
      congestion: 'যানজট',
      low: 'কম',
      moderate: 'মধ্যম',
      critical: 'গুৰুতৰ',
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
    nav: {
      map: 'জিআইএস মানচিত্র',
      routing: 'ঝুঁকি রুটিং',
      fleet: 'ফ্লিট ট্র্যাকার',
      report: 'ঘটনা রিপোর্ট',
      alerts: 'সতর্কতা',
    },
    map: {
      title: 'রিয়েল-টাইম জিআইএস অ্যাক্সেসিবিলিটি মানচিত্র',
      layerIncidents: 'সক্রিয় ঘটনাসমূহ',
      layerSupplyHubs: 'সরবরাহ কেন্দ্র',
      layerWeather: 'আবহাওয়া ওভারলে',
      green: 'পরিষ্কার (স্কোর 80-100)',
      yellow: 'সীমিত (স্কোর 50-79)',
      red: 'অবরুদ্ধ (স্কোর 0-49)',
      noIncidents: 'এই এলাকায় কোনো সক্রিয় ঘটনা নেই',
    },
    routing: {
      title: 'এআই-চালিত গতিশীল ঝুঁকি রুটিং',
      selectCorridor: 'NER করিডোর নির্বাচন করুন',
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
      geofenceAlert: '⚠️ জিওফেন্স সতর্কতা: যানবাহন উচ্চ-ঝুঁকি এলাকায় প্রবেশ করছে!',
      lastUpdated: 'সর্বশেষ আপডেট',
    },
    report: {
      title: 'সড়ক ঘটনা রিপোর্ট করুন',
      subtitle: 'অফলাইনে কাজ করে — সংযোগ পুনরুদ্ধার হলে ডেটা সিংক হয়',
      yourLocation: 'আপনার অবস্থান',
      detectLocation: 'আমার অবস্থান সনাক্ত করুন',
      incidentType: 'ঘটনার ধরন',
      severity: 'তীব্রতা',
      description: 'বিবরণ',
      reporterName: 'আপনার নাম / ইউনিট',
      highway: 'মহাসড়ক / রাস্তা',
      district: 'জেলা',
      state: 'রাজ্য',
      submit: 'রিপোর্ট জমা দিন',
      offlineQueue: 'অফলাইনে সংরক্ষিত — সিংক অপেক্ষারত',
      syncing: 'সার্ভারে সিংক হচ্ছে...',
      syncSuccess: 'সফলভাবে সিংক হয়েছে!',
      landslide: 'ভূমিধস',
      flood: 'বন্যা',
      bridgeFailure: 'সেতু ক্ষতিগ্রস্ত',
      congestion: 'যানজট',
      low: 'কম',
      moderate: 'মাঝারি',
      critical: 'গুরুতর',
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
    nav: {
      map: 'জিআইএস মেপ',
      routing: 'ৰিস্ক ৰুটিং',
      fleet: 'ফ্লিট ট্ৰেকৰ',
      report: 'ওইনবা রিপোৰ্ট',
      alerts: 'এলাৰ্ট',
    },
    map: {
      title: 'ৰিয়েল-টাইম জিআইএস মেপ',
      layerIncidents: 'চাল্লবা ওইনবাসিং',
      layerSupplyHubs: 'সাপ্লাই হাব',
      layerWeather: 'ৱেদৰ ওভাৰলে',
      green: 'চামু (স্কোৰ 80-100)',
      yellow: 'লিমিটেড (স্কোৰ 50-79)',
      red: 'বন্ধ (স্কোৰ 0-49)',
      noIncidents: 'মফম অদুদা ওইনবা য়াওদে',
    },
    routing: {
      title: 'এআই ডায়নামিক ৰিস্ক ৰুটিং',
      selectCorridor: 'NER কৰিডোৰ শেলগৎপী',
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
      geofenceAlert: '⚠️ জিওফেন্স এলাৰ্ট: গাৰি হাই-ৰিস্ক এৰিয়াদা ফংলে!',
      lastUpdated: 'শেষ আপডেট',
    },
    report: {
      title: 'লমদা ওইনবা রিপোৰ্ট তৌবিয়ু',
      subtitle: 'অফলাইনদা থবক তৌই — কনেকশন ফাউবদা ডেটা সিংক অৈ',
      yourLocation: 'নংগী মফম',
      detectLocation: 'এই মফম ফাউবিয়ু',
      incidentType: 'ওইনবাগী মতিক',
      severity: 'থাজবা',
      description: 'মতিক মপাং',
      reporterName: 'নংগী মিং / য়ুনিট',
      highway: 'হাইৱে / লমদা',
      district: 'জিলা',
      state: 'ৰাজ্য',
      submit: 'রিপোৰ্ট পীবিয়ু',
      offlineQueue: 'অফলাইনদা সেভ অৈ — সিংক য়াউৰি',
      syncing: 'সাৰভৰদা সিংক হৈ আছে...',
      syncSuccess: 'সিংক অৈ!',
      landslide: 'মপু হৌবা',
      flood: 'এরোইবা',
      bridgeFailure: 'পাল্লা থৌনা',
      congestion: 'গাৰি জাম',
      low: 'থুনা',
      moderate: 'মধ্যম',
      critical: 'থাজবা',
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
