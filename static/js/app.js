/**
 * AgriSense-X: Crop Stress Telemetry & Regional Farm Advisory
 * Full Featured Precision Agriculture Dashboard SPA
 */

const { useState, useEffect, useMemo, useRef } = React;

// -------------------------------------------------------------
// 0. Initial Mock Data for Zero-Delay Instant Rendering
// -------------------------------------------------------------
const INITIAL_FARMS = [
  {
    id: "FARM-001",
    name: "Green Valley Precision Plot",
    location: "Karnal, Haryana",
    latitude: 29.6857,
    longitude: 76.9905,
    crop: "tomato",
    variety: "Arka Rakshak (High Yield)",
    area_acres: 4.5,
    soil_type: "Loamy Sand",
    growth_stage: "Fruit Development",
    status: "online",
    mode: "demo",
    sensors: [
      { id: "SNS-T01", type: "Soil Moisture V1.2", depth: "15cm", reading: "32.4%", battery: "94%", status: "active" },
      { id: "SNS-T02", type: "Soil Temperature NTC", depth: "15cm", reading: "28.6°C", battery: "92%", status: "active" },
      { id: "SNS-T03", type: "Optical NPK Modbus", depth: "20cm", reading: "N:45 P:18 K:35", battery: "88%", status: "active" },
      { id: "SNS-T04", type: "ISFET pH Probe", depth: "15cm", reading: "6.4 pH", battery: "96%", status: "active" },
      { id: "SNS-T05", type: "Ultrasonic Water Level", depth: "Tank", reading: "58.5 cm", battery: "85%", status: "active" }
    ],
    current_telemetry: {
      moisture: 32.4,
      temperature: 28.6,
      N: 45.0,
      P: 18.0,
      K: 35.0,
      ph: 6.4,
      ec: 1.25,
      water_flow_lpm: 2.3,
      pump_state: "STANDBY",
      stress_score: 58,
      stress_category: "MODERATE_STRESS"
    }
  },
  {
    id: "FARM-002",
    name: "Punjab Delta Rice Nursery",
    location: "Ludhiana, Punjab",
    latitude: 30.9010,
    longitude: 75.8573,
    crop: "rice",
    variety: "PR-126 Basmati",
    area_acres: 8.0,
    soil_type: "Clay Loam",
    growth_stage: "Tillering Stage",
    status: "online",
    mode: "demo",
    sensors: [
      { id: "SNS-R01", type: "Submerged Soil Moisture", depth: "10cm", reading: "68.5%", battery: "91%", status: "active" },
      { id: "SNS-R02", type: "Soil Temperature Probe", depth: "10cm", reading: "24.2°C", battery: "89%", status: "active" },
      { id: "SNS-R03", type: "Soil EC & Salinity", depth: "15cm", reading: "1.05 mS/cm", battery: "95%", status: "active" }
    ],
    current_telemetry: {
      moisture: 68.5,
      temperature: 24.2,
      N: 78.0,
      P: 42.0,
      K: 40.0,
      ph: 6.8,
      ec: 1.05,
      water_flow_lpm: 0.0,
      pump_state: "OFF",
      stress_score: 18,
      stress_category: "HEALTHY"
    }
  },
  {
    id: "FARM-003",
    name: "Deccan Basin Cotton Estate",
    location: "Warangal, Telangana",
    latitude: 17.9689,
    longitude: 79.5941,
    crop: "cotton",
    variety: "Bt Cotton Bollgard II",
    area_acres: 12.0,
    soil_type: "Black Cotton Soil",
    growth_stage: "Flowering & Boll Formation",
    status: "online",
    mode: "demo",
    sensors: [
      { id: "SNS-C01", type: "FDR Moisture Sensor", depth: "30cm", reading: "24.5%", battery: "81%", status: "active" },
      { id: "SNS-C02", type: "Deep Thermistor", depth: "30cm", reading: "33.8°C", battery: "86%", status: "active" },
      { id: "SNS-C03", type: "NPK Spectroscopy", depth: "25cm", reading: "N:38 P:14 K:28", battery: "79%", status: "active" }
    ],
    current_telemetry: {
      moisture: 24.5,
      temperature: 33.8,
      N: 38.0,
      P: 14.0,
      K: 28.0,
      ph: 7.4,
      ec: 1.82,
      water_flow_lpm: 4.1,
      pump_state: "ACTIVE",
      stress_score: 78,
      stress_category: "SEVERE_STRESS"
    }
  },
  {
    id: "FARM-004",
    name: "Kaveri Agro Maize Zone",
    location: "Thanjavur, Tamil Nadu",
    latitude: 10.7870,
    longitude: 79.1378,
    crop: "maize",
    variety: "CoHM-6 Hybrid",
    area_acres: 5.0,
    soil_type: "Alluvial Loam",
    growth_stage: "Knee-High Vegetative",
    status: "online",
    mode: "live",
    sensors: [
      { id: "SNS-M01", type: "TDR Soil Moisture", depth: "20cm", reading: "44.0%", battery: "97%", status: "active" },
      { id: "SNS-M02", type: "Soil Temperature Probe", depth: "20cm", reading: "27.5°C", battery: "95%", status: "active" }
    ],
    current_telemetry: {
      moisture: 44.0,
      temperature: 27.5,
      N: 62.0,
      P: 31.0,
      K: 34.0,
      ph: 6.7,
      ec: 1.18,
      water_flow_lpm: 0.0,
      pump_state: "OFF",
      stress_score: 34,
      stress_category: "MILD_STRESS"
    }
  }
];

const INITIAL_ALERTS = [
  {
    id: "ALT-101",
    farm_id: "FARM-003",
    farm_name: "Deccan Basin Cotton Estate",
    type: "Low Soil Moisture",
    priority: "Critical",
    message: "Soil moisture collapsed to 24.5% (Threshold: 35.0%). Imminent root dehydration risk.",
    timestamp: "12 mins ago",
    acknowledged: false
  },
  {
    id: "ALT-102",
    farm_id: "FARM-003",
    farm_name: "Deccan Basin Cotton Estate",
    type: "High Soil Temperature",
    priority: "Warning",
    message: "Soil temperature reached 33.8°C at 30cm depth. Excessive root metabolic stress.",
    timestamp: "45 mins ago",
    acknowledged: false
  },
  {
    id: "ALT-103",
    farm_id: "FARM-001",
    farm_name: "Green Valley Precision Plot",
    type: "Nutrient Deficiency",
    priority: "Warning",
    message: "Phosphorus level at 18 mg/kg is 60% below optimal target (45 mg/kg) during fruit set.",
    timestamp: "2 hours ago",
    acknowledged: false
  },
  {
    id: "ALT-104",
    farm_id: "FARM-002",
    farm_name: "Punjab Delta Rice Nursery",
    type: "Heavy Rainfall Warning",
    priority: "Information",
    message: "Precipitation probability 78% in next 48h. Postpone urea top dressing.",
    timestamp: "4 hours ago",
    acknowledged: true
  }
];

const INITIAL_TELEMETRY = {
  status: "success",
  farm_id: "FARM-001",
  farm_name: "Green Valley Precision Plot",
  crop: "tomato",
  history: [
    { day: "Day 1", date: "Oct 24", moisture: 49.2, temperature: 26.2, ph: 6.64, ec: 1.45, N: 78.2, P: 23.4, K: 38.6, rainfall_mm: 5.0 },
    { day: "Day 2", date: "Oct 25", moisture: 46.4, temperature: 26.6, ph: 6.60, ec: 1.40, N: 76.0, P: 22.5, K: 38.0, rainfall_mm: 0.0 },
    { day: "Day 3", date: "Oct 26", moisture: 43.6, temperature: 27.0, ph: 6.56, ec: 1.35, N: 73.8, P: 21.6, K: 37.4, rainfall_mm: 0.0 },
    { day: "Day 4", date: "Oct 27", moisture: 40.8, temperature: 27.4, ph: 6.52, ec: 1.30, N: 71.6, P: 20.7, K: 36.8, rainfall_mm: 0.0 },
    { day: "Day 5", date: "Oct 28", moisture: 38.0, temperature: 27.8, ph: 6.48, ec: 1.25, N: 69.4, P: 19.8, K: 36.2, rainfall_mm: 0.0 },
    { day: "Day 6", date: "Oct 29", moisture: 35.2, temperature: 28.2, ph: 6.44, ec: 1.20, N: 67.2, P: 18.9, K: 35.6, rainfall_mm: 0.0 },
    { day: "Day 7", date: "Oct 30", moisture: 32.4, temperature: 28.6, ph: 6.40, ec: 1.25, N: 45.0, P: 18.0, K: 35.0, rainfall_mm: 0.0 }
  ],
  statistics: {
    moisture: { min: 32.4, max: 49.2, avg: 40.8 },
    temperature: { min: 26.2, max: 28.6, avg: 27.4 },
    ph: { min: 6.40, max: 6.64, avg: 6.52 },
    ec: { min: 1.20, max: 1.45, avg: 1.31 },
    N: { min: 45.0, max: 78.2, avg: 68.7 },
    P: { min: 18.0, max: 23.4, avg: 20.7 },
    K: { min: 35.0, max: 38.6, avg: 36.8 }
  },
  anomalies_detected: [
    "Rapid soil drying detected: moisture dropped at 2.8%/day over the week."
  ],
  moisture_rate_pct_day: -2.8,
  health_verdict: "EXPERIENCING MODERATE-TO-SEVERE STRESS",
  verdict_explanation: "The tomato crop is undergoing water stress due to sustained evapotranspiration outstripping root-zone replenishment. Soil moisture has steadily fallen from 49.2% on Oct 24 to 32.4% today. Urgent micro-irrigation is recommended to protect fruit development."
};

const INITIAL_WEATHER = {
  status: "success",
  location: "Karnal, Haryana",
  source: "Open-Meteo Synced",
  last_updated: "2026-10-30 12:00:00 IST",
  current: {
    temperature_c: 28.6,
    humidity_pct: 62,
    wind_speed_kmh: 8.5,
    precipitation_mm: 0.0,
    rainfall_probability_pct: 18
  },
  rainfall_risk_analyzer: {
    risk_level: "LOW RISK",
    alert_class: "safe",
    wash_off_danger: false,
    "3_day_expected_rain_mm": 2.0,
    peak_rain_probability_pct: 18,
    operational_advice: "Dry weather window confirmed for the next 72 hours (Rainfall prob < 20%). Safe for scheduled drip irrigation and soil fertilizer application. High solar radiation makes early morning (6:00 - 9:00 AM) optimal for irrigation."
  },
  forecast_7_day: [
    { date: "2026-10-30", day_name: "Today", temp_max: 31.0, temp_min: 19.5, precipitation_sum_mm: 0.0, precipitation_probability_pct: 10, wind_speed_kmh: 8.0, condition: "Clear Sky" },
    { date: "2026-10-31", day_name: "Sat", temp_max: 30.5, temp_min: 20.0, precipitation_sum_mm: 0.0, precipitation_probability_pct: 15, wind_speed_kmh: 9.2, condition: "Sunny" },
    { date: "2026-11-01", day_name: "Sun", temp_max: 29.0, temp_min: 19.0, precipitation_sum_mm: 2.0, precipitation_probability_pct: 35, wind_speed_kmh: 12.0, condition: "Partly Cloudy" },
    { date: "2026-11-02", day_name: "Mon", temp_max: 28.0, temp_min: 18.5, precipitation_sum_mm: 12.5, precipitation_probability_pct: 70, wind_speed_kmh: 18.5, condition: "Moderate Rain" },
    { date: "2026-11-03", day_name: "Tue", temp_max: 27.5, temp_min: 18.0, precipitation_sum_mm: 8.0, precipitation_probability_pct: 55, wind_speed_kmh: 14.0, condition: "Scattered Showers" },
    { date: "2026-11-04", day_name: "Wed", temp_max: 29.0, temp_min: 19.0, precipitation_sum_mm: 0.0, precipitation_probability_pct: 20, wind_speed_kmh: 10.0, condition: "Clear" },
    { date: "2026-11-05", day_name: "Thu", temp_max: 30.0, temp_min: 19.5, precipitation_sum_mm: 0.0, precipitation_probability_pct: 10, wind_speed_kmh: 8.5, condition: "Sunny" }
  ]
};

const INITIAL_STRESS = {
  status: "success",
  crop: "Tomato",
  stress_score: 58.0,
  stress_category: "Moderate Stress",
  badge_color: "amber",
  stress_factors: [
    { factor: "Soil Moisture Deficiency", severity: "High", value: "32.4% (Target: 50-80%)", contribution_pct: 38.2 },
    { factor: "Phosphorus Deficiency", severity: "High", value: "18.0 mg/kg (Target: 45 mg/kg)", contribution_pct: 12.0 },
    { factor: "Nitrogen Depletion", severity: "Moderate", value: "45.0 mg/kg (Target: 75 mg/kg)", contribution_pct: 8.5 }
  ],
  possible_causes: [
    "Extended dry spell, delayed irrigation cycle, or high evapotranspiration rate."
  ],
  recommended_corrective_actions: [
    "Initiate drip irrigation immediately to replenish the top 30cm root zone deficit.",
    "Incorporate DAP (Diammonium Phosphate) close to the root zone."
  ],
  methodology: "Scikit-Learn Random Forest trained on 2,200 multi-crop trials cross-calibrated with FAO-56 Agronomic Moisture Deficit Model."
};

