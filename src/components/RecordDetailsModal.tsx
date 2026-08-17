import React from 'react';
import { RunningRecord } from '../types';
import { formatDateFriendly, parseExcelTime } from '../utils/formatters';
import {
  X,
  Calendar,
  MapPin,
  Trophy,
  ExternalLink,
  Flame,
  Globe,
  User,
  Clock,
  Zap,
  Tag,
  Share2,
  Award,
} from 'lucide-react';

interface RecordDetailsModalProps {
  record: RunningRecord | null;
  onClose: () => void;
}

export const RecordDetailsModal: React.FC<RecordDetailsModalProps> = ({
  record,
  onClose,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!record) return null;

  const handleShareRecord = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {}
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0A0A0A] border border-white/20 p-6 sm:p-8 max-w-lg w-full relative text-white space-y-6 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 bg-[#D9FF00] text-black font-black text-[10px] uppercase tracking-wider">
                {record.distance_category}
              </span>
              <span className="px-2.5 py-0.5 bg-white/10 text-white font-bold text-[10px] uppercase tracking-wider">
                {record.event_type}
              </span>
              <span className="px-2.5 py-0.5 bg-[#D9FF00]/10 text-[#D9FF00] border border-[#D9FF00]/20 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <Globe className="w-3 h-3" /> Verified Event
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tighter text-white">
              {record.event_name}
            </h3>

            <p className="text-xs uppercase tracking-wider text-white/40 font-bold flex items-center gap-2 mt-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-white/30" />
                {formatDateFriendly(record.event_date)} ({record.year})
              </span>
              {record.location && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-white/30" />
                    {record.location}
                  </span>
                </>
              )}
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-white/40 hover:text-white p-1 border border-white/10 hover:border-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          
          <div className="bg-white/5 border border-white/10 p-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 block">Distance</span>
            <div className="text-2xl font-black font-mono text-[#D9FF00] mt-1">
              {record.distance_km} <span className="text-xs text-white/60 font-sans">KM</span>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 block">Official Time</span>
            <div className="text-xl font-black font-mono text-white mt-1">
              {parseExcelTime(record.official_time) || '-'}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 block">Avg Pace</span>
            <div className="text-xl font-black font-mono text-white mt-1">
              {record.pace || '-'}
            </div>
          </div>

          {record.strava_time && (
            <div className="bg-white/5 border border-white/10 p-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 block">Strava Time</span>
              <div className="text-lg font-black font-mono text-white/80 mt-1">
                {parseExcelTime(record.strava_time)}
              </div>
            </div>
          )}

          {record.bib_number && (
            <div className="bg-white/5 border border-white/10 p-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 block">BIB Number</span>
              <div className="text-lg font-black font-mono text-white/80 mt-1">
                #{record.bib_number}
              </div>
            </div>
          )}

          {record.organizer && (
            <div className="bg-white/5 border border-white/10 p-3 col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 block">Organizer</span>
              <div className="text-xs font-bold text-white/80 truncate mt-1">
                {record.organizer}
              </div>
            </div>
          )}

        </div>

        {/* Notes / Story */}
        {record.notes && (
          <div className="bg-white/5 border border-white/10 p-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 block mb-1.5 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#D9FF00]" /> Race Notes & Reflection
            </span>
            <p className="text-xs text-white/80 leading-relaxed font-sans italic">
              "{record.notes}"
            </p>
          </div>
        )}

        {/* Modal Footer Actions */}
        <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center gap-2">
            {record.strava_url && (
              <a
                href={record.strava_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-[#D9FF00] text-black font-black uppercase tracking-tighter italic text-xs hover:brightness-110 transition-all"
              >
                <Flame className="w-4 h-4 fill-current" />
                <span>Strava</span>
                <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
              </a>
            )}

            {record.certificate_url && (
              <a
                href={record.certificate_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-emerald-400 text-black font-black uppercase tracking-tighter italic text-xs hover:brightness-110 transition-all"
                title="View Finisher Certificate (Google Drive / Official PDF)"
              >
                <Award className="w-4 h-4" />
                <span>Certificate</span>
                <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
              </a>
            )}

            {!record.strava_url && !record.certificate_url && (
              <span className="text-xs text-white/30 font-bold uppercase tracking-wider">No External Links</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareRecord}
              className="p-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
              title="Copy share link"
            >
              <Share2 className="w-4 h-4 text-[#D9FF00]" />
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Share'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold uppercase text-xs transition-colors"
            >
              Close
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
