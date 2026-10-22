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
} from '../types';
import {
  INITIAL_INCIDENTS,
  INITIAL_SOS_REQUESTS,
  INITIAL_RISK_WARNINGS,
  INITIAL_DEPOTS,
  INITIAL_ALLOCATIONS,
  INITIAL_HOSPITALS,
  INITIAL_TEAMS,
  INITIAL_SHELTERS,
  INITIAL_VOLUNTEERS,
  INITIAL_USERS,
} from '../data/mockData';

const KEYS = {
  INCIDENTS: 'lifelink_incidents_v1',
  SOS: 'lifelink_sos_v1',
  WARNINGS: 'lifelink_warnings_v1',
  DEPOTS: 'lifelink_depots_v1',
  ALLOCATIONS: 'lifelink_allocations_v1',
  HOSPITALS: 'lifelink_hospitals_v1',
  TEAMS: 'lifelink_teams_v1',
  SHELTERS: 'lifelink_shelters_v1',
  VOLUNTEERS: 'lifelink_volunteers_v1',
  USERS: 'lifelink_users_v1',
  CURRENT_USER: 'lifelink_current_user_v1',
  DEMO_MODE: 'lifelink_demo_mode_override',
  API_URL: 'lifelink_custom_api_url',
};

function getItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`Error reading key ${key} from storage:`, err);
    return defaultValue;
  }
}

function setItem<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
    window.dispatchEvent(new CustomEvent('lifelink-storage-update', { detail: { key } }));
  } catch (err) {
    console.error(`Error saving key ${key} to storage:`, err);
  }
}

