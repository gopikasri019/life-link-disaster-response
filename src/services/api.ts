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
  BackendConnectionState,
  SystemHealth,
} from '../types';
import { StorageEngine } from './storage';

class ApiService {
  private customBaseUrl: string = '';
  private connectionState: BackendConnectionState = 'DEMO';
  private lastHealthCheck: SystemHealth | null = null;
  private listeners: Array<(state: BackendConnectionState) => void> = [];

  constructor() {
    this.customBaseUrl = StorageEngine.getCustomApiUrl();
  }

  public subscribeConnection(listener: (state: BackendConnectionState) => void) {
    this.listeners.push(listener);
    listener(this.connectionState);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners() {
    for (const listener of this.listeners) {
      listener(this.connectionState);
    }
  }

  public getBaseUrl(): string {
    return this.customBaseUrl || import.meta.env.VITE_API_BASE_URL || '';
  }

  public setBaseUrl(url: string) {
    this.customBaseUrl = url.trim();
    StorageEngine.setCustomApiUrl(this.customBaseUrl);
    this.checkHealth();
  }

  public getConnectionState(): BackendConnectionState {
    return this.connectionState;
  }

  public getLastHealth(): SystemHealth | null {
    return this.lastHealthCheck;
  }

  public async checkHealth(): Promise<{ state: BackendConnectionState; health: SystemHealth | null; error?: string }> {
    const baseUrl = this.getBaseUrl();

    if (!baseUrl) {
      this.connectionState = 'DEMO';
      this.lastHealthCheck = {
        status: 'DEMO_STANDALONE',
        database: 'SIMULATED',
        timestamp: new Date().toISOString(),
        version: '1.0.0-demo-spring-boot-ready',
        apiUrl: 'Client Local Storage (No backend configured)',
      };
      this.notifyListeners();
      return { state: 'DEMO', health: this.lastHealthCheck };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const normalizedUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
      const target = normalizedUrl.endsWith('/api') ? `${normalizedUrl}/health` : `${normalizedUrl}/api/health`;

      const response = await fetch(target, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        this.connectionState = 'CONNECTED';
        this.lastHealthCheck = {
          status: data.status || 'UP',
          database: data.database || 'CONNECTED',
          timestamp: data.timestamp || new Date().toISOString(),
          version: data.version || '1.0.0-spring-boot-mysql',
          apiUrl: target,
        };
        this.notifyListeners();
        return { state: 'CONNECTED', health: this.lastHealthCheck };
      } else {
        throw new Error(`HTTP ${response.status} from backend health check`);
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Unknown connection error';
      this.connectionState = 'DISCONNECTED';
      this.lastHealthCheck = {
        status: 'UNREACHABLE',
        database: 'DISCONNECTED',
        timestamp: new Date().toISOString(),
        version: 'Unknown',
        apiUrl: baseUrl,
      };
      this.notifyListeners();
      return {
        state: 'DISCONNECTED',
        health: this.lastHealthCheck,
        error: `Could not reach Spring Boot backend at ${baseUrl}: ${errMsg}. Using persistent Demo Mode fallback.`,
      };
    }
  }

  // --- INCIDENTS ---
  public async getIncidents(): Promise<HazardIncident[]> {
    if (this.connectionState === 'CONNECTED') {
      try {
        const res = await fetch(`${this.getBaseUrl()}/incidents`);
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend fetch failed, falling back to local storage', e);
      }
    }
    return StorageEngine.getIncidents();
  }

  public async createIncident(data: Omit<HazardIncident, 'id' | 'reportedAt'>): Promise<HazardIncident> {
    if (this.connectionState === 'CONNECTED') {
      try {
        const res = await fetch(`${this.getBaseUrl()}/incidents`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend create failed, storing locally', e);
      }
    }
    return StorageEngine.addIncident(data);
  }

  public async updateIncidentStatus(id: string, status: HazardIncident['status'], assignedTeam?: string): Promise<HazardIncident | null> {
    if (this.connectionState === 'CONNECTED') {
      try {
        const res = await fetch(`${this.getBaseUrl()}/incidents/${id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status, assignedTeam }),
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend update failed, updating locally', e);
      }
    }
    return StorageEngine.updateIncident(id, { status, assignedTeam });
  }

  // --- SOS REQUESTS ---
  public async getSosRequests(): Promise<SosRequest[]> {
    if (this.connectionState === 'CONNECTED') {
      try {
        const res = await fetch(`${this.getBaseUrl()}/sos`);
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend fetch failed, falling back to local storage', e);
      }
    }
    return StorageEngine.getSosRequests();
  }

  public async createSosRequest(data: Omit<SosRequest, 'id' | 'reportedAt' | 'trackingCode' | 'status'>): Promise<SosRequest> {
    if (this.connectionState === 'CONNECTED') {
      try {
        const res = await fetch(`${this.getBaseUrl()}/sos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend SOS create failed, storing locally', e);
      }
    }
    return StorageEngine.addSosRequest(data);
  }

  public async updateSosStatus(id: string, status: SosRequest['status'], assignedUnit?: string): Promise<SosRequest | null> {
    if (this.connectionState === 'CONNECTED') {
      try {
        const res = await fetch(`${this.getBaseUrl()}/sos/${id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status, assignedUnit }),
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend SOS status update failed, updating locally', e);
      }
    }
    return StorageEngine.updateSosStatus(id, status, assignedUnit);
  }

  // --- RISK WARNINGS ---
  public async getRiskWarnings(): Promise<RiskWarning[]> {
    if (this.connectionState === 'CONNECTED') {
      try {
        const res = await fetch(`${this.getBaseUrl()}/risk-warnings`);
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend warnings fetch failed, falling back to local storage', e);
      }
    }
    return StorageEngine.getRiskWarnings();
  }

  // --- DEPOTS & INVENTORY ---
  public async getDepots(): Promise<ReliefDepot[]> {
    if (this.connectionState === 'CONNECTED') {
      try {
        const res = await fetch(`${this.getBaseUrl()}/depots`);
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend depots fetch failed, falling back to local storage', e);
      }
    }
    return StorageEngine.getDepots();
  }

  // --- ALLOCATIONS ---
  public async getAllocations(): Promise<ResourceAllocation[]> {
    if (this.connectionState === 'CONNECTED') {
      try {
        const res = await fetch(`${this.getBaseUrl()}/allocations`);
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend allocations fetch failed, falling back to local storage', e);
      }
    }
    return StorageEngine.getAllocations();
  }

  public async createAllocation(
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
  ): Promise<{ success: boolean; message: string; allocation?: ResourceAllocation }> {
    if (this.connectionState === 'CONNECTED') {
      try {
        const res = await fetch(`${this.getBaseUrl()}/allocations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            incidentId,
            incidentTitle,
            depotId,
            depotName,
            resourceName,
            quantity,
            unit,
            priority,
            reason,
            assignedTeam,
            distanceKm,
          }),
        });
        if (res.ok) {
          const allocation = await res.json();
          return { success: true, message: 'Allocation committed to MySQL via Spring Boot.', allocation };
        } else {
          const err = await res.json();
          return { success: false, message: err.message || 'Backend allocation error' };
        }
      } catch (e) {
        console.warn('Backend allocation failed, executing on local engine', e);
      }
    }

    return StorageEngine.createAllocation(
      incidentId,
      incidentTitle,
      depotId,
      depotName,
      resourceName,
      quantity,
      unit,
      priority,
      reason,
      assignedTeam,
      distanceKm
    );
  }

  // --- HOSPITALS ---
  public async getHospitals(): Promise<Hospital[]> {
    if (this.connectionState === 'CONNECTED') {
      try {
        const res = await fetch(`${this.getBaseUrl()}/hospitals`);
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend hospitals fetch failed, falling back to local storage', e);
      }
    }
    return StorageEngine.getHospitals();
  }

  public async updateHospitalBeds(id: string, availableBeds: number, icuAvailable: number): Promise<{ success: boolean; message: string }> {
    if (this.connectionState === 'CONNECTED') {
      try {
        const res = await fetch(`${this.getBaseUrl()}/hospitals/${id}/beds`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ availableBeds, icuAvailable }),
        });
        if (res.ok) return { success: true, message: 'Hospital bed capacity updated in MySQL.' };
      } catch (e) {
        console.warn('Backend hospital update failed, updating local storage', e);
      }
    }
    return StorageEngine.updateHospitalBeds(id, availableBeds, icuAvailable);
  }

  // --- RESCUE TEAMS ---
  public async getTeams(): Promise<NgoRescueTeam[]> {
    if (this.connectionState === 'CONNECTED') {
      try {
        const res = await fetch(`${this.getBaseUrl()}/teams`);
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend teams fetch failed, falling back to local storage', e);
      }
    }
    return StorageEngine.getTeams();
  }

  public async updateTeamStatus(id: string, status: NgoRescueTeam['status'], assignment?: string): Promise<NgoRescueTeam | null> {
    if (this.connectionState === 'CONNECTED') {
      try {
        const res = await fetch(`${this.getBaseUrl()}/teams/${id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status, assignment }),
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend team update failed, updating locally', e);
      }
    }
    return StorageEngine.updateTeamStatus(id, status, assignment);
  }

  // --- SHELTERS ---
  public async getShelters(): Promise<Shelter[]> {
    if (this.connectionState === 'CONNECTED') {
      try {
        const res = await fetch(`${this.getBaseUrl()}/shelters`);
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend shelters fetch failed, falling back to local storage', e);
      }
    }
    return StorageEngine.getShelters();
  }

  public async updateShelterOccupancy(id: string, occupancy: number): Promise<{ success: boolean; message: string }> {
    if (this.connectionState === 'CONNECTED') {
      try {
        const res = await fetch(`${this.getBaseUrl()}/shelters/${id}/occupancy`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ occupancy }),
        });
        if (res.ok) return { success: true, message: 'Shelter occupancy updated in MySQL.' };
      } catch (e) {
        console.warn('Backend shelter update failed, updating locally', e);
      }
    }
    return StorageEngine.updateShelterOccupancy(id, occupancy);
  }

  // --- VOLUNTEERS ---
  public async getVolunteers(): Promise<Volunteer[]> {
    if (this.connectionState === 'CONNECTED') {
      try {
        const res = await fetch(`${this.getBaseUrl()}/volunteers`);
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend volunteers fetch failed, falling back to local storage', e);
      }
    }
    return StorageEngine.getVolunteers();
  }

  public async updateVolunteerTask(id: string, task: string, status: Volunteer['availabilityStatus']): Promise<Volunteer | null> {
    if (this.connectionState === 'CONNECTED') {
      try {
        const res = await fetch(`${this.getBaseUrl()}/volunteers/${id}/task`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ task, status }),
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend volunteer update failed, updating locally', e);
      }
    }
    return StorageEngine.updateVolunteerTask(id, task, status);
  }

  // --- USERS ---
  public getUsers(): User[] {
    return StorageEngine.getUsers();
  }
}

export const api = new ApiService();
