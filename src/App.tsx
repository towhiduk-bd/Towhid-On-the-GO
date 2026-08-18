/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { FilterState, RunningRecord, UserBio } from './types';
import {
  getStoredRecords,
  computeStats,
  exportToCSV,
  getStoredBio,
  syncWithPublicDataJson,
} from './services/storage';
import { Navbar } from './components/Navbar';
import { StatsOverview } from './components/StatsOverview';
import { ChartsSection } from './components/ChartsSection';
import { RecordTable } from './components/RecordTable';
import { PersonalBio } from './components/PersonalBio';
import { StravaConnectModal } from './components/StravaConnectModal';
import { RecordDetailsModal } from './components/RecordDetailsModal';
import { SupabaseSqlModal } from './components/SupabaseSqlModal';
import { ShowcaseGallery } from './components/ShowcaseGallery';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  const [records, setRecords] = useState<RunningRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'log' | 'dashboard' | 'bio' | 'strava'>('dashboard');
  const [userBio, setUserBio] = useState<UserBio>(getStoredBio());

  const [filterState, setFilterState] = useState<FilterState>({
    searchQuery: '',
    year: 'All',
    category: 'All',
    eventType: 'All',
    visibility: 'All',
    sortBy: 'date_desc',
    viewMode: 'table',
  });

  // Modal visibility states
  const [isStravaOpen, setIsStravaOpen] = useState(false);
  const [isSqlOpen, setIsSqlOpen] = useState(false);
  const [recordForView, setRecordForView] = useState<RunningRecord | null>(null);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  useEffect(() => {
    const data = getStoredRecords();
    setRecords(data);

    // Auto-sync with /data.json served statically if available
    syncWithPublicDataJson().then((synced) => {
      if (synced) {
        if (synced.records && synced.records.length > 0) setRecords(synced.records);
        if (synced.userBio) setUserBio(synced.userBio);
      }
    });
  }, []);

  const stats = computeStats(records);

  const handleImportStravaActivities = (stravaRows: RunningRecord[]) => {
    const updated = [...stravaRows, ...records];
    setRecords(updated);
    showToast(`Synced ${stravaRows.length} activities from Strava!`);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#D9FF00] selection:text-black flex flex-col">
      
      {/* Top Header Navbar */}
      <Navbar
        onOpenStravaModal={() => setIsStravaOpen(true)}
        onOpenSqlModal={() => setIsSqlOpen(true)}
        onExportCsv={() => exportToCSV(records)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#0A0A0A] border border-[#D9FF00] text-[#D9FF00] px-5 py-3 shadow-2xl flex items-center gap-2 text-xs font-black uppercase tracking-wider animate-bounce">
          <CheckCircle2 className="w-4 h-4 shrink-0 stroke-[3]" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Dashboard / Analytics Tab View */}
        {activeTab === 'dashboard' ? (
          <div className="space-y-6">
            <StatsOverview stats={stats} />
            <ChartsSection
              stats={stats}
              onSelectRun={(id) => {
                const found = records.find((r) => r.id === id);
                if (found) setRecordForView(found);
              }}
            />
          </div>
        ) : activeTab === 'bio' ? (
          /* Personal BIO Tab View */
          <PersonalBio bio={userBio} />
        ) : (
          /* Main Log View */
          <div className="space-y-8">
            
            {/* Featured Showcase Photos Banner */}
            <ShowcaseGallery />

            {/* Top Summary Header Banner */}
            <StatsOverview stats={stats} />

            {/* Event Records Search & Filter Table / Cards */}
            <RecordTable
              records={records}
              filterState={filterState}
              setFilterState={setFilterState}
              onSelectRecord={(rec) => setRecordForView(rec)}
            />

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#050505] py-8 text-white/40 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="px-2 py-0.5 bg-[#D9FF00] text-black flex items-center justify-center font-black text-xs tracking-tighter italic rounded">
              TR_GO
            </div>
            <span className="font-black text-white uppercase tracking-wider">TR_GO</span>
            <span className="text-white/40 font-bold uppercase tracking-wider">— Towhid's Running & Endurance Event Hub</span>
          </div>

          <div className="flex items-center gap-4 text-white/60 font-bold uppercase tracking-wider text-[11px]">
            <button
              onClick={() => setIsSqlOpen(true)}
              className="hover:text-[#D9FF00] transition-colors"
            >
              Supabase SQL
            </button>
            <span>•</span>
            <button
              onClick={() => setIsStravaOpen(true)}
              className="hover:text-[#D9FF00] transition-colors"
            >
              Strava CSV Sync
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <StravaConnectModal
        isOpen={isStravaOpen}
        onClose={() => setIsStravaOpen(false)}
        onImportStravaActivities={handleImportStravaActivities}
      />

      <RecordDetailsModal
        record={recordForView}
        onClose={() => setRecordForView(null)}
      />

      <SupabaseSqlModal
        isOpen={isSqlOpen}
        onClose={() => setIsSqlOpen(false)}
      />

    </div>
  );
}
