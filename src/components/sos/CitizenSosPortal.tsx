import React, { useState } from 'react';
import {
  AlertTriangle,
  Send,
  CheckCircle2,
  PhoneCall,
  MapPin,
  Users,
  HeartPulse,
  Accessibility,
  Search,
  Clock,
  ShieldAlert,
  Compass,
  FileText,
  LifeBuoy,
} from 'lucide-react';
import { api } from '../../services/api';
import { SosRequest, SosPriority } from '../../types';

interface CitizenSosPortalProps {
  onSosCreated?: (sos: SosRequest) => void;
  activeDistrict?: string;
}

export const CitizenSosPortal: React.FC<CitizenSosPortalProps> = ({
  onSosCreated,
  activeDistrict = 'Chennai',
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'track'>('create');

  // Form State
  const [category, setCategory] = useState('Trapped / Inundation');
  const [citizenName, setCitizenName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [district, setDistrict] = useState(activeDistrict);
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [peopleAffected, setPeopleAffected] = useState<number>(1);
  const [injuredCount, setInjuredCount] = useState<number>(0);
  const [medicalRequirements, setMedicalRequirements] = useState('');
  const [specialNeeds, setSpecialNeeds] = useState('');
  const [priority, setPriority] = useState<SosPriority>('Urgent');
  const [consentGps, setConsentGps] = useState(true);

  // Status & Feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [createdSos, setCreatedSos] = useState<SosRequest | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Tracking state
  const [searchTrackingCode, setSearchTrackingCode] = useState('');
  const [trackedSos, setTrackedSos] = useState<SosRequest | null>(null);
  const [trackSearched, setTrackSearched] = useState(false);

  const emergencyCategories = [
    'Trapped / Inundation',
    'Medical Emergency / Oxygen Shortage',
    'Structural Collapse / Building Wall Damage',
    'Food & Potable Water Exhaustion',
    'Missing Family Member',
    'Elderly / Disabled Evacuation Need',
    'Electrical Hazard / Downed Power Lines',
    'Other Severe Hazard',
  ];

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!citizenName.trim()) {
      errs.citizenName = 'Please enter your full name or family representative name.';
    }
    if (!contactPhone.trim()) {
      errs.contactPhone = 'Please provide a valid emergency contact phone number.';
    } else if (contactPhone.replace(/\D/g, '').length < 10) {
      errs.contactPhone = 'Phone number must have at least 10 digits.';
    }
    if (!location.trim()) {
      errs.location = 'Please specify landmark, street, door no, or ward location.';
    }
    if (!description.trim()) {
      errs.description = 'Please describe the emergency situation.';
    }
    if (peopleAffected < 1) {
      errs.peopleAffected = 'At least 1 person must be affected.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      setToastMessage('Please fix the highlighted errors before sending SOS.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Default coordinate anchors for districts
      let baseLat = 13.0827;
      let baseLng = 80.2707;
      if (district === 'Cuddalore') {
        baseLat = 11.748;
        baseLng = 79.7714;
      } else if (district === 'Nagapattinam') {
        baseLat = 10.7656;
        baseLng = 79.8436;
      } else if (district === 'Tiruvallur') {
        baseLat = 13.1438;
        baseLng = 79.9079;
      } else if (district === 'Kancheepuram') {
        baseLat = 12.8342;
        baseLng = 79.7036;
      }

      // Add small realistic offset
      const lat = baseLat + (Math.random() - 0.5) * 0.05;
      const lng = baseLng + (Math.random() - 0.5) * 0.05;

      const newSos = await api.createSosRequest({
        emergencyCategory: category,
        description,
        citizenName,
        contactPhone,
        district,
        location,
        latitude: Number(lat.toFixed(4)),
        longitude: Number(lng.toFixed(4)),
        peopleAffected: Number(peopleAffected),
        injuredCount: Number(injuredCount),
        medicalRequirements: medicalRequirements || 'None specified',
        specialNeeds: specialNeeds || 'None specified',
        priority,
      });

      setCreatedSos(newSos);
      setToastMessage(`SOS Beacon transmitted! Tracking ID: ${newSos.trackingCode}`);
      if (onSosCreated) {
        onSosCreated(newSos);
      }
    } catch (err) {
      console.error(err);
      setToastMessage('Failed to transmit SOS. Please contact 112 immediately.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTrackLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTrackingCode.trim()) return;

    const allSos = await api.getSosRequests();
    const cleanSearch = searchTrackingCode.trim().toLowerCase();
    const found = allSos.find(
      (s) =>
        s.trackingCode.toLowerCase() === cleanSearch ||
        s.id.toLowerCase() === cleanSearch ||
        s.contactPhone.includes(cleanSearch)
    );

    setTrackedSos(found || null);
    setTrackSearched(true);
  };

  const handleResetForm = () => {
    setCreatedSos(null);
    setCitizenName('');
    setContactPhone('');
    setLocation('');
    setDescription('');
    setPeopleAffected(1);
    setInjuredCount(0);
    setMedicalRequirements('');
    setSpecialNeeds('');
    setPriority('Urgent');
    setErrors({});
    setToastMessage(null);
  };

  return (
    <div className="space-y-6">
      {/* Toast feedback banner */}
      {toastMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-sm font-semibold">{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 underline ml-4 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Official Emergency Disclaimer */}
      <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-900 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-amber-100 rounded-lg shrink-0 mt-0.5">
            <ShieldAlert className="w-5 h-5 text-amber-700" />
          </div>
          <div className="text-xs md:text-sm">
            <p className="font-bold text-amber-950">
              Emergency Academic Prototype Disclaimer — Easwari Engineering College
            </p>
            <p className="text-amber-800 mt-0.5 leading-relaxed">
              LIFE-LINK coordinates relief logistics and response triage. If you or someone around you is in immediate mortal peril, do not wait for platform triage alone. Immediately call official State Emergency Services:
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <a
            href="tel:112"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-sm transition"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>112 National</span>
          </a>
          <a
            href="tel:1070"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-sm transition"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>1070 TN Disaster</span>
          </a>
          <a
            href="tel:108"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>108 Ambulance</span>
          </a>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer flex items-center space-x-2 ${
              activeTab === 'create'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Transmit Emergency SOS</span>
          </button>
          <button
            onClick={() => setActiveTab('track')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer flex items-center space-x-2 ${
              activeTab === 'track'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Track SOS Status</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 hidden sm:flex items-center space-x-1">
          <Compass className="w-4 h-4 text-emerald-600" />
          <span>Active Command: {district} Disaster Zone</span>
        </div>
      </div>

      {/* CREATE TAB */}
      {activeTab === 'create' && (
        <>
          {createdSos ? (
            /* Submission Success Card */
            <div className="p-8 rounded-2xl bg-white border border-emerald-200 shadow-sm text-center max-w-2xl mx-auto space-y-6">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                  SOS Transmitted & Logged
                </span>
                <h3 className="text-2xl font-bold text-slate-900 mt-2">
                  Emergency Signal Active
                </h3>
                <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
                  Your SOS beacon has been registered in the LIFE-LINK emergency queue and prioritized for nearest rescue unit triage.
                </p>
              </div>

              {/* Tracking Ticket */}
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Emergency Tracking Code
                  </span>
                  <span className="text-base font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {createdSos.trackingCode}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500">SOS ID:</span>{' '}
                    <span className="font-semibold text-slate-800">{createdSos.id}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Priority Level:</span>{' '}
                    <span className="font-semibold text-red-600">{createdSos.priority}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Citizen:</span>{' '}
                    <span className="font-semibold text-slate-800">{createdSos.citizenName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Location:</span>{' '}
                    <span className="font-semibold text-slate-800">{createdSos.location}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Triage Status:</span>{' '}
                    <span className="font-semibold text-amber-600">{createdSos.status}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">District:</span>{' '}
                    <span className="font-semibold text-slate-800">{createdSos.district}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <button
                  onClick={() => {
                    setSearchTrackingCode(createdSos.trackingCode);
                    setActiveTab('track');
                    handleTrackLookup({ preventDefault: () => {} } as React.FormEvent);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition cursor-pointer flex items-center justify-center space-x-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Monitor Live Rescue Status</span>
                </button>
                <button
                  onClick={handleResetForm}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold text-sm hover:bg-slate-200 transition cursor-pointer"
                >
                  Submit Another Assistance Request
                </button>
              </div>
            </div>
          ) : (
            /* SOS Creation Form */
            <form
              onSubmit={handleSubmit}
              className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-8 space-y-6 max-w-4xl mx-auto"
            >
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-red-100 text-red-600 rounded-xl">
                    <LifeBuoy className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Emergency Assistance Request (Citizen SOS)
                    </h2>
                    <p className="text-xs md:text-sm text-slate-500">
                      Coordinates directly with District Disaster Management Authorities and on-ground rescue battalions.
                    </p>
                  </div>
                </div>
              </div>

              {/* Priority Select Banner */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select Emergency Urgency Tier
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setPriority('Standard')}
                    className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                      priority === 'Standard'
                        ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 ring-2 ring-emerald-400'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="font-bold text-sm">Standard Relief</div>
                    <div className="text-xs text-slate-500 mt-1">
                      Food, drinking water supply, power cutoff, non-urgent assistance.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPriority('Urgent')}
                    className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                      priority === 'Urgent'
                        ? 'border-amber-500 bg-amber-50/80 text-amber-950 ring-2 ring-amber-400'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="font-bold text-sm text-amber-900">Urgent Evacuation</div>
                    <div className="text-xs text-slate-500 mt-1">
                      Rising floodwaters, marooned household, elderly care, minor injuries.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPriority('Life-Threatening')}
                    className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                      priority === 'Life-Threatening'
                        ? 'border-red-600 bg-red-50 text-red-950 ring-2 ring-red-400'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="font-bold text-sm text-red-700 flex items-center space-x-1">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>Life-Threatening</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Rooftop submersion, acute trauma, oxygen failure, drowning risk.
                    </div>
                  </button>
                </div>
              </div>

              {/* Category & District */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Emergency Nature / Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {emergencyCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Affected District *
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Chennai">Chennai (Adyar / Saidapet / Velachery)</option>
                    <option value="Cuddalore">Cuddalore (Devanampattinam / Chidambaram)</option>
                    <option value="Nagapattinam">Nagapattinam (Velankanni / Vedaranyam)</option>
                    <option value="Tiruvallur">Tiruvallur (Ennore / Ponneri / Minjur)</option>
                    <option value="Kancheepuram">Kancheepuram (Chengalpattu Coastal)</option>
                  </select>
                </div>
              </div>

              {/* Citizen Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Full Name / Caller *
                  </label>
                  <input
                    type="text"
                    value={citizenName}
                    onChange={(e) => setCitizenName(e.target.value)}
                    placeholder="e.g. R. Karthikeyan"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-none ${
                      errors.citizenName
                        ? 'border-red-400 bg-red-50/50 focus:ring-2 focus:ring-red-300'
                        : 'border-slate-300 focus:ring-2 focus:ring-emerald-500'
                    }`}
                  />
                  {errors.citizenName && (
                    <p className="text-xs text-red-600 mt-1">{errors.citizenName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Emergency Contact Phone *
                  </label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="e.g. +91 94440 12345"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-none ${
                      errors.contactPhone
                        ? 'border-red-400 bg-red-50/50 focus:ring-2 focus:ring-red-300'
                        : 'border-slate-300 focus:ring-2 focus:ring-emerald-500'
                    }`}
                  />
                  {errors.contactPhone && (
                    <p className="text-xs text-red-600 mt-1">{errors.contactPhone}</p>
                  )}
                </div>
              </div>

              {/* Specific Location & Landmark */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Exact Landmark, Building, Door No, & Street *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Door No 24, 3rd Cross Street, River View Colony near Mariamman Temple"
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-none ${
                      errors.location
                        ? 'border-red-400 bg-red-50/50 focus:ring-2 focus:ring-red-300'
                        : 'border-slate-300 focus:ring-2 focus:ring-emerald-500'
                    }`}
                  />
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
                {errors.location && (
                  <p className="text-xs text-red-600 mt-1">{errors.location}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Emergency Situation Description *
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe depth of water, whether you are on rooftop, current condition of trapped persons..."
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-none ${
                    errors.description
                      ? 'border-red-400 bg-red-50/50 focus:ring-2 focus:ring-red-300'
                      : 'border-slate-300 focus:ring-2 focus:ring-emerald-500'
                  }`}
                />
                {errors.description && (
                  <p className="text-xs text-red-600 mt-1">{errors.description}</p>
                )}
              </div>

              {/* People Affected & Medical details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    People Trapped/Needing Aid *
                  </label>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-slate-500" />
                    <input
                      type="number"
                      min={1}
                      max={500}
                      value={peopleAffected}
                      onChange={(e) => setPeopleAffected(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-sm bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Injured / Critical Count
                  </label>
                  <div className="flex items-center space-x-2">
                    <HeartPulse className="w-4 h-4 text-red-500" />
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={injuredCount}
                      onChange={(e) => setInjuredCount(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-sm bg-white"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Urgent Medical / Drug Requirements
                  </label>
                  <input
                    type="text"
                    value={medicalRequirements}
                    onChange={(e) => setMedicalRequirements(e.target.value)}
                    placeholder="e.g. Insulin, Asthma inhaler, Dialysis, Trauma bandage"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-sm bg-white"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
                    <Accessibility className="w-3.5 h-3.5 text-slate-500" />
                    <span>Vulnerable Persons / Special Assistance Requirements</span>
                  </label>
                  <input
                    type="text"
                    value={specialNeeds}
                    onChange={(e) => setSpecialNeeds(e.target.value)}
                    placeholder="e.g. Bedridden octogenarian, 3-month-old infant, visually impaired person, wheelchair user"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-sm bg-white"
                  />
                </div>
              </div>

              {/* Consent Checkbox */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="gpsConsent"
                  checked={consentGps}
                  onChange={(e) => setConsentGps(e.target.checked)}
                  className="mt-1 h-4 w-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <label htmlFor="gpsConsent" className="text-xs text-slate-600 leading-relaxed">
                  I consent to sharing my location and contact details with authorized Government Disaster
                  Relief Officials, SDRF/NDRF rescue battalions, and medical response coordinators for rescue operations.
                </label>
              </div>

              {/* Action Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !consentGps}
                  className={`w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-sm shadow-md transition flex items-center justify-center space-x-2 cursor-pointer ${
                    priority === 'Life-Threatening'
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  } ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {isSubmitting ? 'Transmitting Emergency Beacon...' : 'Transmit Emergency SOS Now'}
                  </span>
                </button>
              </div>
            </form>
          )}
        </>
      )}

      {/* TRACK TAB */}
      {activeTab === 'track' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-8 space-y-6 max-w-3xl mx-auto">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Search className="w-5 h-5 text-emerald-600" />
              <span>Track Emergency SOS Status</span>
            </h2>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5">
              Enter your unique tracking code (e.g. LL-SOS-7892-A) or contact phone number to view live triage notes.
            </p>
          </div>

          <form onSubmit={handleTrackLookup} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchTrackingCode}
                onChange={(e) => setSearchTrackingCode(e.target.value)}
                placeholder="Enter SOS Tracking Code or SOS ID..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition cursor-pointer shadow-sm flex items-center justify-center space-x-2"
            >
              <span>Search Status</span>
            </button>
          </form>

          {trackSearched && !trackedSos && (
            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
              <FileText className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No matching SOS request found</p>
              <p className="text-xs text-slate-500">
                Please verify the tracking code or try searching using sample code: <code className="bg-slate-200 px-1 py-0.5 rounded">LL-SOS-7892-A</code>
              </p>
            </div>
          )}

          {trackedSos && (
            <div className="p-6 rounded-xl border border-emerald-200 bg-emerald-50/30 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                <div>
                  <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    {trackedSos.trackingCode}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    {trackedSos.emergencyCategory}
                  </h3>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      trackedSos.status === 'Pending Triage'
                        ? 'bg-amber-100 text-amber-800'
                        : trackedSos.status === 'Assigned'
                        ? 'bg-blue-100 text-blue-800'
                        : trackedSos.status === 'Rescue In Progress'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {trackedSos.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500">Citizen:</span>{' '}
                  <span className="font-semibold text-slate-800">{trackedSos.citizenName}</span>
                </div>
                <div>
                  <span className="text-slate-500">District:</span>{' '}
                  <span className="font-semibold text-slate-800">{trackedSos.district}</span>
                </div>
                <div>
                  <span className="text-slate-500">Reported Time:</span>{' '}
                  <span className="font-semibold text-slate-800">{trackedSos.reportedAt}</span>
                </div>
                <div>
                  <span className="text-slate-500">Priority:</span>{' '}
                  <span className="font-semibold text-red-600">{trackedSos.priority}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-500">Location:</span>{' '}
                  <span className="font-semibold text-slate-800">{trackedSos.location}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-500">Dispatched Rescue Unit:</span>{' '}
                  <span className="font-semibold text-emerald-700">
                    {trackedSos.assignedUnit || 'Triage in progress; unit being assigned by control room'}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1">
                <div className="font-semibold text-slate-800 flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Current Triage Advisory</span>
                </div>
                <p>
                  Rescue teams are actively operating in this sector. Keep your phone charged, stay in an elevated high ground, and do not attempt to walk across swift current water deeper than knee level.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
