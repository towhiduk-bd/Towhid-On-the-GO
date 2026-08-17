import React, { useState } from 'react';
import { OverallStats } from '../types';
import { BarChart3, TrendingUp, Calendar, Trophy, ChevronRight, MapPin, Activity, Clock, Flame, ArrowUpRight } from 'lucide-react';
import { formatDateFriendly, parseExcelTime } from '../utils/formatters';

interface ChartsSectionProps {
  stats: OverallStats;
  onSelectRun?: (id: string) => void;
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({ stats, onSelectRun }) => {
  const [metricMode, setMetricMode] = useState<'distance' | 'count'>('distance');

  const recentRuns = stats.recentRuns || [];
  const runsByYear = stats.runsByYear || [];
  const maxDistance = Math.max(...runsByYear.map((y) => y.distance), 1);
  const maxCount = Math.max(...runsByYear.map((y) => y.count), 1);

  return (
    <div className="w-full space-y-6">
      
      {/* Recent 5 Running Events Data Table */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 sm:p-7 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#D9FF00]/10 text-[#D9FF00] rounded-xl border border-[#D9FF00]/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white tracking-tight">Recent 5 Running Events</h3>
              <p className="text-xs text-zinc-400">Latest completed races & official logged events</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-[#D9FF00] bg-[#D9FF00]/10 px-3 py-1 rounded-full border border-[#D9FF00]/20">
            {recentRuns.length} Events
          </span>
        </div>

        {recentRuns.length === 0 ? (
          <div className="py-12 text-center text-zinc-500 text-sm">
            No recent running events logged yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-[10px] uppercase tracking-wider text-zinc-400 font-bold">
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Event Name</th>
                  <th className="py-3 px-3 text-center">Distance</th>
                  <th className="py-3 px-3 text-right">Time</th>
                  <th className="py-3 px-3 text-right">Pace</th>
                  <th className="py-3 px-3 text-center">Type</th>
                  <th className="py-3 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-xs">
                {recentRuns.map((r) => {
                  const displayTime = parseExcelTime(r.official_time || r.strava_time) || '--:--';
                  return (
                    <tr
                      key={r.id}
                      onClick={() => onSelectRun && onSelectRun(r.id)}
                      className="hover:bg-white/[0.04] transition-all cursor-pointer group"
                    >
                      {/* Date */}
                      <td className="py-3.5 px-3 whitespace-nowrap text-zinc-300 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-zinc-500 group-hover:text-[#D9FF00] transition-colors" />
                          <span>{formatDateFriendly(r.event_date)}</span>
                        </div>
                      </td>

                      {/* Event Name */}
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-white group-hover:text-[#D9FF00] transition-colors truncate max-w-[220px] sm:max-w-xs">
                          {r.event_name}
                        </div>
                        {r.location && (
                          <div className="text-[11px] text-zinc-500 flex items-center gap-1 mt-0.5 truncate">
                            <MapPin className="w-3 h-3 text-zinc-600 shrink-0" />
                            <span>{r.location}</span>
                          </div>
                        )}
                      </td>

                      {/* Distance */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <span className="inline-block px-2.5 py-0.5 bg-zinc-800 text-zinc-200 text-[11px] font-mono font-bold rounded-md border border-zinc-700">
                          {r.distance_km} KM
                        </span>
                      </td>

                      {/* Time */}
                      <td className="py-3.5 px-3 text-right whitespace-nowrap font-mono font-bold text-[#D9FF00]">
                        {displayTime}
                      </td>

                      {/* Pace */}
                      <td className="py-3.5 px-3 text-right whitespace-nowrap font-mono text-zinc-300">
                        {r.pace || '--'}
                      </td>

                      {/* Type */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <span className="text-[10px] uppercase font-bold text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded border border-zinc-700/60">
                          {r.event_type || 'Road'}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1 text-[11px] font-bold text-zinc-400 group-hover:text-white transition-colors">
                          <span>View</span>
                          <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Yearly Progression Chart */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col justify-between">
        
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-orange-500/10 text-orange-400 rounded-xl border border-orange-500/20">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Yearly Running Progress</h3>
                <p className="text-xs text-slate-400">Distance completed and event frequency by year</p>
              </div>
            </div>

            {/* Toggle metric */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setMetricMode('distance')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  metricMode === 'distance'
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Distance (KM)
              </button>
              <button
                onClick={() => setMetricMode('count')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  metricMode === 'count'
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Run Count
              </button>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          {runsByYear.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-500 text-sm">
              No running records available yet
            </div>
          ) : (
            <div className="space-y-4 my-4">
              {runsByYear.map((item) => {
                const percentage =
                  metricMode === 'distance'
                    ? (item.distance / maxDistance) * 100
                    : (item.count / maxCount) * 100;

                return (
                  <div key={item.year} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-300 font-mono text-sm">{item.year}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400">
                          {item.count} {item.count === 1 ? 'event' : 'events'}
                        </span>
                        <span className="text-orange-400 font-mono font-bold text-sm">
                          {item.distance} KM
                        </span>
                      </div>
                    </div>

                    <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800/60 p-0.5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 transition-all duration-700 ease-out shadow-sm"
                        style={{ width: `${Math.max(percentage, 5)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
          <span className="flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Continuous event log active
          </span>
          <span>Updated dynamically</span>
        </div>

      </div>

    </div>
  );
};
