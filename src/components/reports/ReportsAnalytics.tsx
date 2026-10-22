import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Filter,
  PieChart,
  TrendingUp,
  FileSpreadsheet,
  CheckCircle2,
  Calendar,
  Layers,
  Flame,
  LifeBuoy,
  HeartPulse,
  Home,
  Package,
} from 'lucide-react';
import {
  HazardIncident,
  SosRequest,
  Hospital,
  Shelter,
  ReliefDepot,
  ResourceAllocation,
} from '../../types';

interface ReportsAnalyticsProps {
  incidents: HazardIncident[];
  sosRequests: SosRequest[];
  hospitals: Hospital[];
  shelters: Shelter[];
  depots: ReliefDepot[];
  allocations: ResourceAllocation[];
  activeDistrict: string;
}

export const ReportsAnalytics: React.FC<ReportsAnalyticsProps> = ({
  incidents,
  sosRequests,
  hospitals,
  shelters,
  depots,
  allocations,
  activeDistrict,
}) => {
  const [districtFilter, setDistrictFilter] = useState(
    activeDistrict !== 'All Districts' ? activeDistrict : 'ALL'
  );
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const filterByDist = <T extends { district: string }>(items: T[]): T[] => {
    if (districtFilter === 'ALL') return items;
    return items.filter((i) => i.district.toLowerCase() === districtFilter.toLowerCase());
  };

  const fIncidents = filterByDist(incidents);
  const fSos = filterByDist(sosRequests);
  const fHospitals = filterByDist(hospitals);
  const fShelters = filterByDist(shelters);

  // Groupings
  // Incidents by Category
  const categoryCounts = fIncidents.reduce((acc, inc) => {
    acc[inc.category] = (acc[inc.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Incidents by Severity
  const severityCounts = {
    Critical: fIncidents.filter((i) => i.severity === 'Critical').length,
    High: fIncidents.filter((i) => i.severity === 'High').length,
    Moderate: fIncidents.filter((i) => i.severity === 'Moderate').length,
    Low: fIncidents.filter((i) => i.severity === 'Low').length,
  };

  // SOS by Status
  const sosStatusCounts = {
    'Pending Triage': fSos.filter((s) => s.status === 'Pending Triage').length,
    Assigned: fSos.filter((s) => s.status === 'Assigned').length,
    'Rescue In Progress': fSos.filter((s) => s.status === 'Rescue In Progress').length,
    Assisted: fSos.filter((s) => s.status === 'Assisted').length,
  };

  // Totals
  const totalHospitalBeds = fHospitals.reduce((acc, h) => acc + h.totalBeds, 0);
  const freeHospitalBeds = fHospitals.reduce((acc, h) => acc + h.availableBeds, 0);
  const totalShelterCapacity = fShelters.reduce((acc, s) => acc + s.capacity, 0);
  const totalShelterOccupancy = fShelters.reduce((acc, s) => acc + s.occupancy, 0);

  // Helper to trigger real CSV download in browser
  const downloadCsv = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setExportNotice(`Exported ${filename} successfully.`);
    setTimeout(() => setExportNotice(null), 4000);
  };

  const exportIncidentsCsv = () => {
    const headers = ['Incident ID', 'Title', 'Category', 'Severity', 'District', 'Location', 'Affected Population', 'Status', 'Reported At'];
    const rows = fIncidents.map((i) => [i.id, i.title, i.category, i.severity, i.district, i.location, i.affectedPopulation, i.status, i.reportedAt]);
    downloadCsv(`LIFE_LINK_Incidents_${districtFilter}_${Date.now()}.csv`, headers, rows);
  };

  const exportSosCsv = () => {
    const headers = ['SOS ID', 'Tracking Code', 'Category', 'Citizen Name', 'Phone', 'District', 'Location', 'People Trapped', 'Injured', 'Priority', 'Status', 'Dispatched Unit', 'Reported At'];
    const rows = fSos.map((s) => [s.id, s.trackingCode, s.emergencyCategory, s.citizenName, s.contactPhone, s.district, s.location, s.peopleAffected, s.injuredCount, s.priority, s.status, s.assignedUnit || 'Unassigned', s.reportedAt]);
    downloadCsv(`LIFE_LINK_SOS_Queue_${districtFilter}_${Date.now()}.csv`, headers, rows);
  };

  const exportAllocationsCsv = () => {
    const headers = ['Allocation ID', 'Consignment Resource', 'Quantity', 'Unit', 'Source Depot', 'Target Incident', 'Status', 'Assigned Team', 'Timestamp'];
    const rows = allocations.map((a) => [a.id, a.resourceName, a.quantity, a.unit, a.depotName, a.incidentTitle, a.status, a.assignedTeam, a.timestamp]);
    downloadCsv(`LIFE_LINK_Relief_Allocations_${Date.now()}.csv`, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            <span>Disaster Intelligence &amp; Analytics Reports</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Statistical summaries, response capacity trends, and tabular data exports for government sit-reps.
          </p>
        </div>

        {/* Filter and Export buttons */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold text-slate-800"
          >
            <option value="ALL">All Districts</option>
            <option value="Chennai">Chennai</option>
            <option value="Cuddalore">Cuddalore</option>
            <option value="Nagapattinam">Nagapattinam</option>
            <option value="Tiruvallur">Tiruvallur</option>
          </select>

          <button
            onClick={exportIncidentsCsv}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition flex items-center space-x-1 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Incidents CSV</span>
          </button>

          <button
            onClick={exportSosCsv}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition flex items-center space-x-1 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export SOS CSV</span>
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Visual Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Incidents */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Total Logged Incidents
          </span>
          <p className="text-3xl font-black text-slate-900">{fIncidents.length}</p>
          <div className="text-xs text-slate-600">
            <strong>{severityCounts.Critical}</strong> Critical &bull; <strong>{severityCounts.High}</strong> High
          </div>
        </div>

        {/* SOS Resolution Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Active SOS Beacons
          </span>
          <p className="text-3xl font-black text-red-600">{fSos.length}</p>
          <div className="text-xs text-slate-600">
            <strong>{sosStatusCounts['Rescue In Progress']}</strong> in rescue &bull;{' '}
            <strong>{sosStatusCounts['Pending Triage']}</strong> awaiting dispatch
          </div>
        </div>

        {/* Medical Bed Utilization */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Hospital Bed Availability
          </span>
          <p className="text-3xl font-black text-blue-700">
            {freeHospitalBeds}
            <span className="text-sm text-slate-400 font-normal"> / {totalHospitalBeds}</span>
          </p>
          <div className="text-xs text-slate-600">
            {totalHospitalBeds > 0 ? Math.round((freeHospitalBeds / totalHospitalBeds) * 100) : 0}% surge reserve
          </div>
        </div>

        {/* Shelter Load */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Shelter Capacity In Use
          </span>
          <p className="text-3xl font-black text-teal-700">
            {totalShelterOccupancy}
            <span className="text-sm text-slate-400 font-normal"> / {totalShelterCapacity}</span>
          </p>
          <div className="text-xs text-slate-600">
            {totalShelterCapacity > 0 ? Math.round((totalShelterOccupancy / totalShelterCapacity) * 100) : 0}% occupancy
          </div>
        </div>
      </div>

      {/* Distribution Charts Visual Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hazards by Category Bar Representation */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900">
              Incidents Distributed By Hazard Category
            </h3>
            <span className="text-xs text-slate-400 font-mono">Count</span>
          </div>

          <div className="space-y-3 text-xs">
            {Object.entries(categoryCounts).map(([cat, count]) => {
              const pct = Math.round((count / Math.max(1, fIncidents.length)) * 100);
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between font-semibold text-slate-700">
                    <span>{cat}</span>
                    <span className="font-mono text-slate-900">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Severity & SOS Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900">
              Severity Distribution &amp; Triage Health
            </h3>
            <span className="text-xs text-slate-400 font-mono">Priority Tiers</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between font-semibold text-rose-800">
                <span>Critical Severity Hazards</span>
                <span className="font-mono">{severityCounts.Critical}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-rose-600 h-full rounded-full"
                  style={{ width: `${(severityCounts.Critical / Math.max(1, fIncidents.length)) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-semibold text-amber-800">
                <span>High Severity Hazards</span>
                <span className="font-mono">{severityCounts.High}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full"
                  style={{ width: `${(severityCounts.High / Math.max(1, fIncidents.length)) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-semibold text-blue-800">
                <span>Moderate Severity Hazards</span>
                <span className="font-mono">{severityCounts.Moderate}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full"
                  style={{ width: `${(severityCounts.Moderate / Math.max(1, fIncidents.length)) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-semibold text-slate-700">
                <span>Low Severity / Monitored</span>
                <span className="font-mono">{severityCounts.Low}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-slate-400 h-full rounded-full"
                  style={{ width: `${(severityCounts.Low / Math.max(1, fIncidents.length)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
