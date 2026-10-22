import React, { useState } from 'react';
import {
  ShieldCheck,
  Server,
  Activity,
  AlertCircle,
  Bell,
  UserCheck,
  ExternalLink,
  ChevronDown,
  Menu,
  Radio,
  LifeBuoy,
} from 'lucide-react';
import { BackendConnectionState, User, UserRole } from '../../types';

interface NavbarProps {
  connectionState: BackendConnectionState;
  currentUser: User;
  onRoleSwitch: (role: UserRole) => void;
  onOpenSos: () => void;
  onOpenConnectionModal: () => void;
  onToggleSidebar: () => void;
  activeDistrict: string;
  onDistrictChange: (district: string) => void;
  notificationCount: number;
  onOpenNotifications: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  connectionState,
  currentUser,
  onRoleSwitch,
  onOpenSos,
  onOpenConnectionModal,
  onToggleSidebar,
  activeDistrict,
  onDistrictChange,
  notificationCount,
  onOpenNotifications,
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const districts = ['All Districts', 'Chennai', 'Cuddalore', 'Nagapattinam', 'Tiruvallur', 'Kancheepuram'];

  const getStatusBadge = () => {
    switch (connectionState) {
      case 'CONNECTED':
        return (
          <button
            onClick={onOpenConnectionModal}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200 transition cursor-pointer"
            title="Spring Boot REST API connected to MySQL"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            <span>REST API Connected</span>
          </button>
        );
      case 'DISCONNECTED':
        return (
          <button
            onClick={onOpenConnectionModal}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300 hover:bg-rose-200 transition cursor-pointer"
            title="Backend unreachable. Operating in Demo Mode"
          >
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Backend Offline (Demo Fallback)</span>
          </button>
        );
      case 'DEMO':
      default:
        return (
          <button
            onClick={onOpenConnectionModal}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 transition cursor-pointer"
            title="Standalone Demo Mode with local simulation"
          >
            <Radio className="w-3 h-3 text-amber-600" />
            <span>Interactive Demo Mode</span>
          </button>
        );
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Left: Sidebar toggle + Logo */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden cursor-pointer"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-700/20">
              <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-black tracking-tight text-slate-900 font-sans">
                  LIFE<span className="text-emerald-600">-LINK</span>
                </span>
                <span className="hidden md:inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wider">
                  EEC AI&amp;DS
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Disaster Response &amp; Community Resilience
              </p>
            </div>
          </div>
        </div>

        {/* Center: Operational Region selector */}
        <div className="hidden md:flex items-center space-x-2 bg-slate-100/80 px-3 py-1.5 rounded-xl border border-slate-200">
          <span className="text-xs font-semibold text-slate-500">Region:</span>
          <select
            value={activeDistrict}
            onChange={(e) => onDistrictChange(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
          >
            {districts.map((d) => (
              <option key={d} value={d}>
                {d === 'All Districts' ? 'All TN Coastal Districts' : `${d} District`}
              </option>
            ))}
          </select>
        </div>

        {/* Right side items */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Backend Status */}
          <div className="hidden sm:block">{getStatusBadge()}</div>

          {/* Quick Citizen SOS Trigger */}
          <button
            onClick={onOpenSos}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-red-600/20 transition cursor-pointer"
          >
            <LifeBuoy className="w-4 h-4 animate-spin-slow" />
            <span className="hidden sm:inline">Citizen SOS</span>
            <span className="sm:hidden">SOS</span>
          </button>

          {/* Notification Button */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {notificationCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </button>

          {/* Role switcher menu */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center space-x-2 pl-2 pr-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition cursor-pointer text-left"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                {currentUser.role.substring(0, 2)}
              </div>
              <div className="hidden lg:block text-xs">
                <p className="font-bold text-slate-800 leading-tight truncate max-w-[110px]">
                  {currentUser.name}
                </p>
                <p className="text-[10px] text-emerald-700 font-semibold">{currentUser.role}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-fade-in">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <p className="text-xs text-slate-500">Logged in as</p>
                  <p className="text-sm font-bold text-slate-900 truncate">{currentUser.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                </div>

                <div className="space-y-1">
                  <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Switch Test Role:
                  </p>
                  {(['ADMIN', 'CITIZEN', 'HOSPITAL', 'NGO', 'VOLUNTEER'] as UserRole[]).map((role) => (
                    <button
                      key={role}
                      onClick={() => {
                        onRoleSwitch(role);
                        setShowRoleMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer ${
                        currentUser.role === role
                          ? 'bg-emerald-50 text-emerald-800 font-bold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>
                        {role === 'ADMIN'
                          ? 'Govt Official / TNSDMA'
                          : role === 'CITIZEN'
                          ? 'Citizen (Public)'
                          : role === 'HOSPITAL'
                          ? 'Hospital Staff'
                          : role === 'NGO'
                          ? 'NGO Coordinator'
                          : 'Rescue Volunteer'}
                      </span>
                      {currentUser.role === role && <UserCheck className="w-3.5 h-3.5 text-emerald-600" />}
                    </button>
                  ))}
                </div>

                <div className="border-t border-slate-100 mt-2 pt-2">
                  <button
                    onClick={() => {
                      onOpenConnectionModal();
                      setShowRoleMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-600 hover:text-emerald-700 flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Server className="w-3.5 h-3.5" />
                    <span>Spring Boot &amp; MySQL Setup</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
