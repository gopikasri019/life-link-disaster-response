import React from 'react';
import {
  LayoutDashboard,
  Map,
  Flame,
  BrainCircuit,
  LifeBuoy,
  Cpu,
  Package,
  HeartPulse,
  Users2,
  Home,
  UserCheck2,
  BarChart3,
  Users,
  Settings,
  ChevronRight,
  Shield,
  X,
} from 'lucide-react';
import { UserRole } from '../../types';

export type NavModule =
  | 'command-center'
  | 'gis-map'
  | 'incidents'
  | 'risk-warning'
  | 'sos-portal'
  | 'resource-allocation'
  | 'depots-inventory'
  | 'hospitals-beds'
  | 'rescue-teams'
  | 'shelters'
  | 'volunteers'
  | 'reports-analytics'
  | 'user-management'
  | 'settings';

interface SidebarProps {
  currentModule: NavModule;
  onSelectModule: (module: NavModule) => void;
  isOpen: boolean;
  onClose: () => void;
  userRole: UserRole;
  counts: {
    activeIncidents: number;
    pendingSos: number;
    riskAlerts: number;
    lowStockCount: number;
    lowBedHospitals: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentModule,
  onSelectModule,
  isOpen,
  onClose,
  userRole,
  counts,
}) => {
  const navItems: Array<{
    id: NavModule;
    label: string;
    icon: React.ElementType;
    badge?: number | string;
    badgeColor?: string;
    category: 'Operations' | 'Logistics & Healthcare' | 'Coordination & Insights';
    allowedRoles?: UserRole[];
  }> = [
    // Operations
    {
      id: 'command-center',
      label: '1. Command Center',
      icon: LayoutDashboard,
      category: 'Operations',
    },
    {
      id: 'gis-map',
      label: '2. Interactive GIS Map',
      icon: Map,
      badge: 'GIS Live',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      category: 'Operations',
    },
    {
      id: 'incidents',
      label: '3. Multi-Hazard Incidents',
      icon: Flame,
      badge: counts.activeIncidents,
      badgeColor: 'bg-rose-100 text-rose-800',
      category: 'Operations',
    },
    {
      id: 'risk-warning',
      label: '4. AI Risk Early Warning',
      icon: BrainCircuit,
      badge: counts.riskAlerts,
      badgeColor: 'bg-amber-100 text-amber-800',
      category: 'Operations',
    },
    {
      id: 'sos-portal',
      label: '5. Emergency SOS Portal',
      icon: LifeBuoy,
      badge: counts.pendingSos > 0 ? `${counts.pendingSos} Active` : undefined,
      badgeColor: 'bg-red-500 text-white animate-pulse',
      category: 'Operations',
    },

    // Logistics & Healthcare
    {
      id: 'resource-allocation',
      label: '6. Smart Resource Allocation',
      icon: Cpu,
      badge: 'Rule Engine',
      badgeColor: 'bg-teal-100 text-teal-800',
      category: 'Logistics & Healthcare',
    },
    {
      id: 'depots-inventory',
      label: '7. Depots & Relief Inventory',
      icon: Package,
      badge: counts.lowStockCount > 0 ? `${counts.lowStockCount} Shortage` : undefined,
      badgeColor: 'bg-amber-100 text-amber-800',
      category: 'Logistics & Healthcare',
    },
    {
      id: 'hospitals-beds',
      label: '8. Hospitals & Medical Beds',
      icon: HeartPulse,
      badge: counts.lowBedHospitals > 0 ? `${counts.lowBedHospitals} High Load` : undefined,
      badgeColor: 'bg-rose-100 text-rose-800',
      category: 'Logistics & Healthcare',
    },
    {
      id: 'rescue-teams',
      label: '9. NGOs & Rescue Teams',
      icon: Users2,
      category: 'Logistics & Healthcare',
    },
    {
      id: 'shelters',
      label: '10. Shelter Management',
      icon: Home,
      category: 'Logistics & Healthcare',
    },

    // Coordination & Insights
    {
      id: 'volunteers',
      label: '11. Volunteer Coordination',
      icon: UserCheck2,
      category: 'Coordination & Insights',
    },
    {
      id: 'reports-analytics',
      label: '12. Reports & Analytics',
      icon: BarChart3,
      badge: 'CSV Export',
      badgeColor: 'bg-slate-100 text-slate-700',
      category: 'Coordination & Insights',
    },
    {
      id: 'user-management',
      label: '13. User Management',
      icon: Users,
      category: 'Coordination & Insights',
    },
    {
      id: 'settings',
      label: '14. System Settings',
      icon: Settings,
      category: 'Coordination & Insights',
    },
  ];

  const categories: Array<'Operations' | 'Logistics & Healthcare' | 'Coordination & Insights'> = [
    'Operations',
    'Logistics & Healthcare',
    'Coordination & Insights',
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-72 bg-white border-r border-slate-200 overflow-y-auto transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 flex items-center justify-between border-b border-slate-100 lg:hidden">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-emerald-600" />
            <span className="font-bold text-slate-800 text-sm">LIFE-LINK Modules</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-3 space-y-6">
          {categories.map((cat) => {
            const items = navItems.filter((i) => i.category === cat);
            return (
              <div key={cat} className="space-y-1">
                <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  {cat}
                </p>
                <div className="space-y-0.5">
                  {items.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentModule === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          onSelectModule(item.id);
                          onClose();
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer text-left ${
                          isActive
                            ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-700/20 font-bold'
                            : 'text-slate-700 hover:bg-emerald-50/60 hover:text-emerald-950'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <Icon
                            className={`w-4 h-4 shrink-0 ${
                              isActive ? 'text-white' : 'text-slate-500 group-hover:text-emerald-600'
                            }`}
                          />
                          <span className="truncate">{item.label}</span>
                        </div>

                        {item.badge !== undefined && (
                          <span
                            className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                              isActive
                                ? 'bg-white/20 text-white'
                                : item.badgeColor || 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Footer info badge */}
        <div className="p-4 border-t border-slate-100 m-3 rounded-2xl bg-slate-50 text-[11px] text-slate-600 space-y-1">
          <p className="font-bold text-slate-800">Easwari Engineering College</p>
          <p className="text-slate-500 text-[10px]">Dept. of AI &amp; Data Science</p>
          <p className="text-[10px] text-emerald-700 font-semibold pt-1">
            Tamil Nadu Coastal Disaster Grid v2.4
          </p>
        </div>
      </aside>
    </>
  );
};
