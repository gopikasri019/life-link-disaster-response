import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/common/Navbar';
import { Sidebar, NavModule } from './components/common/Sidebar';
import { ConnectionModal } from './components/common/ConnectionModal';
import { NotificationDropdown, NotificationItem } from './components/common/NotificationDropdown';
import { CommandCenter } from './components/dashboard/CommandCenter';
import { InteractiveGisMap } from './components/map/InteractiveGisMap';
import { MultiHazardIncidents } from './components/incidents/MultiHazardIncidents';
import { AiRiskEarlyWarning } from './components/risk/AiRiskEarlyWarning';
import { CitizenSosPortal } from './components/sos/CitizenSosPortal';
import { SmartResourceAllocation } from './components/allocation/SmartResourceAllocation';
import { ReliefDepotInventory } from './components/depots/ReliefDepotInventory';
import { HospitalBedsManagement } from './components/hospitals/HospitalBedsManagement';
import { NgoRescueTeams } from './components/rescue/NgoRescueTeams';
import { ShelterManagement } from './components/shelters/ShelterManagement';
import { VolunteerCoordination } from './components/volunteers/VolunteerCoordination';
import { ReportsAnalytics } from './components/reports/ReportsAnalytics';
import { UserManagement } from './components/users/UserManagement';
import { SystemSettings } from './components/settings/SystemSettings';

import { api } from './services/api';
import { StorageEngine } from './services/storage';
import {
  HazardIncident,
  SosRequest,
  RiskWarning,
  ReliefDepot,
  ResourceAllocation,
  Hospital,
  NgoRescueTeam,
  Shelter,
  Volunteer,
  User,
  UserRole,
  BackendConnectionState,
  SystemHealth,
} from './types';
import { X, CheckCircle2, LifeBuoy } from 'lucide-react';

