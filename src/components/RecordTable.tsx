import React, { useState } from 'react';
import { RunningRecord, FilterState } from '../types';
import { formatDateFriendly, parseExcelTime } from '../utils/formatters';
import { ConfirmModal } from './ConfirmModal';
import {
  Search,
  Filter,
  ArrowUpDown,
  Flame,
  Globe,
  Lock,
  Edit2,
  Trash2,
  ExternalLink,
  MapPin,
  Calendar,
  Grid,
  List,
  Eye,
  Plus,
  FileSpreadsheet,
  CheckCircle2,
  SlidersHorizontal,
  Award,
} from 'lucide-react';

interface RecordTableProps {
  records: RunningRecord[];
  filterState: FilterState;
  setFilterState: React.Dispatch<React.SetStateAction<FilterState>>;
  isAdmin: boolean;
  publicViewOnly: boolean;
  onSelectRecord: (record: RunningRecord) => void;
  onEditRecord?: (record: RunningRecord) => void;
  onDeleteRecord?: (id: string) => void;
  onBatchDeleteRecords?: (ids: string[]) => void;
  onToggleVisibility?: (id: string) => void;
  onOpenAddModal?: () => void;
  onOpenImportModal?: () => void;
}

export const RecordTable: React.FC<RecordTableProps> = ({
  records,
  filterState,
  setFilterState,
  isAdmin,
  publicViewOnly,
  onSelectRecord,
  onEditRecord,
  onDeleteRecord,
  onBatchDeleteRecords,
  onToggleVisibility,
  onOpenAddModal,
  onOpenImportModal,
}) => {
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [recordToDelete, setRecordToDelete] = useState<{ id: string; name: string } | null>(null);
  const [showBatchConfirm, setShowBatchConfirm] = useState(false);

  // Extract unique filter options from records
  const availableYears = Array.from(
    new Set(records.map((r) => Number(r.year || new Date(r.event_date).getFullYear())))
  ).sort((a: number, b: number) => b - a);

  const availableCategories = Array.from(
    new Set(records.map((r) => r.distance_category).filter(Boolean))
  );

  const availableTypes = ['Road', 'Trail', 'Virtual', 'Other'];

  // Filter logic
  const filteredRecords = records.filter((r) => {
    // 1. Search Query
    if (filterState.searchQuery.trim()) {
      const q = filterState.searchQuery.toLowerCase().trim();
      const matchName = r.event_name.toLowerCase().includes(q);
      const matchLoc = r.location?.toLowerCase().includes(q);
      const matchOrg = r.organizer?.toLowerCase().includes(q);
      const matchBib = r.bib_number?.toLowerCase().includes(q);
      const matchNotes = r.notes?.toLowerCase().includes(q);
      if (!matchName && !matchLoc && !matchOrg && !matchBib && !matchNotes) {
        return false;
      }
    }

    // 2. Year Filter
    if (filterState.year !== 'All') {
      if (String(r.year) !== filterState.year) return false;
    }

    // 3. Distance Category Filter
    if (filterState.category !== 'All') {
      if (r.distance_category !== filterState.category) return false;
    }

    // 4. Event Type Filter
    if (filterState.eventType !== 'All') {
      if (r.event_type !== filterState.eventType) return false;
    }

    // 5. Visibility Filter (Admin only)
    if (filterState.visibility !== 'All') {
      if (r.visibility !== filterState.visibility) return false;
    }

    // 6. Public View Protection (Non-admins or Public View mode)
    if (!isAdmin || publicViewOnly) {
      if (r.visibility === 'Private') return false;
    }

    return true;
  });

  // Sort logic
  const sortedRecords = [...filteredRecords].sort((a, b) => {
    switch (filterState.sortBy) {
      case 'date_desc': {
        const timeA = Date.parse(a.event_date) || 0;
        const timeB = Date.parse(b.event_date) || 0;
        return timeB - timeA;
      }
      case 'date_asc': {
        const timeA = Date.parse(a.event_date) || 0;
        const timeB = Date.parse(b.event_date) || 0;
        return timeA - timeB;
      }
      case 'distance_desc':
        return b.distance_km - a.distance_km;
      case 'distance_asc':
        return a.distance_km - b.distance_km;
      case 'time_asc': {
        const tA = a.official_time || a.strava_time || '99:99:99';
        const tB = b.official_time || b.strava_time || '99:99:99';
        return tA.localeCompare(tB);
      }
      case 'time_desc': {
        const tA = a.official_time || a.strava_time || '00:00:00';
        const tB = b.official_time || b.strava_time || '00:00:00';
        return tB.localeCompare(tA);
      }
      default: {
        const timeA = Date.parse(a.event_date) || 0;
        const timeB = Date.parse(b.event_date) || 0;
        return timeB - timeA;
      }
    }
  });

  // Selection helpers
  const visibleRecordIds = sortedRecords.map((r) => r.id);
  const allFilteredSelected =
    visibleRecordIds.length > 0 &&
    visibleRecordIds.every((id) => selectedIds.includes(id));

  const toggleSelectRecord = (id: string, e?: React.MouseEvent | React.ChangeEvent) => {
    if (e) e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAllFiltered = () => {
    if (allFilteredSelected) {
      setSelectedIds((prev) => prev.filter((id) => !visibleRecordIds.includes(id)));
    } else {
      const combined = new Set([...selectedIds, ...visibleRecordIds]);
      setSelectedIds(Array.from(combined));
    }
  };

  const handleBatchDelete = () => {
    if (selectedIds.length === 0) return;
    setShowBatchConfirm(true);
  };

  const confirmBatchDelete = () => {
    if (onBatchDeleteRecords) {
      onBatchDeleteRecords(selectedIds);
    } else if (onDeleteRecord) {
      selectedIds.forEach((id) => onDeleteRecord(id));
    }
    setSelectedIds([]);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <h2 className="text-4xl sm:text-5xl font-black uppercase italic tracking-tighter text-white">
            Recent Activity
          </h2>
          <p className="text-xs uppercase tracking-[0.2em] text-white/40 font-bold mt-1">
            Running Log Records & Verified Finishes
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white/5 border border-white/10 p-1">
            <button
              onClick={() => setFilterState((prev) => ({ ...prev, viewMode: 'table' }))}
              className={`p-2 transition-all ${
                filterState.viewMode === 'table'
                  ? 'bg-[#D9FF00] text-black font-bold'
                  : 'text-white/40 hover:text-white'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setFilterState((prev) => ({ ...prev, viewMode: 'cards' }))}
              className={`p-2 transition-all ${
                filterState.viewMode === 'cards'
                  ? 'bg-[#D9FF00] text-black font-bold'
                  : 'text-white/40 hover:text-white'
              }`}
              title="Card View"
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>

          {isAdmin && !publicViewOnly && (
            <button
              onClick={onOpenAddModal}
              className="px-4 py-2.5 bg-[#D9FF00] text-black font-black uppercase tracking-tighter italic text-xs hover:brightness-110 flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add Event</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-white/[0.02] border border-white/10 p-4 space-y-3">
        
        {/* Search Input & Quick Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-3" />
            <input
              type="text"
              value={filterState.searchQuery}
              onChange={(e) => setFilterState((prev) => ({ ...prev, searchQuery: e.target.value }))}
              placeholder="Search event name, location, BIB..."
              className="w-full bg-black/50 border border-white/20 focus:border-[#D9FF00] px-10 py-2 text-xs uppercase tracking-wider font-bold text-white placeholder-white/30 outline-none transition-all"
            />
            {filterState.searchQuery && (
              <button
                onClick={() => setFilterState((prev) => ({ ...prev, searchQuery: '' }))}
                className="absolute right-3 top-2.5 text-[10px] font-bold uppercase tracking-widest text-[#D9FF00] hover:underline"
              >
                Clear
              </button>
            )}
          </div>

        </div>

        {/* Filters Dropdown Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 pt-3 border-t border-white/10 text-xs">
          
          {/* Year Filter */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 block mb-1">
              Year
            </label>
            <select
              value={filterState.year}
              onChange={(e) => setFilterState((prev) => ({ ...prev, year: e.target.value }))}
              className="w-full bg-black/60 border border-white/20 text-white font-bold uppercase tracking-wider px-3 py-2 outline-none focus:border-[#D9FF00]"
            >
              <option value="All">All Years</option>
              {availableYears.map((y) => (
                <option key={y} value={String(y)}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 block mb-1">
              Category
            </label>
            <select
              value={filterState.category}
              onChange={(e) => setFilterState((prev) => ({ ...prev, category: e.target.value }))}
              className="w-full bg-black/60 border border-white/20 text-white font-bold uppercase tracking-wider px-3 py-2 outline-none focus:border-[#D9FF00]"
            >
              <option value="All">All Categories</option>
              {availableCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Event Type Filter */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 block mb-1">
              Type
            </label>
            <select
              value={filterState.eventType}
              onChange={(e) => setFilterState((prev) => ({ ...prev, eventType: e.target.value }))}
              className="w-full bg-black/60 border border-white/20 text-white font-bold uppercase tracking-wider px-3 py-2 outline-none focus:border-[#D9FF00]"
            >
              <option value="All">All Types</option>
              {availableTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 block mb-1">
              Sort
            </label>
            <select
              value={filterState.sortBy}
              onChange={(e) =>
                setFilterState((prev) => ({ ...prev, sortBy: e.target.value as any }))
              }
              className="w-full bg-black/60 border border-white/20 text-white font-bold uppercase tracking-wider px-3 py-2 outline-none focus:border-[#D9FF00]"
            >
              <option value="date_desc">Date (Newest)</option>
              <option value="date_asc">Date (Oldest)</option>
              <option value="distance_desc">Distance (Longest)</option>
              <option value="distance_asc">Distance (Shortest)</option>
              <option value="time_asc">Finish (Fastest)</option>
            </select>
          </div>

          {/* Visibility Filter (Admin only) */}
          {isAdmin && !publicViewOnly && (
            <div className="col-span-2 sm:col-span-1">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 block mb-1">
                Visibility
              </label>
              <select
                value={filterState.visibility}
                onChange={(e) => setFilterState((prev) => ({ ...prev, visibility: e.target.value }))}
                className="w-full bg-black/60 border border-white/20 text-white font-bold uppercase tracking-wider px-3 py-2 outline-none focus:border-[#D9FF00]"
              >
                <option value="All">All Records</option>
                <option value="Public">Public Only</option>
                <option value="Private">Private Only</option>
              </select>
            </div>
          )}

        </div>

      </div>

      {/* Results Header Info Bar & Admin Batch Selection Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-white/40 font-bold uppercase tracking-widest px-1">
          <div className="flex items-center gap-3">
            <span>
              Showing <strong className="text-[#D9FF00] font-mono text-sm">{sortedRecords.length}</strong> of {records.length} Activities
            </span>
            {isAdmin && !publicViewOnly && sortedRecords.length > 0 && (
              <button
                onClick={handleSelectAllFiltered}
                className="text-xs text-white/70 hover:text-[#D9FF00] underline font-mono flex items-center gap-1 transition-colors"
              >
                {allFilteredSelected ? 'Deselect All' : `Select All (${sortedRecords.length})`}
              </button>
            )}
          </div>
          {filterState.searchQuery || filterState.year !== 'All' || filterState.category !== 'All' ? (
            <button
              onClick={() =>
                setFilterState((prev) => ({
                  ...prev,
                  searchQuery: '',
                  year: 'All',
                  category: 'All',
                  eventType: 'All',
                  visibility: 'All',
                }))
              }
              className="text-[#D9FF00] hover:underline"
            >
              Reset Filters
            </button>
          ) : null}
        </div>

        {/* Admin Batch Action Toolbar */}
        {isAdmin && !publicViewOnly && selectedIds.length > 0 && (
          <div className="bg-[#D9FF00]/10 border border-[#D9FF00]/40 p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-[#D9FF00] text-black font-black text-xs uppercase tracking-wider">
                {selectedIds.length} Selected
              </span>
              <span className="text-xs font-bold text-white/80 uppercase tracking-wider">
                out of {sortedRecords.length} visible runs
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSelectAllFiltered}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider border border-white/20 transition-all"
              >
                {allFilteredSelected ? 'Deselect All' : `Select All (${sortedRecords.length})`}
              </button>
              <button
                onClick={handleBatchDelete}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-lg border border-red-400/50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Selected ({selectedIds.length})</span>
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="px-2.5 py-1.5 text-white/50 hover:text-white text-xs font-bold uppercase tracking-wider"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Zero Records State */}
      {sortedRecords.length === 0 ? (
        <div className="bg-white/[0.02] border border-white/10 p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-white/5 border border-white/10 text-white/40 flex items-center justify-center mx-auto">
            <SlidersHorizontal className="w-6 h-6" />
          </div>
          <h4 className="text-lg font-black uppercase italic tracking-tighter text-white">No Matching Runs Found</h4>
          <p className="text-xs uppercase tracking-wider text-white/40 max-w-sm mx-auto font-bold">
            Try resetting search parameters to display recorded events.
          </p>
        </div>
      ) : filterState.viewMode === 'table' ? (
        
        /* Desktop Table View */
        <div className="bg-white/[0.02] border border-white/10 overflow-hidden shadow-2xl overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                {isAdmin && !publicViewOnly && (
                  <th className="px-4 py-4 text-center w-10" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={allFilteredSelected}
                      onChange={handleSelectAllFiltered}
                      className="w-4 h-4 accent-[#D9FF00] cursor-pointer"
                      title={allFilteredSelected ? 'Deselect all visible' : 'Select all visible'}
                    />
                  </th>
                )}
                <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">
                  {isAdmin && !publicViewOnly ? 'Event / Location' : 'Event Name'}
                </th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Date</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">
                  {isAdmin && !publicViewOnly ? 'Cat' : 'Category'}
                </th>
                {isAdmin && !publicViewOnly && (
                  <>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold text-right">Dist</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold text-right">Time</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold text-right">Pace</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold text-center">Status</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold text-center">Actions</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {sortedRecords.map((r) => {
                const isSelected = selectedIds.includes(r.id);
                return (
                  <tr
                    key={r.id}
                    onClick={() => onSelectRecord(r)}
                    className={`transition-colors cursor-pointer group ${
                      isSelected
                        ? 'bg-[#D9FF00]/10 hover:bg-[#D9FF00]/15'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    {isAdmin && !publicViewOnly && (
                      <td className="px-4 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => toggleSelectRecord(r.id, e)}
                          className="w-4 h-4 accent-[#D9FF00] cursor-pointer"
                        />
                      </td>
                    )}
                    
                    {/* Event Name & Location */}
                    <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-black uppercase italic tracking-tighter text-base sm:text-lg text-white group-hover:text-[#D9FF00] transition-colors">
                        {r.event_name}
                      </span>
                      {r.visibility === 'Private' && (
                        <span className="p-0.5 bg-red-500/10 text-red-400 border border-red-500/20" title="Private Record">
                          <Lock className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-white/40 uppercase tracking-wider font-bold flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-white/30" />
                        {r.location || 'Bangladesh'}
                      </span>
                      {r.organizer && <span>• {r.organizer}</span>}
                    </div>
                  </td>

                  {/* Date */}
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-white/80 font-bold">
                    {formatDateFriendly(r.event_date)}
                  </td>

                  {/* Category */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 bg-[#D9FF00]/10 border border-[#D9FF00]/30 text-[#D9FF00] font-bold text-[10px] uppercase tracking-wider">
                      {r.distance_category}
                    </span>
                  </td>

                  {/* Admin Only Detailed Columns */}
                  {isAdmin && !publicViewOnly && (
                    <>
                      {/* Distance */}
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-right font-black text-[#D9FF00] text-sm">
                        {r.distance_km} KM
                      </td>

                      {/* Time */}
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-right font-bold text-white text-sm">
                        {parseExcelTime(r.official_time || r.strava_time) || '-'}
                      </td>

                      {/* Pace */}
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-right font-bold text-white/80 text-xs">
                        {r.pace || '-'}
                      </td>

                      {/* Status & Links */}
                      <td className="px-6 py-4 whitespace-nowrap text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          {r.strava_url && (
                            <a
                              href={r.strava_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#D9FF00]/10 hover:bg-[#D9FF00] text-[#D9FF00] hover:text-black border border-[#D9FF00]/30 font-bold text-[10px] uppercase tracking-wider transition-all"
                              title="Strava Activity"
                            >
                              <Flame className="w-3 h-3" />
                              <span className="hidden lg:inline">Strava</span>
                            </a>
                          )}
                          {r.certificate_url && (
                            <a
                              href={r.certificate_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 hover:bg-emerald-400 text-emerald-400 hover:text-black border border-emerald-500/30 font-bold text-[10px] uppercase tracking-wider transition-all"
                              title="Google Drive Finisher Certificate"
                            >
                              <Award className="w-3 h-3" />
                              <span className="hidden lg:inline">Cert</span>
                            </a>
                          )}
                          {!r.strava_url && !r.certificate_url && (
                            <div
                              className={`w-2.5 h-2.5 rounded-full ${
                                r.visibility === 'Public' ? 'bg-[#D9FF00]' : 'border border-white/30'
                              }`}
                              title={r.visibility}
                            />
                          )}
                        </div>
                      </td>

                      {/* Admin Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          {onToggleVisibility && (
                            <button
                              onClick={() => onToggleVisibility(r.id)}
                              className="p-1.5 text-white/50 hover:text-[#D9FF00] bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                              title={r.visibility === 'Public' ? 'Set Private' : 'Set Public'}
                            >
                              {r.visibility === 'Public' ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5 text-red-400" />}
                            </button>
                          )}
                          {onEditRecord && (
                            <button
                              onClick={() => onEditRecord(r)}
                              className="px-2 py-1 bg-[#D9FF00]/10 hover:bg-[#D9FF00] text-[#D9FF00] hover:text-black border border-[#D9FF00]/30 font-bold text-[10px] uppercase tracking-wider transition-all flex items-center gap-1"
                              title="Edit running log data"
                            >
                              <Edit2 className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                          )}
                          {onDeleteRecord && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setRecordToDelete({ id: r.id, name: r.event_name });
                              }}
                              className="p-1.5 text-white/40 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 transition-colors"
                              title="Delete event"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </>
                  )}

                </tr>
              );
            })}
          </tbody>
          </table>
        </div>

      ) : (
        
        /* Card Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedRecords.map((r) => {
            const isSelected = selectedIds.includes(r.id);
            return (
              <div
                key={r.id}
                onClick={() => onSelectRecord(r)}
                className={`bg-white/[0.02] border p-5 transition-all duration-200 cursor-pointer group flex flex-col justify-between space-y-4 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#D9FF00]/5 ${
                  isSelected
                    ? 'border-[#D9FF00] bg-[#D9FF00]/5 ring-1 ring-[#D9FF00]'
                    : 'border-white/10 hover:border-[#D9FF00]/40'
                }`}
              >
                <div>
                  
                  {/* Header badges & Checkbox */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      {isAdmin && !publicViewOnly && (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => toggleSelectRecord(r.id, e)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 accent-[#D9FF00] cursor-pointer"
                        />
                      )}
                      <span className="px-2.5 py-0.5 bg-[#D9FF00] text-black font-black text-[10px] uppercase tracking-wider">
                        {r.distance_category}
                      </span>
                      <span className="px-2 py-0.5 bg-white/10 text-white/80 font-bold text-[10px] uppercase tracking-wider">
                        {r.event_type}
                      </span>
                    </div>

                    {r.visibility === 'Private' ? (
                      <span className="px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> Private
                      </span>
                    ) : (
                      <div className="w-2 h-2 bg-[#D9FF00] rounded-full" />
                    )}
                  </div>

                {/* Event Name */}
                <h4 className="text-xl font-black uppercase italic tracking-tighter text-white group-hover:text-[#D9FF00] transition-colors line-clamp-1">
                  {r.event_name}
                </h4>

                <p className="text-xs uppercase tracking-wider text-white/40 font-bold flex items-center gap-2 mt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-white/30" />
                    {formatDateFriendly(r.event_date)}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 text-white/30" />
                    {r.location || 'Bangladesh'}
                  </span>
                </p>

              </div>

              {/* Stats Box */}
              <div className="grid grid-cols-3 gap-2 bg-black/50 p-3 border border-white/10 text-center">
                <div>
                  <span className="text-[9px] uppercase font-bold text-white/40 block">Dist</span>
                  <span className="text-xs font-black text-[#D9FF00] font-mono">{r.distance_km} KM</span>
                </div>
                <div className="border-x border-white/10">
                  <span className="text-[9px] uppercase font-bold text-white/40 block">Time</span>
                  <span className="text-xs font-black text-white font-mono">
                    {parseExcelTime(r.official_time || r.strava_time) || '--'}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-white/40 block">Pace</span>
                  <span className="text-xs font-black text-white/80 font-mono">{r.pace || '-'}</span>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-white/10" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-2">
                  {r.strava_url && (
                    <a
                      href={r.strava_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#D9FF00] hover:underline"
                    >
                      <Flame className="w-3 h-3" />
                      <span>Strava</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                  {r.certificate_url && (
                    <a
                      href={r.certificate_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-emerald-400 hover:underline"
                    >
                      <Award className="w-3 h-3" />
                      <span>Cert</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                  {!r.strava_url && !r.certificate_url && (
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                      BIB: {r.bib_number ? `#${r.bib_number}` : 'N/A'}
                    </span>
                  )}
                </div>

                {isAdmin && !publicViewOnly && (
                  <div className="flex items-center gap-1.5">
                    {onEditRecord && (
                      <button
                        onClick={() => onEditRecord(r)}
                        className="px-2 py-0.5 bg-[#D9FF00]/10 hover:bg-[#D9FF00] text-[#D9FF00] hover:text-black border border-[#D9FF00]/30 font-bold text-[10px] uppercase tracking-wider transition-all flex items-center gap-1"
                        title="Edit event"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    )}
                    {onDeleteRecord && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setRecordToDelete({ id: r.id, name: r.event_name });
                        }}
                        className="p-1 text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete event"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>

            </div>
            );
          })}
        </div>

      )}

      {/* Delete Confirmation Modal for Single Record */}
      <ConfirmModal
        isOpen={!!recordToDelete}
        title="Delete Running Record"
        message={
          recordToDelete
            ? `Are you sure you want to delete "${recordToDelete.name}" from your running log? This action cannot be undone.`
            : ''
        }
        confirmText="Yes, Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={() => {
          if (recordToDelete && onDeleteRecord) {
            onDeleteRecord(recordToDelete.id);
            setRecordToDelete(null);
          }
        }}
        onClose={() => setRecordToDelete(null)}
      />

      {/* Delete Confirmation Modal for Batch Selection */}
      <ConfirmModal
        isOpen={showBatchConfirm}
        title="Delete Selected Records"
        message={`Are you sure you want to delete ${selectedIds.length} selected running log event${
          selectedIds.length > 1 ? 's' : ''
        }? This will permanently remove them from your active log.`}
        confirmText={`Delete ${selectedIds.length} Event${selectedIds.length > 1 ? 's' : ''}`}
        cancelText="Cancel"
        variant="danger"
        onConfirm={() => {
          confirmBatchDelete();
          setShowBatchConfirm(false);
        }}
        onClose={() => setShowBatchConfirm(false)}
      />

    </div>
  );
};
