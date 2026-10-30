# 🌾 Crop Stress Telemetry & Advisory (AgriSense-X)
> **"Sensor Readings In, An Actionable Farm Advisory Out."**
> *An AI-Powered Smart Precision Agriculture Platform & Hackathon AgentX Submission*

---

## 🏆 Project Overview

**Crop Stress Telemetry & Advisory** is an intelligent agricultural monitoring and decision-support web platform. It analyzes real-time soil telemetry (soil moisture, temperature, pH, electrical conductivity, Nitrogen, Phosphorus, Potassium), monitors crop stress using Scikit-Learn models and FAO-56 Penman-Monteith reference agronomics, checks live rainfall risk via Open-Meteo APIs, calculates precise fertilizer (Urea, DAP, MOP) and irrigation requirements, and generates actionable farming advisories in 6 Indian regional languages.

---

## 🏗️ Repository Architecture (`agentx-starter`)

```text
agentx-starter/
├── agent/
│   ├── core.py             # ReAct loop, step cap, repeat guard, error recovery
│   ├── llm.py              # Gemini / Groq wrapper with 429 retry & offline fallback
│   ├── prompt_builder.py   # System prompt with agronomic role & tool guidelines
│   └── __init__.py
├── tools/
│   ├── __init__.py         # Tool base class + registry (7 registered tools)
│   ├── calculator.py       # Safe arithmetic evaluator
│   ├── data_query.py       # list_files, read_file, sql_query over CSVs
│   ├── web_search.py       # DuckDuckGo agricultural search
│   ├── soil_analyzer.py    # 7-day soil trend & stress index calculation
│   ├── weather_tool.py     # Live Open-Meteo & wash-off risk evaluator
│   ├── dosage_calculator.py# Urea, DAP, MOP and irrigation dosage engine
│   └── regional_advisor.py # Multilingual advisory generator (6 languages)
├── config/
│   └── __init__.py         # Configuration constants & model thresholds
├── data/
│   ├── crop_recommendation.csv     # 2,200 agronomic multi-crop trials
│   ├── crop_benchmarks.json        # Optimal bounds for 22 crops
│   ├── telemetry_7days.csv         # 7-day field sensor logs
│   ├── iot_telemetry.json          # High-resolution IoT telemetry stream
│   └── tomato_growth_telemetry.csv # Tomato stage-by-stage soil telemetry
├── notebooks/
│   └── agentx_colab.ipynb  # Interactive Google Colab notebook demonstration
├── tests/
│   └── test_agent.py       # 100% Offline Pytest suite (8/8 passing)
├── static/
│   ├── index.html          # Modern SaaS Web App layout & styling
│   └── js/
│       └── app.js          # React 18 SPA with 10 interactive views
├── web_app.py              # Flask REST API backend & static file server
├── main.py                 # CLI entry point, judging contract & web runner
├── requirements.txt        # Python dependency manifest
├── .env.example            # Environment variables template
├── pytest.ini              # Pytest configuration
└── README.md               # Project documentation
```

---

## ⚡ Quick Start

### 1. Installation
```bash
# Clone and enter directory
cd agentx-starter

# Install dependencies
pip install -r requirements.txt
```

### 2. Run Offline Pytest Suite
Verify all agent tools, ReAct loops, and the standard judging contract without external API keys:
```bash
pytest tests/test_agent.py -v
```
*(All 8 tests run in < 1 second!)*

### 3. Run Judging Contract Mode (`--json`)
Evaluates crop telemetry and outputs standardized machine-readable JSON:
```bash
python main.py --json "{\"crop\": \"tomato\", \"readings\": {\"moisture\": 32, \"N\": 45, \"P\": 18, \"K\": 35, \"ph\": 6.2, \"temperature\": 31}, \"language\": \"Hindi\"}"
```
Or with a payload file:
```bash
python main.py --json @test_payload.json
```