export default function App() {
  const [currentModule, setCurrentModule] = useState<NavModule>('command-center');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [connectionModalOpen, setConnectionModalOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [declareIncidentOpen, setDeclareIncidentOpen] = useState(false);
  const [triageSosTarget, setTriageSosTarget] = useState<SosRequest | null>(null);

  // App Data State
  const [incidents, setIncidents] = useState<HazardIncident[]>([]);
  const [sosRequests, setSosRequests] = useState<SosRequest[]>([]);
  const [riskWarnings, setRiskWarnings] = useState<RiskWarning[]>([]);
  const [depots, setDepots] = useState<ReliefDepot[]>([]);
  const [allocations, setAllocations] = useState<ResourceAllocation[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [teams, setTeams] = useState<NgoRescueTeam[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User>(StorageEngine.getCurrentUser());

  // Regional Scope
  const [activeDistrict, setActiveDistrict] = useState<string>('All Districts');

  // Backend Health
  const [connectionState, setConnectionState] = useState<BackendConnectionState>('DEMO');
  const [healthData, setHealthData] = useState<SystemHealth | null>(null);

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'N-01',
      title: 'Chembarambakkam Reservoir Discharge',
      message: 'Surplus discharge increased to 14,000 cusecs. Adyar riverbank low areas in Saidapet on alert.',
      type: 'danger',
      time: '18:30',
      targetModule: 'risk-warning',
    },
    {
      id: 'N-02',
      title: 'Cuddalore Depots Stock Alert',
      message: 'Drinking water and food packets inventory at District Warehouse 2 below threshold.',
      type: 'warning',
      time: '19:40',
      targetModule: 'depots-inventory',
    },
    {
      id: 'N-03',
      title: 'New Rooftop SOS in Jafferkhanpet',
      message: 'Family of 7 trapped with rising flood water level. Priority: Life-Threatening.',
      type: 'danger',
      time: '20:10',
      targetModule: 'sos-portal',
    },
  ]);

  // Load All Data
  const loadData = useCallback(async () => {
    const [
      incidentsData,
      sosData,
      warningsData,
      depotsData,
      allocationsData,
      hospitalsData,
      teamsData,
      sheltersData,
      volunteersData,
    ] = await Promise.all([
      api.getIncidents(),
      api.getSosRequests(),
      api.getRiskWarnings(),
      api.getDepots(),
      api.getAllocations(),
      api.getHospitals(),
      api.getTeams(),
      api.getShelters(),
      api.getVolunteers(),
    ]);

    setIncidents(incidentsData);
    setSosRequests(sosData);
    setRiskWarnings(warningsData);
    setDepots(depotsData);
    setAllocations(allocationsData);
    setHospitals(hospitalsData);
    setTeams(teamsData);
    setShelters(sheltersData);
    setVolunteers(volunteersData);
    setUsers(api.getUsers());
  }, []);

  useEffect(() => {
    loadData();

    // Check backend health
    api.checkHealth().then((res) => {
      setConnectionState(res.state);
      setHealthData(res.health);
    });

    const unsubscribe = api.subscribeConnection((st) => {
      setConnectionState(st);
      setHealthData(api.getLastHealth());
    });

    // Listen for local storage updates
    const handleStorageUpdate = () => {
      loadData();
    };
    window.addEventListener('lifelink-storage-update', handleStorageUpdate);

    return () => {
      unsubscribe();
      window.removeEventListener('lifelink-storage-update', handleStorageUpdate);
    };
  }, [loadData]);

  // Role switch handler
  const handleRoleSwitch = (role: UserRole) => {
    const updatedUser = StorageEngine.switchUserRole(role);
    setCurrentUser(updatedUser);
  };

  // SOS Creation callback
  const handleSosCreated = (newSos: SosRequest) => {
    loadData();
    // Add real-time notification
    setNotifications((prev) => [
      {
        id: `N-${Date.now()}`,
        title: `New SOS Beacon: ${newSos.emergencyCategory}`,
        message: `${newSos.citizenName} in ${newSos.district} (${newSos.location}). Priority: ${newSos.priority}.`,
        type: newSos.priority === 'Life-Threatening' ? 'danger' : 'warning',
        time: 'Just now',
        targetModule: 'sos-portal',
      },
      ...prev,
    ]);
  };

  // Triage SOS submission
  const handlePerformTriage = async (sosId: string, status: SosRequest['status'], unit: string) => {
    await api.updateSosStatus(sosId, status, unit);
    setTriageSosTarget(null);
    loadData();
  };

  // Sidebar badge counts
  const activeIncidents = incidents.filter((i) => i.status !== 'Resolved').length;
  const pendingSos = sosRequests.filter(
    (s) => s.status !== 'Assisted' && s.status !== 'Cancelled'
  ).length;
  const riskAlerts = riskWarnings.filter((r) => r.riskScore >= 65).length;
  const lowStockCount = depots.reduce(
    (acc, d) => acc + d.inventory.filter((i) => i.quantity <= i.reorderThreshold).length,
    0
  );
  const lowBedHospitals = hospitals.filter((h) => h.availableBeds <= 100 || h.icuAvailable <= 5).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        connectionState={connectionState}
        currentUser={currentUser}
        onRoleSwitch={handleRoleSwitch}
        onOpenSos={() => setCurrentModule('sos-portal')}
        onOpenConnectionModal={() => setConnectionModalOpen(true)}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        activeDistrict={activeDistrict}
        onDistrictChange={setActiveDistrict}
        notificationCount={notifications.length}
        onOpenNotifications={() => setNotificationsOpen(true)}
      />

      {/* Main Container with Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          currentModule={currentModule}
          onSelectModule={setCurrentModule}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          userRole={currentUser.role}
          counts={{
            activeIncidents,
            pendingSos,
            riskAlerts,
            lowStockCount,
            lowBedHospitals,
          }}
        />

        {/* Content Viewport */}
        <main className="flex-1 lg:ml-72 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {currentModule === 'command-center' && (
            <CommandCenter
              incidents={incidents}
              sosRequests={sosRequests}
              hospitals={hospitals}
              shelters={shelters}
              teams={teams}
              depots={depots}
              allocations={allocations}
              riskWarnings={riskWarnings}
              activeDistrict={activeDistrict}
              onNavigate={setCurrentModule}
              onOpenNewIncident={() => {
                setCurrentModule('incidents');
                setDeclareIncidentOpen(true);
              }}
              onOpenSosPortal={() => setCurrentModule('sos-portal')}
              onTriageSos={(sos) => setTriageSosTarget(sos)}
            />
          )}

          {currentModule === 'gis-map' && (
            <InteractiveGisMap
              incidents={incidents}
              sosRequests={sosRequests}
              hospitals={hospitals}
              shelters={shelters}
              depots={depots}
              teams={teams}
              activeDistrict={activeDistrict}
              onDistrictSelect={setActiveDistrict}
            />
          )}

          {currentModule === 'incidents' && (
            <MultiHazardIncidents
              incidents={incidents}
              onIncidentUpdated={loadData}
              activeDistrict={activeDistrict}
              userRole={currentUser.role}
              isCreateOpen={declareIncidentOpen}
              onCloseCreate={() => setDeclareIncidentOpen(false)}
            />
          )}

          {currentModule === 'risk-warning' && (
            <AiRiskEarlyWarning warnings={riskWarnings} activeDistrict={activeDistrict} />
          )}

          {currentModule === 'sos-portal' && (
            <CitizenSosPortal
              onSosCreated={handleSosCreated}
              activeDistrict={activeDistrict === 'All Districts' ? 'Chennai' : activeDistrict}
            />
          )}

          {currentModule === 'resource-allocation' && (
            <SmartResourceAllocation
              incidents={incidents}
              depots={depots}
              allocations={allocations}
              onAllocationCommitted={loadData}
              activeDistrict={activeDistrict}
            />
          )}

          {currentModule === 'depots-inventory' && (
            <ReliefDepotInventory
              depots={depots}
              onInventoryChanged={loadData}
              activeDistrict={activeDistrict}
            />
          )}

          {currentModule === 'hospitals-beds' && (
            <HospitalBedsManagement
              hospitals={hospitals}
              onHospitalsUpdated={loadData}
              activeDistrict={activeDistrict}
            />
          )}

          {currentModule === 'rescue-teams' && (
            <NgoRescueTeams
              teams={teams}
              onTeamsUpdated={loadData}
              activeDistrict={activeDistrict}
            />
          )}

          {currentModule === 'shelters' && (
            <ShelterManagement
              shelters={shelters}
              onSheltersUpdated={loadData}
              activeDistrict={activeDistrict}
            />
          )}

          {currentModule === 'volunteers' && (
            <VolunteerCoordination
              volunteers={volunteers}
              onVolunteersUpdated={loadData}
              activeDistrict={activeDistrict}
            />
          )}

          {currentModule === 'reports-analytics' && (
            <ReportsAnalytics
              incidents={incidents}
              sosRequests={sosRequests}
              hospitals={hospitals}
              shelters={shelters}
              depots={depots}
              allocations={allocations}
              activeDistrict={activeDistrict}
            />
          )}

          {currentModule === 'user-management' && (
            <UserManagement
              users={users}
              currentUser={currentUser}
              onRoleSwitch={handleRoleSwitch}
            />
          )}

          {currentModule === 'settings' && (
            <SystemSettings onDataReset={loadData} />
          )}
        </main>
      </div>

      {/* Backend & MySQL Connectivity Modal */}
      <ConnectionModal
        isOpen={connectionModalOpen}
        onClose={() => setConnectionModalOpen(false)}
        connectionState={connectionState}
        health={healthData}
        onHealthUpdated={(st, h) => {
          setConnectionState(st);
          setHealthData(h);
        }}
      />

      {/* Real-time Notifications Drawer */}
      <NotificationDropdown
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        notifications={notifications}
        onDismiss={(id) => setNotifications((prev) => prev.filter((n) => n.id !== id))}
        onSelectNotification={(mod) => {
          if (mod) setCurrentModule(mod);
        }}
      />

      {/* Quick SOS Triage Modal */}
      {triageSosTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <LifeBuoy className="w-5 h-5 text-red-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Triage SOS Dispatch &bull; {triageSosTarget.trackingCode}
                </h3>
              </div>
              <button
                onClick={() => setTriageSosTarget(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <p className="font-bold text-sm text-slate-900">{triageSosTarget.emergencyCategory}</p>
              <p className="text-slate-500 mt-0.5">{triageSosTarget.location}, {triageSosTarget.district}</p>
              <p className="text-slate-700 mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                {triageSosTarget.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 font-mono text-[11px] text-slate-600">
              <div>Affected: <strong>{triageSosTarget.peopleAffected}</strong></div>
              <div>Injured: <strong className="text-red-600">{triageSosTarget.injuredCount}</strong></div>
              <div>Citizen: <strong>{triageSosTarget.citizenName}</strong></div>
              <div>Phone: <strong>{triageSosTarget.contactPhone}</strong></div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block font-bold text-slate-700">Assign Rescue Unit</label>
              <select
                id="triageUnitSelect"
                defaultValue={triageSosTarget.assignedUnit || 'NDRF Boat Unit 4'}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
              >
                <option value="NDRF Boat Unit 4">NDRF Boat Unit 4 (Arakkonam)</option>
                <option value="Cuddalore Fishermen Rescue Taskforce">Cuddalore Fishermen Rescue Taskforce</option>
                <option value="Indian Coast Guard Cutter Interceptor">Indian Coast Guard Cutter Interceptor</option>
                <option value="108 Marine Emergency Ambulance">108 Marine Emergency Ambulance</option>
                <option value="SDRF Quick Response Wing">SDRF Quick Response Wing</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  const sel = document.getElementById('triageUnitSelect') as HTMLSelectElement;
                  handlePerformTriage(triageSosTarget.id, 'Rescue In Progress', sel?.value || 'Assigned Unit');
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition cursor-pointer"
              >
                Dispatch Unit &amp; Mark In-Progress
              </button>
              <button
                onClick={() => {
                  handlePerformTriage(triageSosTarget.id, 'Assisted', triageSosTarget.assignedUnit || 'Field Unit');
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition cursor-pointer"
              >
                Mark Assisted
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
