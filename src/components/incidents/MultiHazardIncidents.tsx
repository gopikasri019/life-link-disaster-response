import React, { useState } from 'react';
import {
  Flame,
  Plus,
  Filter,
  Search,
  MapPin,
  Clock,
  Users,
  Shield,
  Edit3,
  CheckCircle2,
  X,
  Package,
  AlertTriangle,
  ChevronDown,
} from 'lucide-react';
import {
  HazardIncident,
  HazardCategory,
  SeverityLevel,
  IncidentStatus,
  UserRole,
} from '../../types';
import { api } from '../../services/api';

interface MultiHazardIncidentsProps {
  incidents: HazardIncident[];
  onIncidentUpdated: () => void;
  activeDistrict: string;
  userRole: UserRole;
  isCreateOpen?: boolean;
  onCloseCreate?: () => void;
}

export const MultiHazardIncidents: React.FC<MultiHazardIncidentsProps> = ({
  incidents,
  onIncidentUpdated,
  activeDistrict,
  userRole,
  isCreateOpen = false,
  onCloseCreate,
}) => {
  const [showModal, setShowModal] = useState(isCreateOpen);
  const [selectedIncident, setSelectedIncident] = useState<HazardIncident | null>(null);
  const [statusUpdateModal, setStatusUpdateModal] = useState<HazardIncident | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Form State for New Incident
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<HazardCategory>('Flood');
  const [severity, setSeverity] = useState<SeverityLevel>('High');
  const [district, setDistrict] = useState(activeDistrict !== 'All Districts' ? activeDistrict : 'Chennai');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [affectedPopulation, setAffectedPopulation] = useState<number>(1000);
  const [assignedTeam, setAssignedTeam] = useState('NDRF Coastal Taskforce');

  // Resources
  const [foodPackets, setFoodPackets] = useState(2000);
  const [drinkingWaterLiters, setDrinkingWaterLiters] = useState(5000);
  const [medicalKits, setMedicalKits] = useState(100);
  const [rescueBoats, setRescueBoats] = useState(4);
  const [shelterTents, setShelterTents] = useState(25);
  const [ambulances, setAmbulances] = useState(2);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Status edit state
  const [newStatus, setNewStatus] = useState<IncidentStatus>('Active');
  const [newAssignedTeam, setNewAssignedTeam] = useState('');

  const hazardCategories: HazardCategory[] = [
    'Flood',
    'Cyclone',
    'Tsunami',
    'Earthquake',
    'Landslide',
    'Heavy rainfall',
    'Drought',
    'Epidemic and disease outbreaks',
    'Industrial accidents',
    'Other emergencies',
  ];

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Title is required';
    if (!location.trim()) errs.location = 'Location description is required';
    if (!description.trim()) errs.description = 'Incident description is required';
    if (affectedPopulation < 0) errs.affectedPopulation = 'Affected population cannot be negative';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      let lat = 13.0827;
      let lng = 80.2707;
      if (district === 'Cuddalore') {
        lat = 11.748;
        lng = 79.7714;
      } else if (district === 'Nagapattinam') {
        lat = 10.7656;
        lng = 79.8436;
      } else if (district === 'Tiruvallur') {
        lat = 13.1438;
        lng = 79.9079;
      }

      await api.createIncident({
        title,
        description,
        category,
        severity,
        district,
        location,
        latitude: lat + (Math.random() - 0.5) * 0.04,
        longitude: lng + (Math.random() - 0.5) * 0.04,
        affectedPopulation,
        status: 'Reported',
        assignedTeam,
        requiredResources: {
          foodPackets,
          drinkingWaterLiters,
          medicalKits,
          rescueBoats,
          shelterTents,
          ambulances,
        },
      });

      setShowModal(false);
      if (onCloseCreate) onCloseCreate();
      onIncidentUpdated();
      // Reset form
      setTitle('');
      setLocation('');
      setDescription('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!statusUpdateModal) return;
    await api.updateIncidentStatus(statusUpdateModal.id, newStatus, newAssignedTeam || statusUpdateModal.assignedTeam);
    setStatusUpdateModal(null);
    onIncidentUpdated();
  };

  const filtered = incidents.filter((inc) => {
    if (activeDistrict !== 'All Districts' && inc.district.toLowerCase() !== activeDistrict.toLowerCase()) {
      return false;
    }
    if (categoryFilter !== 'ALL' && inc.category !== categoryFilter) return false;
    if (severityFilter !== 'ALL' && inc.severity !== severityFilter) return false;
    if (statusFilter !== 'ALL' && inc.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        inc.title.toLowerCase().includes(q) ||
        inc.location.toLowerCase().includes(q) ||
        inc.id.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <Flame className="w-5 h-5 text-rose-600" />
            <span>Multi-Hazard Incident Directory</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time tracking of storm surge, cyclonic landfall, industrial spill, and waterborne outbreaks.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center space-x-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Declare New Hazard Incident</span>
        </button>
      </div>

      {/* Filter Ribbon */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search incident title, location, or ID..."
            className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-2 rounded-xl border border-slate-300 bg-white font-medium text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            {hazardCategories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Severity */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-2.5 py-2 rounded-xl border border-slate-300 bg-white font-medium text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Moderate">Moderate</option>
            <option value="Low">Low</option>
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-2 rounded-xl border border-slate-300 bg-white font-medium text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="Reported">Reported</option>
            <option value="Verified">Verified</option>
            <option value="Active">Active</option>
            <option value="Response Underway">Response Underway</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Incidents Table / Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="p-3.5">ID / Reported</th>
                <th className="p-3.5">Incident Title &amp; Description</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">District &amp; Location</th>
                <th className="p-3.5">Severity</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Assigned Response</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No matching incidents found for the selected filter.
                  </td>
                </tr>
              ) : (
                filtered.map((inc) => (
                  <tr key={inc.id} className="hover:bg-slate-50 transition">
                    <td className="p-3.5 font-mono text-[11px] text-slate-500">
                      <div className="font-bold text-slate-800">{inc.id}</div>
                      <div>{inc.reportedAt}</div>
                    </td>
                    <td className="p-3.5 max-w-xs">
                      <div className="font-bold text-slate-900 line-clamp-1">{inc.title}</div>
                      <div className="text-slate-500 text-[11px] line-clamp-2 mt-0.5">
                        {inc.description}
                      </div>
                    </td>
                    <td className="p-3.5 font-medium text-slate-700">{inc.category}</td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-800">{inc.district}</div>
                      <div className="text-[11px] text-slate-500">{inc.location}</div>
                    </td>
                    <td className="p-3.5">
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
                    <td className="p-3.5">
                      <span className="font-bold text-slate-700">{inc.status}</span>
                    </td>
                    <td className="p-3.5 text-slate-600 font-medium">
                      {inc.assignedTeam || <span className="text-slate-400 italic">Unassigned</span>}
                    </td>
                    <td className="p-3.5 text-right space-x-1">
                      <button
                        onClick={() => setSelectedIncident(inc)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition cursor-pointer"
                      >
                        Inspect
                      </button>
                      <button
                        onClick={() => {
                          setStatusUpdateModal(inc);
                          setNewStatus(inc.status);
                          setNewAssignedTeam(inc.assignedTeam || '');
                        }}
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg font-semibold transition cursor-pointer"
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                  {selectedIncident.id}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  {selectedIncident.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500">Category:</span>{' '}
                <span className="font-bold text-slate-800">{selectedIncident.category}</span>
              </div>
              <div>
                <span className="text-slate-500">Severity:</span>{' '}
                <span className="font-bold text-rose-600">{selectedIncident.severity}</span>
              </div>
              <div>
                <span className="text-slate-500">District:</span>{' '}
                <span className="font-bold text-slate-800">{selectedIncident.district}</span>
              </div>
              <div>
                <span className="text-slate-500">Location:</span>{' '}
                <span className="font-bold text-slate-800">{selectedIncident.location}</span>
              </div>
              <div>
                <span className="text-slate-500">Reported Time:</span>{' '}
                <span className="font-bold text-slate-800">{selectedIncident.reportedAt}</span>
              </div>
              <div>
                <span className="text-slate-500">Affected Population:</span>{' '}
                <span className="font-bold text-slate-800 font-mono">
                  {selectedIncident.affectedPopulation.toLocaleString()} citizens
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500">Assigned Response Team:</span>{' '}
                <span className="font-bold text-emerald-700">{selectedIncident.assignedTeam}</span>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500">Full Description</p>
              <p className="text-xs text-slate-700 mt-1 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
                {selectedIncident.description}
              </p>
            </div>

            {/* Required Resources Checklist */}
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                <Package className="w-4 h-4 text-emerald-600" />
                <span>Estimated Required Emergency Relief Consignments</span>
              </p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 text-[10px]">Food Packets</span>
                  <p className="font-bold text-slate-900">{selectedIncident.requiredResources.foodPackets} pkts</p>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 text-[10px]">Drinking Water</span>
                  <p className="font-bold text-slate-900">{selectedIncident.requiredResources.drinkingWaterLiters} L</p>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 text-[10px]">Medical Trauma Kits</span>
                  <p className="font-bold text-slate-900">{selectedIncident.requiredResources.medicalKits} kits</p>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 text-[10px]">Rescue Boats</span>
                  <p className="font-bold text-slate-900">{selectedIncident.requiredResources.rescueBoats} units</p>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 text-[10px]">Emergency Tents</span>
                  <p className="font-bold text-slate-900">{selectedIncident.requiredResources.shelterTents} units</p>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 text-[10px]">Ambulances</span>
                  <p className="font-bold text-slate-900">{selectedIncident.requiredResources.ambulances} vehicles</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedIncident(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STATUS UPDATE MODAL */}
      {statusUpdateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Update Incident Triage &amp; Assignment
            </h3>
            <p className="text-xs text-slate-500">
              Change deployment phase for {statusUpdateModal.id} &mdash; {statusUpdateModal.title}
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status Phase</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as IncidentStatus)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="Reported">Reported</option>
                  <option value="Verified">Verified</option>
                  <option value="Active">Active</option>
                  <option value="Response Underway">Response Underway</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Team / Unit</label>
                <input
                  type="text"
                  value={newAssignedTeam}
                  onChange={(e) => setNewAssignedTeam(e.target.value)}
                  placeholder="e.g. NDRF 04 Battalion / SDRF / Coast Guard"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setStatusUpdateModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition cursor-pointer"
              >
                Commit Status Change
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DECLARE NEW INCIDENT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <form
            onSubmit={handleCreateIncident}
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-fade-in"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Flame className="w-5 h-5 text-rose-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Declare Multi-Hazard Incident
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  if (onCloseCreate) onCloseCreate();
                }}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Incident Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Chembarambakkam Surplus Overflow Inundation"
                  className={`w-full px-3 py-2 rounded-xl border ${
                    formErrors.title ? 'border-red-400 bg-red-50' : 'border-slate-300'
                  }`}
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Hazard Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as HazardCategory)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                >
                  {hazardCategories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Severity Tier</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as SeverityLevel)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">District</label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="Chennai">Chennai</option>
                  <option value="Cuddalore">Cuddalore</option>
                  <option value="Nagapattinam">Nagapattinam</option>
                  <option value="Tiruvallur">Tiruvallur</option>
                  <option value="Kancheepuram">Kancheepuram</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Location Details *</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Saidapet Riverbed / Jafferkhanpet"
                  className={`w-full px-3 py-2 rounded-xl border ${
                    formErrors.location ? 'border-red-400 bg-red-50' : 'border-slate-300'
                  }`}
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Estimated Affected Population</label>
                <input
                  type="number"
                  value={affectedPopulation}
                  onChange={(e) => setAffectedPopulation(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Response Team</label>
                <input
                  type="text"
                  value={assignedTeam}
                  onChange={(e) => setAssignedTeam(e.target.value)}
                  placeholder="e.g. NDRF 04 Battalion"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Description &amp; On-Ground Situation *</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details of breach, water level, access routes..."
                  className={`w-full px-3 py-2 rounded-xl border ${
                    formErrors.description ? 'border-red-400 bg-red-50' : 'border-slate-300'
                  }`}
                />
              </div>
            </div>

            {/* Estimated Resources */}
            <div className="border-t border-slate-100 pt-3 space-y-2">
              <p className="text-xs font-bold text-slate-700">Initial Required Relief Resources</p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 text-[10px]">Food Packets</span>
                  <input
                    type="number"
                    value={foodPackets}
                    onChange={(e) => setFoodPackets(parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1 rounded border border-slate-300"
                  />
                </div>
                <div>
                  <span className="text-slate-500 text-[10px]">Water (Liters)</span>
                  <input
                    type="number"
                    value={drinkingWaterLiters}
                    onChange={(e) => setDrinkingWaterLiters(parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1 rounded border border-slate-300"
                  />
                </div>
                <div>
                  <span className="text-slate-500 text-[10px]">Medical Kits</span>
                  <input
                    type="number"
                    value={medicalKits}
                    onChange={(e) => setMedicalKits(parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1 rounded border border-slate-300"
                  />
                </div>
                <div>
                  <span className="text-slate-500 text-[10px]">Rescue Boats</span>
                  <input
                    type="number"
                    value={rescueBoats}
                    onChange={(e) => setRescueBoats(parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1 rounded border border-slate-300"
                  />
                </div>
                <div>
                  <span className="text-slate-500 text-[10px]">Shelter Tents</span>
                  <input
                    type="number"
                    value={shelterTents}
                    onChange={(e) => setShelterTents(parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1 rounded border border-slate-300"
                  />
                </div>
                <div>
                  <span className="text-slate-500 text-[10px]">Ambulances</span>
                  <input
                    type="number"
                    value={ambulances}
                    onChange={(e) => setAmbulances(parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1 rounded border border-slate-300"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  if (onCloseCreate) onCloseCreate();
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition cursor-pointer"
              >
                {isSubmitting ? 'Registering...' : 'Register Incident'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
