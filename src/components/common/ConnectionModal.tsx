import React, { useState } from 'react';
import {
  X,
  Server,
  Database,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Terminal,
  Code2,
  ExternalLink,
  ShieldCheck,
  Radio,
} from 'lucide-react';
import { BackendConnectionState, SystemHealth } from '../../types';
import { api } from '../../services/api';

interface ConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  connectionState: BackendConnectionState;
  health: SystemHealth | null;
  onHealthUpdated: (state: BackendConnectionState, health: SystemHealth | null) => void;
}

export const ConnectionModal: React.FC<ConnectionModalProps> = ({
  isOpen,
  onClose,
  connectionState,
  health,
  onHealthUpdated,
}) => {
  const [apiUrl, setApiUrl] = useState(api.getBaseUrl() || 'http://localhost:8080/api');
  const [isChecking, setIsChecking] = useState(false);
  const [checkError, setCheckError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTestPing = async () => {
    setIsChecking(true);
    setCheckError(null);
    api.setBaseUrl(apiUrl);
    const result = await api.checkHealth();
    setIsChecking(false);
    onHealthUpdated(result.state, result.health);
    if (result.error) {
      setCheckError(result.error);
    }
  };

  const handleSwitchToDemo = () => {
    api.setBaseUrl('');
    setApiUrl('');
    api.checkHealth().then((res) => {
      onHealthUpdated(res.state, res.health);
    });
    setCheckError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Backend &amp; MySQL Connectivity Manager
              </h3>
              <p className="text-xs text-slate-500">
                Java 21 Spring Boot + MySQL 8 REST Service Architecture
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Status Alert Banner */}
          <div
            className={`p-4 rounded-xl border flex items-start space-x-3 ${
              connectionState === 'CONNECTED'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : connectionState === 'DISCONNECTED'
                ? 'bg-rose-50 border-rose-300 text-rose-900'
                : 'bg-amber-50 border-amber-300 text-amber-900'
            }`}
          >
            {connectionState === 'CONNECTED' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : connectionState === 'DISCONNECTED' ? (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            ) : (
              <Radio className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="text-xs space-y-1">
              <p className="font-bold">
                {connectionState === 'CONNECTED'
                  ? 'Spring Boot Backend Connected & Live'
                  : connectionState === 'DISCONNECTED'
                  ? 'Spring Boot Backend Unreachable at configured URL'
                  : 'Operating in Interactive Client-Side Demo Mode'}
              </p>
              <p className="text-slate-600 leading-relaxed">
                {connectionState === 'CONNECTED'
                  ? 'All REST calls are synchronized with MySQL database `lifelink_db` via Spring Data JPA.'
                  : connectionState === 'DISCONNECTED'
                  ? 'The cloud preview container cannot reach a local host address without a tunnel. All modifications are currently being persisted to local browser storage to keep the demo fully working.'
                  : 'Standalone mode enabled with realistic Tamil Nadu coastal disaster data (Chennai, Cuddalore, Nagapattinam).'}
              </p>
            </div>
          </div>

          {/* Endpoint Configuration Input */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Spring Boot REST API Base URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="e.g. http://localhost:8080/api or https://your-server.com/api"
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <button
                onClick={handleTestPing}
                disabled={isChecking}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
                <span>{isChecking ? 'Checking...' : 'Ping /health'}</span>
              </button>
            </div>
            {checkError && <p className="text-xs text-rose-600 font-mono mt-1">{checkError}</p>}
          </div>

          {/* Health Details */}
          {health && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 font-mono">
              <div className="flex justify-between text-slate-600">
                <span>Status:</span>
                <span className="font-bold text-slate-800">{health.status}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Database Engine:</span>
                <span className="font-bold text-slate-800">{health.database}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Target URI:</span>
                <span className="text-slate-800 truncate max-w-[280px]">{health.apiUrl}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Timestamp:</span>
                <span className="text-slate-800">{health.timestamp}</span>
              </div>
            </div>
          )}

          {/* Spring Boot & MySQL Instructions */}
          <div className="border-t border-slate-100 pt-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
              <Database className="w-4 h-4 text-emerald-600" />
              <span>Local Deployment Guide for College Evaluation</span>
            </h4>
            <div className="p-3.5 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono space-y-2 overflow-x-auto">
              <p className="text-slate-400"># 1. Initialize MySQL Database:</p>
              <p className="text-emerald-400">CREATE DATABASE lifelink_db CHARACTER SET utf8mb4;</p>
              <p className="text-slate-400 mt-2"># 2. Start Java 21 Spring Boot Backend:</p>
              <p className="text-emerald-400">cd backend &amp;&amp; mvn spring-boot:run</p>
              <p className="text-slate-400 mt-2"># 3. Check Health Endpoint:</p>
              <p className="text-emerald-400">curl http://localhost:8080/api/health</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3 rounded-b-2xl">
          <button
            onClick={handleSwitchToDemo}
            className="text-xs font-semibold text-slate-600 hover:text-emerald-700 underline cursor-pointer"
          >
            Force Client Demo Mode (Safe Fallback)
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition cursor-pointer"
          >
            Close Dialog
          </button>
        </div>
      </div>
    </div>
  );
};
