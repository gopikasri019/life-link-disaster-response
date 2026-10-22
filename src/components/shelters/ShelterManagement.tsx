import React, { useState } from 'react';
import {
  Home,
  Users,
  MapPin,
  PhoneCall,
  CheckCircle2,
  AlertTriangle,
  X,
  Edit3,
  Accessibility,
  Coffee,
} from 'lucide-react';
import { Shelter } from '../../types';
import { api } from '../../services/api';

interface ShelterManagementProps {
  shelters: Shelter[];
  onSheltersUpdated: () => void;
  activeDistrict: string;
}

export const ShelterManagement: React.FC<ShelterManagementProps> = ({
  shelters,
  onSheltersUpdated,
  activeDistrict,
}) => {
  const [selectedShelter, setSelectedShelter] = useState<Shelter | null>(null);
  const [editOccupancy, setEditOccupancy] = useState<number>(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const filtered = activeDistrict === 'All Districts'
    ? shelters
    : shelters.filter((s) => s.district.toLowerCase() === activeDistrict.toLowerCase());

  const handleUpdateOccupancy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShelter) return;

    if (editOccupancy < 0) {
      setErrorMsg('Occupancy cannot be negative.');
      return;
    }
    if (editOccupancy > selectedShelter.capacity * 1.25) {
      setErrorMsg(`Occupancy exceeds emergency structural safety limit (${Math.round(selectedShelter.capacity * 1.25)}).`);
      return;
    }

    const res = await api.updateShelterOccupancy(selectedShelter.id, editOccupancy);
    if (res.success) {
      setFeedback(`Occupancy updated for ${selectedShelter.name}.`);
      setSelectedShelter(null);
      setErrorMsg(null);
      onSheltersUpdated();
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <Home className="w-5 h-5 text-emerald-600" />
            <span>Evacuation Shelters &amp; Relief Centers</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time monitoring of community halls, cyclone shelters, sanitation, and dietary supplies.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="font-semibold text-slate-600">Total Shelters:</span>
          <span className="px-2.5 py-1 rounded-full bg-teal-100 text-teal-800 font-bold">
            {filtered.length} Open
          </span>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((shelter) => {
          const occupancyPercent = Math.min(
            100,
            Math.round((shelter.occupancy / shelter.capacity) * 100)
          );
          const remaining = Math.max(0, shelter.capacity - shelter.occupancy);

          return (
            <div
              key={shelter.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                    {shelter.district}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      shelter.status === 'Full'
                        ? 'bg-rose-100 text-rose-800'
                        : shelter.status === 'Near Capacity'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {shelter.status}
                  </span>
                </div>

                <h3 className="font-bold text-base text-slate-900">{shelter.name}</h3>

                <p className="text-xs text-slate-500 flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{shelter.location}</span>
                </p>

                {/* Capacity Progress Bar */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-600">Current Occupancy:</span>
                    <span className="font-bold text-slate-900">
                      {shelter.occupancy} / {shelter.capacity} evacuees ({occupancyPercent}%)
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        occupancyPercent >= 90
                          ? 'bg-rose-600'
                          : occupancyPercent >= 75
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${occupancyPercent}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                    <span>Remaining Headroom: <strong>{remaining} beds</strong></span>
                    <span>Safety Margin: 25%</span>
                  </div>
                </div>

                {/* Facilities */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Facilities on-site:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {shelter.facilities.map((f, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-100 text-[10px] text-slate-700">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Special assistance */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center space-x-1">
                    <Accessibility className="w-3 h-3 text-emerald-600" />
                    <span>Special Assistance &amp; Vulnerable Care:</span>
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {shelter.specialAssistance.map((s, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-100">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-mono text-[11px]">{shelter.contactPhone}</span>
                <button
                  onClick={() => {
                    setSelectedShelter(shelter);
                    setEditOccupancy(shelter.occupancy);
                    setErrorMsg(null);
                  }}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs transition cursor-pointer"
                >
                  Update Headcount
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Occupancy Modal */}
      {selectedShelter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <form
            onSubmit={handleUpdateOccupancy}
            className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4 text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Update Shelter Headcount
              </h3>
              <button
                type="button"
                onClick={() => setSelectedShelter(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <p className="font-bold text-sm text-slate-800">{selectedShelter.name}</p>
              <p className="text-slate-500">Design Capacity: {selectedShelter.capacity} evacuees</p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-semibold">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Verified Headcount / Occupancy *
              </label>
              <input
                type="number"
                min={0}
                max={selectedShelter.capacity * 2}
                value={editOccupancy}
                onChange={(e) => setEditOccupancy(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-sm"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedShelter(null)}
                className="px-4 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition cursor-pointer"
              >
                Save Headcount
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
