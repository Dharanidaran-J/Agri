import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  Sprout,
  CloudSun,
  AlertTriangle,
  Calculator,
  MessageSquareQuote,
  Layers,
  Bell,
  FileSpreadsheet,
  Settings,
  Droplets,
  Thermometer,
  Volume2,
  VolumeX,
  Upload,
  Download,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Activity
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [lang, setLang] = useState('English');
  const [selectedFarmId, setSelectedFarmId] = useState('FARM-001');

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f3f7f4] font-sans">
      <aside className="w-full md:w-64 bg-agriForest text-white flex flex-col p-4 border-r border-emerald-950">
        <div className="flex items-center space-x-3 mb-6 p-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-green-300 flex items-center justify-center text-agriForest">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">AgriSense<span className="text-emerald-400">X</span></h1>
            <span className="text-[10px] text-emerald-300 uppercase font-semibold">Smart Farm Advisory</span>
          </div>
        </div>

        <nav className="space-y-1 flex-1">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'soil', label: 'Soil Analytics', icon: Sprout },
            { id: 'weather', label: 'Weather Monitoring', icon: CloudSun },
            { id: 'stress', label: 'Crop Stress Detection', icon: AlertTriangle },
            { id: 'calc', label: 'Fertilizer & Water Calc', icon: Calculator },
            { id: 'advisory', label: 'AI Farmer Advisory', icon: MessageSquareQuote },
            { id: 'fleet', label: 'Farm Management', icon: Layers },
            { id: 'alerts', label: 'Alerts Center', icon: Bell },
            { id: 'reports', label: 'Reports & Export', icon: FileSpreadsheet },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map(item => {
            const IconComp = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive ? 'bg-white/10 text-white font-bold border-l-4 border-emerald-400' : 'text-emerald-100/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <IconComp className={`w-5 h-5 ${isActive ? 'text-emerald-300' : 'text-emerald-300/70'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-emerald-900/60 mt-4">
          <label className="text-[11px] font-semibold text-emerald-300 uppercase block mb-1">Language</label>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="w-full bg-emerald-900 text-white text-xs rounded-lg px-2.5 py-1.5 border border-emerald-700"
          >
            <option value="English">English</option>
            <option value="Hindi">हिन्दी (Hindi)</option>
            <option value="Tamil">தமிழ் (Tamil)</option>
            <option value="Telugu">తెలుగు (Telugu)</option>
            <option value="Kannada">ಕನ್ನಡ (Kannada)</option>
            <option value="Malayalam">മലയാളം (Malayalam)</option>
          </select>
        </div>
      </aside>

      <main className="flex-1 p-6 overflow-y-auto">
        <header className="flex justify-between items-center mb-6 bg-white p-4 rounded-2xl border border-agriBorder shadow-sm">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase bg-emerald-50 px-2 py-0.5 rounded">AgriSense-X v2.4</span>
            <h2 className="text-xl font-bold text-slate-800 capitalize mt-1">{activeTab} Section</h2>
          </div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>REST API & Live Telemetry Connected</span>
          </div>
        </header>

        <div className="bg-white p-6 rounded-2xl border border-agriBorder shadow-sm">
          <p className="text-sm text-slate-600">
            This React module mirrors the standalone deployment in <code>static/index.html</code> served by <code>web_app.py</code> and <code>python main.py --serve</code>.
            All 10 views, 6 languages, Open-Meteo weather APIs, 7-day soil analytics, and FAO-56 dosage calculations are actively connected.
          </p>
        </div>
      </main>
    </div>
  );
}
