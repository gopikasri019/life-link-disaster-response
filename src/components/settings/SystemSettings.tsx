import React, { useState } from 'react';
import {
  Settings,
  Server,
  Database,
  PhoneCall,
  RefreshCw,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
  Info,
  Shield,
  Save,
} from 'lucide-react';
import { api } from '../../services/api';
import { StorageEngine } from '../../services/storage';

interface SystemSettingsProps {
  onDataReset: () => void;
}

export const SystemSettings: React.FC<SystemSettingsProps> = ({ onDataReset }) => {
  const [apiUrl, setApiUrl] = useState(api.getBaseUrl() || '');
  const [nationalSosPhone, setNationalSosPhone] = useState('112');
  const [stateDisasterPhone, setStateDisasterPhone] = useState('1070');
  const [districtCollectorPhone, setDistrictCollectorPhone] = useState('1077');
  const [ambulancePhone, setAmbulancePhone] = useState('108');

  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [isPinging, setIsPinging] = useState(false);
  const [pingResult, setPingResult] = useState<string | null>(null);

  const handleSaveApi = async (e: React.FormEvent) => {
    e.preventDefault();
    api.setBaseUrl(apiUrl);
    setIsPinging(true);
    const res = await api.checkHealth();
    setIsPinging(false);
    if (res.state === 'CONNECTED') {
      setPingResult('Connected to Spring Boot backend successfully!');
    } else if (res.state === 'DISCONNECTED') {
      setPingResult(res.error || 'Backend not reachable at this URL.');
    } else {
      setPingResult('Configured for Standalone Demo Mode.');
    }
    setSaveNotice('Settings saved.');
    setTimeout(() => setSaveNotice(null), 3000);
  };

  const handleResetData = () => {
    if (window.confirm('Reset all disaster incidents, SOS requests, and inventory back to initial seed data?')) {
      StorageEngine.resetAllData();
      onDataReset();
      setSaveNotice('All disaster data has been restored to default seeds.');
      setTimeout(() => setSaveNotice(null), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
          <Settings className="w-5 h-5 text-emerald-600" />
          <span>System Settings &amp; Platform Configuration</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Backend REST endpoint, MySQL connection instructions, and regional emergency hotlines.
        </p>
      </div>

      {saveNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveNotice}</span>
        </div>
      )}

      {/* Spring Boot REST API Endpoint Config */}
      <form
        onSubmit={handleSaveApi}
        className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs"
      >
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
          <Server className="w-4 h-4 text-emerald-600" />
          <h3 className="font-bold text-sm text-slate-900">
            Spring Boot REST Backend Configuration
          </h3>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1.5">
            REST API Base URL (leave empty for standalone in-browser Demo Mode)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="e.g. http://localhost:8080/api or http://127.0.0.1:8080/api"
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-slate-800 text-xs"
            />
            <button
              type="submit"
              disabled={isPinging}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition cursor-pointer flex items-center space-x-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isPinging ? 'Testing...' : 'Save & Test'}</span>
            </button>
          </div>
          {pingResult && (
            <p className="mt-2 font-mono text-[11px] text-slate-600">{pingResult}</p>
          )}
        </div>
      </form>

      {/* Emergency Helpline Contacts Configuration */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
          <PhoneCall className="w-4 h-4 text-red-600" />
          <h3 className="font-bold text-sm text-slate-900">
            Emergency Hotlines &amp; State Dispatch Contacts
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              National Emergency Number
            </label>
            <input
              type="text"
              value={nationalSosPhone}
              onChange={(e) => setNationalSosPhone(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Tamil Nadu State Disaster Control Room
            </label>
            <input
              type="text"
              value={stateDisasterPhone}
              onChange={(e) => setStateDisasterPhone(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              District Collectorate Disaster Line
            </label>
            <input
              type="text"
              value={districtCollectorPhone}
              onChange={(e) => setDistrictCollectorPhone(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Medical Ambulance Emergency
            </label>
            <input
              type="text"
              value={ambulancePhone}
              onChange={(e) => setAmbulancePhone(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold"
            />
          </div>
        </div>
      </div>

      {/* Database Schema & Run Instructions */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
          <Database className="w-4 h-4 text-emerald-600" />
          <h3 className="font-bold text-sm text-slate-900">
            MySQL 8 Schema &amp; Local Spring Boot Execution
          </h3>
        </div>

        <p className="text-slate-600 leading-relaxed">
          The project includes a production-grade Java 21 Spring Boot 3 backend in the <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-emerald-800">/backend</code> folder.
          It integrates with MySQL 8 with JPA entities, Spring Security, DTO validation, and automated flyway/SQL initialization.
        </p>

        <div className="p-3.5 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] space-y-1.5 overflow-x-auto">
          <p className="text-slate-400"># 1. Clone &amp; Enter Backend Directory</p>
          <p className="text-emerald-400">cd backend</p>
          <p className="text-slate-400 mt-2"># 2. Configure application.properties (or pass environment variables)</p>
          <p className="text-slate-300">export DB_HOST=localhost</p>
          <p className="text-slate-300">export DB_PORT=3306</p>
          <p className="text-slate-300">export DB_NAME=lifelink_db</p>
          <p className="text-slate-300">export DB_USER=root</p>
          <p className="text-slate-300">export DB_PASSWORD=your_password</p>
          <p className="text-slate-400 mt-2"># 3. Launch Spring Boot REST Service</p>
          <p className="text-emerald-400">mvn spring-boot:run</p>
        </div>
      </div>

      {/* System Reset Box */}
      <div className="bg-white rounded-2xl border border-rose-200 p-6 shadow-xs space-y-3 text-xs">
        <div className="flex items-center space-x-2">
          <RotateCcw className="w-4 h-4 text-rose-600" />
          <h3 className="font-bold text-sm text-rose-950">
            Demonstration State Reset
          </h3>
        </div>
        <p className="text-slate-600 leading-relaxed">
          Need a fresh clean slate for presenting to examiners? This will restore all incidents, SOS beacons, hospital bed numbers, and warehouse stock back to the original Tamil Nadu Coastal baseline.
        </p>
        <button
          onClick={handleResetData}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition cursor-pointer"
        >
          Reset All Simulation Data to Initial Seed
        </button>
      </div>

      {/* College Project Credit */}
      <div className="p-5 bg-emerald-50/60 rounded-2xl border border-emerald-200 text-xs text-slate-700 space-y-2">
        <div className="flex items-center space-x-2 text-emerald-950 font-bold text-sm">
          <GraduationCap className="w-5 h-5 text-emerald-700" />
          <span>Easwari Engineering College &mdash; Department of Artificial Intelligence and Data Science</span>
        </div>
        <p className="text-slate-600 leading-relaxed">
          <strong>Project LIFE-LINK:</strong> AI-Powered Disaster Response &amp; Community Resilience Platform. Designed for coastal storm surge preparedness, explainable early warning prediction, and real-time inter-agency relief logistics across Tamil Nadu.
        </p>
      </div>
    </div>
  );
};
