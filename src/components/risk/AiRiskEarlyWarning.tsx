import React, { useState } from 'react';
import {
  BrainCircuit,
  AlertTriangle,
  Activity,
  Sliders,
  CheckCircle2,
  Clock,
  Compass,
  ChevronRight,
  TrendingUp,
  Droplets,
  Wind,
  Waves,
  Info,
  ShieldAlert,
} from 'lucide-react';
import { RiskWarning, HazardCategory, RiskLevel } from '../../types';

interface AiRiskEarlyWarningProps {
  warnings: RiskWarning[];
  activeDistrict: string;
}

export const AiRiskEarlyWarning: React.FC<AiRiskEarlyWarningProps> = ({
  warnings,
  activeDistrict,
}) => {
  const [districtFilter, setDistrictFilter] = useState(activeDistrict !== 'All Districts' ? activeDistrict : 'ALL');
  const [levelFilter, setLevelFilter] = useState<string>('ALL');
  const [selectedWarning, setSelectedWarning] = useState<RiskWarning | null>(warnings[0] || null);

  // Interactive Model Simulation Controls
  const [simRainfall, setSimRainfall] = useState<number>(180);
  const [simReservoir, setSimReservoir] = useState<number>(95);
  const [simTideSwell, setSimTideSwell] = useState<number>(1.6);

  // Compute explainable dynamic simulation score
  // Formula: Score = (Rainfall/250)*40 + (Reservoir/100)*35 + (Tide/2.5)*25
  const simulatedScore = Math.min(
    100,
    Math.round((simRainfall / 250) * 40 + (simReservoir / 100) * 35 + (simTideSwell / 2.5) * 25)
  );

  const getSimulatedLevel = (score: number): RiskLevel => {
    if (score >= 80) return 'High Emergency';
    if (score >= 65) return 'Warning';
    if (score >= 45) return 'Watch';
    if (score >= 25) return 'Advisory';
    return 'Minimal';
  };

  const filtered = warnings.filter((w) => {
    if (districtFilter !== 'ALL' && w.district.toLowerCase() !== districtFilter.toLowerCase()) return false;
    if (levelFilter !== 'ALL' && w.riskLevel !== levelFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header and Disclaimer */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <BrainCircuit className="w-5 h-5 text-emerald-600" />
            <span>AI Risk Early Warning &amp; Predictive Analytics</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Explainable decision intelligence fusing IMD radar, river catchment runoff, and coastal swell models.
          </p>
        </div>

        <div className="p-2 px-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-center space-x-1.5">
          <Info className="w-3.5 h-3.5 text-amber-700 shrink-0" />
          <span>Demo estimate &mdash; explainable rule weights displayed transparently.</span>
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-slate-600">Filter By District:</span>
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium"
          >
            <option value="ALL">All Districts</option>
            <option value="Chennai">Chennai</option>
            <option value="Cuddalore">Cuddalore</option>
            <option value="Nagapattinam">Nagapattinam</option>
            <option value="Tiruvallur">Tiruvallur</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="font-semibold text-slate-600">Risk Severity Level:</span>
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="High Emergency">High Emergency (&gt;80)</option>
            <option value="Warning">Warning (65-79)</option>
            <option value="Watch">Watch (45-64)</option>
            <option value="Advisory">Advisory (&lt;45)</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Warning List & Factor Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Warning Cards Column */}
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
            Active Hazard Early Warnings ({filtered.length})
          </p>

          {filtered.map((w) => {
            const isSelected = selectedWarning?.id === w.id;
            return (
              <div
                key={w.id}
                onClick={() => setSelectedWarning(w)}
                className={`p-4 rounded-2xl border transition cursor-pointer space-y-2 text-xs ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/50 shadow-sm ring-1 ring-emerald-400'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-slate-900">{w.district}</span>
                    <span className="text-slate-400">&bull;</span>
                    <span className="text-slate-600">{w.hazardType}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      w.riskScore >= 80
                        ? 'bg-rose-100 text-rose-800'
                        : w.riskScore >= 65
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    Score {w.riskScore}/100
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 line-clamp-1">{w.forecastPeriod}</p>

                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] text-slate-400 font-mono">
                  <span>{w.id}</span>
                  <span>{w.dataFreshness.substring(0, 22)}...</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Warning Inspector (Center & Right 2 cols) */}
        {selectedWarning && (
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-emerald-100 text-emerald-800">
                    {selectedWarning.riskLevel}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{selectedWarning.id}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mt-1">
                  {selectedWarning.district} &mdash; {selectedWarning.hazardType} Hazard Model
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Forecast Window: {selectedWarning.forecastPeriod}
                </p>
              </div>

              {/* Gauge Score Ring */}
              <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="text-center">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Compound Risk</span>
                  <p className="text-2xl font-black text-slate-900 leading-none mt-0.5">
                    {selectedWarning.riskScore}
                    <span className="text-xs text-slate-400 font-normal">/100</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Explainable Contributing Factors Breakdown */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <span>Explainable Contributing Factor Weights</span>
                </h4>
                <span className="text-[11px] text-slate-400">Additive Linear Attribution</span>
              </div>

              <div className="space-y-2.5">
                {selectedWarning.contributingFactors.map((factor, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-slate-800 flex items-center space-x-2">
                        <span>{factor.parameter}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                            factor.status === 'Danger'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {factor.status}
                        </span>
                      </div>
                      <span className="font-mono text-slate-600 text-[11px]">
                        Weight: {factor.weightPercent}%
                      </span>
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>Observed: <strong className="text-slate-800">{factor.currentValue}</strong></span>
                      <span>Warning Baseline: {factor.threshold}</span>
                    </div>

                    {/* Progress indicator */}
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          factor.status === 'Danger' ? 'bg-rose-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${Math.min(100, factor.weightPercent * 2.5)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Preventive Actions */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                <ShieldAlert className="w-4 h-4 text-emerald-600" />
                <span>Recommended Standard Operating Procedures (SOP)</span>
              </h4>
              <ul className="space-y-2">
                {selectedWarning.recommendedActions.map((action, i) => (
                  <li key={i} className="flex items-start space-x-2 text-xs text-slate-700 bg-emerald-50/40 p-2.5 rounded-xl border border-emerald-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{action}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Telemetry Source Tag */}
            <div className="p-3 bg-slate-100 rounded-xl text-[11px] text-slate-500 font-mono flex items-center justify-between">
              <span>Telemetry: {selectedWarning.dataFreshness}</span>
              <span>Model Confidence: 94.2%</span>
            </div>
          </div>
        )}
      </div>

      {/* Interactive AI Simulation Sandbox */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Interactive Multi-Parametric Risk Simulation Sandbox
              </h3>
              <p className="text-xs text-slate-500">
                Adjust hydrological and meteorological variables to examine how the risk scoring engine updates in real time.
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400">Simulated Risk</span>
            <div className="text-lg font-black text-emerald-800">
              {simulatedScore} / 100 &mdash; {getSimulatedLevel(simulatedScore)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Slider 1: 6h Rainfall */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="flex items-center space-x-1 text-slate-700">
                <Droplets className="w-3.5 h-3.5 text-blue-500" />
                <span>6h Precipitation</span>
              </span>
              <span className="font-mono text-emerald-700">{simRainfall} mm</span>
            </div>
            <input
              type="range"
              min={20}
              max={300}
              step={5}
              value={simRainfall}
              onChange={(e) => setSimRainfall(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>20mm (Moderate)</span>
              <span>100mm (Alert)</span>
              <span>300mm (Deluge)</span>
            </div>
          </div>

          {/* Slider 2: Reservoir Capacity */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="flex items-center space-x-1 text-slate-700">
                <Waves className="w-3.5 h-3.5 text-teal-500" />
                <span>Reservoir Storage %</span>
              </span>
              <span className="font-mono text-emerald-700">{simReservoir}%</span>
            </div>
            <input
              type="range"
              min={40}
              max={100}
              step={1}
              value={simReservoir}
              onChange={(e) => setSimReservoir(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>40% (Safe)</span>
              <span>85% (Warning)</span>
              <span>100% (Surplus Gate Open)</span>
            </div>
          </div>

          {/* Slider 3: High Tide Swell */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="flex items-center space-x-1 text-slate-700">
                <Wind className="w-3.5 h-3.5 text-indigo-500" />
                <span>Tidal Swell Surge</span>
              </span>
              <span className="font-mono text-emerald-700">+{simTideSwell} meters</span>
            </div>
            <input
              type="range"
              min={0.2}
              max={3.0}
              step={0.1}
              value={simTideSwell}
              onChange={(e) => setSimTideSwell(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>+0.2m (Normal)</span>
              <span>+1.5m (Surge)</span>
              <span>+3.0m (Storm Breach)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