### 4. Launch the Interactive Web Dashboard (`--serve`)
```bash
python main.py --serve --port 5000
```
Open **[http://127.0.0.1:5000](http://127.0.0.1:5000)** in your browser!

---

## 💻 10 Interactive SaaS Dashboard Views

1. **Dashboard:**
   - 8 Fleet KPIs (monitored farms, active sensors, avg moisture, soil temp, pH, rainfall prob, current stress status with Green/Yellow/Red indicators).
   - Irrigation recommendation banner & pump motor state telemetry.
   - Interactive 7-day moisture depletion chart & AI advisory card with voice playback.
   - Recent field alerts with 1-click acknowledge.
2. **Seven-Day Soil Trend Analysis:**
   - Multi-variable selector (moisture, temp, pH, EC, N, P, K).
   - Dynamic SVG Line Charts with hover tooltips and min/max/avg markers.
   - Soil anomaly detector & depletion rate calculation.
   - **CSV Telemetry File Upload:** Drag-and-drop or select any CSV to dynamically parse and reload 7-day soil analytics in real time!
3. **Weather & Rainfall Risk Monitoring:**
   - Live integration with **Open-Meteo API** (zero API key needed).
   - 7-day forecast with precipitation probability, max/min temps, and wind velocity.
   - **Intelligent Rainfall Risk Analyzer:** If heavy rain is expected (>15 mm or >65%), advises delaying irrigation and withholding broadcast fertilizer to prevent wash-off and leaching.
4. **AI Crop Stress Detection:**
   - Interactive crop selector (Tomato, Rice, Cotton, Maize, Chickpea, Banana).
   - Interactive sensor sliders for moisture %, temp, N, P, K, pH.
   - Real-time Stress Score Gauge (0 - 100) classified into *Healthy, Mild Stress, Moderate Stress, Severe Stress*.
   - Factor contribution breakdown, root causes, and step-by-step corrective actions.
5. **Fertilizer & Irrigation Calculator:**
   - Agronomic input parameters: crop, area (acres/hectares), soil moisture, pH, NPK, growth stage, soil texture.
   - Output: Net water depth (mm), total volume (Litres & m³), drip duration (hours), optimal morning timing, and water-saving advice.
   - Commercial fertilizer output: exact kg of **Urea (46% N)**, **DAP (18-46-0)**, and **MOP (60% K2O)** with scheduling protocols.
6. **AI-Powered Farmer Advisory:**
   - Synthesizes 7-day soil trends, current soil readings, crop type, weather forecast, rainfall risk, and stress score.
   - Multi-variable structure: **Detected Problem**, **Agronomic Reason**, **Recommended Action**, **Priority Level**, and **Expected Benefit**.
   - Accessible **Text-to-Speech Voice Advisory** playback.
7. **Multilingual Advisory:**
   - Full support for 6 regional languages:
     - **English**
     - **Hindi (हिन्दी)**
     - **Tamil (தமிழ்)**
     - **Telugu (తెలుగు)**
     - **Kannada (ಕನ್ನಡ)**
     - **Malayalam (മലയാളം)**
   - Global language switcher updating headlines, action steps, voice scripts, and alerts.
8. **Farm & Sensor Fleet Management:**
   - Add new monitored farm with custom acreage, soil type, and crop variety.
   - Individual IoT hardware node diagnostics (Moisture V1.2, NTC Thermistor, NPK Modbus, ISFET pH, Ultrasonic Level).
   - Seamless toggle between **"Demo Telemetry"** and **"Live IoT Hardware"** with distinct visual badges.
9. **Alerts & Notifications:**
   - Priority-based triage (*Critical, Warning, Information*).
   - Filters for low moisture, high soil temp, nutrient deficiency, rainfall warnings, and sensor disconnection.
   - Interactive acknowledge action to mark alerts as resolved.
10. **Reports & Export:**
    - Complete official Agricultural Diagnostic Report document.
    - 1-click **Download / Print PDF** (`window.print()`).
    - 1-click **Export 7-Day Sensor Data as CSV**.

---

## 📡 REST API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/health` | GET | Server health status & engine version |
| `/api/dashboard/overview` | GET | Fleet KPIs, stress distribution, recent alerts |
| `/api/telemetry/7day` | GET | 7-day sensor trends, min/max/avg, anomalies |
| `/api/telemetry/upload-csv` | POST | Upload and parse custom sensor CSV files |
| `/api/telemetry/export-csv` | GET | Download 7-day sensor telemetry as CSV |
| `/api/weather/live` | GET | Live Open-Meteo weather & rainfall risk analyzer |
| `/api/stress/analyze` | POST | AI crop stress scoring (0-100) & factor diagnosis |
| `/api/calculator/dosage` | POST | Irrigation volume (Litres) & fertilizer (Urea/DAP/MOP) |
| `/api/advisory` | POST | Multilingual structured farmer advisory |
| `/api/farms` | GET, POST | Farm & sensor fleet management |
| `/api/farms/<farm_id>` | PUT, DELETE | Edit or remove farm from fleet |
| `/api/alerts` | GET | System alerts and warnings |
| `/api/alerts/<id>/ack` | POST | Acknowledge and resolve an alert |
| `/api/reports/generate` | POST | Generate comprehensive audit report payload |
| `/api/settings` | GET, POST | User preferences and threshold calibration |

---

## 🧪 Judging Contract Compliance

AgriSense-X satisfies the **AgentX Hackathon Judging Contract**:
- Deterministic ReAct loop with repeat guard and step cap.
- Pure machine-readable JSON output under `--json`.
- Zero crash fallback when external API keys are absent.
- Verified offline pytest suite.

```json
{
  "crop": "tomato",
  "stress_level": "MODERATE",
  "stress_index": 35.6,
  "trend_summary": "Over the last 7 days, soil moisture shifted from 49.2% to 30.0% (-3.2%/day)...",
  "weather_risk": {
    "rainfall_risk": "MODERATE",
    "forecast_summary": "CAUTION: Light showers expected...",
    "wash_off_danger": false
  },
  "recommendations": {
    "water_dosage": {
      "net_depth_mm": 30.0,
      "liters_per_acre": 121410.0,
      "delivery_method": "Deliver via drip irrigation..."
    },
    "fertilizer_dosage": {
      "urea_kg_acre": 27.1,
      "dap_kg_acre": 14.1,
      "mop_kg_acre": 5.0,
      "application_timing": "Apply 50% Urea today in morning..."
    }
  },
  "regional_advisory": {
    "language": "Hindi",
    "headline": "🌾 कृषि परामर्श: टमाटर में मध्यम तनाव",
    "farmer_action_steps": [...]
  },
  "react_metadata": {
    "iterations_used": 5,
    "duration_seconds": 0.0,
    "repeat_guard_triggered": false,
    "tools_used": ["soil_analyzer", "weather_tool", "dosage_calculator", "regional_advisor"]
  }
}
```

---

## 👥 Hackathon Presentation Highlights
- **Real-Time Weather Intelligence:** Automatically saves water and fertilizer by correlating soil deficit with Open-Meteo precipitation forecasts.
- **Agronomic Accuracy:** Uses FAO-56 Penman-Monteith formulas and standard fertilizer grade conversions (Urea 46%, DAP 18-46-0, MOP 60%) instead of arbitrary numbers.
- **Multilingual Accessibility:** Serves rural farmers in their native tongue with simple vocabulary and built-in voice playback.
- **Production-Ready SaaS UI:** Modern dark green aesthetic, responsive desktop/tablet/mobile layouts, interactive SVG charts, CSV upload, and PDF report export.
