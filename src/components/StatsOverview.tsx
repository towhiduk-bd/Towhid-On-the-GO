import React from 'react';
import { OverallStats, RunningRecord } from '../types';
import { formatDateFriendly, formatBest10KTime, parseExcelTime } from '../utils/formatters';
import {
  Trophy,
  Activity,
  Flame,
  Milestone,
  Award,
  Calendar,
  MapPin,
  Zap,
} from 'lucide-react';

interface StatsOverviewProps {
  stats: OverallStats;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ stats }) => {
  const renderDateOnly = (rec?: RunningRecord, fallbackEvent?: string) => {
    let text = 'No record set';
    if (rec && rec.event_date) {
      text = formatDateFriendly(rec.event_date);
    } else if (fallbackEvent) {
      text = fallbackEvent.replace(/^Set at:\s*/, '');
    }
    return (
      <p className="text-[11px] text-zinc-400 font-medium mt-1.5 truncate border-t border-zinc-800/60 pt-2">
        {text}
      </p>
    );
  };

  return (
    <div className="space-y-5 font-sans">
      
      {/* Hero Stats Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-zinc-900 via-zinc-950 to-black border border-zinc-800 p-5 sm:p-7 rounded-2xl shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#D9FF00] rounded-2xl flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(217,255,0,0.25)] border-2 border-black">
              <span className="text-xl sm:text-2xl font-black text-black italic">TR</span>
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl sm:text-3xl font-black uppercase italic tracking-tight text-white">
                  Towhid’s Running Log
                </h2>
                <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-[#D9FF00]/10 text-[#D9FF00] border border-[#D9FF00]/30 rounded-full">
                  Verified Runner
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1 font-medium">
                Official Event History, Distance Milestones & Personal Records
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 bg-black/60 px-5 py-3.5 border border-zinc-800 rounded-xl self-stretch md:self-auto justify-between shadow-inner">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold mb-0.5">
                Total Distance
              </p>
              <p className="text-2xl sm:text-3xl font-black text-white leading-tight font-mono">
                {stats.totalDistanceKm}
                <span className="text-sm font-bold ml-1 text-[#D9FF00] font-sans uppercase">KM</span>
              </p>
            </div>
            <div className="w-px h-8 bg-zinc-800" />
            <div>
              <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold mb-0.5">
                Total Runs
              </p>
              <p className="text-2xl sm:text-3xl font-black text-white leading-tight font-mono">
                {stats.totalRuns}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Key Stats Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Total Runs */}
        <div className="bg-zinc-900/80 border border-zinc-800 hover:border-[#D9FF00]/40 hover:-translate-y-0.5 p-4 sm:p-5 rounded-2xl transition-all duration-200 shadow-md hover:shadow-xl hover:shadow-[#D9FF00]/5 group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider text-zinc-400 font-bold">Total Runs</span>
            <Activity className="w-4 h-4 text-zinc-500 group-hover:text-[#D9FF00] transition-colors" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{stats.totalRuns}</p>
          <p className="text-[11px] text-zinc-400 font-medium mt-1">Recorded official events</p>
        </div>

        {/* Total Distance */}
        <div className="bg-zinc-900/80 border border-zinc-800 hover:border-[#D9FF00]/40 hover:-translate-y-0.5 p-4 sm:p-5 rounded-2xl transition-all duration-200 shadow-md hover:shadow-xl hover:shadow-[#D9FF00]/5 group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider text-zinc-400 font-bold">Distance</span>
            <Milestone className="w-4 h-4 text-zinc-500 group-hover:text-[#D9FF00] transition-colors" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#D9FF00] font-mono">
            {stats.totalDistanceKm} <span className="text-sm font-bold text-zinc-400 font-sans">KM</span>
          </p>
          <p className="text-[11px] text-zinc-400 font-medium mt-1">Accumulated mileage</p>
        </div>

        {/* Half Marathons */}
        <div className="bg-zinc-900/80 border border-zinc-800 hover:border-[#D9FF00]/40 hover:-translate-y-0.5 p-4 sm:p-5 rounded-2xl transition-all duration-200 shadow-md hover:shadow-xl hover:shadow-[#D9FF00]/5 group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider text-zinc-400 font-bold">Half Marathons</span>
            <Trophy className="w-4 h-4 text-zinc-500 group-hover:text-[#D9FF00] transition-colors" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{stats.halfMarathonCount}</p>
          <p className="text-[11px] text-zinc-400 font-medium mt-1">21.1 KM official finishes</p>
        </div>

        {/* 10K Finishes */}
        <div className="bg-zinc-900/80 border border-zinc-800 hover:border-[#D9FF00]/40 hover:-translate-y-0.5 p-4 sm:p-5 rounded-2xl transition-all duration-200 shadow-md hover:shadow-xl hover:shadow-[#D9FF00]/5 group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider text-zinc-400 font-bold">10K Finishes</span>
            <Flame className="w-4 h-4 text-zinc-500 group-hover:text-[#D9FF00] transition-colors" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{stats.tenKCount}</p>
          <p className="text-[11px] text-zinc-400 font-medium mt-1">10 KM speed challenges</p>
        </div>

      </div>

      {/* Personal Best (PB) & Milestones Grid (Only 10K, HM, Marathon, Longest Run) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* 10K Best Time */}
        <div className="bg-zinc-900/80 border border-zinc-800 hover:border-[#D9FF00]/50 hover:-translate-y-0.5 p-4 sm:p-5 rounded-2xl transition-all duration-200 shadow-md hover:shadow-xl hover:shadow-[#D9FF00]/5 relative group">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#D9FF00]" />
              <span className="text-xs uppercase tracking-wider text-zinc-300 font-bold">
                10K Best Time
              </span>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest bg-[#D9FF00]/10 text-[#D9FF00] border border-[#D9FF00]/30 rounded">
              PB
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-[#D9FF00] font-mono tracking-tight">
            {stats.best10KTime ? formatBest10KTime(stats.best10KTime) : '--:--'}
          </p>
          {renderDateOnly(stats.best10KRecord, stats.best10KEvent)}
        </div>

        {/* Half Marathon Best Time */}
        <div className="bg-zinc-900/80 border border-zinc-800 hover:border-[#D9FF00]/50 hover:-translate-y-0.5 p-4 sm:p-5 rounded-2xl transition-all duration-200 shadow-md hover:shadow-xl hover:shadow-[#D9FF00]/5 relative group">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#D9FF00]" />
              <span className="text-xs uppercase tracking-wider text-zinc-300 font-bold">
                HM Best Time
              </span>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest bg-[#D9FF00]/10 text-[#D9FF00] border border-[#D9FF00]/30 rounded">
              PB
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-[#D9FF00] font-mono tracking-tight">
            {stats.bestHalfMarathonTime ? formatBest10KTime(stats.bestHalfMarathonTime) : '--:--:--'}
          </p>
          {renderDateOnly(stats.bestHalfMarathonRecord, stats.bestHalfMarathonEvent)}
        </div>

        {/* Marathon Best Time */}
        <div className="bg-zinc-900/80 border border-zinc-800 hover:border-[#D9FF00]/50 hover:-translate-y-0.5 p-4 sm:p-5 rounded-2xl transition-all duration-200 shadow-md hover:shadow-xl hover:shadow-[#D9FF00]/5 relative group">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#D9FF00]" />
              <span className="text-xs uppercase tracking-wider text-zinc-300 font-bold">
                Marathon Best Time
              </span>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest bg-[#D9FF00]/10 text-[#D9FF00] border border-[#D9FF00]/30 rounded">
              PB
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-[#D9FF00] font-mono tracking-tight">
            {stats.bestMarathonTime ? formatBest10KTime(stats.bestMarathonTime) : '--:--:--'}
          </p>
          {renderDateOnly(stats.bestMarathonRecord, stats.bestMarathonEvent)}
        </div>

        {/* Longest Run Best */}
        <div className="bg-zinc-900/80 border border-zinc-800 hover:border-[#D9FF00]/50 hover:-translate-y-0.5 p-4 sm:p-5 rounded-2xl transition-all duration-200 shadow-md hover:shadow-xl hover:shadow-[#D9FF00]/5 relative group">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#D9FF00]" />
              <span className="text-xs uppercase tracking-wider text-zinc-300 font-bold">
                Longest Run Best
              </span>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest bg-zinc-800 text-zinc-300 border border-zinc-700 rounded">
              MAX
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-white font-mono tracking-tight">
            {stats.longestRunKm > 0 ? `${stats.longestRunKm} KM` : '-- KM'}
          </p>
          {renderDateOnly(stats.longestRunRecord, stats.longestRunEvent)}
        </div>

      </div>

      {/* Latest Run Banner */}
      {stats.latestRun && (
        <div className="bg-zinc-900/90 border border-zinc-800 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#D9FF00]/10 border border-[#D9FF00]/30 text-[#D9FF00] rounded-xl">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#D9FF00] block">
                Latest Activity
              </span>
              <h4 className="text-base sm:text-lg font-black text-white leading-snug">
                {stats.latestRun.event_name}
              </h4>
              <p className="text-xs text-zinc-400 font-medium flex items-center gap-2 mt-0.5">
                <span>{formatDateFriendly(stats.latestRun.event_date)}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-zinc-500" />
                  {stats.latestRun.location || 'Bangladesh'}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-5 bg-black/60 px-4 py-2.5 rounded-xl border border-zinc-800 self-stretch sm:self-auto justify-between">
            <div>
              <span className="text-[10px] text-zinc-400 block font-bold uppercase tracking-wider">Dist</span>
              <span className="text-sm font-bold text-white font-mono">{stats.latestRun.distance_km} KM</span>
            </div>
            <div className="w-px h-6 bg-zinc-800" />
            <div>
              <span className="text-[10px] text-zinc-400 block font-bold uppercase tracking-wider">Time</span>
              <span className="text-sm font-bold text-[#D9FF00] font-mono">
                {parseExcelTime(stats.latestRun.official_time || stats.latestRun.strava_time) || '--'}
              </span>
            </div>
            <div className="w-px h-6 bg-zinc-800" />
            <div>
              <span className="text-[10px] text-zinc-400 block font-bold uppercase tracking-wider">Pace</span>
              <span className="text-sm font-bold text-white font-mono">{stats.latestRun.pace || '-'}</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};


