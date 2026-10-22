import React from 'react';
import {
  Flame,
  LifeBuoy,
  HeartPulse,
  Home,
  Users2,
  Package,
  AlertTriangle,
  ArrowUpRight,
  Clock,
  MapPin,
  CheckCircle2,
  PlusCircle,
  Cpu,
  ShieldAlert,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import {
  HazardIncident,
  SosRequest,
  Hospital,
  Shelter,
  NgoRescueTeam,
  ReliefDepot,
  ResourceAllocation,
  RiskWarning,
} from '../../types';
import { NavModule } from '../common/Sidebar';

interface CommandCenterProps {
  incidents: HazardIncident[];
  sosRequests: SosRequest[];
  hospitals: Hospital[];
  shelters: Shelter[];
  teams: NgoRescueTeam[];
  depots: ReliefDepot[];
  allocations: ResourceAllocation[];
  riskWarnings: RiskWarning[];
  activeDistrict: string;
  onNavigate: (module: NavModule) => void;
  onOpenNewIncident: () => void;
  onOpenSosPortal: () => void;
  onTriageSos: (sos: SosRequest) => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({
  incidents,
  sosRequests,
  hospitals,
  shelters,
  teams,
  depots,
  allocations,
  riskWarnings,
  activeDistrict,
  onNavigate,
  onOpenNewIncident,
  onOpenSosPortal,
  onTriageSos,
}) => {
  // District filter
  const filterByDistrict = <T extends { district: string }>(items: T[]): T[] => {
    if (activeDistrict === 'All Districts') return items;
    return items.filter((i) => i.district.toLowerCase() === activeDistrict.toLowerCase());
  };

  const filteredIncidents = filterByDistrict(incidents);
  const filteredSos = filterByDistrict(sosRequests);
  const filteredHospitals = filterByDistrict(hospitals);
  const filteredShelters = filterByDistrict(shelters);
  const filteredTeams = filterByDistrict(teams);

  // Derived metrics
  const activeIncidentsCount = filteredIncidents.filter((i) => i.status !== 'Resolved').length;
  const criticalSosCount = filteredSos.filter(
    (s) => s.priority === 'Life-Threatening' && s.status !== 'Assisted' && s.status !== 'Cancelled'
  ).length;
  const totalBeds = filteredHospitals.reduce((acc, h) => acc + h.totalBeds, 0);
  const availableBeds = filteredHospitals.reduce((acc, h) => acc + h.availableBeds, 0);
  const shelterCapacity = filteredShelters.reduce((acc, s) => acc + s.capacity, 0);
  const shelterOccupancy = filteredShelters.reduce((acc, s) => acc + s.occupancy, 0);
  const deployedTeams = filteredTeams.filter((t) => t.status === 'Deployed').length;
  const totalTeams = filteredTeams.length;

  // Shortage detection
  const lowStockDepots = depots.flatMap((d) =>
    d.inventory
      .filter((i) => i.quantity <= i.reorderThreshold)
      .map((i) => ({ depot: d.name, district: d.district, item: i.name, qty: i.quantity, threshold: i.reorderThreshold }))
  );

  return (
    <div className="space-y-6">
      {/* Top Banner with Quick Actions */}
      <div className="p-6 rounded-2xl bg-linear-to-r from-slate-900 via-emerald-950 to-slate-900 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Live State Emergency Feed
            </span>
            <span className="text-xs text-slate-300">
              {activeDistrict === 'All Districts' ? 'Tamil Nadu Coastal Command' : `${activeDistrict} District Command`}
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight mt-1">
            Integrated Disaster Operations Center
          </h1>
          <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-xl">
            Real-time multi-agency coordination between TNSDMA, NDRF, SDRF, Greater Chennai Corp, and coastal relief depots.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenNewIncident}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center space-x-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report Incident</span>
          </button>
          <button
            onClick={onOpenSosPortal}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center space-x-1.5 cursor-pointer"
          >
            <LifeBuoy className="w-4 h-4" />
            <span>Citizen SOS Queue</span>
          </button>
          <button
            onClick={() => onNavigate('gis-map')}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition flex items-center space-x-1.5 cursor-pointer border border-white/10"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Open GIS Map</span>
          </button>
        </div>
      </div>

      {/* Low-stock warning marquee if applicable */}
      {lowStockDepots.length > 0 && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-bold">Relief Supply Alert:</span>
            <span className="truncate max-w-2xl">
              {lowStockDepots[0].item} at {lowStockDepots[0].depot} is below safety threshold ({lowStockDepots[0].qty} remaining vs {lowStockDepots[0].threshold} target).
            </span>
          </div>
          <button
            onClick={() => onNavigate('depots-inventory')}
            className="font-bold text-amber-800 hover:underline shrink-0 ml-2 cursor-pointer"
          >
            Manage Depots &rarr;
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Hazards */}
        <div
          onClick={() => onNavigate('incidents')}
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Hazards
            </span>
            <div className="p-2 rounded-xl bg-rose-100 text-rose-600">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{activeIncidentsCount}</p>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center space-x-1">
            <span className="text-rose-600 font-semibold">{filteredIncidents.filter(i => i.severity === 'Critical').length} Critical</span>
            <span>in operational zone</span>
          </p>
        </div>

        {/* Life-Threatening SOS */}
        <div
          onClick={() => onNavigate('sos-portal')}
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-red-300 hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Critical SOS Queue
            </span>
            <div className="p-2 rounded-xl bg-red-100 text-red-600">
              <LifeBuoy className="w-4 h-4 animate-spin-slow" />
            </div>
          </div>
          <p className="text-2xl font-black text-red-600 mt-2">{criticalSosCount}</p>
          <p className="text-[11px] text-slate-500 mt-1">
            {filteredSos.filter(s => s.status === 'Pending Triage').length} pending triage dispatch
          </p>
        </div>

        {/* Hospital Beds */}
        <div
          onClick={() => onNavigate('hospitals-beds')}
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Medical Beds Free
            </span>
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600">
              <HeartPulse className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-700 mt-2">{availableBeds}</p>
          <p className="text-[11px] text-slate-500 mt-1">
            of {totalBeds} total beds ({totalBeds > 0 ? Math.round((availableBeds / totalBeds) * 100) : 0}% available)
          </p>
        </div>

        {/* Shelter Occupancy */}
        <div
          onClick={() => onNavigate('shelters')}
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Shelter Occupancy
            </span>
            <div className="p-2 rounded-xl bg-teal-100 text-teal-700">
              <Home className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {shelterOccupancy}
            <span className="text-sm font-normal text-slate-400">/{shelterCapacity}</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            {shelterCapacity > 0 ? Math.round((shelterOccupancy / shelterCapacity) * 100) : 0}% capacity utilized
          </p>
        </div>
      </div>

      {/* Main Split: Triage Queue & Active Incidents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Incident Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Active Hazard Incidents
              </h2>
              <p className="text-xs text-slate-500">
                Live monitoring of storm surges, inundations, and coastal warnings
              </p>
            </div>
            <button
              onClick={() => onNavigate('incidents')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1 cursor-pointer"
            >
              <span>View All ({filteredIncidents.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider">
                  <th className="pb-2.5 font-bold">Incident / ID</th>
                  <th className="pb-2.5 font-bold">Category</th>
                  <th className="pb-2.5 font-bold">District</th>
                  <th className="pb-2.5 font-bold">Severity</th>
                  <th className="pb-2.5 font-bold">Status</th>
                  <th className="pb-2.5 font-bold text-right">Population</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredIncidents.slice(0, 5).map((inc) => (
                  <tr key={inc.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 pr-2">
                      <div className="font-bold text-slate-900 line-clamp-1">{inc.title}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{inc.id}</div>
                    </td>
                    <td className="py-3 pr-2 font-medium text-slate-700">{inc.category}</td>
                    <td className="py-3 pr-2 text-slate-600">{inc.district}</td>
                    <td className="py-3 pr-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          inc.severity === 'Critical'
                            ? 'bg-rose-100 text-rose-800'
                            : inc.severity === 'High'
                            ? 'bg-amber-100 text-amber-800'
                            : inc.severity === 'Moderate'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {inc.severity}
                      </span>
                    </td>
                    <td className="py-3 pr-2">
                      <span className="font-semibold text-slate-700">{inc.status}</span>
                    </td>
                    <td className="py-3 text-right font-mono text-slate-800">
                      {inc.affectedPopulation.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: SOS Emergency Triage Queue */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <LifeBuoy className="w-4 h-4 text-red-600" />
              <h2 className="text-base font-bold text-slate-900">
                Live SOS Triage Queue
              </h2>
            </div>
            <button
              onClick={() => onNavigate('sos-portal')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
            >
              Portal &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {filteredSos.slice(0, 4).map((sos) => (
              <div
                key={sos.id}
                className="p-3 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-slate-50 transition text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      sos.priority === 'Life-Threatening'
                        ? 'bg-red-100 text-red-800 animate-pulse'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {sos.priority}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{sos.reportedAt}</span>
                </div>

                <div>
                  <p className="font-bold text-slate-800 line-clamp-1">{sos.emergencyCategory}</p>
                  <p className="text-slate-500 text-[11px] line-clamp-2 mt-0.5">
                    {sos.description}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1 border-t border-slate-100">
                  <div className="flex items-center space-x-1 truncate max-w-[150px]">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{sos.location}</span>
                  </div>
                  <button
                    onClick={() => onTriageSos(sos)}
                    className="px-2 py-1 bg-slate-900 hover:bg-emerald-700 text-white rounded-md text-[10px] font-bold cursor-pointer transition shrink-0 ml-2"
                  >
                    Triage &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Risk & Resource Allocation Previews */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Early Warning Snapshot */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">
                AI Risk Early Warning (Sample Predictors)
              </h3>
            </div>
            <button
              onClick={() => onNavigate('risk-warning')}
              className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
            >
              Analyze Models &rarr;
            </button>
          </div>

          <div className="space-y-2.5">
            {riskWarnings.slice(0, 2).map((rw) => (
              <div key={rw.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">{rw.district} &mdash; {rw.hazardType}</span>
                  <span className="font-mono font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                    Risk Score: {rw.riskScore}/100
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">{rw.forecastPeriod}</p>
                <div className="text-[11px] text-slate-500 font-medium">
                  Key Factor: {rw.contributingFactors[0]?.parameter} ({rw.contributingFactors[0]?.currentValue})
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Smart Allocation Summary */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Package className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Active Relief Dispatch &amp; Allocations
              </h3>
            </div>
            <button
              onClick={() => onNavigate('resource-allocation')}
              className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
            >
              Rule Engine &rarr;
            </button>
          </div>

          <div className="space-y-2.5">
            {allocations.slice(0, 2).map((alc) => (
              <div key={alc.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">{alc.resourceName}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {alc.status}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Qty: {alc.quantity} {alc.unit}</span>
                  <span>To: {alc.incidentTitle.substring(0, 26)}...</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
