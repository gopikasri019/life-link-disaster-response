import React, { useState } from 'react';
import {
  Cpu,
  Package,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Truck,
  Building2,
  Calendar,
  Flame,
  ShieldCheck,
  Send,
  X,
  Compass,
} from 'lucide-react';
import {
  HazardIncident,
  ReliefDepot,
  ResourceAllocation,
  SeverityLevel,
} from '../../types';
import { api } from '../../services/api';

interface SmartResourceAllocationProps {
  incidents: HazardIncident[];
  depots: ReliefDepot[];
  allocations: ResourceAllocation[];
  onAllocationCommitted: () => void;
  activeDistrict: string;
}

export const SmartResourceAllocation: React.FC<SmartResourceAllocationProps> = ({
  incidents,
  depots,
  allocations,
  onAllocationCommitted,
  activeDistrict,
}) => {
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(incidents[0]?.id || '');
  const [selectedDepotId, setSelectedDepotId] = useState<string>(depots[0]?.id || '');
  const [resourceName, setResourceName] = useState<string>('Ready-to-Eat Food Packets (Chapati/Pongal Meal)');
  const [quantity, setQuantity] = useState<number>(1000);
  const [unit, setUnit] = useState<string>('Packets');
  const [assignedTeam, setAssignedTeam] = useState<string>('NDRF Ground Supply Truck');
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedIncident = incidents.find((i) => i.id === selectedIncidentId) || incidents[0];
  const selectedDepot = depots.find((d) => d.id === selectedDepotId) || depots[0];

  // Find available quantity in selected depot
  const depotInventoryItem = selectedDepot?.inventory.find(
    (item) => item.name.toLowerCase() === resourceName.toLowerCase() || item.name.includes(resourceName)
  );
  const availableStock = depotInventoryItem ? depotInventoryItem.quantity : 0;

  // Transparent rule-based triage priority explanation
  const calculatePriorityReason = (incident?: HazardIncident) => {
    if (!incident) return 'Routine buffer stock prepositioning';
    if (incident.severity === 'Critical') {
      return `Priority Tier 1: Severe life-threatening risk in ${incident.location} with ${incident.affectedPopulation.toLocaleString()} citizens threatened by ${incident.category}. Immediate dispatch mandatory.`;
    }
    if (incident.severity === 'High') {
      return `Priority Tier 2: Rising water / storm ingress in ${incident.district}. Pre-emptive relief delivery before road links submerge.`;
    }
    return `Priority Tier 3: Standard humanitarian replenishing for relief center kitchens.`;
  };

  const handleCommitAllocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncident || !selectedDepot) return;

    if (quantity <= 0) {
      setStatusMessage({ text: 'Quantity must be greater than zero.', isError: true });
      return;
    }

    if (quantity > availableStock) {
      setStatusMessage({
        text: `Cannot allocate ${quantity} ${unit}. Only ${availableStock} ${unit} available in ${selectedDepot.name}. Allocation aborted to protect inventory integrity.`,
        isError: true,
      });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    // Approximate distance calculation
    const distanceKm = Number(
      (
        Math.hypot(
          (selectedIncident.latitude - selectedDepot.latitude) * 111,
          (selectedIncident.longitude - selectedDepot.longitude) * 105
        ) || 5
      ).toFixed(1)
    );

    const reason = calculatePriorityReason(selectedIncident);

    const result = await api.createAllocation(
      selectedIncident.id,
      selectedIncident.title,
      selectedDepot.id,
      selectedDepot.name,
      resourceName,
      quantity,
      unit,
      selectedIncident.severity,
      reason,
      assignedTeam,
      distanceKm
    );

    setIsSubmitting(false);
    if (result.success) {
      setStatusMessage({ text: result.message, isError: false });
      onAllocationCommitted();
    } else {
      setStatusMessage({ text: result.message, isError: true });
    }
  };

  const handleUpdateStatus = async (allocId: string, status: ResourceAllocation['status']) => {
    await api.createAllocation('', '', '', '', '', 0, '', 'Low', '', '', 0); // Trigger check
    const list = allocations.map((a) => (a.id === allocId ? { ...a, status } : a));
    // update via storage engine
    const found = allocations.find((a) => a.id === allocId);
    if (found) {
      found.status = status;
      onAllocationCommitted();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-emerald-600" />
            <span>Smart Resource Allocation &amp; Matching Engine</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Rule-based algorithmic matching prioritizing life-threatening incidents, proximity, and inventory constraints.
          </p>
        </div>

        <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
          Enforcing Non-Negative Stock Invariant
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs font-semibold ${
            statusMessage.isError
              ? 'bg-rose-50 border-rose-300 text-rose-900'
              : 'bg-emerald-50 border-emerald-300 text-emerald-900'
          }`}
        >
          <div className="flex items-center space-x-2">
            {statusMessage.isError ? (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-slate-500 hover:text-slate-800 cursor-pointer ml-3"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Allocation Rule Dispatch Studio */}
      <form
        onSubmit={handleCommitAllocation}
        className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">
              Create Validated Stock Allocation
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Transaction Code: AUTO-ALC-TN
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* 1. Target Incident */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              1. Target Incident &amp; Severity *
            </label>
            <select
              value={selectedIncidentId}
              onChange={(e) => setSelectedIncidentId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {incidents.map((i) => (
                <option key={i.id} value={i.id}>
                  [{i.severity}] {i.district} &mdash; {i.title.substring(0, 36)}...
                </option>
              ))}
            </select>
            {selectedIncident && (
              <div className="mt-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span>Affected Population:</span>
                  <span className="font-bold text-slate-800">{selectedIncident.affectedPopulation.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Priority Tier:</span>
                  <span className="font-bold text-rose-600">{selectedIncident.severity}</span>
                </div>
              </div>
            )}
          </div>

          {/* 2. Source Depot */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              2. Source Supply Warehouse *
            </label>
            <select
              value={selectedDepotId}
              onChange={(e) => setSelectedDepotId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {depots.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.district})
                </option>
              ))}
            </select>
            {selectedDepot && (
              <div className="mt-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span>Available In Stock:</span>
                  <span className={`font-bold ${availableStock < quantity ? 'text-rose-600' : 'text-emerald-700'}`}>
                    {availableStock} {unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Warehouse District:</span>
                  <span className="font-semibold text-slate-800">{selectedDepot.district}</span>
                </div>
              </div>
            )}
          </div>

          {/* 3. Resource Line Item */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              3. Resource Category / Item *
            </label>
            <select
              value={resourceName}
              onChange={(e) => {
                setResourceName(e.target.value);
                if (e.target.value.includes('Water')) setUnit('Liters');
                else if (e.target.value.includes('Boat') || e.target.value.includes('Tent')) setUnit('Units');
                else if (e.target.value.includes('Kit')) setUnit('Kits');
                else setUnit('Packets');
              }}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="Ready-to-Eat Food Packets (Chapati/Pongal Meal)">Food: Ready-to-Eat Meals (Packets)</option>
              <option value="Packaged Mineral Water (1L Bottled)">Clean Water: Bottled Water (Liters)</option>
              <option value="Comprehensive Trauma & First Aid Kit">Medical: First Aid Kits</option>
              <option value="Rigid Inflatable Motorized Rescue Boats (with 40HP OBM)">Rescue: Motorized Rescue Boats</option>
              <option value="Waterproof All-Weather Relief Family Tents (10-Person)">Shelter: Relief Tents</option>
              <option value="Emergency Life Jackets (SOLAS Certified)">Safety: Life Jackets</option>
            </select>

            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <label className="text-[10px] text-slate-500">Dispatch Qty</label>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500">Assigned Team</label>
                <input
                  type="text"
                  value={assignedTeam}
                  onChange={(e) => setAssignedTeam(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Priority Reason Explanation Box */}
        <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200 text-xs space-y-1">
          <div className="font-bold text-emerald-950 flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Algorithmic Priority &amp; Triage Rationale</span>
          </div>
          <p className="text-emerald-900 leading-relaxed">
            {calculatePriorityReason(selectedIncident)}
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-slate-500">
            {availableStock < quantity ? (
              <span className="text-rose-600 font-bold">
                Exceeds stock: Requested {quantity} &gt; Available {availableStock}
              </span>
            ) : (
              <span className="text-emerald-700 font-semibold">
                Sufficient stock available ({availableStock - quantity} {unit} will remain in depot)
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || availableStock < quantity}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold shadow-sm transition flex items-center space-x-1.5 cursor-pointer ${
              availableStock < quantity
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Verifying & Committing...' : 'Commit Dispatch & Deduct Stock'}</span>
          </button>
        </div>
      </form>

      {/* Allocations History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900">
            Active Dispatches &amp; Allocation Ledgers
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            {allocations.length} records in ledger
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="p-3">ID / Time</th>
                <th className="p-3">Consignment Item</th>
                <th className="p-3">Source Warehouse</th>
                <th className="p-3">Target Incident</th>
                <th className="p-3">Quantity</th>
                <th className="p-3">Priority Reason</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allocations.map((alc) => (
                <tr key={alc.id} className="hover:bg-slate-50">
                  <td className="p-3 font-mono text-[11px] text-slate-500">
                    <div className="font-bold text-slate-800">{alc.id}</div>
                    <div>{alc.timestamp}</div>
                  </td>
                  <td className="p-3 font-bold text-slate-800">{alc.resourceName}</td>
                  <td className="p-3 text-slate-600">{alc.depotName}</td>
                  <td className="p-3 text-slate-700 max-w-xs truncate">{alc.incidentTitle}</td>
                  <td className="p-3 font-mono font-bold text-slate-800">
                    {alc.quantity.toLocaleString()} {alc.unit}
                  </td>
                  <td className="p-3 text-slate-500 max-w-xs text-[11px] line-clamp-2">
                    {alc.reason}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        alc.status === 'Delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : alc.status === 'Dispatched'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {alc.status}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-1">
                    {alc.status !== 'Delivered' && (
                      <button
                        onClick={() => handleUpdateStatus(alc.id, 'Delivered')}
                        className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded cursor-pointer transition"
                      >
                        Mark Delivered
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
