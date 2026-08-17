import React, { useState } from 'react';
import { RunningRecord, FilterState } from '../types';
import { formatDateFriendly, parseExcelTime } from '../utils/formatters';
import {
  Search,
  Flame,
  Award,
  ExternalLink,
  MapPin,
  Calendar,
  Grid,
  List,
  SlidersHorizontal,
} from 'lucide-react';

interface RecordTableProps {
  records: RunningRecord[];
  filterState: FilterState;
  setFilterState: React.Dispatch<React.SetStateAction<FilterState>>;
  onSelectRecord: (record: RunningRecord) => void;
}

export const RecordTable: React.FC<RecordTableProps> = ({
  records,
  filterState,
  setFilterState,
  onSelectRecord,
}) => {
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/10 text-xs">
          
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

        </div>

      </div>

      {/* Results Header Info Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-white/40 font-bold uppercase tracking-widest px-1">
          <div className="flex items-center gap-3">
            <span>
              Showing <strong className="text-[#D9FF00] font-mono text-sm">{sortedRecords.length}</strong> of {records.length} Activities
            </span>
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
                <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">
                  Event / Location
                </th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Date</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Category</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold text-right">Distance</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold text-right">Finish Time</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold text-right">Avg Pace</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold text-center">Links</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {sortedRecords.map((r) => {
                return (
                  <tr
                    key={r.id}
                    onClick={() => onSelectRecord(r)}
                    className="transition-colors cursor-pointer group hover:bg-white/5"
                  >
                    {/* Event Name & Location */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-black uppercase italic tracking-tighter text-base sm:text-lg text-white group-hover:text-[#D9FF00] transition-colors">
                          {r.event_name}
                        </span>
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
                            title="Finisher Certificate"
                          >
                            <Award className="w-3 h-3" />
                            <span className="hidden lg:inline">Cert</span>
                          </a>
                        )}
                        {!r.strava_url && !r.certificate_url && (
                          <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                            {r.bib_number ? `BIB #${r.bib_number}` : '-'}
                          </span>
                        )}
                      </div>
                    </td>

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
            return (
              <div
                key={r.id}
                onClick={() => onSelectRecord(r)}
                className="bg-white/[0.02] border border-white/10 hover:border-[#D9FF00]/40 p-5 transition-all duration-200 cursor-pointer group flex flex-col justify-between space-y-4 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#D9FF00]/5"
              >
                <div>
                  
                  {/* Header badges */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-[#D9FF00] text-black font-black text-[10px] uppercase tracking-wider">
                        {r.distance_category}
                      </span>
                      <span className="px-2 py-0.5 bg-white/10 text-white/80 font-bold text-[10px] uppercase tracking-wider">
                        {r.event_type}
                      </span>
                    </div>

                    <div className="w-2 h-2 bg-[#D9FF00] rounded-full" />
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
                </div>

              </div>
            );
          })}
        </div>

      )}

    </div>
  );
};