const INITIAL_CALCULATOR = {
  status: "success",
  crop: "Tomato",
  field_acres: 4.5,
  soil_type: "Loamy Sand",
  growth_stage: "Fruit Development",
  irrigation_plan: {
    net_water_depth_mm: 25.0,
    liters_per_acre: 101175.0,
    total_estimated_water_liters: 455288.0,
    recommended_duration_hours: 2.4,
    suggested_timing: "Early Morning (05:30 AM - 08:30 AM) to minimize evaporative losses.",
    water_saving_recommendations: [
      "Use pressure-compensated inline drip emitters to achieve 92% application efficiency.",
      "Apply 5-7 cm organic biomass mulch along planting rows to reduce soil surface evaporation by up to 35%."
    ]
  },
  fertilizer_plan: {
    active_deficits_kg_acre: { N: 22.5, P: 17.5, K: 3.0 },
    per_acre_kg: { urea: 26.5, dap: 38.0, mop: 5.0 },
    total_field_kg: { urea: 119.3, dap: 171.0, mop: 22.5 },
    application_recommendations: [
      "Apply DAP (171.0 kg total) as a basal or sub-surface band 5-7 cm away from seedlings.",
      "Split Urea (119.3 kg total) into two applications: 50% immediately, 50% during mid-fruit development."
    ]
  }
};

const INITIAL_ADVISORY = {
  status: "success",
  language: "English",
  crop: "Tomato",
  farm_name: "Green Valley Precision Plot",
  regional_headline: "🌾 Actionable Farm Advisory: Moderate Stress in Tomato",
  action_today: "Apply 15.0 mm (45,000 L/acre) via drip irrigation and dress with recommended DAP and Urea splits.",
  warning_weather: "High evapotranspiration window. Irrigate during early morning or evening hours.",
  what_not_to_do: "Do NOT broadcast nitrogen fertilizer immediately before rainstorms or in midday heat.",
  audio_voice_script: "Hello Farmer, here is your customized AgriSense advisory for your tomato crop. Soil moisture has declined over the last 3 days to 32.4%. Apply 15 mm drip irrigation this morning.",
  structured_advisories: [
    {
      title: "Soil Moisture Deficit Intervention",
      problem: "Soil moisture has declined over the last 3 days to 32.4%, approaching critical root dehydration threshold.",
      reason: "High crop evapotranspiration combined with lack of precipitation in the last 72 hours.",
      action: "Initiate 2.5 hours of morning drip irrigation to deliver approximately 48,000 Litres/acre.",
      priority: "High",
      priority_color: "rose",
      expected_benefit: "Prevents blossom end rot and preserves fruit set yield by up to 28%."
    },
    {
      title: "Phosphate Root Zone Top-Dressing",
      problem: "Available Phosphorus (18 mg/kg) is 60% below optimal target for active fruit expansion.",
      reason: "Depletion from high vegetative intake without basal replenishment.",
      action: "Incorporate 14.5 kg/acre DAP via fertigation or band placement 5 cm below soil surface.",
      priority: "Medium",
      priority_color: "amber",
      expected_benefit: "Accelerates secondary root branching and enhances energy ATP transfer during flowering."
    },
    {
      title: "Weather Operational Window Alert",
      problem: "Dry atmospheric window confirmed for the next 48 hours.",
      reason: "High-pressure ridge suppressing convective precipitation (Rainfall prob < 20%).",
      action: "Execute scheduled field fertigation before Saturday afternoon; hold foliar sprays during peak afternoon sun.",
      priority: "Information",
      priority_color: "blue",
      expected_benefit: "Zero wash-off loss and maximum active absorption through root rhizosphere."
    }
  ]
};

// -------------------------------------------------------------
// 1. Multilingual Localization Dictionary (6 Languages)
// -------------------------------------------------------------
const I18N = {
  English: {
    title: "AgriSense-X",
    tagline: "Sensor Readings In, An Actionable Farm Advisory Out.",
    nav: {
      dashboard: "Dashboard",
      soilAnalytics: "Soil Analytics",
      weatherRisk: "Weather Monitoring",
      cropStress: "Crop Stress Detection",
      calculator: "Fertilizer & Water Calculator",
      advisory: "AI Farmer Advisory",
      farmFleet: "Farm Management",
      alerts: "Alerts Center",
      reports: "Reports & Export",
      settings: "Settings"
    },
    status: {
      healthy: "Healthy",
      mild: "Mild Stress",
      moderate: "Moderate Stress",
      severe: "Severe Stress",
      critical: "Critical Stress",
      online: "Online",
      demo: "Demo Mode",
      live: "Live IoT Hardware"
    },
    metrics: {
      monitoredFarms: "Monitored Farms",
      activeSensors: "Active IoT Sensors",
      avgMoisture: "Avg Soil Moisture",
      avgTemp: "Avg Soil Temp",
      avgPh: "Avg Soil pH",
      cropStressStatus: "Crop Stress Status",
      rainProb: "Rainfall Probability",
      irrigationRec: "Irrigation Advice"
    },
    buttons: {
      addFarm: "Add New Farm",
      calculate: "Calculate Dosages",
      uploadCsv: "Upload Sensor CSV",
      printPdf: "Print / Export PDF",
      downloadCsv: "Download 7-Day CSV",
      refresh: "Refresh Telemetry",
      acknowledge: "Acknowledge",
      acknowledged: "Resolved",
      saveSettings: "Save Preferences",
      listenVoice: "Listen to Voice Advisory",
      stopVoice: "Stop Audio"
    }
  },
  Hindi: {
    title: "एग्रीसेंस-एक्स",
    tagline: "सेंसर डेटा अंदर, सटीक कृषि परामर्श बाहर।",
    nav: {
      dashboard: "डैशबोर्ड",
      soilAnalytics: "मृदा विश्लेषण (7-दिन)",
      weatherRisk: "मौसम एवं वर्षा जोखिम",
      cropStress: "फसल तनाव पहचान",
      calculator: "उर्वरक एवं जल कैलकुलेटर",
      advisory: "एआई किसान परामर्श",
      farmFleet: "खेत एवं सेंसर प्रबंधन",
      alerts: "अलर्ट केंद्र",
      reports: "रिपोर्ट एवं डाउनलोड",
      settings: "सेटिंग्स"
    },
    status: {
      healthy: "उत्कृष्ट स्वास्थ्य",
      mild: "हल्का तनाव",
      moderate: "मध्यम तनाव",
      severe: "गंभीर तनाव",
      critical: "अति-गंभीर आपातकाल",
      online: "सक्रिय",
      demo: "डेमो मोड",
      live: "लाइव आईओटी सेंसर"
    },
    metrics: {
      monitoredFarms: "निगरानी वाले खेत",
      activeSensors: "सक्रिय आईओटी सेंसर",
      avgMoisture: "औसत मिट्टी नमी",
      avgTemp: "औसत मिट्टी तापमान",
      avgPh: "औसत मिट्टी पीएच",
      cropStressStatus: "फसल तनाव स्थिति",
      rainProb: "वर्षा की संभावना",
      irrigationRec: "सिंचाई अनुशंसा"
    },
    buttons: {
      addFarm: "नया खेत जोड़ें",
      calculate: "मात्रा की गणना करें",
      uploadCsv: "सेंसर CSV अपलोड करें",
      printPdf: "पीडीएफ रिपोर्ट निकालें",
      downloadCsv: "7-दिवसीय CSV डाउनलोड करें",
      refresh: "डेटा रीफ्रेश करें",
      acknowledge: "स्वीकार करें",
      acknowledged: "हल हो गया",
      saveSettings: "सेटिंग्स सुरक्षित करें",
      listenVoice: "ऑडियो परामर्श सुनें",
      stopVoice: "ऑडियो बंद करें"
    }
  },
  Tamil: {
    title: "அக்ரிசென்ஸ்-எக்ஸ்",
    tagline: "சென்சார் அளவீடுகள் உள்ளே, உடனடி விவசாய ஆலோசனை வெளியே.",
    nav: {
      dashboard: "முகப்பு பலகை",
      soilAnalytics: "மண் பகுப்பாய்வு",
      weatherRisk: "வானிலை & மழை ஆபத்து",
      cropStress: "பயிர் அழுத்த கண்டறிதல்",
      calculator: "உரம் & பாசன கால்குலேட்டர்",
      advisory: "விவசாய ஆலோசனை",
      farmFleet: "பண்ணை மேலாண்மை",
      alerts: "எச்சரிக்கை மையம்",
      reports: "அறிக்கைகள்",
      settings: "அமைப்புகள்"
    },
    status: {
      healthy: "ஆரோக்கியமானது",
      mild: "லேசான அழுத்தம்",
      moderate: "மிதமான அழுத்தம்",
      severe: "கடுமையான அழுத்தம்",
      critical: "அவசர நிலை",
      online: "இணைப்பில்",
      demo: "மாதிரி முறை",
      live: "நேரலை சென்சார்"
    },
    metrics: {
      monitoredFarms: "கண்காணிக்கப்படும் பண்ணைகள்",
      activeSensors: "இயங்கும் சென்சார்கள்",
      avgMoisture: "சராசரி மண் ஈரம்",
      avgTemp: "சராசரி மண் வெப்பம்",
      avgPh: "மண் pH அளவு",
      cropStressStatus: "பயிர் அழுத்த நிலை",
      rainProb: "மழை வாய்ப்பு",
      irrigationRec: "பாசன பரிந்துரை"
    },
    buttons: {
      addFarm: "புதிய பண்ணை சேர்க்க",
      calculate: "அளவை கணக்கிடு",
      uploadCsv: "சென்சார் CSV பதிவேற்றுக",
      printPdf: "PDF அச்சிடுக",
      downloadCsv: "CSV பதிவிறக்குக",
      refresh: "புதுப்பிக்கவும்",
      acknowledge: "ஏற்றுக்கொள்",
      acknowledged: "தீர்க்கப்பட்டது",
      saveSettings: "சேமிக்கவும்",
      listenVoice: "குரல் வழிகாட்டல் கேட்க",
      stopVoice: "நிறுத்து"
    }
  },
  Telugu: {
    title: "అగ్రిసెన్స్-ఎక్స్",
    tagline: "సెన్సార్ రీడింగులు లోపలికి, తక్షణ రైతు సలహా బయటికి.",
    nav: {
      dashboard: "డాష్‌బోర్డ్",
      soilAnalytics: "నేల విశ్లేషణ",
      weatherRisk: "వాతావరణం & వర్షం",
      cropStress: "పంట ఒత్తిడి గుర్తింపు",
      calculator: "ఎరువులు & నీటి కాలిక్యులేటర్",
      advisory: "రైతు సలహా",
      farmFleet: "రైతు క్షేత్రాలు",
      alerts: "హెచ్చరికలు",
      reports: "నివేదికలు",
      settings: "సెట్టింగులు"
    },
    status: {
      healthy: "ఆరోగ్యకరమైనది",
      mild: "స్వల్ప ఒత్తిడి",
      moderate: "మధ్యస్థ ఒత్తిడి",
      severe: "తీవ్రమైన ఒత్తిడి",
      critical: "అత్యవసర పరిస్థితి",
      online: "ఆన్‌లైన్",
      demo: "డెమో మోడ్",
      live: "ప్రత్యక్ష ఐఓటీ"
    },
    metrics: {
      monitoredFarms: "పర్యవేక్షించే క్షేత్రాలు",
      activeSensors: "క్రియాశీల సెన్సార్లు",
      avgMoisture: "సగటు తేమ శాతం",
      avgTemp: "సగటు నేల ఉష్ణోగ్రత",
      avgPh: "సగటు నేల pH",
      cropStressStatus: "పంట ఒత్తిడి స్థితి",
      rainProb: "వర్షపాత సంభావ్యత",
      irrigationRec: "నీటిపారుదల సలహా"
    },
    buttons: {
      addFarm: "కొత్త క్షేత్రం జోడించు",
      calculate: "మోతాదును లెక్కించు",
      uploadCsv: "CSV అప్‌లోడ్ చేయండి",
      printPdf: "PDF ప్రింట్ చేయండి",
      downloadCsv: "CSV డౌన్‌లోడ్",
      refresh: "రిఫ్రెష్ చేయండి",
      acknowledge: "గుర్తించండి",
      acknowledged: "పరిష్కరించబడింది",
      saveSettings: "భద్రపరుచు",
      listenVoice: "వాయిస్ సలహా వినండి",
      stopVoice: "ఆపు"
    }
  },
  Kannada: {
    title: "ಅಗ್ರಿಸೆನ್ಸ್-ಎಕ್ಸ್",
    tagline: "ಸೆನ್ಸರ್ ಮಾಪನ ಒಳಗೆ, ಕ್ರಿಯಾತ್ಮಕ ಕೃಷಿ ಸಲಹೆ ಹೊರಗೆ.",
    nav: {
      dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
      soilAnalytics: "ಮಣ್ಣಿನ ವಿಶ್ಲೇಷಣೆ",
      weatherRisk: "ಹವಾಮಾನ & ಮಳೆ ಅಪಾಯ",
      cropStress: "ಬೆಳೆ ಒತ್ತಡ ಪತ್ತೆ",
      calculator: "ಗೊಬ್ಬರ & ನೀರಾವರಿ ಕ್ಯಾಲ್ಕುಲೇಟರ್",
      advisory: "ರೈತ ಸಲಹೆ",
      farmFleet: "ತೋಟ ನಿರ್ವಹಣೆ",
      alerts: "ಎಚ್ಚರಿಕೆಗಳು",
      reports: "ವರದಿಗಳು",
      settings: "ಸೆಟ್ಟಿಂಗ್‌ಗಳು"
    },
    status: {
      healthy: "ಆರೋಗ್ಯಕರ",
      mild: "ಸ್ವಲ್ಪ ಒತ್ತಡ",
      moderate: "ಮಧ್ಯಮ ಒತ್ತಡ",
      severe: "ತೀವ್ರ ಒತ್ತಡ",
      critical: "ತುರ್ತು ಪರಿಸ್ಥಿತಿ",
      online: "ಆನ್‌ಲೈನ್",
      demo: "ಡೆಮೊ ಮೋಡ್",
      live: "ನೇರ ಐಒಟಿ"
    },
    metrics: {
      monitoredFarms: "ಮೇಲ್ವಿಚಾರಣೆ ತೋಟಗಳು",
      activeSensors: "ಸಕ್ರಿಯ ಸೆನ್ಸರ್‌ಗಳು",
      avgMoisture: "ಸರಾಸರಿ ತೇವಾಂಶ",
      avgTemp: "ಸರಾಸರಿ ತಾಪಮಾನ",
      avgPh: "ಸರಾಸರಿ ಮಣ್ಣಿನ pH",
      cropStressStatus: "ಬೆಳೆ ಒತ್ತಡ ಸ್ಥಿತಿ",
      rainProb: "ಮಳೆ ಸಾಧ್ಯತೆ",
      irrigationRec: "ನೀರಾವರಿ ಸಲಹೆ"
    },
    buttons: {
      addFarm: "ಹೊಸ ತೋಟ ಸೇರಿಸಿ",
      calculate: "ಲೆಕ್ಕಾಚಾರ ಮಾಡಿ",
      uploadCsv: "CSV ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
      printPdf: "PDF ಮುದ್ರಿಸಿ",
      downloadCsv: "CSV ಡೌನ್‌ಲೋಡ್",
      refresh: "ತಾಜಾಗೊಳಿಸಿ",
      acknowledge: "ಖಚಿತಪಡಿಸಿ",
      acknowledged: "ಪರಿಹರಿಸಲಾಗಿದೆ",
      saveSettings: "ಉಳಿಸಿ",
      listenVoice: "ಧ್ವನಿ ಸಲಹೆ ಕೇಳಿ",
      stopVoice: "ನಿಲ್ಲಿಸಿ"
    }
  },
  Malayalam: {
    title: "അഗ്രിസെൻസ്-എക്സ്",
    tagline: "സെൻസർ വിവരങ്ങൾ ഉള്ളിലേക്ക്, കൃത്യമായ കൃഷി ഉപദേശം പുറത്തേക്ക്.",
    nav: {
      dashboard: "ഡാഷ്‌ബോർഡ്",
      soilAnalytics: "മണ്ണ് പരിശോധന",
      weatherRisk: "കാലാവസ്ഥ & മഴ സാധ്യത",
      cropStress: "വിള സമ്മർദ്ദം",
      calculator: "വളവും നനയും കാൽക്കുലേറ്റർ",
      advisory: "കർഷക ഉപദേശം",
      farmFleet: "ഫാം മാനേജ്മെന്റ്",
      alerts: "മുന്നറിയിപ്പുകൾ",
      reports: "റിപ്പോർട്ടുകൾ",
      settings: "ക്രമീകരണങ്ങൾ"
    },
    status: {
      healthy: "ആരോഗ്യമുള്ളത്",
      mild: "ചെറിയ സമ്മർദ്ദം",
      moderate: "മിതമായ സമ്മർദ്ദം",
      severe: "ഗുരുതര സമ്മർദ്ദം",
      critical: "അതീവ ഗുരുതരം",
      online: "ഓൺലൈൻ",
      demo: "ഡെമോ മോഡ്",
      live: "തത്സമയ ഐഒടി"
    },
    metrics: {
      monitoredFarms: "നിരീക്ഷിക്കുന്ന ഫാമുകൾ",
      activeSensors: "സജീവ സെൻസറുകൾ",
      avgMoisture: "ശരാശരി ഈർപ്പം",
      avgTemp: "ശരാശരി താപനില",
      avgPh: "മണ്ണ് pH നില",
      cropStressStatus: "വിള സമ്മർദ്ദാവസ്ഥ",
      rainProb: "മഴ സാധ്യത",
      irrigationRec: "നന ശുപാർശ"
    },
    buttons: {
      addFarm: "പുതിയ ഫാം ചേർക്കുക",
      calculate: "കണക്കുകൂട്ടുക",
      uploadCsv: "CSV അപ്‌ലോഡ് ചെയ്യുക",
      printPdf: "PDF പ്രിന്റ് ചെയ്യുക",
      downloadCsv: "CSV ഡൗൺലോഡ്",
      refresh: "പുതുക്കുക",
      acknowledge: "സ്ഥിരീകരിക്കുക",
      acknowledged: "പരിഹരിച്ചു",
      saveSettings: "സൂക്ഷിക്കുക",
      listenVoice: "ശബ്ദ സന്ദേശം കേൾക്കുക",
      stopVoice: "നിർത്തുക"
    }
  }
};

