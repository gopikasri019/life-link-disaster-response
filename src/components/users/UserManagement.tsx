import React, { useState } from 'react';
import {
  Users,
  Shield,
  UserCheck,
  Lock,
  Key,
  CheckCircle2,
  AlertCircle,
  Building2,
  Mail,
  PhoneCall,
} from 'lucide-react';
import { User, UserRole } from '../../types';

interface UserManagementProps {
  users: User[];
  currentUser: User;
  onRoleSwitch: (role: UserRole) => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({
  users,
  currentUser,
  onRoleSwitch,
}) => {
  const rolePermissions: Record<
    UserRole,
    { title: string; desc: string; canDeclareIncident: boolean; canAssignTeams: boolean; canManageDepot: boolean; canUpdateBeds: boolean }
  > = {
    ADMIN: {
      title: 'Government Official / Disaster Commissioner',
      desc: 'Full administrative privileges: declare incidents, allocate resources, override assignments, manage backend settings.',
      canDeclareIncident: true,
      canAssignTeams: true,
      canManageDepot: true,
      canUpdateBeds: true,
    },
    CITIZEN: {
      title: 'Public Citizen',
      desc: 'Public portal access: transmit emergency SOS beacons, query live tracking tickets, view safety advisories.',
      canDeclareIncident: false,
      canAssignTeams: false,
      canManageDepot: false,
      canUpdateBeds: false,
    },
    HOSPITAL: {
      title: 'Hospital Medical Superintendent',
      desc: 'Healthcare authority: update live general and ICU bed occupancy, report ambulance counts, log medical supplies.',
      canDeclareIncident: false,
      canAssignTeams: false,
      canManageDepot: false,
      canUpdateBeds: true,
    },
    NGO: {
      title: 'NGO Relief Coordinator',
      desc: 'Logistics and field leadership: coordinate rescue squads, request warehouse dispatches, manage temporary camp feeding.',
      canDeclareIncident: true,
      canAssignTeams: true,
      canManageDepot: true,
      canUpdateBeds: false,
    },
    VOLUNTEER: {
      title: 'First Responder / Student Volunteer',
      desc: 'Field response operations: accept shift assignments, record task completions, report on-ground water levels.',
      canDeclareIncident: false,
      canAssignTeams: false,
      canManageDepot: false,
      canUpdateBeds: false,
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <Users className="w-5 h-5 text-emerald-600" />
            <span>Role-Based Access Control &amp; User Accounts</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Security boundary enforcement for state administrators, medical superintendents, NGOs, and citizens.
          </p>
        </div>

        <div className="text-xs px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-semibold">
          Active Identity: {currentUser.name} ({currentUser.role})
        </div>
      </div>

      {/* User Directory */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900">
            Registered System Personnel Profiles
          </h3>
          <span className="text-xs text-slate-400">
            Click &ldquo;Switch Role&rdquo; to simulate RBAC permissions
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="p-3.5">User / UID</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">Jurisdiction / District</th>
                <th className="p-3.5">Organization</th>
                <th className="p-3.5">Contact Email</th>
                <th className="p-3.5 text-right">Switch Identity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => {
                const isCurrent = currentUser.role === u.role;
                return (
                  <tr key={u.id} className={isCurrent ? 'bg-emerald-50/40' : 'hover:bg-slate-50'}>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{u.name}</div>
                      <div className="font-mono text-[10px] text-slate-400">{u.id}</div>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          u.role === 'ADMIN'
                            ? 'bg-purple-100 text-purple-800'
                            : u.role === 'HOSPITAL'
                            ? 'bg-blue-100 text-blue-800'
                            : u.role === 'NGO'
                            ? 'bg-amber-100 text-amber-800'
                            : u.role === 'VOLUNTEER'
                            ? 'bg-teal-100 text-teal-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-700 font-medium">{u.district}</td>
                    <td className="p-3.5 text-slate-600">{u.organization || 'General Public'}</td>
                    <td className="p-3.5 font-mono text-slate-500 text-[11px]">{u.email}</td>
                    <td className="p-3.5 text-right">
                      {isCurrent ? (
                        <span className="text-xs font-bold text-emerald-700 flex items-center justify-end space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Active Role</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => onRoleSwitch(u.role)}
                          className="px-3 py-1 bg-slate-900 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition cursor-pointer"
                        >
                          Switch
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permissions Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
          <Shield className="w-4 h-4 text-emerald-600" />
          <span>Role-Based Operational Permissions Matrix</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {(Object.entries(rolePermissions) as [UserRole, any][]).map(([r, info]) => (
            <div
              key={r}
              className={`p-4 rounded-xl border space-y-2 ${
                currentUser.role === r
                  ? 'border-emerald-500 bg-emerald-50/30'
                  : 'border-slate-200 bg-slate-50/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 uppercase tracking-wider">{r}</span>
                {currentUser.role === r && (
                  <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded">
                    Active
                  </span>
                )}
              </div>
              <p className="font-semibold text-slate-800 text-[11px]">{info.title}</p>
              <p className="text-slate-500 text-[11px] leading-relaxed">{info.desc}</p>
              <div className="pt-2 border-t border-slate-200 space-y-1 font-mono text-[10px]">
                <div className="flex justify-between">
                  <span>Declare Hazard:</span>
                  <span className={info.canDeclareIncident ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
                    {info.canDeclareIncident ? 'YES' : 'NO'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Assign Units:</span>
                  <span className={info.canAssignTeams ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
                    {info.canAssignTeams ? 'YES' : 'NO'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Manage Warehouses:</span>
                  <span className={info.canManageDepot ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
                    {info.canManageDepot ? 'YES' : 'NO'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
