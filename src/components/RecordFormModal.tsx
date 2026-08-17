import React, { useState, useEffect } from 'react';
import { RunningRecord, EventType, RecordVisibility } from '../types';
import { calculatePace, inferDistanceCategory } from '../utils/formatters';
import { ConfirmModal } from './ConfirmModal';
import { X, Calendar, MapPin, Hash, Timer, Link2, Eye, ShieldCheck, Award, Trash2 } from 'lucide-react';

interface RecordFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: Partial<RunningRecord>) => void;
  onDelete?: (id: string) => void;
  initialRecord?: RunningRecord | null;
}

export const RecordFormModal: React.FC<RecordFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialRecord,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [distanceKm, setDistanceKm] = useState<number | ''>('');
  const [distanceCategory, setDistanceCategory] = useState('');
  const [bibNumber, setBibNumber] = useState('');
  const [officialTime, setOfficialTime] = useState('');
  const [stravaTime, setStravaTime] = useState('');
  const [stravaUrl, setStravaUrl] = useState('');
  const [certificateUrl, setCertificateUrl] = useState('');
  const [location, setLocation] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [eventType, setEventType] = useState<EventType>('Road');
  const [notes, setNotes] = useState('');
  const [visibility, setVisibility] = useState<RecordVisibility>('Public');

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialRecord) {
      setEventName(initialRecord.event_name || '');
      setEventDate(initialRecord.event_date || '');
      setDistanceKm(initialRecord.distance_km || '');
      setDistanceCategory(initialRecord.distance_category || '');
      setBibNumber(initialRecord.bib_number || '');
      setOfficialTime(initialRecord.official_time || '');
      setStravaTime(initialRecord.strava_time || '');
      setStravaUrl(initialRecord.strava_url || '');
      setCertificateUrl(initialRecord.certificate_url || '');
      setLocation(initialRecord.location || '');
      setOrganizer(initialRecord.organizer || '');
      setEventType(initialRecord.event_type || 'Road');
      setNotes(initialRecord.notes || '');
      setVisibility(initialRecord.visibility || 'Public');
    } else {
      // Default new record values
      setEventName('');
      setEventDate(new Date().toISOString().split('T')[0]);
      setDistanceKm('');
      setDistanceCategory('');
      setBibNumber('');
      setOfficialTime('');
      setStravaTime('');
      setStravaUrl('');
      setCertificateUrl('');
      setLocation('Hatirjheel, Dhaka');
      setOrganizer('');
      setEventType('Road');
      setNotes('');
      setVisibility('Public');
    }
    setErrors({});
  }, [initialRecord, isOpen]);

  if (!isOpen) return null;

  // Auto calculate pace and infer category whenever distance or time changes
  const numDist = typeof distanceKm === 'number' ? distanceKm : parseFloat(String(distanceKm)) || 0;
  const activeTime = officialTime || stravaTime;
  const calculatedPace = calculatePace(numDist, activeTime);
  const inferredCat = numDist > 0 ? inferDistanceCategory(numDist) : '';

  const handleDistanceChange = (val: string) => {
    if (val === '') {
      setDistanceKm('');
      setDistanceCategory('');
      return;
    }
    const num = parseFloat(val);
    setDistanceKm(isNaN(num) ? '' : num);
    if (!isNaN(num) && num > 0) {
      setDistanceCategory(inferDistanceCategory(num));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!eventName.trim()) {
      newErrors.eventName = 'Event name is required';
    }
    if (!eventDate) {
      newErrors.eventDate = 'Event date is required';
    }
    if (!numDist || numDist <= 0) {
      newErrors.distanceKm = 'Valid distance in KM is required';
    }

    // Optional time format validation
    const timeRegex = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/;
    if (officialTime.trim() && !timeRegex.test(officialTime.trim())) {
      newErrors.officialTime = 'Use format HH:MM:SS or MM:SS (e.g. 01:45:30)';
    }
    if (stravaTime.trim() && !timeRegex.test(stravaTime.trim())) {
      newErrors.stravaTime = 'Use format HH:MM:SS or MM:SS';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const year = new Date(eventDate).getFullYear() || new Date().getFullYear();

    const recordData: Partial<RunningRecord> = {
      ...(initialRecord ? { id: initialRecord.id, sl_no: initialRecord.sl_no } : {}),
      event_name: eventName.trim(),
      event_date: eventDate,
      year,
      distance_km: numDist,
      distance_category: distanceCategory.trim() || inferredCat,
      bib_number: bibNumber.trim(),
      official_time: officialTime.trim(),
      strava_time: stravaTime.trim(),
      pace: calculatedPace,
      strava_url: stravaUrl.trim(),
      certificate_url: certificateUrl.trim(),
      location: location.trim(),
      organizer: organizer.trim(),
      event_type: eventType,
      notes: notes.trim(),
      source: initialRecord ? initialRecord.source : 'Manual',
      visibility,
      updated_at: new Date().toISOString(),
      created_at: initialRecord ? initialRecord.created_at : new Date().toISOString(),
    };

    onSave(recordData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0A0A0A] border border-white/20 p-6 sm:p-8 max-w-2xl w-full relative text-white max-h-[90vh] flex flex-col shadow-2xl space-y-6">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h3 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tighter text-white">
              {initialRecord ? 'Edit Running Record' : 'Manual Event Entry'}
            </h3>
            <p className="text-xs uppercase tracking-wider text-white/40 font-bold mt-0.5">
              Update Towhid’s running log with event details and finish times
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white p-1 border border-white/10 hover:border-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1">
          
          {/* Row 1: Event Name & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-1">
                Event Name <span className="text-[#D9FF00]">*</span>
              </label>
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="e.g. Dhaka Half Marathon 2025"
                className="w-full bg-black/60 border border-white/20 focus:border-[#D9FF00] px-4 py-2.5 text-sm font-bold text-white placeholder-white/30 outline-none"
              />
              {errors.eventName && <p className="text-red-400 text-xs mt-1 uppercase font-bold">{errors.eventName}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-1">
                Event Date <span className="text-[#D9FF00]">*</span>
              </label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full bg-black/60 border border-white/20 focus:border-[#D9FF00] px-3 py-2.5 text-xs font-bold text-white outline-none"
              />
              {errors.eventDate && <p className="text-red-400 text-xs mt-1 uppercase font-bold">{errors.eventDate}</p>}
            </div>
          </div>

          {/* Row 2: Distance KM, Distance Category & BIB */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-1">
                Distance (KM) <span className="text-[#D9FF00]">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.1"
                value={distanceKm}
                onChange={(e) => handleDistanceChange(e.target.value)}
                placeholder="e.g. 21.1 or 10"
                className="w-full bg-black/60 border border-white/20 focus:border-[#D9FF00] px-4 py-2.5 text-sm font-black text-[#D9FF00] placeholder-white/30 outline-none font-mono"
              />
              {errors.distanceKm && <p className="text-red-400 text-xs mt-1 uppercase font-bold">{errors.distanceKm}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-1">
                Category
              </label>
              <input
                type="text"
                value={distanceCategory || inferredCat}
                onChange={(e) => setDistanceCategory(e.target.value)}
                placeholder="7.5K, 10K, HM, 25K..."
                className="w-full bg-black/60 border border-white/20 focus:border-[#D9FF00] px-4 py-2.5 text-xs font-bold text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-1">
                BIB Number
              </label>
              <input
                type="text"
                value={bibNumber}
                onChange={(e) => setBibNumber(e.target.value)}
                placeholder="e.g. 1048"
                className="w-full bg-black/60 border border-white/20 focus:border-[#D9FF00] px-4 py-2.5 text-xs font-bold text-white outline-none font-mono"
              />
            </div>
          </div>

          {/* Row 3: Official Time, Strava Time & Auto Pace */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-black/40 p-4 border border-white/10">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-1">
                Official Time
              </label>
              <input
                type="text"
                value={officialTime}
                onChange={(e) => setOfficialTime(e.target.value)}
                placeholder="01:52:14"
                className="w-full bg-black/80 border border-white/20 focus:border-[#D9FF00] px-3 py-2 text-xs text-white font-mono font-bold outline-none"
              />
              {errors.officialTime && <p className="text-red-400 text-[10px] uppercase font-bold mt-1">{errors.officialTime}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-1">
                Strava Time
              </label>
              <input
                type="text"
                value={stravaTime}
                onChange={(e) => setStravaTime(e.target.value)}
                placeholder="01:51:48"
                className="w-full bg-black/80 border border-white/20 focus:border-[#D9FF00] px-3 py-2 text-xs text-white font-mono font-bold outline-none"
              />
              {errors.stravaTime && <p className="text-red-400 text-[10px] uppercase font-bold mt-1">{errors.stravaTime}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-1">
                Calculated Pace
              </label>
              <div className="h-9 bg-black/80 border border-white/10 px-3 flex items-center justify-between text-xs font-black font-mono text-[#D9FF00]">
                <span>{calculatedPace}</span>
                <span className="text-[9px] text-white/40 uppercase font-bold font-sans">Min/KM</span>
              </div>
            </div>
          </div>

          {/* Row 4: Strava Link, Certificate Link & Event Type */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-1 flex items-center gap-1">
                <Link2 className="w-3.5 h-3.5 text-[#D9FF00]" /> Strava Activity URL
              </label>
              <input
                type="url"
                value={stravaUrl}
                onChange={(e) => setStravaUrl(e.target.value)}
                placeholder="https://www.strava.com/activities/..."
                className="w-full bg-black/60 border border-white/20 focus:border-[#D9FF00] px-4 py-2.5 text-xs text-white placeholder-white/30 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-1 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-[#D9FF00]" /> Certificate Link
              </label>
              <input
                type="url"
                value={certificateUrl}
                onChange={(e) => setCertificateUrl(e.target.value)}
                placeholder="https://drive.google.com/file/d/..."
                className="w-full bg-black/60 border border-white/20 focus:border-[#D9FF00] px-4 py-2.5 text-xs text-white placeholder-white/30 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-1">
                Event Type
              </label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value as EventType)}
                className="w-full bg-black/60 border border-white/20 focus:border-[#D9FF00] px-3 py-2.5 text-xs font-bold text-white outline-none"
              >
                <option value="Road">Road</option>
                <option value="Trail">Trail</option>
                <option value="Virtual">Virtual</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Row 5: Location & Organizer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-1">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Hatirjheel, Dhaka"
                className="w-full bg-black/60 border border-white/20 focus:border-[#D9FF00] px-4 py-2.5 text-xs font-bold text-white placeholder-white/30 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-1">
                Organizer
              </label>
              <input
                type="text"
                value={organizer}
                onChange={(e) => setOrganizer(e.target.value)}
                placeholder="e.g. Dhaka Run Lords"
                className="w-full bg-black/60 border border-white/20 focus:border-[#D9FF00] px-4 py-2.5 text-xs font-bold text-white placeholder-white/30 outline-none"
              />
            </div>
          </div>

          {/* Row 6: Notes & Visibility */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-1">
                Notes & Highlights
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Weather condition, pacing notes, personal milestone..."
                className="w-full bg-black/60 border border-white/20 focus:border-[#D9FF00] px-4 py-2.5 text-xs text-white font-mono placeholder-white/30 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-1">
                Visibility
              </label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as RecordVisibility)}
                className="w-full bg-black/60 border border-white/20 focus:border-[#D9FF00] px-3 py-2.5 text-xs font-bold text-white outline-none"
              >
                <option value="Public">Public (Everyone)</option>
                <option value="Private">Private (Admin only)</option>
              </select>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
            <div>
              {initialRecord && onDelete && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-3 py-2.5 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 font-bold uppercase tracking-wider text-xs transition-all flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Event</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#D9FF00] text-black font-black uppercase tracking-tighter italic text-xs hover:brightness-110 transition-all"
              >
                {initialRecord ? 'Update Record' : 'Save Event'}
              </button>
            </div>
          </div>

        </form>

      </div>

      {initialRecord && (
        <ConfirmModal
          isOpen={showDeleteConfirm}
          title="Delete Running Record"
          message={`Are you sure you want to delete "${initialRecord.event_name}"? This action cannot be undone.`}
          confirmText="Yes, Delete"
          cancelText="Cancel"
          variant="danger"
          onConfirm={() => {
            setShowDeleteConfirm(false);
            onClose();
            onDelete?.(initialRecord.id);
          }}
          onClose={() => setShowDeleteConfirm(false)}
        />
      )}

    </div>
  );
};