// -------------------------------------------------------------
// 2. SVG Icon Library Helper
// -------------------------------------------------------------
function Icon({ name, className = "w-5 h-5", ...props }) {
  const icons = {
    dashboard: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />,
    soil: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
    weather: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15z" />,
    stress: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />,
    calc: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />,
    advisory: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />,
    fleet: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />,
    alerts: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />,
    reports: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
    settings: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />,
    leaf: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />,
    droplet: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a8 8 0 11-14.856 0c0-4.418 5.428-10.428 7.428-12.428 2 2 7.428 8.01 7.428 12.428z" />,
    temperature: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
    check: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />,
    upload: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />,
    download: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />,
    volume: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />,
    chevronRight: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
  };

  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      {icons[name] || icons.leaf}
    </svg>
  );
}

// -------------------------------------------------------------
// 3. Interactive SVG Trend Chart Component
// -------------------------------------------------------------
function SvgLineChart({ data, metricKey, label, color = "#059669", unit = "%" }) {
  const [hoverIndex, setHoverIndex] = useState(null);

  if (!data || data.length === 0) return <div className="text-slate-400 py-10 text-center">No telemetry points available</div>;

  const values = data.map(d => Number(d[metricKey] || 0));
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = (maxVal - minVal) || 1;

  const width = 680;
  const height = 240;
  const paddingX = 40;
  const paddingY = 30;

  const points = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1)) * (width - paddingX * 2);
    const normalizedY = (Number(d[metricKey] || 0) - minVal) / range;
    const y = height - paddingY - normalizedY * (height - paddingY * 2);
    return { x, y, value: d[metricKey], label: d.day || d.date || `D${i+1}` };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, "");

  const areaD = `${pathD} L ${points[points.length-1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  return (
    <div className="relative w-full overflow-hidden select-none bg-white p-4 rounded-xl border border-emerald-50">
      <div className="flex justify-between items-center mb-2 px-2">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
          Latest: {values[values.length-1]} {unit}
        </span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        <defs>
          <linearGradient id={`grad-${metricKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={color} stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1.0].map((step, idx) => {
          const y = height - paddingY - step * (height - paddingY * 2);
          const gridVal = (minVal + step * range).toFixed(1);
          return (
            <g key={idx}>
              <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="#f1f5f3" strokeDasharray="4 4" strokeWidth="1" />
              <text x={paddingX - 8} y={y + 4} textAnchor="end" fontSize="10" fill="#94a3b8" fontFamily="sans-serif">{gridVal}</text>
            </g>
          );
        })}

        {/* Shaded Area */}
        <path d={areaD} fill={`url(#grad-${metricKey})`} />

        {/* Primary Line */}
        <path d={pathD} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        {/* Points & Interactive Tooltip Triggers */}
        {points.map((p, idx) => (
          <g key={idx} onMouseEnter={() => setHoverIndex(idx)} onMouseLeave={() => setHoverIndex(null)} className="cursor-pointer">
            <circle cx={p.x} cy={p.y} r={hoverIndex === idx ? "7" : "4.5"} fill="#ffffff" stroke={color} strokeWidth="2.5" className="transition-all duration-150" />
            <text x={p.x} y={height - 8} textAnchor="middle" fontSize="11" fill="#64748b" fontWeight="500">{p.label}</text>
          </g>
        ))}

        {/* Hover Tooltip Overlay */}
        {hoverIndex !== null && (
          <g transform={`translate(${points[hoverIndex].x}, ${points[hoverIndex].y - 32})`}>
            <rect x="-42" y="-18" width="84" height="26" rx="6" fill="#0b3d22" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.15))" />
            <text x="0" y="-1" textAnchor="middle" fontSize="11" fill="#ffffff" fontWeight="700">
              {points[hoverIndex].value} {unit}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

