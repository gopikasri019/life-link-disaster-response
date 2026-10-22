import React, { useState } from 'react';
import {
  HeartPulse,
  PhoneCall,
  MapPin,
  Ambulance,
  AlertTriangle,
  CheckCircle2,
  X,
  Edit,
  Activity,
  Info,
} from 'lucide-react';
import { Hospital } from '../../types';
import { api } from '../../services/api';

interface HospitalBedsManagementProps {
  hospitals: Hospital[];
  onHospitalsUpdated: () => void;
  activeDistrict: string;
}

export const HospitalBedsManagement: React.FC<HospitalBedsManagementProps> = ({
  hospitals,
  onHospitalsUpdated,
  activeDistrict,
}) => {
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [editAvailableBeds, setEditAvailableBeds] = useState<number>(0);
  const [editIcuAvailable, setEditIcuAvailable] = useState<number>(0);
  const [modalError, setModalError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const filtered = activeDistrict === 'All Districts'
    ? hospitals
    : hospitals.filter((h) => h.district.toLowerCase() === activeDistrict.toLowerCase());

  const handleOpenEdit = (h: Hospital) => {
    setSelectedHospital(h);
    setEditAvailableBeds(h.availableBeds);
    setEditIcuAvailable(h.icuAvailable);
    setModalError(null);
  };

  const handleSaveBeds = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHospital) return;

    if (editAvailableBeds < 0 || editAvailableBeds > selectedHospital.totalBeds) {
      setModalError(`Available general beds must be between 0 and total capacity (${selectedHospital.totalBeds}).`);
      return;
    }

    if (editIcuAvailable < 0 || editIcuAvailable > selectedHospital.icuTotal) {
      setModalError(`Available ICU beds must be between 0 and total ICU capacity (${selectedHospital.icuTotal}).`);
      return;
    }

    const res = await api.updateHospitalBeds(selectedHospital.id, editAvailableBeds, editIcuAvailable);
    if (res.success) {
      setFeedback(`Hospital beds updated for ${selectedHospital.name}.`);
      setSelectedHospital(null);
      onHospitalsUpdated();
    } else {
      setModalError(res.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <HeartPulse className="w-5 h-5 text-rose-600" />
            <span>Hospitals &amp; Critical Medical Bed Capacity</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time ICU, trauma ward, and emergency ambulance readiness for casualty routing.
          </p>
        </div>

        <div className="text-xs p-2 px-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl flex items-center space-x-1.5">
          <Info className="w-3.5 h-3.5 text-blue-700 shrink-0" />
          <span>Validated: Available beds cannot exceed total hospital capacity.</span>
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

      {/* Hospital Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((hosp) => {
          const bedOccupancyPercent = Math.round(
            ((hosp.totalBeds - hosp.availableBeds) / hosp.totalBeds) * 100
          );
          const icuOccupancyPercent = Math.round(
            ((hosp.icuTotal - hosp.icuAvailable) / hosp.icuTotal) * 100
          );
          const isCritical = hosp.availableBeds <= 100 || hosp.icuAvailable <= 5;

          return (
            <div
              key={hosp.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                    {hosp.district}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      hosp.medicalSuppliesStatus === 'Adequate'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    Supplies: {hosp.medicalSuppliesStatus}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 leading-snug">{hosp.name}</h3>

                <p className="text-xs text-slate-500 flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{hosp.location}</span>
                </p>

                <p className="text-xs text-slate-500 flex items-center space-x-1 font-mono">
                  <PhoneCall className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{hosp.contactPhone}</span>
                </p>

                {/* Capacity Gauges */}
                <div className="pt-2 space-y-3">
                  {/* General Beds */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-600">General Beds Free:</span>
                      <span className="text-slate-900 font-bold">
                        {hosp.availableBeds} / {hosp.totalBeds} ({100 - bedOccupancyPercent}% Free)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          bedOccupancyPercent > 85 ? 'bg-rose-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${bedOccupancyPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* ICU Beds */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-600">ICU Beds Free:</span>
                      <span className="text-rose-700 font-bold">
                        {hosp.icuAvailable} / {hosp.icuTotal} Free
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          icuOccupancyPercent > 85 ? 'bg-rose-600' : 'bg-blue-500'
                        }`}
                        style={{ width: `${icuOccupancyPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Facilities Tags */}
                <div className="pt-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Emergency Facilities:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {hosp.emergencyFacilities.map((fac, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-[10px] font-medium text-slate-600"
                      >
                        {fac}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1 text-slate-600 font-medium">
                  <Ambulance className="w-4 h-4 text-emerald-600" />
                  <span>{hosp.ambulanceAvailable} Ambulances</span>
                </div>

                <button
                  onClick={() => handleOpenEdit(hosp)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] transition cursor-pointer"
                >
                  Update Capacity
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Bed Modal */}
      {selectedHospital && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <form
            onSubmit={handleSaveBeds}
            className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4 text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Update Live Hospital Bed Capacity
              </h3>
              <button
                type="button"
                onClick={() => setSelectedHospital(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <p className="font-bold text-sm text-slate-800">{selectedHospital.name}</p>
              <p className="text-slate-500">{selectedHospital.district} &bull; Total Bed Cap: {selectedHospital.totalBeds}</p>
            </div>

            {modalError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-semibold">
                {modalError}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Available General Beds (Max {selectedHospital.totalBeds}) *
                </label>
                <input
                  type="number"
                  min={0}
                  max={selectedHospital.totalBeds}
                  value={editAvailableBeds}
                  onChange={(e) => setEditAvailableBeds(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Available ICU Beds (Max {selectedHospital.icuTotal}) *
                </label>
                <input
                  type="number"
                  min={0}
                  max={selectedHospital.icuTotal}
                  value={editIcuAvailable}
                  onChange={(e) => setEditIcuAvailable(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedHospital(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition cursor-pointer"
              >
                Commit Bed Status
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
