import React, { useState } from 'react';
import {
  Map as MapIcon,
  Layers,
  Flame,
  LifeBuoy,
  HeartPulse,
  Home,
  Package,
  Users2,
  Search,
  Filter,
  Eye,
  Info,
  Maximize2,
  List,
  Compass,
  AlertTriangle,
  X,
  PhoneCall,
  Navigation,
} from 'lucide-react';
import {
  HazardIncident,
  SosRequest,
  Hospital,
  Shelter,
  ReliefDepot,
  NgoRescueTeam,
} from '../../types';

interface InteractiveGisMapProps {
  incidents: HazardIncident[];
  sosRequests: SosRequest[];
  hospitals: Hospital[];
  shelters: Shelter[];
  depots: ReliefDepot[];
  teams: NgoRescueTeam[];
  activeDistrict: string;
  onDistrictSelect?: (district: string) => void;
}

export const InteractiveGisMap: React.FC<InteractiveGisMapProps> = ({
  incidents,
  sosRequests,
  hospitals,
  shelters,
  depots,
  teams,
  activeDistrict,
  onDistrictSelect,
}) => {
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<any | null>(null);

  // Layer toggles
  const [showIncidents, setShowIncidents] = useState(true);
  const [showSos, setShowSos] = useState(true);
  const [showHospitals, setShowHospitals] = useState(true);
  const [showShelters, setShowShelters] = useState(true);
  const [showDepots, setShowDepots] = useState(true);
  const [showTeams, setShowTeams] = useState(true);
  const [showFloodZones, setShowFloodZones] = useState(true);

  // Geographic boundaries for Tamil Nadu coastal slice (Chennai to Nagapattinam)
  // Latitude ~ 10.5 to 13.5
  // Longitude ~ 79.5 to 80.5
  const minLat = 10.4;
  const maxLat = 13.5;
  const minLng = 79.4;
  const maxLng = 80.6;

  // Convert lat/lng into SVG coordinates (width: 800, height: 600)
  const mapCoords = (lat: number, lng: number) => {
    // Invert lat because higher lat is up (lower y)
    const y = ((maxLat - lat) / (maxLat - minLat)) * 520 + 40;
    const x = ((lng - minLng) / (maxLng - minLng)) * 680 + 60;
    return { x: Math.max(30, Math.min(760, x)), y: Math.max(30, Math.min(560, y)) };
  };

  // Filter based on activeDistrict & search
  const matchesFilter = (item: { district: string; name?: string; title?: string; location?: string }) => {
    if (activeDistrict !== 'All Districts' && item.district.toLowerCase() !== activeDistrict.toLowerCase()) {
      return false;
    }
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const nameMatch = (item.name || item.title || '').toLowerCase().includes(q);
    const locMatch = (item.location || '').toLowerCase().includes(q);
    const distMatch = item.district.toLowerCase().includes(q);
    return nameMatch || locMatch || distMatch;
  };

  const visibleIncidents = incidents.filter(matchesFilter);
  const visibleSos = sosRequests.filter(matchesFilter);
  const visibleHospitals = hospitals.filter(matchesFilter);
  const visibleShelters = shelters.filter(matchesFilter);
  const visibleDepots = depots.filter(matchesFilter);
  const visibleTeams = teams.filter(matchesFilter);

  return (
    <div className="space-y-4">
      {/* Disclaimer Bar */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <Info className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Simulated Cartography &amp; GIS Layer:</strong> Coordinates, flood polygons, and assets are mapped across Tamil Nadu coastal coordinates (Chennai, Cuddalore, Nagapattinam).
          </span>
        </div>
        <div className="flex items-center space-x-1.5 font-mono text-[11px] text-slate-500">
          <Compass className="w-3.5 h-3.5 text-emerald-600" />
          <span>Datum: WGS84 / EPSG:4326</span>
        </div>
      </div>

      {/* Control Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search district, hospital, SOS, or incident..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Layer Checkboxes */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => setShowIncidents(!showIncidents)}
            className={`px-2.5 py-1.5 rounded-lg border font-semibold flex items-center space-x-1 transition cursor-pointer ${
              showIncidents
                ? 'bg-rose-50 border-rose-300 text-rose-800'
                : 'bg-white border-slate-200 text-slate-400'
            }`}
          >
            <Flame className="w-3 h-3" />
            <span>Hazards ({visibleIncidents.length})</span>
          </button>

          <button
            onClick={() => setShowSos(!showSos)}
            className={`px-2.5 py-1.5 rounded-lg border font-semibold flex items-center space-x-1 transition cursor-pointer ${
              showSos
                ? 'bg-red-50 border-red-300 text-red-800'
                : 'bg-white border-slate-200 text-slate-400'
            }`}
          >
            <LifeBuoy className="w-3 h-3" />
            <span>SOS ({visibleSos.length})</span>
          </button>

          <button
            onClick={() => setShowHospitals(!showHospitals)}
            className={`px-2.5 py-1.5 rounded-lg border font-semibold flex items-center space-x-1 transition cursor-pointer ${
              showHospitals
                ? 'bg-blue-50 border-blue-300 text-blue-800'
                : 'bg-white border-slate-200 text-slate-400'
            }`}
          >
            <HeartPulse className="w-3 h-3" />
            <span>Hospitals ({visibleHospitals.length})</span>
          </button>

          <button
            onClick={() => setShowShelters(!showShelters)}
            className={`px-2.5 py-1.5 rounded-lg border font-semibold flex items-center space-x-1 transition cursor-pointer ${
              showShelters
                ? 'bg-teal-50 border-teal-300 text-teal-800'
                : 'bg-white border-slate-200 text-slate-400'
            }`}
          >
            <Home className="w-3 h-3" />
            <span>Shelters ({visibleShelters.length})</span>
          </button>

          <button
            onClick={() => setShowDepots(!showDepots)}
            className={`px-2.5 py-1.5 rounded-lg border font-semibold flex items-center space-x-1 transition cursor-pointer ${
              showDepots
                ? 'bg-amber-50 border-amber-300 text-amber-800'
                : 'bg-white border-slate-200 text-slate-400'
            }`}
          >
            <Package className="w-3 h-3" />
            <span>Depots ({visibleDepots.length})</span>
          </button>

          <button
            onClick={() => setShowTeams(!showTeams)}
            className={`px-2.5 py-1.5 rounded-lg border font-semibold flex items-center space-x-1 transition cursor-pointer ${
              showTeams
                ? 'bg-purple-50 border-purple-300 text-purple-800'
                : 'bg-white border-slate-200 text-slate-400'
            }`}
          >
            <Users2 className="w-3 h-3" />
            <span>Teams ({visibleTeams.length})</span>
          </button>

          <button
            onClick={() => setShowFloodZones(!showFloodZones)}
            className={`px-2.5 py-1.5 rounded-lg border font-semibold flex items-center space-x-1 transition cursor-pointer ${
              showFloodZones
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-white border-slate-200 text-slate-400'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>Flood Heat Zones</span>
          </button>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setViewMode('map')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center space-x-1 ${
              viewMode === 'map' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>GIS Map</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center space-x-1 ${
              viewMode === 'list' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Coordinate List</span>
          </button>
        </div>
      </div>

      {/* Main Map Canvas Area */}
      {viewMode === 'map' ? (
        <div className="relative bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-inner min-h-[560px]">
          {/* SVG Map Canvas */}
          <svg
            viewBox="0 0 800 600"
            className="w-full h-auto max-h-[680px] select-none block"
            style={{ background: 'radial-gradient(circle at 60% 40%, #06191d 0%, #02090e 100%)' }}
          >
            {/* Grid Lines */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#162c33" strokeWidth="0.5" />
              </pattern>
              {/* Radar sweep gradient */}
              <radialGradient id="radarSweep" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="800" height="600" fill="url(#grid)" />

            {/* Tamil Nadu Bay of Bengal Coastline Representation */}
            {/* Coastline path: Starts north at Pulicat / Ennore (top right), flows down through Chennai, Cuddalore, to Nagapattinam and Vedaranyam */}
            <path
              d="M 520 20 Q 510 80, 500 130 T 490 220 T 470 320 T 450 420 Q 430 490, 480 540 L 490 580"
              fill="none"
              stroke="#0ea5e9"
              strokeWidth="2.5"
              strokeDasharray="4 2"
              opacity="0.8"
            />
            {/* Bay of Bengal label */}
            <text x="600" y="260" fill="#0284c7" opacity="0.4" fontSize="16" fontWeight="bold" letterSpacing="4">
              BAY OF BENGAL
            </text>
            <text x="610" y="285" fill="#0369a1" opacity="0.3" fontSize="11" letterSpacing="2">
              (COROMANDEL COAST)
            </text>

            {/* River channels */}
            {/* Adyar & Cooum Rivers near Chennai */}
            <path d="M 280 120 Q 380 135, 495 138" fill="none" stroke="#38bdf8" strokeWidth="1.8" opacity="0.6" />
            <text x="320" y="115" fill="#38bdf8" opacity="0.5" fontSize="8">Adyar River Basin</text>

            {/* Gadilam River near Cuddalore */}
            <path d="M 220 310 Q 340 315, 470 320" fill="none" stroke="#38bdf8" strokeWidth="1.8" opacity="0.6" />
            <text x="250" y="305" fill="#38bdf8" opacity="0.5" fontSize="8">Gadilam River</text>

            {/* Cauvery Delta River near Nagapattinam */}
            <path d="M 200 450 Q 320 460, 450 470" fill="none" stroke="#38bdf8" strokeWidth="1.8" opacity="0.6" />
            <text x="240" y="445" fill="#38bdf8" opacity="0.5" fontSize="8">Cauvery Delta Outflow</text>

            {/* District Regions Overlay */}
            {/* Chennai Hub */}
            <circle cx="490" cy="135" r="50" fill="#047857" opacity="0.1" />
            <text x="400" y="140" fill="#6ee7b7" opacity="0.8" fontSize="12" fontWeight="bold">
              CHENNAI METRO
            </text>

            {/* Cuddalore Hub */}
            <circle cx="468" cy="320" r="45" fill="#047857" opacity="0.1" />
            <text x="380" y="325" fill="#6ee7b7" opacity="0.8" fontSize="12" fontWeight="bold">
              CUDDALORE
            </text>

            {/* Nagapattinam Hub */}
            <circle cx="450" cy="470" r="45" fill="#047857" opacity="0.1" />
            <text x="330" y="475" fill="#6ee7b7" opacity="0.8" fontSize="12" fontWeight="bold">
              NAGAPATTINAM
            </text>

            {/* Simulated Flood Inundation Zones */}
            {showFloodZones && (
              <>
                {/* Adyar flood contour */}
                <ellipse cx="485" cy="142" rx="42" ry="24" fill="#ef4444" opacity="0.22" />
                <ellipse cx="485" cy="142" rx="25" ry="14" fill="#ef4444" opacity="0.35" />
                <text x="445" y="165" fill="#fca5a5" fontSize="8" fontWeight="bold">
                  High Inundation Zone (Adyar)
                </text>

                {/* Gadilam flood contour */}
                <ellipse cx="465" cy="325" rx="35" ry="20" fill="#f59e0b" opacity="0.25" />
                <ellipse cx="465" cy="325" rx="18" ry="10" fill="#f59e0b" opacity="0.4" />
                <text x="430" y="345" fill="#fde68a" fontSize="8" fontWeight="bold">
                  Surge Risk Zone (Devanampattinam)
                </text>

                {/* Nagapattinam Sea Inundation */}
                <ellipse cx="450" cy="475" rx="38" ry="22" fill="#f59e0b" opacity="0.25" />
                <text x="410" y="495" fill="#fde68a" fontSize="8" fontWeight="bold">
                  Squall &amp; Surge Buffer (Velankanni)
                </text>
              </>
            )}

            {/* RENDER ENTITY PINS */}

            {/* Depots */}
            {showDepots &&
              visibleDepots.map((d) => {
                const pt = mapCoords(d.latitude, d.longitude);
                return (
                  <g
                    key={d.id}
                    onClick={() => setSelectedEntity({ type: 'depot', data: d })}
                    className="cursor-pointer transition hover:opacity-100"
                    opacity="0.9"
                  >
                    <rect
                      x={pt.x - 9}
                      y={pt.y - 9}
                      width="18"
                      height="18"
                      rx="4"
                      fill="#f59e0b"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                    <text x={pt.x} y={pt.y + 3.5} textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">
                      D
                    </text>
                  </g>
                );
              })}

            {/* Shelters */}
            {showShelters &&
              visibleShelters.map((s) => {
                const pt = mapCoords(s.latitude, s.longitude);
                return (
                  <g
                    key={s.id}
                    onClick={() => setSelectedEntity({ type: 'shelter', data: s })}
                    className="cursor-pointer transition hover:opacity-100"
                    opacity="0.9"
                  >
                    <rect
                      x={pt.x - 9}
                      y={pt.y - 9}
                      width="18"
                      height="18"
                      rx="4"
                      fill="#0d9488"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                    <text x={pt.x} y={pt.y + 3.5} textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">
                      S
                    </text>
                  </g>
                );
              })}

            {/* Hospitals */}
            {showHospitals &&
              visibleHospitals.map((h) => {
                const pt = mapCoords(h.latitude, h.longitude);
                return (
                  <g
                    key={h.id}
                    onClick={() => setSelectedEntity({ type: 'hospital', data: h })}
                    className="cursor-pointer transition hover:opacity-100"
                    opacity="0.95"
                  >
                    <circle cx={pt.x} cy={pt.y} r="10" fill="#2563eb" stroke="#ffffff" strokeWidth="1.5" />
                    <text x={pt.x} y={pt.y + 3.5} textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">
                      +
                    </text>
                  </g>
                );
              })}

            {/* Teams */}
            {showTeams &&
              visibleTeams.map((t) => {
                const pt = mapCoords(t.latitude, t.longitude);
                return (
                  <g
                    key={t.id}
                    onClick={() => setSelectedEntity({ type: 'team', data: t })}
                    className="cursor-pointer transition hover:opacity-100"
                    opacity="0.9"
                  >
                    <polygon
                      points={`${pt.x},${pt.y - 10} ${pt.x + 8},${pt.y + 7} ${pt.x - 8},${pt.y + 7}`}
                      fill="#9333ea"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                  </g>
                );
              })}

            {/* Incidents */}
            {showIncidents &&
              visibleIncidents.map((i) => {
                const pt = mapCoords(i.latitude, i.longitude);
                return (
                  <g
                    key={i.id}
                    onClick={() => setSelectedEntity({ type: 'incident', data: i })}
                    className="cursor-pointer transition hover:opacity-100"
                  >
                    {i.severity === 'Critical' && (
                      <circle cx={pt.x} cy={pt.y} r="16" fill="#ef4444" opacity="0.3" className="animate-ping" />
                    )}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="10"
                      fill={i.severity === 'Critical' ? '#dc2626' : i.severity === 'High' ? '#ea580c' : '#2563eb'}
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                    <text x={pt.x} y={pt.y + 3.5} textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">
                      !
                    </text>
                  </g>
                );
              })}

            {/* SOS Beacons */}
            {showSos &&
              visibleSos.map((s) => {
                const pt = mapCoords(s.latitude, s.longitude);
                return (
                  <g
                    key={s.id}
                    onClick={() => setSelectedEntity({ type: 'sos', data: s })}
                    className="cursor-pointer transition hover:scale-110"
                  >
                    <circle cx={pt.x} cy={pt.y} r="18" fill="#ef4444" opacity="0.25" className="animate-pulse" />
                    <circle cx={pt.x} cy={pt.y} r="11" fill="#b91c1c" stroke="#ffffff" strokeWidth="2" />
                    <text x={pt.x} y={pt.y + 3.5} textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="bold">
                      SOS
                    </text>
                  </g>
                );
              })}
          </svg>

          {/* Floating Map Legend */}
          <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-md p-3.5 rounded-xl border border-slate-700 text-white text-xs space-y-2 max-w-xs shadow-lg">
            <p className="font-bold text-[11px] text-slate-300 uppercase tracking-wider">
              GIS Tactical Layer Legend
            </p>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-red-600 border border-white"></span>
                <span>Critical Incident</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-red-800 border border-white animate-pulse"></span>
                <span>SOS Signal</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-600 border border-white"></span>
                <span>Hospital / Bed</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-md bg-teal-600 border border-white"></span>
                <span>Cyclone Shelter</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-md bg-amber-500 border border-white"></span>
                <span>Relief Depot</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 bg-purple-600 border border-white transform rotate-45"></span>
                <span>Rescue Unit</span>
              </div>
            </div>
          </div>

          {/* Selected Entity Popup Drawer */}
          {selectedEntity && (
            <div className="absolute top-4 right-4 bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 max-w-sm w-full z-20 animate-fade-in text-slate-800">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                    {selectedEntity.type}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {selectedEntity.data.id || selectedEntity.data.trackingCode}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedEntity(null)}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="py-3 space-y-2 text-xs">
                <h4 className="font-bold text-sm text-slate-900">
                  {selectedEntity.data.name || selectedEntity.data.title || selectedEntity.data.emergencyCategory}
                </h4>

                <div className="text-slate-600 flex items-center space-x-1">
                  <Navigation className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{selectedEntity.data.location}, {selectedEntity.data.district}</span>
                </div>

                {selectedEntity.type === 'hospital' && (
                  <div className="grid grid-cols-2 gap-2 pt-1 font-semibold">
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-900">
                      <div>Available Beds</div>
                      <div className="text-base font-bold">{selectedEntity.data.availableBeds} / {selectedEntity.data.totalBeds}</div>
                    </div>
                    <div className="p-2 bg-purple-50 rounded-lg text-purple-900">
                      <div>ICU Beds Free</div>
                      <div className="text-base font-bold">{selectedEntity.data.icuAvailable} / {selectedEntity.data.icuTotal}</div>
                    </div>
                  </div>
                )}

                {selectedEntity.type === 'sos' && (
                  <div className="p-2.5 bg-red-50 rounded-xl border border-red-200 text-red-900 space-y-1">
                    <div className="flex justify-between font-bold">
                      <span>Priority: {selectedEntity.data.priority}</span>
                      <span>{selectedEntity.data.status}</span>
                    </div>
                    <p className="text-[11px]">{selectedEntity.data.description}</p>
                    <div className="text-[10px] font-mono text-red-700">
                      Contact: {selectedEntity.data.citizenName} ({selectedEntity.data.contactPhone})
                    </div>
                  </div>
                )}

                {selectedEntity.type === 'incident' && (
                  <div className="space-y-1 text-slate-600">
                    <p className="line-clamp-2">{selectedEntity.data.description}</p>
                    <div className="flex justify-between font-semibold pt-1">
                      <span>Severity: <span className="text-rose-600">{selectedEntity.data.severity}</span></span>
                      <span>Assigned: {selectedEntity.data.assignedTeam}</span>
                    </div>
                  </div>
                )}

                {selectedEntity.type === 'shelter' && (
                  <div className="p-2 bg-teal-50 rounded-lg text-teal-900 space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span>Occupancy:</span>
                      <span>{selectedEntity.data.occupancy} / {selectedEntity.data.capacity}</span>
                    </div>
                    <div className="text-[10px] text-teal-800">
                      Status: {selectedEntity.data.status}
                    </div>
                  </div>
                )}

                {selectedEntity.type === 'depot' && (
                  <div className="p-2 bg-amber-50 rounded-lg text-amber-900 space-y-1">
                    <div className="font-semibold">{selectedEntity.data.name}</div>
                    <div className="text-[10px] text-amber-800">
                      {selectedEntity.data.inventory.length} distinct relief supply lines tracked.
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* List View of All Geo-Tagged Assets */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">
              Geo-Coordinate Inventory &amp; Beacon Directory
            </h3>
            <span className="text-xs text-slate-500">
              Showing active points in {activeDistrict}
            </span>
          </div>

          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider sticky top-0">
                <tr>
                  <th className="p-3">Entity Type</th>
                  <th className="p-3">Name / Identifier</th>
                  <th className="p-3">District &amp; Location</th>
                  <th className="p-3">Latitude / Longitude</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleIncidents.map((i) => (
                  <tr key={i.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-rose-600">Incident</td>
                    <td className="p-3 font-semibold text-slate-800">{i.title}</td>
                    <td className="p-3 text-slate-600">{i.location}, {i.district}</td>
                    <td className="p-3 font-mono text-slate-500">{i.latitude}° N, {i.longitude}° E</td>
                    <td className="p-3 font-medium text-slate-700">{i.status}</td>
                  </tr>
                ))}
                {visibleSos.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-red-600">SOS Beacon</td>
                    <td className="p-3 font-semibold text-slate-800">{s.emergencyCategory}</td>
                    <td className="p-3 text-slate-600">{s.location}, {s.district}</td>
                    <td className="p-3 font-mono text-slate-500">{s.latitude}° N, {s.longitude}° E</td>
                    <td className="p-3 font-medium text-red-700">{s.status}</td>
                  </tr>
                ))}
                {visibleHospitals.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-blue-600">Hospital</td>
                    <td className="p-3 font-semibold text-slate-800">{h.name}</td>
                    <td className="p-3 text-slate-600">{h.location}, {h.district}</td>
                    <td className="p-3 font-mono text-slate-500">{h.latitude}° N, {h.longitude}° E</td>
                    <td className="p-3 font-medium text-blue-700">{h.availableBeds} beds available</td>
                  </tr>
                ))}
                {visibleShelters.map((sh) => (
                  <tr key={sh.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-teal-600">Shelter</td>
                    <td className="p-3 font-semibold text-slate-800">{sh.name}</td>
                    <td className="p-3 text-slate-600">{sh.location}, {sh.district}</td>
                    <td className="p-3 font-mono text-slate-500">{sh.latitude}° N, {sh.longitude}° E</td>
                    <td className="p-3 font-medium text-teal-700">{sh.occupancy}/{sh.capacity} ({sh.status})</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
