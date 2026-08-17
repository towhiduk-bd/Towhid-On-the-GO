import React from 'react';
import { RunningRecord } from '../types';
import { formatDateFriendly, parseExcelTime } from '../utils/formatters';
import { ConfirmModal } from './ConfirmModal';
import {
  X,
  Calendar,
  MapPin,
  Trophy,
  ExternalLink,
  Flame,
  Globe,
  Lock,
  User,
  Clock,
  Zap,
  Tag,
  Share2,
  Award,
  Trash2,
} from 'lucide-react';

interface RecordDetailsModalProps {
  record: RunningRecord | null;
  onClose: () => void;
  isAdmin?: boolean;
  onEdit?: (record: RunningRecord) => void;
  onDelete?: (id: string) => void;
}

export const RecordDetailsModal: React.FC<RecordDetailsModalProps> = ({
  record,
  onClose,
  isAdmin,
  onEdit,
  onDelete,
}) => {
  const [copied, setCopied] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  if (!record) return null;

  const handleShareRecord = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
              {record.visibility === 'Private' ? (
                <span className="px-2.5 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Private
                </span>
              ) : (
                <span className="px-2.5 py-0.5 bg-[#D9FF00]/10 text-[#D9FF00] border border-[#D9FF00]/20 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <Globe className="w-3 h-3" /> Public
                </span>
              )}
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

        {/* Primary Key Stats Box */}
        <div className="grid grid-cols-3 gap-3 bg-black/60 p-4 border border-white/10 text-center">
          <div>
            <span className="text-[10px] uppercase font-bold text-white/40 block">Distance</span>
            <span className="text-xl font-black text-[#D9FF00] font-mono">{record.distance_km} KM</span>
          </div>
          <div className="border-x border-white/10">
            <span className="text-[10px] uppercase font-bold text-white/40 block">Time</span>
            <span className="text-xl font-black text-white font-mono">
              {parseExcelTime(record.official_time || record.strava_time) || '--'}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-white/40 block">Pace</span>
            <span className="text-xl font-black text-white/80 font-mono">{record.pace || '-'}</span>
          </div>
        </div>

        {/* Extended Metadata */}
        <div className="space-y-3 text-xs">
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-black/40 p-3 border border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-0.5">BIB Number</span>
              <span className="text-sm font-bold text-white font-mono">{record.bib_number || 'N/A'}</span>
            </div>

            <div className="bg-black/40 p-3 border border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-0.5">Strava Time</span>
              <span className="text-sm font-bold text-[#D9FF00] font-mono">{parseExcelTime(record.strava_time || record.official_time) || 'N/A'}</span>
            </div>
          </div>

          {record.organizer && (
            <div className="bg-black/40 p-3 border border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-0.5">Event Organizer</span>
              <span className="text-xs font-bold text-white uppercase tracking-wider">{record.organizer}</span>
            </div>
          )}

          {record.notes && (
            <div className="bg-black/40 p-3 border border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-1">Notes & Highlights</span>
              <p className="text-xs text-white/80 italic font-mono leading-relaxed">{record.notes}</p>
            </div>
          )}

          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-white/30 px-1 pt-1">
            <span>Source: <strong className="text-white/60">{record.source}</strong></span>
            <span>Ref ID: <code className="font-mono text-white/60">{record.id.slice(0, 10)}</code></span>
          </div>

        </div>

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

            {isAdmin && onEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(record);
                }}
                className="px-4 py-2.5 bg-white text-black font-black uppercase tracking-tighter italic text-xs hover:bg-[#D9FF00] transition-all"
              >
                Edit Record
              </button>
            )}

            {isAdmin && onDelete && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-3 py-2.5 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 font-bold uppercase tracking-wider text-xs transition-all flex items-center gap-1.5"
                title="Delete this running record"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}
          </div>

        </div>

      </div>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete Running Record"
        message={`Are you sure you want to delete "${record.event_name}"? This action cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={() => {
          setShowDeleteConfirm(false);
          onClose();
          onDelete?.(record.id);
        }}
        onClose={() => setShowDeleteConfirm(false)}
      />

    </div>
  );
};
