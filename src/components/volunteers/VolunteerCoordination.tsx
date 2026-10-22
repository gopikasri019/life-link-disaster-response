import React, { useState } from 'react';
import {
  UserCheck2,
  Award,
  PhoneCall,
  Clock,
  CheckCircle2,
  X,
  Edit,
  Plus,
  Briefcase,
  GraduationCap,
} from 'lucide-react';
import { Volunteer } from '../../types';
import { api } from '../../services/api';

interface VolunteerCoordinationProps {
  volunteers: Volunteer[];
  onVolunteersUpdated: () => void;
  activeDistrict: string;
}

export const VolunteerCoordination: React.FC<VolunteerCoordinationProps> = ({
  volunteers,
  onVolunteersUpdated,
  activeDistrict,
}) => {
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);
  const [taskText, setTaskText] = useState('');
  const [statusVal, setStatusVal] = useState<Volunteer['availabilityStatus']>('Available');
  const [feedback, setFeedback] = useState<string | null>(null);

  const filtered = activeDistrict === 'All Districts'
    ? volunteers
    : volunteers.filter((v) => v.district.toLowerCase() === activeDistrict.toLowerCase());

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVolunteer) return;

    await api.updateVolunteerTask(selectedVolunteer.id, taskText, statusVal);
    setFeedback(`Volunteer task updated for ${selectedVolunteer.name}.`);
    setSelectedVolunteer(null);
    onVolunteersUpdated();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <UserCheck2 className="w-5 h-5 text-emerald-600" />
            <span>Volunteer Force &amp; Student Taskforce Coordination</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Deployment roster for Easwari Engineering College student volunteers, certified first aiders, and community responders.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="font-semibold text-slate-600">Active Roster:</span>
          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">
            {filtered.length} Enrolled Responders
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

      {/* Roster Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((vol) => (
          <div
            key={vol.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 hover:shadow-md transition flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                  {vol.district}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    vol.availabilityStatus === 'On Shift'
                      ? 'bg-purple-100 text-purple-800'
                      : vol.availabilityStatus === 'Available'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {vol.availabilityStatus}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-sm text-slate-900">{vol.name}</h3>
                <p className="text-slate-500 text-xs font-mono flex items-center space-x-1 mt-0.5">
                  <PhoneCall className="w-3.5 h-3.5 text-slate-400" />
                  <span>{vol.contactPhone}</span>
                </p>
              </div>

              {/* Skills */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center space-x-1">
                  <Award className="w-3 h-3 text-emerald-600" />
                  <span>Certified Skills:</span>
                </p>
                <div className="flex flex-wrap gap-1">
                  {vol.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-medium border border-emerald-100"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Assigned Task */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-700">Current Task Assignment:</span>
                  <span className="font-mono text-slate-400">Shift: {vol.shiftStatus}</span>
                </div>
                <p className="text-slate-800 font-medium">
                  {vol.assignedTask || 'Awaiting dispatch assignment at volunteer assembly point.'}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-500">
                Tasks Completed: <strong>{vol.completedTasksCount}</strong>
              </span>

              <button
                onClick={() => {
                  setSelectedVolunteer(vol);
                  setTaskText(vol.assignedTask || '');
                  setStatusVal(vol.availabilityStatus);
                }}
                className="px-3 py-1.5 bg-slate-900 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] transition cursor-pointer"
              >
                Assign Task
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Task Assignment Modal */}
      {selectedVolunteer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <form
            onSubmit={handleSaveTask}
            className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4 text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Assign Volunteer Shift &amp; Task
              </h3>
              <button
                type="button"
                onClick={() => setSelectedVolunteer(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <p className="font-bold text-sm text-slate-800">{selectedVolunteer.name}</p>
              <p className="text-slate-500">Operating Base: {selectedVolunteer.district}</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Availability Status</label>
                <select
                  value={statusVal}
                  onChange={(e) => setStatusVal(e.target.value as Volunteer['availabilityStatus'])}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="On Shift">On Shift (Active Deployment)</option>
                  <option value="Available">Available (Standby)</option>
                  <option value="Unavailable">Unavailable</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Mission / Duty</label>
                <textarea
                  rows={3}
                  value={taskText}
                  onChange={(e) => setTaskText(e.target.value)}
                  placeholder="e.g. Field triage with NDRF Boat unit or food packaging..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedVolunteer(null)}
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