export const StorageEngine = {
  getIncidents(): HazardIncident[] {
    return getItem(KEYS.INCIDENTS, INITIAL_INCIDENTS);
  },
  saveIncidents(incidents: HazardIncident[]) {
    setItem(KEYS.INCIDENTS, incidents);
  },
  addIncident(incident: Omit<HazardIncident, 'id' | 'reportedAt'>): HazardIncident {
    const incidents = this.getIncidents();
    const newIncident: HazardIncident = {
      ...incident,
      id: `INC-TN-2026-${String(incidents.length + 87).padStart(3, '0')}`,
      reportedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    this.saveIncidents([newIncident, ...incidents]);
    return newIncident;
  },
  updateIncident(id: string, updates: Partial<HazardIncident>): HazardIncident | null {
    const incidents = this.getIncidents();
    const index = incidents.findIndex((i) => i.id === id);
    if (index === -1) return null;
    const updated = { ...incidents[index], ...updates };
    incidents[index] = updated;
    this.saveIncidents(incidents);
    return updated;
  },

  getSosRequests(): SosRequest[] {
    return getItem(KEYS.SOS, INITIAL_SOS_REQUESTS);
  },
  saveSosRequests(sos: SosRequest[]) {
    setItem(KEYS.SOS, sos);
  },
  addSosRequest(sos: Omit<SosRequest, 'id' | 'reportedAt' | 'trackingCode' | 'status'>): SosRequest {
    const list = this.getSosRequests();
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const newSos: SosRequest = {
      ...sos,
      id: `SOS-2026-${String(list.length + 906).padStart(3, '0')}`,
      status: 'Pending Triage',
      reportedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      trackingCode: `LL-SOS-${randomHex}-${sos.district.substring(0, 1).toUpperCase()}`,
    };
    this.saveSosRequests([newSos, ...list]);
    return newSos;
  },
  updateSosStatus(id: string, status: SosRequest['status'], assignedUnit?: string): SosRequest | null {
    const list = this.getSosRequests();
    const idx = list.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    const updated: SosRequest = {
      ...list[idx],
      status,
      assignedUnit: assignedUnit ?? list[idx].assignedUnit,
    };
    list[idx] = updated;
    this.saveSosRequests(list);
    return updated;
  },

  getRiskWarnings(): RiskWarning[] {
    return getItem(KEYS.WARNINGS, INITIAL_RISK_WARNINGS);
  },
  saveRiskWarnings(warnings: RiskWarning[]) {
    setItem(KEYS.WARNINGS, warnings);
  },
  addRiskWarning(warning: Omit<RiskWarning, 'id' | 'createdAt'>): RiskWarning {
    const list = this.getRiskWarnings();
    const newWarn: RiskWarning = {
      ...warning,
      id: `RW-2026-${String(list.length + 105).padStart(3, '0')}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    this.saveRiskWarnings([newWarn, ...list]);
    return newWarn;
  },

  getDepots(): ReliefDepot[] {
    return getItem(KEYS.DEPOTS, INITIAL_DEPOTS);
  },
  saveDepots(depots: ReliefDepot[]) {
    setItem(KEYS.DEPOTS, depots);
  },
  updateDepotStock(depotId: string, itemName: string, delta: number): boolean {
    const depots = this.getDepots();
    const depot = depots.find((d) => d.id === depotId);
    if (!depot) return false;
    const item = depot.inventory.find((i) => i.name.toLowerCase() === itemName.toLowerCase() || i.name.includes(itemName));
    if (!item) return false;

    if (item.quantity + delta < 0) {
      return false; // Cannot allocate more than available
    }

    item.quantity += delta;
    item.lastUpdated = new Date().toISOString().replace('T', ' ').substring(0, 16);
    this.saveDepots(depots);
    return true;
  },

  getAllocations(): ResourceAllocation[] {
    return getItem(KEYS.ALLOCATIONS, INITIAL_ALLOCATIONS);
  },
  saveAllocations(allocations: ResourceAllocation[]) {
    setItem(KEYS.ALLOCATIONS, allocations);
  },
  createAllocation(
    incidentId: string,
    incidentTitle: string,
    depotId: string,
    depotName: string,
    resourceName: string,
    quantity: number,
    unit: string,
    priority: ResourceAllocation['priority'],
    reason: string,
    assignedTeam: string,
    distanceKm: number
  ): { success: boolean; message: string; allocation?: ResourceAllocation } {
    // 1. Verify stock availability
    const stockAvailable = this.updateDepotStock(depotId, resourceName, -quantity);
    if (!stockAvailable) {
      return {
        success: false,
        message: `Allocation failed: Insufficient quantity of "${resourceName}" at ${depotName}. Cannot allocate negative inventory.`,
      };
    }

    const allocations = this.getAllocations();
    const newAllocation: ResourceAllocation = {
      id: `ALC-2026-${String(allocations.length + 505).padStart(3, '0')}`,
      incidentId,
      incidentTitle,
      depotId,
      depotName,
      resourceName,
      quantity,
      unit,
      priority,
      reason,
      status: 'Approved',
      assignedTeam,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      distanceKm,
    };

    this.saveAllocations([newAllocation, ...allocations]);
    return {
      success: true,
      message: `Successfully allocated ${quantity} ${unit} of "${resourceName}" from ${depotName}. Inventory adjusted.`,
      allocation: newAllocation,
    };
  },
  updateAllocationStatus(id: string, status: ResourceAllocation['status']): ResourceAllocation | null {
    const list = this.getAllocations();
    const idx = list.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    list[idx].status = status;
    this.saveAllocations(list);
    return list[idx];
  },

  getHospitals(): Hospital[] {
    return getItem(KEYS.HOSPITALS, INITIAL_HOSPITALS);
  },
  saveHospitals(hospitals: Hospital[]) {
    setItem(KEYS.HOSPITALS, hospitals);
  },
  updateHospitalBeds(id: string, availableBeds: number, icuAvailable: number): { success: boolean; message: string } {
    const hospitals = this.getHospitals();
    const hosp = hospitals.find((h) => h.id === id);
    if (!hosp) return { success: false, message: 'Hospital not found' };

    if (availableBeds < 0 || availableBeds > hosp.totalBeds) {
      return {
        success: false,
        message: `Invalid available beds: Must be between 0 and total beds (${hosp.totalBeds}).`,
      };
    }

    if (icuAvailable < 0 || icuAvailable > hosp.icuTotal) {
      return {
        success: false,
        message: `Invalid ICU available beds: Must be between 0 and total ICU beds (${hosp.icuTotal}).`,
      };
    }

    hosp.availableBeds = availableBeds;
    hosp.icuAvailable = icuAvailable;
    hosp.lastUpdated = new Date().toISOString().replace('T', ' ').substring(0, 16);
    this.saveHospitals(hospitals);
    return { success: true, message: 'Hospital beds updated successfully.' };
  },

  getTeams(): NgoRescueTeam[] {
    return getItem(KEYS.TEAMS, INITIAL_TEAMS);
  },
  saveTeams(teams: NgoRescueTeam[]) {
    setItem(KEYS.TEAMS, teams);
  },
  updateTeamStatus(id: string, status: NgoRescueTeam['status'], currentAssignment?: string): NgoRescueTeam | null {
    const teams = this.getTeams();
    const idx = teams.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    teams[idx].status = status;
    if (currentAssignment !== undefined) {
      teams[idx].currentAssignment = currentAssignment;
    }
    teams[idx].lastUpdated = new Date().toISOString().replace('T', ' ').substring(0, 16);
    this.saveTeams(teams);
    return teams[idx];
  },

  getShelters(): Shelter[] {
    return getItem(KEYS.SHELTERS, INITIAL_SHELTERS);
  },
  saveShelters(shelters: Shelter[]) {
    setItem(KEYS.SHELTERS, shelters);
  },
  updateShelterOccupancy(id: string, occupancy: number): { success: boolean; message: string } {
    const shelters = this.getShelters();
    const shelter = shelters.find((s) => s.id === id);
    if (!shelter) return { success: false, message: 'Shelter not found' };

    if (occupancy < 0) {
      return { success: false, message: 'Occupancy cannot be negative.' };
    }
    if (occupancy > shelter.capacity * 1.2) {
      return { success: false, message: `Occupancy exceeds emergency structural safety limit (${shelter.capacity * 1.2}).` };
    }

    shelter.occupancy = occupancy;
    if (occupancy >= shelter.capacity) {
      shelter.status = 'Full';
    } else if (occupancy >= shelter.capacity * 0.85) {
      shelter.status = 'Near Capacity';
    } else {
      shelter.status = 'Open';
    }

    this.saveShelters(shelters);
    return { success: true, message: 'Shelter occupancy updated.' };
  },

  getVolunteers(): Volunteer[] {
    return getItem(KEYS.VOLUNTEERS, INITIAL_VOLUNTEERS);
  },
  saveVolunteers(volunteers: Volunteer[]) {
    setItem(KEYS.VOLUNTEERS, volunteers);
  },
  updateVolunteerTask(id: string, task: string, status: Volunteer['availabilityStatus']): Volunteer | null {
    const list = this.getVolunteers();
    const idx = list.findIndex((v) => v.id === id);
    if (idx === -1) return null;
    list[idx].assignedTask = task;
    list[idx].availabilityStatus = status;
    this.saveVolunteers(list);
    return list[idx];
  },

  getUsers(): User[] {
    return getItem(KEYS.USERS, INITIAL_USERS);
  },
  getCurrentUser(): User {
    const users = this.getUsers();
    return getItem(KEYS.CURRENT_USER, users[0]);
  },
  setCurrentUser(user: User) {
    setItem(KEYS.CURRENT_USER, user);
  },
  switchUserRole(role: UserRole): User {
    const users = this.getUsers();
    const matched = users.find((u) => u.role === role) || users[0];
    this.setCurrentUser(matched);
    return matched;
  },

  getCustomApiUrl(): string {
    return getItem(KEYS.API_URL, import.meta.env.VITE_API_BASE_URL || '');
  },
  setCustomApiUrl(url: string) {
    setItem(KEYS.API_URL, url);
  },

  resetAllData() {
    setItem(KEYS.INCIDENTS, INITIAL_INCIDENTS);
    setItem(KEYS.SOS, INITIAL_SOS_REQUESTS);
    setItem(KEYS.WARNINGS, INITIAL_RISK_WARNINGS);
    setItem(KEYS.DEPOTS, INITIAL_DEPOTS);
    setItem(KEYS.ALLOCATIONS, INITIAL_ALLOCATIONS);
    setItem(KEYS.HOSPITALS, INITIAL_HOSPITALS);
    setItem(KEYS.TEAMS, INITIAL_TEAMS);
    setItem(KEYS.SHELTERS, INITIAL_SHELTERS);
    setItem(KEYS.VOLUNTEERS, INITIAL_VOLUNTEERS);
    setItem(KEYS.USERS, INITIAL_USERS);
    setItem(KEYS.CURRENT_USER, INITIAL_USERS[0]);
  },
};