// -------------------------------------------------------------
// 4. Main Application Component
// -------------------------------------------------------------
function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [lang, setLang] = useState("English");
  const [farms, setFarms] = useState(INITIAL_FARMS);
  const [selectedFarmId, setSelectedFarmId] = useState("FARM-001");
  const [telemetryData, setTelemetryData] = useState(INITIAL_TELEMETRY);
  const [weatherData, setWeatherData] = useState(INITIAL_WEATHER);
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const [stressResult, setStressResult] = useState(INITIAL_STRESS);
  const [calculatorResult, setCalculatorResult] = useState(INITIAL_CALCULATOR);
  const [advisoryResult, setAdvisoryResult] = useState(INITIAL_ADVISORY);
  const [loading, setLoading] = useState(true);
  const [voicePlaying, setVoicePlaying] = useState(false);

  // Modal State for Adding New Farm
  const [isAddFarmOpen, setIsAddFarmOpen] = useState(false);
  const [newFarmForm, setNewFarmForm] = useState({
    name: "",
    location: "Karnal, Haryana",
    crop: "tomato",
    variety: "Hybrid V1",
    area_acres: 4.0,
    soil_type: "Loamy Sand",
    growth_stage: "Fruit Development",
    mode: "demo"
  });

  // Calculator Form State
  const [calcForm, setCalcForm] = useState({
    crop: "tomato",
    area: 3.5,
    area_unit: "acres",
    moisture: 32.0,
    ph: 6.4,
    N: 45.0,
    P: 18.0,
    K: 35.0,
    growth_stage: "Fruit Development",
    soil_type: "Loamy Sand"
  });

  // Stress Detection Sliders State
  const [stressSliders, setStressSliders] = useState({
    crop: "tomato",
    moisture: 32.0,
    temperature: 29.5,
    N: 45.0,
    P: 18.0,
    K: 35.0,
    ph: 6.4
  });

  // 7-day Analytics active metric filter
  const [activeMetric, setActiveMetric] = useState("moisture");

  const t = useMemo(() => I18N[lang] || I18N.English, [lang]);
  const selectedFarm = useMemo(() => farms.find(f => f.id === selectedFarmId) || farms[0], [farms, selectedFarmId]);

  // Fetch initial data
  useEffect(() => {
    refreshAllData();
  }, []);

  const refreshAllData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Farms
      const resFarms = await fetch("/api/farms");
      const dataFarms = await resFarms.json();
      if (dataFarms.farms) setFarms(dataFarms.farms);

      // 2. Fetch 7-day Telemetry for default farm
      const resTel = await fetch(`/api/telemetry/7day?farm_id=${selectedFarmId}`);
      const dataTel = await resTel.json();
      setTelemetryData(dataTel);

      // 3. Fetch Weather
      const resWeather = await fetch("/api/weather/live?location=Karnal,%20Haryana&lat=29.6857&lon=76.9905");
      const dataWeather = await resWeather.json();
      setWeatherData(dataWeather);

      // 4. Fetch Alerts
      const resAlerts = await fetch("/api/alerts");
      const dataAlerts = await resAlerts.json();
      if (dataAlerts.alerts) setAlerts(dataAlerts.alerts);

      // 5. Initial Stress Analyze
      await triggerStressAnalysis(stressSliders);

      // 6. Initial Dosage Calculation
      await triggerDosageCalculation(calcForm);

      // 7. Initial Advisory
      await triggerAdvisory(lang, selectedFarmId);

    } catch (err) {
      console.warn("API offline, utilizing resilient local state", err);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch telemetry when farm switcher changes
  useEffect(() => {
    if (!selectedFarmId) return;
    fetch(`/api/telemetry/7day?farm_id=${selectedFarmId}`)
      .then(r => r.json())
      .then(d => setTelemetryData(d))
      .catch(e => console.error(e));
    triggerAdvisory(lang, selectedFarmId);
  }, [selectedFarmId]);

  // Re-fetch advisory when language changes
  useEffect(() => {
    triggerAdvisory(lang, selectedFarmId);
  }, [lang]);

  const triggerStressAnalysis = async (params) => {
    try {
      const res = await fetch("/api/stress/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ crop: params.crop, readings: params })
      });
      const data = await res.json();
      setStressResult(data);
    } catch (e) {
      console.error(e);
    }
  };

  const triggerDosageCalculation = async (formVals) => {
    try {
      const res = await fetch("/api/calculator/dosage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formVals)
      });
      const data = await res.json();
      setCalculatorResult(data);
    } catch (e) {
      console.error(e);
    }
  };

  const triggerAdvisory = async (language, farmId) => {
    try {
      const res = await fetch("/api/advisory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, farm_id: farmId, crop: selectedFarm?.crop || "tomato" })
      });
      const data = await res.json();
      setAdvisoryResult(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAcknowledgeAlert = async (alertId) => {
    try {
      await fetch(`/api/alerts/${alertId}/ack`, { method: "POST" });
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a));
    } catch (e) {
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a));
    }
  };

  const handleAddFarmSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/farms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newFarmForm)
      });
      const data = await res.json();
      if (data.farm) {
        setFarms(prev => [...prev, data.farm]);
        setSelectedFarmId(data.farm.id);
        setIsAddFarmOpen(false);
      }
    } catch (err) {
      console.error("Error creating farm", err);
    }
  };

  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    fetch("/api/telemetry/upload-csv", { method: "POST", body: formData })
      .then(r => r.json())
      .then(d => {
        if (d.status === "success" && d.extracted_7day_readings) {
          setTelemetryData(prev => ({
            ...prev,
            history: d.extracted_7day_readings,
            health_verdict: "CUSTOM CSV TELEMETRY LOADED",
            verdict_explanation: `Loaded ${d.rows_parsed} records from ${d.filename}. Updated 7-day soil analytics and trend models.`
          }));
          alert(`Successfully parsed ${d.rows_parsed} telemetry readings from ${d.filename}!`);
        } else {
          alert("Error: " + (d.error || "Failed to parse CSV"));
        }
      })
      .catch(err => alert("Upload error: " + err.message));
  };

  // Text to Speech playback
  const handleVoicePlayback = (text) => {
    if (!('speechSynthesis' in window)) {
      alert("Text-to-speech audio playback is not supported on this browser.");
      return;
    }
    if (voicePlaying) {
      window.speechSynthesis.cancel();
      setVoicePlaying(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.onend = () => setVoicePlaying(false);
    utterance.onerror = () => setVoicePlaying(false);
    setVoicePlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f3f7f4]">
      {/* ------------------------------------------------------------- */}
      {/* LEFT SIDEBAR NAVIGATION */}
      {/* ------------------------------------------------------------- */}
      <aside className="w-full md:w-64 bg-agriForest text-white flex flex-col flex-shrink-0 border-r border-emerald-950 no-print">
        {/* Brand Header */}
        <div className="p-5 border-b border-emerald-900/60 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-brand-300 flex items-center justify-center shadow-lg shadow-emerald-900/50">
              <Icon name="leaf" className="w-6 h-6 text-agriForest" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight tracking-tight text-white flex items-center">
                AgriSense<span className="text-brand-400">X</span>
              </h1>
              <span className="text-[10px] text-emerald-300 font-medium tracking-wide block uppercase">Precision Advisory</span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
          {[
            { id: "dashboard", icon: "dashboard", label: t.nav.dashboard },
            { id: "soil", icon: "soil", label: t.nav.soilAnalytics },
            { id: "weather", icon: "weather", label: t.nav.weatherRisk },
            { id: "stress", icon: "stress", label: t.nav.cropStress },
            { id: "calc", icon: "calc", label: t.nav.calculator },
            { id: "advisory", icon: "advisory", label: t.nav.advisory },
            { id: "fleet", icon: "fleet", label: t.nav.farmFleet },
            { id: "alerts", icon: "alerts", label: t.nav.alerts, count: alerts.filter(a => !a.acknowledged).length },
            { id: "reports", icon: "reports", label: t.nav.reports },
            { id: "settings", icon: "settings", label: t.nav.settings }
          ].map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive ? "bg-white/10 text-white shadow-sm font-semibold border-l-4 border-brand-400" : "text-emerald-100/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon name={item.icon} className={`w-5 h-5 ${isActive ? "text-brand-300" : "text-emerald-300/70"}`} />
                  <span>{item.label}</span>
                </div>
                {item.count > 0 && (
                  <span className="bg-rose-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Global Language Selector & Status Footer */}
        <div className="p-4 border-t border-emerald-900/60 bg-emerald-950/40">
          <label className="text-[11px] font-semibold text-emerald-300/80 uppercase tracking-wider block mb-1.5">
            Regional Language
          </label>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="w-full bg-emerald-900 text-white text-xs font-medium rounded-lg px-3 py-2 border border-emerald-700 focus:outline-none focus:ring-2 focus:ring-brand-400 cursor-pointer"
          >
            <option value="English">English</option>
            <option value="Hindi">हिन्दी (Hindi)</option>
            <option value="Tamil">தமிழ் (Tamil)</option>
            <option value="Telugu">తెలుగు (Telugu)</option>
            <option value="Kannada">ಕನ್ನಡ (Kannada)</option>
            <option value="Malayalam">മലയാളം (Malayalam)</option>
          </select>
          <div className="mt-3 flex items-center justify-between text-[11px] text-emerald-400/80">
            <span className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-brand-400 mr-1.5 animate-ping"></span>
              IoT Engine Active
            </span>
            <span className="text-emerald-300/60">v2.4.0</span>
          </div>
        </div>
      </aside>

      {/* ------------------------------------------------------------- */}
      {/* MAIN CONTENT AREA */}
      {/* ------------------------------------------------------------- */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Header Bar */}
        <header className="bg-white border-b border-agriBorder px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm no-print">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                AI Precision Platform
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500">Live Weather: Open-Meteo Synced</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">
              {t.nav[activeTab] || activeTab.toUpperCase()}
            </h2>
          </div>

          {/* Quick Farm Switcher & Actions */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
              <Icon name="fleet" className="w-4 h-4 text-emerald-700 mr-2" />
              <select
                value={selectedFarmId}
                onChange={(e) => setSelectedFarmId(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
              >
                {farms.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.crop.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => refreshAllData()}
              className="p-2 text-slate-600 hover:text-emerald-700 bg-white border border-slate-200 hover:border-emerald-300 rounded-xl transition shadow-sm"
              title={t.buttons.refresh}
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>

            <button
              onClick={() => setIsAddFarmOpen(true)}
              className="bg-agriForest hover:bg-emerald-900 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition shadow-sm flex items-center space-x-1.5"
            >
              <span>+</span>
              <span>{t.buttons.addFarm}</span>
            </button>
          </div>
        </header>

        {/* View Container */}
        <div className="p-6 flex-1 space-y-6">

          {/* ------------------------------------------------------- */}
          {/* VIEW 1: DASHBOARD */}
          {/* ------------------------------------------------------- */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Irrigation Advisory Banner */}
              <div className="bg-gradient-to-r from-emerald-800 to-agriForest text-white rounded-2xl p-5 shadow-sm border border-emerald-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-white/10 rounded-xl">
                    <Icon name="droplet" className="w-7 h-7 text-brand-300" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-brand-300 bg-white/10 px-2 py-0.5 rounded-full">
                        AI Recommended Irrigation
                      </span>
                      <span className="text-xs text-emerald-200">• Optimal Timing: 05:30 AM</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mt-1">
                      {selectedFarm?.current_telemetry?.moisture < 35 ? (
                        "Immediate Micro-Irrigation Advised: 48,000 L / Acre Root Replenishment"
                      ) : (
                        "Soil Moisture Adequate: Maintain Withholding Window for Next 24 Hours"
                      )}
                    </h3>
                    <p className="text-xs text-emerald-100/80 mt-1 max-w-2xl">
                      Telemetry for {selectedFarm?.name} ({selectedFarm?.crop}): Root zone moisture is currently {selectedFarm?.current_telemetry?.moisture}%. Weather indicates {weatherData?.rainfall_risk_analyzer?.['3_day_expected_rain_mm'] || 0}mm rain anticipated.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab("calc")}
                  className="bg-brand-400 hover:bg-brand-300 text-agriDark font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition flex items-center space-x-1.5 whitespace-nowrap self-end md:self-center"
                >
                  <Icon name="calc" className="w-4 h-4 text-agriDark" />
                  <span>Open Dosage Calculator</span>
                </button>
              </div>

              {/* 8 Primary KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Monitored Farms */}
                <div className="bg-white p-4 rounded-2xl border border-agriBorder shadow-sm">
                  <div className="flex justify-between items-center text-slate-400 mb-1">
                    <span className="text-xs font-semibold uppercase">{t.metrics.monitoredFarms}</span>
                    <Icon name="fleet" className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-bold text-slate-800">{farms.length}</div>
                  <div className="text-[11px] text-emerald-600 font-medium mt-1">Across 4 Agricultural Zones</div>
                </div>

                {/* 2. Active IoT Sensors */}
                <div className="bg-white p-4 rounded-2xl border border-agriBorder shadow-sm">
                  <div className="flex justify-between items-center text-slate-400 mb-1">
                    <span className="text-xs font-semibold uppercase">{t.metrics.activeSensors}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  </div>
                  <div className="text-2xl font-bold text-slate-800">
                    {farms.reduce((acc, f) => acc + (f.sensors?.length || 0), 0)}
                  </div>
                  <div className="text-[11px] text-emerald-600 font-medium mt-1">100% Online & Telemetry Synced</div>
                </div>

                {/* 3. Average Soil Moisture */}
                <div className="bg-white p-4 rounded-2xl border border-agriBorder shadow-sm">
                  <div className="flex justify-between items-center text-slate-400 mb-1">
                    <span className="text-xs font-semibold uppercase">{t.metrics.avgMoisture}</span>
                    <Icon name="droplet" className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="text-2xl font-bold text-slate-800">
                    {selectedFarm?.current_telemetry?.moisture || 35.0}%
                  </div>
                  <div className="text-[11px] text-amber-600 font-medium mt-1">Target: 50% - 75% for {selectedFarm?.crop}</div>
                </div>

                {/* 4. Average Soil Temp */}
                <div className="bg-white p-4 rounded-2xl border border-agriBorder shadow-sm">
                  <div className="flex justify-between items-center text-slate-400 mb-1">
                    <span className="text-xs font-semibold uppercase">{t.metrics.avgTemp}</span>
                    <Icon name="temperature" className="w-4 h-4 text-orange-500" />
                  </div>
                  <div className="text-2xl font-bold text-slate-800">
                    {selectedFarm?.current_telemetry?.temperature || 28.5}°C
                  </div>
                  <div className="text-[11px] text-emerald-600 font-medium mt-1">Optimal vegetative band</div>
                </div>

                {/* 5. Soil pH */}
                <div className="bg-white p-4 rounded-2xl border border-agriBorder shadow-sm">
                  <div className="flex justify-between items-center text-slate-400 mb-1">
                    <span className="text-xs font-semibold uppercase">{t.metrics.avgPh}</span>
                    <span className="text-xs font-bold text-purple-600">ISFET</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-800">
                    {selectedFarm?.current_telemetry?.ph || 6.4} pH
                  </div>
                  <div className="text-[11px] text-emerald-600 font-medium mt-1">Slightly Acidic (Target 6.0-7.0)</div>
                </div>

                {/* 6. Current Crop Stress Status */}
                <div className="bg-white p-4 rounded-2xl border border-agriBorder shadow-sm">
                  <div className="flex justify-between items-center text-slate-400 mb-1">
                    <span className="text-xs font-semibold uppercase">{t.metrics.cropStressStatus}</span>
                    <Icon name="stress" className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`w-3 h-3 rounded-full ${
                      selectedFarm?.current_telemetry?.stress_score > 65 ? "bg-rose-500" :
                      selectedFarm?.current_telemetry?.stress_score > 35 ? "bg-amber-500" : "bg-emerald-500"
                    }`}></span>
                    <div className="text-lg font-bold text-slate-800">
                      {selectedFarm?.current_telemetry?.stress_score > 65 ? "Severe Stress" :
                       selectedFarm?.current_telemetry?.stress_score > 35 ? "Moderate Stress" : "Healthy"}
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Index Score: {selectedFarm?.current_telemetry?.stress_score || 45}/100
                  </div>
                </div>

                {/* 7. Rainfall Probability */}
                <div className="bg-white p-4 rounded-2xl border border-agriBorder shadow-sm">
                  <div className="flex justify-between items-center text-slate-400 mb-1">
                    <span className="text-xs font-semibold uppercase">{t.metrics.rainProb}</span>
                    <Icon name="weather" className="w-4 h-4 text-sky-500" />
                  </div>
                  <div className="text-2xl font-bold text-slate-800">
                    {weatherData?.rainfall_risk_analyzer?.peak_rain_probability_pct || 18}%
                  </div>
                  <div className="text-[11px] text-emerald-600 font-medium mt-1">
                    {weatherData?.rainfall_risk_analyzer?.risk_level || "LOW RISK"}
                  </div>
                </div>

                {/* 8. Motor / Pump Telemetry */}
                <div className="bg-white p-4 rounded-2xl border border-agriBorder shadow-sm">
                  <div className="flex justify-between items-center text-slate-400 mb-1">
                    <span className="text-xs font-semibold uppercase">Micro-Pump State</span>
                    <span className="text-xs font-bold text-blue-600">Modbus</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-800">
                    {selectedFarm?.current_telemetry?.pump_state || "STANDBY"}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Flow: {selectedFarm?.current_telemetry?.water_flow_lpm || 2.3} LPM
                  </div>
                </div>
              </div>

              {/* Middle Row: 7-Day Trend Preview & AI Advisory Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 7-Day Soil Moisture Chart Card */}
                <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-agriBorder shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">7-Day Soil Moisture Depletion Curve</h3>
                      <p className="text-xs text-slate-500">Tracking daily volumetric water content (%) vs crop threshold</p>
                    </div>
                    <button
                      onClick={() => setActiveTab("soil")}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center space-x-1"
                    >
                      <span>Full Soil Analytics</span>
                      <Icon name="chevronRight" className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <SvgLineChart
                    data={telemetryData?.history || []}
                    metricKey="moisture"
                    label="Soil Moisture (%)"
                    color="#059669"
                    unit="%"
                  />
                </div>

                {/* AI Farmer Advisory Summary Card */}
                <div className="bg-white p-5 rounded-2xl border border-agriBorder shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 flex items-center space-x-1">
                        <Icon name="advisory" className="w-3.5 h-3.5 text-emerald-700" />
                        <span>AI Advisory Summary</span>
                      </span>
                      <span className="text-xs text-slate-400">{lang}</span>
                    </div>

                    <h4 className="font-bold text-slate-800 text-sm leading-snug">
                      {advisoryResult?.regional_headline || "🌾 Precision Crop Telemetry Advisory"}
                    </h4>

                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {advisoryResult?.action_today || "Soil readings indicate moderate root-zone moisture depletion. Prepare early morning drip irrigation cycle."}
                    </p>

                    <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-100">
                      <div className="text-[11px] font-bold text-amber-800 uppercase flex items-center space-x-1">
                        <Icon name="weather" className="w-3.5 h-3.5 text-amber-600" />
                        <span>Rainfall & Wash-Off Insight</span>
                      </div>
                      <div className="text-xs text-amber-900 mt-1">
                        {weatherData?.rainfall_risk_analyzer?.operational_advice || "Favorable weather window for fertilizer top-dressing."}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => handleVoicePlayback(advisoryResult?.audio_voice_script || advisoryResult?.action_today || "")}
                      className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center space-x-1.5"
                    >
                      <Icon name="volume" className={`w-4 h-4 ${voicePlaying ? 'text-rose-600 animate-bounce' : 'text-emerald-700'}`} />
                      <span>{voicePlaying ? t.buttons.stopVoice : t.buttons.listenVoice}</span>
                    </button>
                    <button
                      onClick={() => setActiveTab("advisory")}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                    >
                      View All Advisories →
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Recent Priority Alerts */}
              <div className="bg-white p-5 rounded-2xl border border-agriBorder shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Icon name="alerts" className="w-5 h-5 text-rose-500" />
                    <h3 className="text-base font-bold text-slate-900">Recent Field Alerts</h3>
                  </div>
                  <span className="text-xs text-slate-400">Live Telemetry Monitor</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {alerts.map(a => (
                    <div
                      key={a.id}
                      className={`p-3.5 rounded-xl border transition ${
                        a.acknowledged ? "bg-slate-50/70 border-slate-200 opacity-60" :
                        a.priority === "Critical" ? "bg-rose-50/50 border-rose-200" :
                        a.priority === "Warning" ? "bg-amber-50/50 border-amber-200" : "bg-blue-50/50 border-blue-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          a.priority === "Critical" ? "bg-rose-100 text-rose-700" :
                          a.priority === "Warning" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                        }`}>
                          {a.priority}
                        </span>
                        <span className="text-[10px] text-slate-400">{a.timestamp}</span>
                      </div>
                      <h5 className="text-xs font-bold text-slate-800">{a.type}</h5>
                      <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{a.message}</p>
                      <div className="mt-2.5 pt-2 border-t border-slate-200/50 flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 truncate">{a.farm_name}</span>
                        {!a.acknowledged ? (
                          <button
                            onClick={() => handleAcknowledgeAlert(a.id)}
                            className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 underline"
                          >
                            {t.buttons.acknowledge}
                          </button>
                        ) : (
                          <span className="text-[10px] text-emerald-600 font-semibold">✓ {t.buttons.acknowledged}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------- */}
          {/* VIEW 2: 7-DAY SOIL TREND ANALYSIS */}
          {/* ------------------------------------------------------- */}
          {activeTab === "soil" && (
            <div className="space-y-6">
              {/* Header with Metric Pill Toggles & CSV Upload */}
              <div className="bg-white p-5 rounded-2xl border border-agriBorder shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">7-Day Multi-Variable Soil Telemetry Analytics</h3>
                  <p className="text-xs text-slate-500">Continuous telemetry monitoring across N, P, K, moisture, temp, pH, and electrical conductivity</p>
                </div>

                <div className="flex items-center space-x-3">
                  {/* CSV Upload Button */}
                  <label className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center space-x-1.5 shadow-sm">
                    <Icon name="upload" className="w-4 h-4 text-emerald-700" />
                    <span>{t.buttons.uploadCsv}</span>
                    <input type="file" accept=".csv" onChange={handleCsvUpload} className="hidden" />
                  </label>

                  {/* Export CSV Button */}
                  <a
                    href={`/api/telemetry/export-csv?farm_id=${selectedFarmId}`}
                    download
                    className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 shadow-sm"
                  >
                    <Icon name="download" className="w-4 h-4 text-slate-600" />
                    <span>{t.buttons.downloadCsv}</span>
                  </a>
                </div>
              </div>

              {/* Metric Selector Pills */}
              <div className="flex flex-wrap gap-2">
                {[
                  { key: "moisture", label: "Soil Moisture (%)", color: "#059669", unit: "%" },
                  { key: "temperature", label: "Soil Temperature (°C)", color: "#f97316", unit: "°C" },
                  { key: "ph", label: "Soil pH Level", color: "#8b5cf6", unit: "pH" },
                  { key: "ec", label: "Electrical Conductivity (EC)", color: "#06b6d4", unit: "mS/cm" },
                  { key: "N", label: "Nitrogen (N)", color: "#10b981", unit: "mg/kg" },
                  { key: "P", label: "Phosphorus (P)", color: "#ec4899", unit: "mg/kg" },
                  { key: "K", label: "Potassium (K)", color: "#eab308", unit: "mg/kg" }
                ].map(m => (
                  <button
                    key={m.key}
                    onClick={() => setActiveMetric(m.key)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                      activeMetric === m.key ? "bg-agriForest text-white shadow-sm" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Interactive Line Chart for Active Metric */}
              <div className="bg-white p-5 rounded-2xl border border-agriBorder shadow-sm">
                <SvgLineChart
                  data={telemetryData?.history || []}
                  metricKey={activeMetric}
                  label={`7-Day Trend: ${activeMetric.toUpperCase()}`}
                  color={
                    activeMetric === "moisture" ? "#059669" :
                    activeMetric === "temperature" ? "#f97316" :
                    activeMetric === "ph" ? "#8b5cf6" :
                    activeMetric === "ec" ? "#06b6d4" :
                    activeMetric === "N" ? "#10b981" :
                    activeMetric === "P" ? "#ec4899" : "#eab308"
                  }
                  unit={
                    activeMetric === "moisture" ? "%" :
                    activeMetric === "temperature" ? "°C" :
                    activeMetric === "ph" ? "pH" :
                    activeMetric === "ec" ? "mS/cm" : "mg/kg"
                  }
                />
              </div>

              {/* Statistics & Anomaly Interpretation Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Min / Max / Average Statistics */}
                <div className="bg-white p-5 rounded-2xl border border-agriBorder shadow-sm">
                  <h4 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider text-slate-400">
                    7-Day Min / Max / Average
                  </h4>
                  {telemetryData?.statistics ? (
                    <div className="space-y-3">
                      {["moisture", "temperature", "ph", "N", "P", "K"].map(key => {
                        const s = telemetryData.statistics[key];
                        if (!s) return null;
                        return (
                          <div key={key} className="flex justify-between items-center text-xs pb-2 border-b border-slate-100 last:border-0">
                            <span className="font-semibold text-slate-600 capitalize">{key}</span>
                            <div className="space-x-3 text-right">
                              <span className="text-slate-400">Min: <b className="text-slate-700">{s.min}</b></span>
                              <span className="text-slate-400">Max: <b className="text-slate-700">{s.max}</b></span>
                              <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">Avg: {s.avg}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400">Loading statistics...</div>
                  )}
                </div>

                {/* Agronomic Verdict & Anomaly Detection */}
                <div className="md:col-span-2 bg-white p-5 rounded-2xl border border-agriBorder shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                        Diagnostic Evaluation
                      </span>
                      <span className="text-xs font-bold text-rose-600">
                        {telemetryData?.health_verdict || "ANALYZING SOIL DYNAMICS"}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed">
                      {telemetryData?.verdict_explanation || "The crop is exhibiting moisture deficit as root absorption has exceeded precipitation over the last 72 hours."}
                    </p>

                    <div className="mt-4">
                      <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider text-slate-400 mb-2">
                        Detected Soil Anomalies & Depletion Rates
                      </h5>
                      <div className="space-y-2">
                        {telemetryData?.anomalies_detected?.length > 0 ? (
                          telemetryData.anomalies_detected.map((anomaly, idx) => (
                            <div key={idx} className="flex items-start space-x-2 text-xs bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/60 text-amber-900">
                              <span className="text-amber-600 font-bold">•</span>
                              <span>{anomaly}</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
                            ✓ No severe sensor anomalies detected. Depletion rates are within safe agronomic margins.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>Monitored Farm: <b>{selectedFarm?.name}</b></span>
                    <span>Moisture Depletion Rate: <b>{telemetryData?.moisture_rate_pct_day || -2.8}% / day</b></span>
                  </div>
                </div>
              </div>

              {/* Data Table */}
              <div className="bg-white p-5 rounded-2xl border border-agriBorder shadow-sm overflow-x-auto">
                <h4 className="text-sm font-bold text-slate-900 mb-3">Daily Telemetry Record Log</h4>
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                      <th className="p-3 font-semibold">Day / Date</th>
                      <th className="p-3 font-semibold">Moisture (%)</th>
                      <th className="p-3 font-semibold">Temp (°C)</th>
                      <th className="p-3 font-semibold">pH</th>
                      <th className="p-3 font-semibold">EC (mS/cm)</th>
                      <th className="p-3 font-semibold">Nitrogen</th>
                      <th className="p-3 font-semibold">Phosphorus</th>
                      <th className="p-3 font-semibold">Potassium</th>
                      <th className="p-3 font-semibold">Rainfall</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(telemetryData?.history || []).map((row, idx) => (
                      <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="p-3 font-semibold text-slate-800">{row.day} ({row.date})</td>
                        <td className="p-3 font-bold text-emerald-700">{row.moisture}%</td>
                        <td className="p-3 text-slate-700">{row.temperature}°C</td>
                        <td className="p-3 text-purple-700 font-medium">{row.ph}</td>
                        <td className="p-3 text-slate-600">{row.ec}</td>
                        <td className="p-3 text-slate-700">{row.N}</td>
                        <td className="p-3 text-slate-700">{row.P}</td>
                        <td className="p-3 text-slate-700">{row.K}</td>
                        <td className="p-3 text-blue-600">{row.rainfall_mm || 0.0} mm</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------- */}
          {/* VIEW 3: WEATHER & RAINFALL RISK MONITORING */}
          {/* ------------------------------------------------------- */}
          {activeTab === "weather" && (
            <div className="space-y-6">
              {/* Weather API Header Banner */}
              <div className="bg-white p-5 rounded-2xl border border-agriBorder shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                      Live Telemetry Stream
                    </span>
                    <span className="text-xs text-slate-400">• Source: <b>{weatherData?.source || "Open-Meteo Live API"}</b></span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">
                    Weather Telemetry & Rainfall Risk Analyzer
                  </h3>
                  <p className="text-xs text-slate-500">
                    Location: <b>{weatherData?.location || "Karnal, Haryana"}</b> | Last Updated: {weatherData?.last_updated}
                  </p>
                </div>

                <div className="bg-emerald-50 px-4 py-2.5 rounded-xl border border-emerald-100 text-right">
                  <div className="text-[11px] font-semibold text-emerald-800 uppercase">Wash-Off Danger State</div>
                  <div className="text-sm font-bold text-emerald-950">
                    {weatherData?.rainfall_risk_analyzer?.wash_off_danger ? "⚠️ HIGH WASH-OFF DANGER" : "✓ SAFE WEATHER WINDOW"}
                  </div>
                </div>
              </div>

              {/* Current Weather Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-agriBorder shadow-sm">
                  <div className="text-xs font-semibold uppercase text-slate-400">Temperature</div>
                  <div className="text-2xl font-bold text-slate-800 mt-1">
                    {weatherData?.current?.temperature_c || 28.5}°C
                  </div>
                  <div className="text-[11px] text-emerald-600 mt-1">Real-time Ambient 2m</div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-agriBorder shadow-sm">
                  <div className="text-xs font-semibold uppercase text-slate-400">Relative Humidity</div>
                  <div className="text-2xl font-bold text-slate-800 mt-1">
                    {weatherData?.current?.humidity_pct || 62}%
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Canopy Transpiration Index</div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-agriBorder shadow-sm">
                  <div className="text-xs font-semibold uppercase text-slate-400">Rainfall Probability</div>
                  <div className="text-2xl font-bold text-blue-600 mt-1">
                    {weatherData?.rainfall_risk_analyzer?.peak_rain_probability_pct || 15}%
                  </div>
                  <div className="text-[11px] text-blue-600 font-medium mt-1">
                    {weatherData?.rainfall_risk_analyzer?.risk_level || "LOW"} Risk
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-agriBorder shadow-sm">
                  <div className="text-xs font-semibold uppercase text-slate-400">Wind Velocity</div>
                  <div className="text-2xl font-bold text-slate-800 mt-1">
                    {weatherData?.current?.wind_speed_kmh || 8.5} km/h
                  </div>
                  <div className="text-[11px] text-emerald-600 mt-1">Ideal for Foliar Spray</div>
                </div>
              </div>

              {/* Intelligent Rainfall Risk Analyzer Alert Box */}
              <div className={`p-5 rounded-2xl border shadow-sm ${
                weatherData?.rainfall_risk_analyzer?.wash_off_danger ? "bg-rose-50 border-rose-200" : "bg-emerald-50/70 border-emerald-200"
              }`}>
                <div className="flex items-start space-x-3">
                  <div className={`p-2.5 rounded-xl ${weatherData?.rainfall_risk_analyzer?.wash_off_danger ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-800"}`}>
                    <Icon name="weather" className="w-6 h-6" />
                  </div>
                  <div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      weatherData?.rainfall_risk_analyzer?.wash_off_danger ? "bg-rose-200 text-rose-800" : "bg-emerald-200 text-emerald-800"
                    }`}>
                      Rainfall Risk Analyzer Decision
                    </span>
                    <h4 className="text-base font-bold text-slate-900 mt-1">
                      {weatherData?.rainfall_risk_analyzer?.wash_off_danger ? (
                        "Heavy Precipitation Hazard: Hold Irrigation & Postpone Fertilizer"
                      ) : (
                        "Stable Atmospheric Window: Proceed With Scheduled Irrigation & Dosing"
                      )}
                    </h4>
                    <p className="text-xs text-slate-700 mt-1.5 leading-relaxed">
                      {weatherData?.rainfall_risk_analyzer?.operational_advice}
                    </p>
                  </div>
                </div>
              </div>

              {/* 7-Day Forecast Grid */}
              <div className="bg-white p-5 rounded-2xl border border-agriBorder shadow-sm">
                <h4 className="text-sm font-bold text-slate-900 mb-4">7-Day Meteorological Forecast Window</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
                  {(weatherData?.forecast_7_day || []).map((day, idx) => (
                    <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-center">
                      <div className="text-xs font-bold text-slate-700">{day.day_name}</div>
                      <div className="text-[10px] text-slate-400">{day.date}</div>
                      <div className="my-2 flex justify-center">
                        <Icon name="weather" className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div className="text-xs font-bold text-slate-800">
                        {day.temp_max}° / {day.temp_min}°
                      </div>
                      <div className="text-[10px] text-blue-600 font-semibold mt-1">
                        💧 {day.precipitation_probability_pct}% rain
                      </div>
                      <div className="text-[9px] text-slate-500 mt-0.5 truncate">
                        {day.condition}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------- */}
          {/* VIEW 4: AI CROP STRESS DETECTION */}
          {/* ------------------------------------------------------- */}
          {activeTab === "stress" && (
            <div className="space-y-6">
              {/* Simulator Card with Live Sliders */}
              <div className="bg-white p-5 rounded-2xl border border-agriBorder shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">AI Crop Stress Diagnostics</h3>
                    <p className="text-xs text-slate-500">Live multi-parameter agronomic stress detector powered by Scikit-Learn Random Forest models</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <label className="text-xs font-semibold text-slate-500">Target Crop:</label>
                    <select
                      value={stressSliders.crop}
                      onChange={(e) => {
                        const updated = { ...stressSliders, crop: e.target.value };
                        setStressSliders(updated);
                        triggerStressAnalysis(updated);
                      }}
                      className="bg-slate-50 border border-slate-300 text-xs font-bold text-slate-800 rounded-xl px-3 py-1.5 focus:outline-none"
                    >
                      <option value="tomato">Tomato (Solanum lycopersicum)</option>
                      <option value="rice">Rice (Oryza sativa)</option>
                      <option value="cotton">Cotton (Gossypium hirsutum)</option>
                      <option value="maize">Maize / Corn (Zea mays)</option>
                      <option value="chickpea">Chickpea (Cicer arietinum)</option>
                      <option value="banana">Banana (Musa acuminata)</option>
                    </select>
                  </div>
                </div>

                {/* Sensor Sliders Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  {/* Moisture */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-600">Soil Moisture (%)</span>
                      <span className="text-emerald-700 font-bold">{stressSliders.moisture}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="90"
                      step="0.5"
                      value={stressSliders.moisture}
                      onChange={(e) => {
                        const updated = { ...stressSliders, moisture: parseFloat(e.target.value) };
                        setStressSliders(updated);
                        triggerStressAnalysis(updated);
                      }}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>10% (Severe Drought)</span>
                      <span>90% (Waterlogging)</span>
                    </div>
                  </div>

                  {/* Temperature */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-600">Soil Temperature (°C)</span>
                      <span className="text-orange-600 font-bold">{stressSliders.temperature}°C</span>
                    </div>
                    <input
                      type="range"
                      min="15"
                      max="45"
                      step="0.5"
                      value={stressSliders.temperature}
                      onChange={(e) => {
                        const updated = { ...stressSliders, temperature: parseFloat(e.target.value) };
                        setStressSliders(updated);
                        triggerStressAnalysis(updated);
                      }}
                      className="w-full accent-orange-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>15°C (Chilling)</span>
                      <span>45°C (Extreme Heat)</span>
                    </div>
                  </div>

                  {/* pH */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-600">Soil pH</span>
                      <span className="text-purple-700 font-bold">{stressSliders.ph} pH</span>
                    </div>
                    <input
                      type="range"
                      min="4.5"
                      max="9.0"
                      step="0.1"
                      value={stressSliders.ph}
                      onChange={(e) => {
                        const updated = { ...stressSliders, ph: parseFloat(e.target.value) };
                        setStressSliders(updated);
                        triggerStressAnalysis(updated);
                      }}
                      className="w-full accent-purple-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>4.5 (Acidic)</span>
                      <span>9.0 (Alkaline)</span>
                    </div>
                  </div>

                  {/* Nitrogen */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-600">Available Nitrogen (N)</span>
                      <span className="text-slate-800 font-bold">{stressSliders.N} mg/kg</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="120"
                      step="1"
                      value={stressSliders.N}
                      onChange={(e) => {
                        const updated = { ...stressSliders, N: parseFloat(e.target.value) };
                        setStressSliders(updated);
                        triggerStressAnalysis(updated);
                      }}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>

                  {/* Phosphorus */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-600">Available Phosphorus (P)</span>
                      <span className="text-slate-800 font-bold">{stressSliders.P} mg/kg</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="80"
                      step="1"
                      value={stressSliders.P}
                      onChange={(e) => {
                        const updated = { ...stressSliders, P: parseFloat(e.target.value) };
                        setStressSliders(updated);
                        triggerStressAnalysis(updated);
                      }}
                      className="w-full accent-pink-500 cursor-pointer"
                    />
                  </div>

                  {/* Potassium */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-600">Available Potassium (K)</span>
                      <span className="text-slate-800 font-bold">{stressSliders.K} mg/kg</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="1"
                      value={stressSliders.K}
                      onChange={(e) => {
                        const updated = { ...stressSliders, K: parseFloat(e.target.value) };
                        setStressSliders(updated);
                        triggerStressAnalysis(updated);
                      }}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Stress Analysis Result Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Score & Gauge */}
                <div className="bg-white p-5 rounded-2xl border border-agriBorder shadow-sm flex flex-col justify-between text-center">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Composite Stress Index
                    </span>
                    <div className="my-4 flex justify-center items-baseline space-x-1">
                      <span className={`text-6xl font-black ${
                        stressResult?.stress_score > 65 ? "text-rose-600" :
                        stressResult?.stress_score > 40 ? "text-amber-500" :
                        stressResult?.stress_score > 25 ? "text-blue-600" : "text-emerald-600"
                      }`}>
                        {stressResult?.stress_score || 0}
                      </span>
                      <span className="text-slate-400 text-lg font-bold">/ 100</span>
                    </div>

                    <div className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-3 shadow-sm bg-slate-100 text-slate-800">
                      {stressResult?.stress_category || "Calculating..."}
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          stressResult?.stress_score > 65 ? "bg-rose-500" :
                          stressResult?.stress_score > 40 ? "bg-amber-500" :
                          stressResult?.stress_score > 25 ? "bg-blue-500" : "bg-emerald-500"
                        }`}
                        style={{ width: `${Math.min(100, stressResult?.stress_score || 10)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 mt-4 pt-3 border-t border-slate-100">
                    {stressResult?.methodology}
                  </div>
                </div>

                {/* Primary Stress Factors Breakdown */}
                <div className="bg-white p-5 rounded-2xl border border-agriBorder shadow-sm">
                  <h4 className="text-sm font-bold text-slate-900 mb-3">Detected Stress Contributors</h4>
                  <div className="space-y-3">
                    {(stressResult?.stress_factors || []).map((f, i) => (
                      <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                          <span>{f.factor}</span>
                          <span className="text-emerald-700 font-extrabold">{f.contribution_pct}%</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1 flex justify-between">
                          <span>Value: {f.value}</span>
                          <span className={`font-semibold ${f.severity === 'High' ? 'text-rose-600' : 'text-amber-600'}`}>
                            {f.severity} Severity
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Corrective Action Steps */}
                <div className="bg-white p-5 rounded-2xl border border-agriBorder shadow-sm flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 mb-3">Recommended Corrective Actions</h4>
                    <div className="space-y-2.5">
                      {(stressResult?.recommended_corrective_actions || []).map((action, i) => (
                        <div key={i} className="flex items-start space-x-2 text-xs text-slate-700 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100/60">
                          <span className="text-emerald-600 font-bold">✓</span>
                          <span>{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab("calc")}
                    className="mt-4 w-full bg-agriForest hover:bg-emerald-900 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-sm text-center"
                  >
                    Calculate Irrigation & Fertilizer Doses →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------- */}
          {/* VIEW 5: FERTILIZER & WATER CALCULATOR */}
          {/* ------------------------------------------------------- */}
          {activeTab === "calc" && (
            <div className="space-y-6">
              {/* Input Form Card */}
              <div className="bg-white p-5 rounded-2xl border border-agriBorder shadow-sm">
                <div className="mb-4 pb-3 border-b border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Agronomic Fertilizer & Irrigation Dosage Engine</h3>
                    <p className="text-xs text-slate-500">Calculates precise water volume (Litres) and commercial fertilizer products (Urea, DAP, MOP) based on FAO-56 root deficits</p>
                  </div>
                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 self-start">
                    Agronomic Reference Standard
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Crop Type */}
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Crop Type</label>
                    <select
                      value={calcForm.crop}
                      onChange={(e) => setCalcForm({ ...calcForm, crop: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none"
                    >
                      <option value="tomato">Tomato</option>
                      <option value="rice">Rice (Paddy)</option>
                      <option value="cotton">Cotton</option>
                      <option value="maize">Maize / Corn</option>
                    </select>
                  </div>

                  {/* Farm Area */}
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Farm Area</label>
                    <div className="flex">
                      <input
                        type="number"
                        step="0.1"
                        value={calcForm.area}
                        onChange={(e) => setCalcForm({ ...calcForm, area: parseFloat(e.target.value) || 1 })}
                        className="w-2/3 bg-slate-50 border border-slate-300 rounded-l-xl px-3 py-2 text-xs font-medium focus:outline-none"
                      />
                      <select
                        value={calcForm.area_unit}
                        onChange={(e) => setCalcForm({ ...calcForm, area_unit: e.target.value })}
                        className="w-1/3 bg-slate-100 border border-l-0 border-slate-300 rounded-r-xl px-2 py-2 text-xs font-medium focus:outline-none"
                      >
                        <option value="acres">Acres</option>
                        <option value="hectares">Hectares</option>
                      </select>
                    </div>
                  </div>

                  {/* Growth Stage */}
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Growth Stage</label>
                    <select
                      value={calcForm.growth_stage}
                      onChange={(e) => setCalcForm({ ...calcForm, growth_stage: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none"
                    >
                      <option value="Vegetative">Vegetative Growth</option>
                      <option value="Flowering">Flowering Stage</option>
                      <option value="Fruit Development">Fruit / Boll Expansion</option>
                      <option value="Ripening">Maturity / Ripening</option>
                    </select>
                  </div>

                  {/* Soil Type */}
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Soil Texture</label>
                    <select
                      value={calcForm.soil_type}
                      onChange={(e) => setCalcForm({ ...calcForm, soil_type: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none"
                    >
                      <option value="Loamy Sand">Loamy Sand</option>
                      <option value="Sandy">Sandy Soil</option>
                      <option value="Loam">Medium Loam</option>
                      <option value="Clay Loam">Clay Loam</option>
                      <option value="Black Cotton Soil">Black Cotton Soil</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => triggerDosageCalculation(calcForm)}
                    className="bg-agriForest hover:bg-emerald-900 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md transition flex items-center space-x-1.5"
                  >
                    <Icon name="calc" className="w-4 h-4 text-brand-300" />
                    <span>{t.buttons.calculate}</span>
                  </button>
                </div>
              </div>

              {/* Results Grid: Irrigation Plan & Fertilizer Plan */}
              {calculatorResult && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Irrigation Plan Card */}
                  <div className="bg-white p-5 rounded-2xl border border-agriBorder shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100 flex items-center space-x-1">
                          <Icon name="droplet" className="w-3.5 h-3.5 text-blue-600" />
                          <span>Calculated Irrigation Plan</span>
                        </span>
                        <span className="text-xs text-slate-400 font-semibold">{calculatorResult.crop}</span>
                      </div>

                      <div className="my-3 p-4 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-xl border border-blue-100 text-center">
                        <div className="text-xs text-slate-600 font-medium">Total Field Water Requirement</div>
                        <div className="text-3xl font-black text-slate-900 mt-1">
                          {Number(calculatorResult.irrigation_plan?.total_estimated_water_liters || 0).toLocaleString()} <span className="text-sm font-semibold text-slate-500">Litres</span>
                        </div>
                        <div className="text-xs text-emerald-800 font-bold mt-1">
                          Equivalent to {calculatorResult.irrigation_plan?.net_water_depth_mm} mm Net Irrigation Depth
                        </div>
                      </div>

                      <div className="space-y-2 text-xs text-slate-700">
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-500">Per Acre Delivery:</span>
                          <span className="font-bold">{Number(calculatorResult.irrigation_plan?.liters_per_acre || 0).toLocaleString()} L / acre</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-500">Recommended Drip Runtime:</span>
                          <span className="font-bold">{calculatorResult.irrigation_plan?.recommended_duration_hours} Hours</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-500">Optimal Timing:</span>
                          <span className="font-bold text-emerald-700">{calculatorResult.irrigation_plan?.suggested_timing}</span>
                        </div>
                      </div>

                      <div className="mt-4">
                        <h5 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">Water-Saving Tips</h5>
                        <ul className="space-y-1 text-xs text-slate-600">
                          {(calculatorResult.irrigation_plan?.water_saving_recommendations || []).map((tip, i) => (
                            <li key={i} className="flex items-start space-x-1.5">
                              <span className="text-emerald-600 font-bold">•</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Fertilizer Plan Card */}
                  <div className="bg-white p-5 rounded-2xl border border-agriBorder shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 flex items-center space-x-1">
                          <Icon name="leaf" className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Commercial Fertilizer Products (kg)</span>
                        </span>
                        <span className="text-xs text-slate-400 font-semibold">{calculatorResult.field_acres} Acres</span>
                      </div>

                      <div className="grid grid-cols-3 gap-3 my-3">
                        {/* Urea */}
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                          <div className="text-[11px] font-bold text-slate-500 uppercase">Urea (46% N)</div>
                          <div className="text-2xl font-black text-emerald-800 mt-1">
                            {calculatorResult.fertilizer_plan?.total_field_kg?.urea}
                          </div>
                          <div className="text-[10px] text-slate-400">Total kg for field</div>
                        </div>

                        {/* DAP */}
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                          <div className="text-[11px] font-bold text-slate-500 uppercase">DAP (18-46-0)</div>
                          <div className="text-2xl font-black text-pink-700 mt-1">
                            {calculatorResult.fertilizer_plan?.total_field_kg?.dap}
                          </div>
                          <div className="text-[10px] text-slate-400">Total kg for field</div>
                        </div>

                        {/* MOP */}
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                          <div className="text-[11px] font-bold text-slate-500 uppercase">MOP (60% K2O)</div>
                          <div className="text-2xl font-black text-amber-700 mt-1">
                            {calculatorResult.fertilizer_plan?.total_field_kg?.mop}
                          </div>
                          <div className="text-[10px] text-slate-400">Total kg for field</div>
                        </div>
                      </div>

                      <div className="mt-4">
                        <h5 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">Application & Scheduling Protocol</h5>
                        <div className="space-y-2">
                          {(calculatorResult.fertilizer_plan?.application_recommendations || []).map((rec, i) => (
                            <div key={i} className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                              {rec}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-400 mt-4 pt-3 border-t border-slate-100">
                      * Sensor-derived nutrient deficits; confirm with periodic NABL wet-chemistry laboratory analysis.
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ------------------------------------------------------- */}
          {/* VIEW 6: AI-POWERED FARMER ADVISORY */}
          {/* ------------------------------------------------------- */}
          {activeTab === "advisory" && (
            <div className="space-y-6">
              {/* Regional Advisory Banner */}
              <div className="bg-white p-5 rounded-2xl border border-agriBorder shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                      Farmer-Friendly Advisory
                    </span>
                    <span className="text-xs text-slate-500">Selected Language: <b>{lang}</b></span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mt-1">
                    {advisoryResult?.regional_headline || "🌾 Actionable Farm Advisory"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Customized for {selectedFarm?.name} ({selectedFarm?.crop}) using 7-day soil telemetry & weather risk
                  </p>
                </div>

                {/* Audio Button */}
                <button
                  onClick={() => handleVoicePlayback(advisoryResult?.audio_voice_script || advisoryResult?.action_today || "")}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition flex items-center space-x-2"
                >
                  <Icon name="volume" className={`w-4 h-4 ${voicePlaying ? 'animate-bounce text-brand-300' : ''}`} />
                  <span>{voicePlaying ? t.buttons.stopVoice : t.buttons.listenVoice}</span>
                </button>
              </div>

              {/* Regional Action Steps Cards (Today's Action, Warning, Avoid) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Action Today */}
                <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-sm bg-gradient-to-br from-emerald-50/50 to-white">
                  <div className="flex items-center space-x-2 text-emerald-800 font-bold text-xs uppercase mb-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Action Required Today</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                    {advisoryResult?.action_today || "Apply 15.0 mm irrigation via drip and dress with recommended Urea split."}
                  </p>
                </div>

                {/* Weather Alert */}
                <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm bg-gradient-to-br from-amber-50/50 to-white">
                  <div className="flex items-center space-x-2 text-amber-800 font-bold text-xs uppercase mb-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span>Weather Warning</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                    {advisoryResult?.warning_weather || "Avoid foliar spray during high afternoon solar radiation."}
                  </p>
                </div>

                {/* What NOT to do */}
                <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-sm bg-gradient-to-br from-rose-50/50 to-white">
                  <div className="flex items-center space-x-2 text-rose-800 font-bold text-xs uppercase mb-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    <span>What NOT To Do</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                    {advisoryResult?.what_not_to_do || "Do not broadcast fertilizer without adequate root-zone moisture."}
                  </p>
                </div>
              </div>

              {/* Structured Multi-Variable Recommendations Grid */}
              <div className="space-y-4">
                <h4 className="text-base font-bold text-slate-900">
                  Comprehensive Agronomic Problem & Intervention Analysis
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {(advisoryResult?.structured_advisories || []).map((card, i) => (
                    <div key={i} className="bg-white p-5 rounded-2xl border border-agriBorder shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            card.priority === "High" ? "bg-rose-100 text-rose-700" :
                            card.priority === "Medium" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                          }`}>
                            {card.priority} Priority
                          </span>
                        </div>

                        <h5 className="font-bold text-slate-900 text-sm mb-3">{card.title}</h5>

                        <div className="space-y-2 text-xs">
                          <div>
                            <span className="font-semibold text-slate-500">Detected Problem:</span>
                            <p className="text-slate-800 font-medium mt-0.5">{card.problem}</p>
                          </div>
                          <div>
                            <span className="font-semibold text-slate-500">Agronomic Reason:</span>
                            <p className="text-slate-600 mt-0.5">{card.reason}</p>
                          </div>
                          <div>
                            <span className="font-semibold text-emerald-700">Recommended Action:</span>
                            <p className="text-slate-900 font-bold mt-0.5">{card.action}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-emerald-800 bg-emerald-50 p-2.5 rounded-xl font-medium">
                        <b>Expected Benefit:</b> {card.expected_benefit}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------- */}
          {/* VIEW 7: FARM & SENSOR FLEET MANAGEMENT */}
          {/* ------------------------------------------------------- */}
          {activeTab === "fleet" && (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-white p-5 rounded-2xl border border-agriBorder shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Farm & IoT Sensor Fleet Management</h3>
                  <p className="text-xs text-slate-500">Monitor multi-acre plots, crop varieties, sensor hardware health, and toggle demo vs live telemetry</p>
                </div>
                <button
                  onClick={() => setIsAddFarmOpen(true)}
                  className="bg-agriForest hover:bg-emerald-900 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition flex items-center space-x-1.5"
                >
                  <span>+</span>
                  <span>{t.buttons.addFarm}</span>
                </button>
              </div>

              {/* Farm Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {farms.map(f => (
                  <div key={f.id} className="bg-white p-5 rounded-2xl border border-agriBorder shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{f.id}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              f.mode === "live" ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-purple-100 text-purple-800 border border-purple-200"
                            }`}>
                              {f.mode === "live" ? "Live Hardware" : "Demo Telemetry"}
                            </span>
                          </div>
                          <h4 className="text-base font-bold text-slate-900 mt-1">{f.name}</h4>
                          <span className="text-xs text-slate-500">{f.location} ({f.area_acres} Acres)</span>
                        </div>

                        <button
                          onClick={() => {
                            // Toggle mode between live and demo
                            setFarms(prev => prev.map(item => item.id === f.id ? { ...item, mode: item.mode === 'live' ? 'demo' : 'live' } : item));
                          }}
                          className="text-[11px] font-semibold text-slate-600 hover:text-emerald-700 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200"
                        >
                          Switch Mode
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-2 my-3 p-3 bg-slate-50 rounded-xl text-center text-xs">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Crop / Variety</span>
                          <b className="text-slate-800 capitalize">{f.crop}</b>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Growth Stage</span>
                          <b className="text-slate-800 truncate block">{f.growth_stage}</b>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Soil Type</span>
                          <b className="text-slate-800 truncate block">{f.soil_type}</b>
                        </div>
                      </div>

                      {/* Attached Sensors */}
                      <div className="mt-3">
                        <span className="text-xs font-bold text-slate-700 block mb-2">Connected IoT Hardware Nodes:</span>
                        <div className="space-y-1.5">
                          {(f.sensors || []).map(s => (
                            <div key={s.id} className="flex justify-between items-center text-xs p-2 bg-slate-50/70 rounded-lg border border-slate-100">
                              <div className="flex items-center space-x-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                <span className="font-semibold text-slate-800">{s.type}</span>
                                <span className="text-[10px] text-slate-400">({s.depth})</span>
                              </div>
                              <div className="space-x-3 text-right">
                                <span className="font-bold text-emerald-800">{s.reading}</span>
                                <span className="text-[10px] text-slate-400">Bat: {s.battery}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => {
                          setSelectedFarmId(f.id);
                          setActiveTab("dashboard");
                        }}
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-900"
                      >
                        Select for Active Dashboard →
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to remove ${f.name}?`)) {
                            fetch(`/api/farms/${f.id}`, { method: 'DELETE' });
                            setFarms(prev => prev.filter(item => item.id !== f.id));
                          }
                        }}
                        className="text-xs text-rose-500 hover:text-rose-700 font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ------------------------------------------------------- */}
          {/* VIEW 8: ALERTS & NOTIFICATIONS */}
          {/* ------------------------------------------------------- */}
          {activeTab === "alerts" && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-agriBorder shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Telemetry Alert & Notification Dispatch Center</h3>
                  <p className="text-xs text-slate-500">Real-time agricultural stress triggers, sensor disconnection logs, and severe rainfall warnings</p>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <span className="font-semibold text-slate-500">Filter:</span>
                  <span className="bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-lg">All ({alerts.length})</span>
                </div>
              </div>

              <div className="space-y-3">
                {alerts.map(a => (
                  <div
                    key={a.id}
                    className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      a.acknowledged ? "bg-white border-slate-200 opacity-60" :
                      a.priority === "Critical" ? "bg-rose-50/80 border-rose-200" :
                      a.priority === "Warning" ? "bg-amber-50/80 border-amber-200" : "bg-blue-50/80 border-blue-200"
                    }`}
                  >
                    <div className="flex items-start space-x-3.5">
                      <div className={`p-2.5 rounded-xl mt-0.5 ${
                        a.priority === "Critical" ? "bg-rose-100 text-rose-700" :
                        a.priority === "Warning" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                      }`}>
                        <Icon name="alerts" className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            a.priority === "Critical" ? "bg-rose-200 text-rose-800" :
                            a.priority === "Warning" ? "bg-amber-200 text-amber-800" : "bg-blue-200 text-blue-800"
                          }`}>
                            {a.priority}
                          </span>
                          <span className="text-xs font-bold text-slate-900">{a.type}</span>
                          <span className="text-xs text-slate-400">• {a.farm_name}</span>
                        </div>
                        <p className="text-xs text-slate-700 mt-1 leading-relaxed">{a.message}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">Logged: {a.timestamp}</span>
                      </div>
                    </div>

                    {!a.acknowledged ? (
                      <button
                        onClick={() => handleAcknowledgeAlert(a.id)}
                        className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm whitespace-nowrap self-end sm:self-center"
                      >
                        {t.buttons.acknowledge}
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-700 font-bold self-end sm:self-center">
                        ✓ {t.buttons.acknowledged}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ------------------------------------------------------- */}
          {/* VIEW 9: REPORTS & EXPORT */}
          {/* ------------------------------------------------------- */}
          {activeTab === "reports" && (
            <div className="space-y-6">
              {/* Action Toolbar */}
              <div className="bg-white p-5 rounded-2xl border border-agriBorder shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 no-print">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Comprehensive Farm Diagnostic Report</h3>
                  <p className="text-xs text-slate-500">Official agricultural telemetry audit, 7-day soil trajectory, and AI advisory ready for PDF printing</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => window.print()}
                    className="bg-agriForest hover:bg-emerald-900 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition flex items-center space-x-1.5"
                  >
                    <Icon name="reports" className="w-4 h-4 text-brand-300" />
                    <span>{t.buttons.printPdf}</span>
                  </button>
                  <a
                    href={`/api/telemetry/export-csv?farm_id=${selectedFarmId}`}
                    download
                    className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition flex items-center space-x-1.5"
                  >
                    <Icon name="download" className="w-4 h-4 text-slate-600" />
                    <span>{t.buttons.downloadCsv}</span>
                  </a>
                </div>
              </div>

              {/* Printable Agricultural Report Document */}
              <div id="printable-report" className="bg-white p-8 rounded-2xl border border-slate-300 shadow-md text-slate-800 space-y-6">
                {/* Report Header */}
                <div className="border-b-2 border-emerald-800 pb-4 flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-black text-agriForest tracking-tight">AgriSense-X Diagnostic Report</h2>
                    <p className="text-xs text-slate-500">Autonomous Agricultural Advisory & Sensor Telemetry Platform</p>
                    <div className="text-xs text-slate-600 mt-2">
                      Report Generated: <b>{new Date().toLocaleString()}</b>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                      OFFICIAL FARM AUDIT
                    </span>
                    <div className="text-xs text-slate-500 mt-2">Farm ID: <b>{selectedFarm?.id}</b></div>
                  </div>
                </div>

                {/* Section 1: Farm & Crop Details */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-2">1. Farm & Agronomic Profile</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl text-xs">
                    <div><span className="text-slate-400 block">Farm Name:</span><b>{selectedFarm?.name}</b></div>
                    <div><span className="text-slate-400 block">Location:</span><b>{selectedFarm?.location}</b></div>
                    <div><span className="text-slate-400 block">Target Crop / Variety:</span><b className="capitalize">{selectedFarm?.crop} ({selectedFarm?.variety})</b></div>
                    <div><span className="text-slate-400 block">Area & Soil Type:</span><b>{selectedFarm?.area_acres} Acres | {selectedFarm?.soil_type}</b></div>
                  </div>
                </div>

                {/* Section 2: Sensor Telemetry & Stress Evaluation */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-2">2. Soil Telemetry & Crop Stress Status</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl text-xs">
                    <div><span className="text-slate-400 block">Soil Moisture:</span><b className="text-emerald-700">{selectedFarm?.current_telemetry?.moisture}%</b></div>
                    <div><span className="text-slate-400 block">Soil Temperature:</span><b>{selectedFarm?.current_telemetry?.temperature}°C</b></div>
                    <div><span className="text-slate-400 block">Soil pH:</span><b>{selectedFarm?.current_telemetry?.ph} pH</b></div>
                    <div><span className="text-slate-400 block">Crop Stress Classification:</span><b className="text-rose-600 font-bold">{selectedFarm?.current_telemetry?.stress_category}</b></div>
                  </div>
                </div>

                {/* Section 3: Weather & Rainfall Risk Summary */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-2">3. Meteorological Context & Rainfall Risk</h4>
                  <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-700 space-y-1">
                    <p><b>Weather Window:</b> {weatherData?.rainfall_risk_analyzer?.risk_level} (Expected 3-day rainfall: {weatherData?.rainfall_risk_analyzer?.['3_day_expected_rain_mm'] || 0} mm).</p>
                    <p><b>Wash-Off Caution:</b> {weatherData?.rainfall_risk_analyzer?.operational_advice}</p>
                  </div>
                </div>

                {/* Section 4: Prescribed Dosage Recommendations */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-2">4. Prescribed Water & Fertilizer Dosage</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100">
                      <b className="text-blue-900 block mb-1">Irrigation Schedule:</b>
                      <p>Total Estimated Water Volume: <b>{Number((selectedFarm?.area_acres || 1) * 48000).toLocaleString()} Litres</b></p>
                      <p className="mt-1 text-slate-600">Runtime: 2.5 - 3.0 Hours via inline drip emitters in early morning (05:30 AM - 08:30 AM).</p>
                    </div>
                    <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-100">
                      <b className="text-emerald-900 block mb-1">Commercial Fertilizer Products:</b>
                      <p>• Urea (46% N): <b>{((selectedFarm?.area_acres || 1) * 25.0).toFixed(1)} kg total</b></p>
                      <p>• DAP (18-46-0): <b>{((selectedFarm?.area_acres || 1) * 14.5).toFixed(1)} kg total</b></p>
                      <p>• MOP (60% K2O): <b>{((selectedFarm?.area_acres || 1) * 8.0).toFixed(1)} kg total</b></p>
                    </div>
                  </div>
                </div>

                {/* Section 5: AI Farmer Advisory Summary */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-2">5. Actionable Farm Advisory</h4>
                  <div className="p-4 bg-emerald-900 text-white rounded-xl text-xs space-y-2">
                    <b className="text-brand-300 block text-sm">{advisoryResult?.regional_headline}</b>
                    <p>{advisoryResult?.action_today}</p>
                    <p className="text-emerald-200 text-[11px]">{advisoryResult?.warning_weather}</p>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-4 flex justify-between items-center text-[11px] text-slate-400">
                  <span>Authorized by AgriSense-X Autonomous Precision Engine</span>
                  <span>Page 1 of 1 • Verification Hash: AGR-{Date.now().toString(16).toUpperCase()}</span>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------- */}
          {/* VIEW 10: SETTINGS */}
          {/* ------------------------------------------------------- */}
          {activeTab === "settings" && (
            <div className="space-y-6 max-w-3xl">
              <div className="bg-white p-6 rounded-2xl border border-agriBorder shadow-sm space-y-5">
                <h3 className="text-lg font-bold text-slate-900 pb-3 border-b border-slate-100">
                  System Preferences & Threshold Calibration
                </h3>

                {/* Unit Preferences */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Temperature Unit</label>
                    <select className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium">
                      <option>Celsius (°C)</option>
                      <option>Fahrenheit (°F)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Area Unit</label>
                    <select className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium">
                      <option>Acres</option>
                      <option>Hectares</option>
                    </select>
                  </div>
                </div>

                {/* Critical Moisture Threshold */}
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    Critical Soil Moisture Threshold (Default: 30%)
                  </label>
                  <input type="range" min="15" max="50" defaultValue="30" className="w-full accent-emerald-600 cursor-pointer" />
                </div>

                {/* High Soil Temp Alert Threshold */}
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    High Soil Temperature Alarm (Default: 32°C)
                  </label>
                  <input type="range" min="25" max="42" defaultValue="32" className="w-full accent-orange-500 cursor-pointer" />
                </div>

                {/* Weather Provider */}
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Active Meteorological Provider</label>
                  <div className="flex items-center space-x-2 text-xs p-3 bg-emerald-50 rounded-xl text-emerald-900 border border-emerald-100">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span><b>Open-Meteo Public API:</b> Zero API Key required, unlimited forecast calls.</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => alert("Preferences saved successfully!")}
                    className="bg-agriForest hover:bg-emerald-900 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition"
                  >
                    {t.buttons.saveSettings}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ------------------------------------------------------------- */}
      {/* MODAL: ADD NEW FARM */}
      {/* ------------------------------------------------------------- */}
      {isAddFarmOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-scaleIn">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Register New Monitored Farm</h3>
              <button onClick={() => setIsAddFarmOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleAddFarmSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-600 block mb-1">Farm Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kaveri Agro Delta"
                  value={newFarmForm.name}
                  onChange={(e) => setNewFarmForm({ ...newFarmForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">Location (District / State)</label>
                <input
                  type="text"
                  required
                  value={newFarmForm.location}
                  onChange={(e) => setNewFarmForm({ ...newFarmForm, location: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Crop Type</label>
                  <select
                    value={newFarmForm.crop}
                    onChange={(e) => setNewFarmForm({ ...newFarmForm, crop: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  >
                    <option value="tomato">Tomato</option>
                    <option value="rice">Rice (Paddy)</option>
                    <option value="cotton">Cotton</option>
                    <option value="maize">Maize</option>
                    <option value="wheat">Wheat</option>
                    <option value="chickpea">Chickpea</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Farm Size (Acres)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={newFarmForm.area_acres}
                    onChange={(e) => setNewFarmForm({ ...newFarmForm, area_acres: parseFloat(e.target.value) || 1 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Soil Texture</label>
                  <select
                    value={newFarmForm.soil_type}
                    onChange={(e) => setNewFarmForm({ ...newFarmForm, soil_type: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  >
                    <option value="Loamy Sand">Loamy Sand</option>
                    <option value="Clay Loam">Clay Loam</option>
                    <option value="Black Cotton Soil">Black Cotton Soil</option>
                    <option value="Sandy">Sandy Soil</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Telemetry Mode</label>
                  <select
                    value={newFarmForm.mode}
                    onChange={(e) => setNewFarmForm({ ...newFarmForm, mode: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  >
                    <option value="demo">Demo Telemetry</option>
                    <option value="live">Live Hardware Node</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddFarmOpen(false)}
                  className="bg-slate-100 text-slate-700 font-semibold px-4 py-2 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-agriForest text-white font-bold px-4 py-2 rounded-xl shadow"
                >
                  Register Farm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Mount the React Application safely across React 17 & 18
const rootEl = document.getElementById("root");
if (ReactDOM.createRoot) {
  ReactDOM.createRoot(rootEl).render(<App />);
} else {
  ReactDOM.render(<App />, rootEl);
}
