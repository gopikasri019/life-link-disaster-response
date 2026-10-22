export type UserRole = 'ADMIN' | 'CITIZEN' | 'HOSPITAL' | 'NGO' | 'VOLUNTEER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  district: string;
  phone?: string;
  organization?: string;
}

export type HazardCategory =
  | 'Flood'
  | 'Cyclone'
  | 'Tsunami'
  | 'Earthquake'
  | 'Landslide'
  | 'Heavy rainfall'
  | 'Drought'
  | 'Epidemic and disease outbreaks'
  | 'Industrial accidents'
  | 'Other emergencies';

export type SeverityLevel = 'Low' | 'Moderate' | 'High' | 'Critical';

export type IncidentStatus =
  | 'Reported'
  | 'Verified'
  | 'Active'
  | 'Response Underway'
  | 'Resolved';

export interface RequiredResources {
  foodPackets: number;
  drinkingWaterLiters: number;
  medicalKits: number;
  rescueBoats: number;
  shelterTents: number;
  ambulances: number;
}

export interface HazardIncident {
  id: string;
  title: string;
  description: string;
  category: HazardCategory;
  severity: SeverityLevel;
  district: string;
  location: string;
  latitude: number;
  longitude: number;
  reportedAt: string;
  affectedPopulation: number;
  status: IncidentStatus;
  assignedTeam?: string;
  requiredResources: RequiredResources;
}

export type SosPriority = 'Standard' | 'Urgent' | 'Life-Threatening';
export type SosStatus = 'Pending Triage' | 'Assigned' | 'Rescue In Progress' | 'Assisted' | 'Cancelled';

export interface SosRequest {
  id: string;
  emergencyCategory: string;
  description: string;
  citizenName: string;
  contactPhone: string;
  district: string;
  location: string;
  latitude: number;
  longitude: number;
  peopleAffected: number;
  injuredCount: number;
  medicalRequirements: string;
  specialNeeds: string;
  priority: SosPriority;
  status: SosStatus;
  reportedAt: string;
  assignedUnit?: string;
  trackingCode: string;
}

export type RiskLevel = 'Minimal' | 'Advisory' | 'Watch' | 'Warning' | 'High Emergency';

export interface ContributingFactor {
  parameter: string;
  currentValue: string;
  threshold: string;
  weightPercent: number;
  status: 'Normal' | 'Elevated' | 'Danger';
}

export interface RiskWarning {
  id: string;
  hazardType: HazardCategory;
  district: string;
  riskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  forecastPeriod: string;
  contributingFactors: ContributingFactor[];
  recommendedActions: string[];
  createdAt: string;
  dataFreshness: string;
  isSimulatedEstimate: boolean;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Food & Nutrition' | 'Clean Water' | 'Medical' | 'Rescue Equipment' | 'Shelter & Clothing' | 'Sanitation';
  quantity: number;
  unit: string;
  reorderThreshold: number;
  lastUpdated: string;
}

export interface ReliefDepot {
  id: string;
  name: string;
  district: string;
  location: string;
  contactPerson: string;
  contactPhone: string;
  latitude: number;
  longitude: number;
  inventory: InventoryItem[];
}

export type AllocationStatus = 'Recommended' | 'Approved' | 'Dispatched' | 'Delivered' | 'Cancelled';

export interface ResourceAllocation {
  id: string;
  incidentId: string;
  incidentTitle: string;
  depotId: string;
  depotName: string;
  resourceName: string;
  quantity: number;
  unit: string;
  priority: SeverityLevel;
  reason: string;
  status: AllocationStatus;
  assignedTeam: string;
  timestamp: string;
  distanceKm: number;
}

export interface Hospital {
  id: string;
  name: string;
  district: string;
  location: string;
  contactPhone: string;
  totalBeds: number;
  availableBeds: number;
  icuTotal: number;
  icuAvailable: number;
  emergencyFacilities: string[];
  ambulanceAvailable: number;
  medicalSuppliesStatus: 'Adequate' | 'Limited' | 'Critical Shortage';
  lastUpdated: string;
  latitude: number;
  longitude: number;
}

export interface NgoRescueTeam {
  id: string;
  name: string;
  type: 'NDRF' | 'SDRF' | 'Coast Guard' | 'Fire & Rescue' | 'NGO Volunteer Unit' | 'Medical Emergency Unit' | 'Fishermen Marine Squad';
  contactPerson: string;
  contactPhone: string;
  district: string;
  personnelCount: number;
  capabilities: string[];
  status: 'Available' | 'Deployed' | 'Standby' | 'Resting';
  currentAssignment?: string;
  lastUpdated: string;
  latitude: number;
  longitude: number;
}

export interface Shelter {
  id: string;
  name: string;
  district: string;
  location: string;
  capacity: number;
  occupancy: number;
  facilities: string[];
  specialAssistance: string[];
  status: 'Open' | 'Near Capacity' | 'Full' | 'Closed';
  contactPhone: string;
  latitude: number;
  longitude: number;
}

export interface Volunteer {
  id: string;
  name: string;
  contactPhone: string;
  district: string;
  skills: string[];
  availabilityStatus: 'Available' | 'On Shift' | 'Unavailable';
  assignedTask?: string;
  shiftStatus: 'Morning' | 'Night' | '24h Standby' | 'Off';
  completedTasksCount: number;
}

export type BackendConnectionState = 'CONNECTED' | 'DISCONNECTED' | 'DEMO';

export interface SystemHealth {
  status: string;
  database: 'CONNECTED' | 'DISCONNECTED' | 'SIMULATED';
  timestamp: string;
  version: string;
  apiUrl: string;
}
