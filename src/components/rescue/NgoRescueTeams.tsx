import React, { useState } from 'react';
import {
  Users2,
  Shield,
  PhoneCall,
  MapPin,
  CheckCircle2,
  X,
  Compass,
  Anchor,
  Radio,
  Edit2,
} from 'lucide-react';
import { NgoRescueTeam } from '../../types';
import { api } from '../../services/api';

interface NgoRescueTeamsProps {
  teams: NgoRescueTeam[];
  onTeamsUpdated: () => void;
  activeDistrict: string;
}

export const NgoRescueTeams: React.FC<NgoRescueTeamsProps> = ({
  teams,
  onTeamsUpdated,
  activeDistrict,
}) => {
  const [selectedTeam, setSelectedTeam] = useState<NgoRescueTeam | null>(null);
  const [newStatus, setNewStatus] = useState<NgoRescueTeam['status']>('Available');
  const [newAssignment, setNewAssignment] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const filtered = activeDistrict === 'All Districts'
    ? teams
    : teams.filter((t) => t.district.toLowerCase() === activeDistrict.toLowerCase());

  const handleUpdateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam) return;

    await api.updateTeamStatus(selectedTeam.id, newStatus, newAssignment || 'Standby Readiness');
    setFeedback(`Team status updated for ${selectedTeam.name}.`);
    setSelectedTeam(null);
    onTeamsUpdated();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <Users2 className="w-5 h-5 text-emerald-600" />
            <span>NGOs &amp; Specialized Rescue Taskforces</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Coordination matrix for NDRF battalions, SDRF, Indian Coast Guard, and local coastal fishermen boat units.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="font-semibold text-slate-600">Active Taskforces:</span>
          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">
            {filtered.length} Units Operating
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

      {/* Grid of Teams */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((team) => (
          <div
            key={team.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                  {team.type}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    team.status === 'Deployed'
                      ? 'bg-rose-100 text-rose-800'
                      : team.status === 'Available'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {team.status}
                </span>
              </div>

              <h3 className="font-bold text-sm text-slate-900 leading-snug">{team.name}</h3>

              <div className="text-xs text-slate-600 space-y-1">
                <p className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Base: {team.district}</span>
                </p>
                <p className="flex items-center space-x-1">
                  <Shield className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Lead: {team.contactPerson}</span>
                </p>
                <p className="flex items-center space-x-1 font-mono text-[11px] text-slate-500">
                  <PhoneCall className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{team.contactPhone}</span>
                </p>
              </div>

              {/* Personnel count */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-500">Specialized Personnel:</span>
                <span className="font-black text-slate-900">{team.personnelCount} Rescuers</span>
              </div>

              {/* Current Assignment */}
              <div className="text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Mission:</span>
                <p className="text-slate-800 font-medium mt-0.5 bg-emerald-50/50 p-2 rounded-lg border border-emerald-100 text-[11px]">
                  {team.currentAssignment || 'On Standby Readiness in Barracks'}
                </p>
              </div>

              {/* Capabilities */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Capabilities:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {team.capabilities.map((c, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-medium text-slate-600"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[10px] font-mono text-slate-400">{team.lastUpdated}</span>
              <button
                onClick={() => {
                  setSelectedTeam(team);
                  setNewStatus(team.status);
                  setNewAssignment(team.currentAssignment || '');
                }}
                className="px-3 py-1.5 bg-slate-900 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] transition cursor-pointer"
              >
                Reassign / Update
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Reassign Modal */}
      {selectedTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <form
            onSubmit={handleUpdateTeam}
            className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4 text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Update Taskforce Deployment
              </h3>
              <button
                type="button"
                onClick={() => setSelectedTeam(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <p className="font-bold text-sm text-slate-800">{selectedTeam.name}</p>
              <p className="text-slate-500">Personnel Strength: {selectedTeam.personnelCount}</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Deployment Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as NgoRescueTeam['status'])}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="Available">Available (Standby)</option>
                  <option value="Deployed">Deployed (Active Mission)</option>
                  <option value="Standby">Standby (Staging Area)</option>
                  <option value="Resting">Resting (Post-Mission)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Mission Assignment</label>
                <input
                  type="text"
                  value={newAssignment}
                  onChange={(e) => setNewAssignment(e.target.value)}
                  placeholder="e.g. Inundation Evacuation at Saidapet Bridge"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedTeam(null)}
                className="px-4 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition cursor-pointer"
              >
                Save Assignment
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
