/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { FilterState, RunningRecord, UserBio } from './types';
import {
  getStoredRecords,
  saveRecords,
  resetToSeedData,
  computeStats,
  exportToCSV,
  getStoredBio,
  saveBio,
  exportFullSiteBackupJSON,
  importFullSiteBackupJSON,
  syncWithPublicDataJson,
} from './services/storage';
import { Navbar } from './components/Navbar';
import { StatsOverview } from './components/StatsOverview';
import { ChartsSection } from './components/ChartsSection';
import { RecordTable } from './components/RecordTable';
import { PersonalBio } from './components/PersonalBio';
import { AdminLoginModal } from './components/AdminLoginModal';
import { RecordFormModal } from './components/RecordFormModal';
import { ExcelImportModal } from './components/ExcelImportModal';
import { StravaConnectModal } from './components/StravaConnectModal';
import { RecordDetailsModal } from './components/RecordDetailsModal';
import { SupabaseSqlModal } from './components/SupabaseSqlModal';
import { ShowcaseGallery } from './components/ShowcaseGallery';
import { ConfirmModal } from './components/ConfirmModal';
import {
  Plus,
  FileSpreadsheet,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  Globe,
  Flame,
  Activity,
  Award,
  Download,
} from 'lucide-react';

export default function App() {
  const [records, setRecords] = useState<RunningRecord[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [publicViewOnly, setPublicViewOnly] = useState(false);

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
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isStravaOpen, setIsStravaOpen] = useState(false);
  const [isSqlOpen, setIsSqlOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const [recordForEdit, setRecordForEdit] = useState<RunningRecord | null>(null);
  const [recordForView, setRecordForView] = useState<RunningRecord | null>(null);

  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  useEffect(() => {
    const data = getStoredRecords();
    setRecords(data);

    // Auto-sync with /data.json served from Netlify if available
    syncWithPublicDataJson().then((synced) => {
      if (synced) {
        if (synced.records) setRecords(synced.records);
        if (synced.userBio) setUserBio(synced.userBio);
      }
    });
  }, []);

  const stats = computeStats(records);

  // CRUD Operations
  const handleSaveRecord = (partial: Partial<RunningRecord>) => {
    if (partial.id) {
      // Edit existing
      const updated = records.map((r) =>
        r.id === partial.id ? ({ ...r, ...partial } as RunningRecord) : r
      );
      setRecords(updated);
      saveRecords(updated);
      showToast('Running record updated successfully!');
    } else {
      // Create new record
      const newRecord: RunningRecord = {
        id: `run-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        sl_no: records.length + 1,
        event_name: partial.event_name || 'Running Event',
        event_date: partial.event_date || new Date().toISOString().split('T')[0],
        year: partial.year || new Date().getFullYear(),
        distance_km: partial.distance_km || 10,
        distance_category: partial.distance_category || '10K',
        bib_number: partial.bib_number || '',
        official_time: partial.official_time || '',
        strava_time: partial.strava_time || '',
        pace: partial.pace || '-',
        strava_url: partial.strava_url || '',
        location: partial.location || 'Hatirjheel, Dhaka',
        organizer: partial.organizer || '',
        event_type: partial.event_type || 'Road',
        notes: partial.notes || '',
        source: partial.source || 'Manual',
        visibility: partial.visibility || 'Public',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const updated = [newRecord, ...records];
      setRecords(updated);
      saveRecords(updated);
      showToast(`Added new run: "${newRecord.event_name}"`);
    }
  };

  const handleDeleteRecord = (id: string) => {
    const updated = records.filter((r) => r.id !== id);
    setRecords(updated);
    saveRecords(updated);
    if (recordForView?.id === id) setRecordForView(null);
    if (recordForEdit?.id === id) {
      setRecordForEdit(null);
      setIsFormOpen(false);
    }
    showToast('Record deleted');
  };

  const handleBatchDeleteRecords = (ids: string[]) => {
    const idSet = new Set(ids);
    const updated = records.filter((r) => !idSet.has(r.id));
    setRecords(updated);
    saveRecords(updated);
    showToast(`Deleted ${ids.length} selected record${ids.length > 1 ? 's' : ''}`);
  };

  const handleToggleVisibility = (id: string) => {
    const updated = records.map((r) => {
      if (r.id === id) {
        const nextVis = r.visibility === 'Public' ? 'Private' : 'Public';
        return { ...r, visibility: nextVis as any };
      }
      return r;
    });
    setRecords(updated);
    saveRecords(updated);
    showToast('Visibility status updated');
  };

  const handleImportExcelConfirmed = (newRows: RunningRecord[]) => {
    const updated = [...newRows, ...records];
    setRecords(updated);
    saveRecords(updated);
    showToast(`Successfully imported ${newRows.length} events from Excel!`);
  };

  const handleImportStravaActivities = (stravaRows: RunningRecord[]) => {
    const updated = [...stravaRows, ...records];
    setRecords(updated);
    saveRecords(updated);
    showToast(`Synced ${stravaRows.length} activities from Strava!`);
  };

  const handleResetData = () => {
    setIsResetConfirmOpen(true);
  };

  const handleExportBackup = () => {
    exportFullSiteBackupJSON();
    showToast('Exported full site backup JSON!');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const restored = importFullSiteBackupJSON(content);
        setRecords(restored.records);
        setUserBio(restored.userBio);
        showToast('Site data & photos restored/synced successfully!');
      } catch (err) {
        console.error('Failed to import backup JSON:', err);
        alert('Invalid site backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#D9FF00] selection:text-black flex flex-col">
      
      {/* Top Header Navbar */}
      <Navbar
        isAdmin={isAdmin}
        onOpenLogin={() => setIsLoginOpen(true)}
        onLogout={() => {
          setIsAdmin(false);
          setPublicViewOnly(false);
          showToast('Logged out of Admin Mode');
        }}
        onOpenAddModal={() => {
          setRecordForEdit(null);
          setIsFormOpen(true);
        }}
        onOpenImportModal={() => setIsImportOpen(true)}
        onOpenStravaModal={() => setIsStravaOpen(true)}
        onOpenSqlModal={() => setIsSqlOpen(true)}
        onExportCsv={() => exportToCSV(records)}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        publicViewOnly={publicViewOnly}
        setPublicViewOnly={setPublicViewOnly}
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
        
        {/* Admin Mode Quick Banner (If logged in as admin) */}
        {isAdmin && !publicViewOnly && (
          <div className="bg-white/[0.03] border border-[#D9FF00]/40 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#D9FF00] text-black font-black">
                <ShieldCheck className="w-5 h-5 stroke-[3]" />
              </div>
              <div>
                <span className="font-black text-white text-sm uppercase tracking-wider block">Admin Access Active</span>
                <span className="text-white/50 text-xs font-bold uppercase tracking-wider">
                  You can Add, Edit, Delete records, Toggle Public/Private visibility, or Import Excel files.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-stretch sm:self-auto justify-end flex-wrap">
              <button
                onClick={() => {
                  setRecordForEdit(null);
                  setIsFormOpen(true);
                }}
                className="px-4 py-2 bg-[#D9FF00] text-black font-black uppercase tracking-tighter italic text-xs hover:brightness-110 transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Add Event</span>
              </button>
              <button
                onClick={() => setIsImportOpen(true)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold uppercase tracking-wider text-xs border border-white/20 transition-all flex items-center gap-1.5"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Import Excel</span>
              </button>
              <a
                href="/site-deploy.zip"
                download="netlify-site-deploy.zip"
                className="px-3.5 py-2 bg-sky-500/20 text-sky-400 hover:bg-sky-500/30 font-bold uppercase tracking-wider text-xs border border-sky-500/40 transition-all flex items-center gap-1.5"
                title="Download full static site ZIP ready to drag-and-drop onto Netlify Drop"
              >
                <Download className="w-4 h-4 text-sky-400" />
                <span>Netlify ZIP</span>
              </a>
              <button
                onClick={handleExportBackup}
                className="px-3.5 py-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 font-bold uppercase tracking-wider text-xs border border-emerald-500/30 transition-all flex items-center gap-1.5"
                title="Download JSON containing all logs, bio, travel blogs, and showcase photos"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Export Backup</span>
              </button>
              <label
                className="px-3.5 py-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 font-bold uppercase tracking-wider text-xs border border-emerald-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
                title="Upload JSON backup file to sync all records, bio, blogs, and showcase photos"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Sync JSON</span>
                <input
                  type="file"
                  onChange={handleImportBackup}
                  accept=".json"
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}

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
          <PersonalBio
            bio={userBio}
            onUpdateBio={(updated) => {
              setUserBio(updated);
              saveBio(updated);
              showToast('Personal Bio updated successfully!');
            }}
            isAdmin={isAdmin && !publicViewOnly}
          />
        ) : (
          /* Main Log View */
          <div className="space-y-8">
            
            {/* Featured Admin Showcase Photos Banner */}
            <ShowcaseGallery isAdmin={isAdmin} publicViewOnly={publicViewOnly} />

            {/* Top Summary Header Banner */}
            <StatsOverview stats={stats} />

            {/* Event Records Search & Filter Table / Cards */}
            <RecordTable
              records={records}
              filterState={filterState}
              setFilterState={setFilterState}
              isAdmin={isAdmin}
              publicViewOnly={publicViewOnly}
              onSelectRecord={(rec) => setRecordForView(rec)}
              onEditRecord={(rec) => {
                setRecordForEdit(rec);
                setIsFormOpen(true);
              }}
              onDeleteRecord={handleDeleteRecord}
              onBatchDeleteRecords={handleBatchDeleteRecords}
              onToggleVisibility={handleToggleVisibility}
              onOpenAddModal={() => {
                setRecordForEdit(null);
                setIsFormOpen(true);
              }}
              onOpenImportModal={() => setIsImportOpen(true)}
            />

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#050505] py-8 text-white/40 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 bg-[#D9FF00] text-black flex items-center justify-center font-black text-xs tracking-tighter italic">
              TR
            </div>
            <span className="font-black text-white uppercase tracking-wider">Towhid's Running Event Log</span>
            <span className="text-white/40 font-bold uppercase tracking-wider">— Personal Running Event History & Strava Analytics</span>
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
              onClick={handleResetData}
              className="hover:text-[#D9FF00] transition-colors flex items-center gap-1"
              title="Restore initial seed records"
            >
              <RotateCcw className="w-3 h-3 stroke-[3]" /> Restore Seed Log
            </button>
            <span>•</span>
            <button
              onClick={() => setIsLoginOpen(true)}
              className="hover:text-[#D9FF00] transition-colors"
            >
              Admin Area
            </button>
          </div>
        </div>
      </footer>

      {/* Dialog Modals */}
      <AdminLoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={() => {
          setIsAdmin(true);
          setPublicViewOnly(false);
          showToast('Admin Mode unlocked successfully!');
        }}
      />

      <RecordFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveRecord}
        onDelete={handleDeleteRecord}
        initialRecord={recordForEdit}
      />

      <ExcelImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        existingRecords={records}
        onImportConfirmed={handleImportExcelConfirmed}
      />

      <StravaConnectModal
        isOpen={isStravaOpen}
        onClose={() => setIsStravaOpen(false)}
        onImportStravaActivities={handleImportStravaActivities}
      />

      <RecordDetailsModal
        record={recordForView}
        onClose={() => setRecordForView(null)}
        isAdmin={isAdmin && !publicViewOnly}
        onEdit={(rec) => {
          setRecordForEdit(rec);
          setIsFormOpen(true);
        }}
        onDelete={handleDeleteRecord}
      />

      <SupabaseSqlModal
        isOpen={isSqlOpen}
        onClose={() => setIsSqlOpen(false)}
      />

      <ConfirmModal
        isOpen={isResetConfirmOpen}
        title="Restore Seed Data"
        message="Are you sure you want to reset your running log back to the initial sample seed dataset? Any custom created runs will be overwritten."
        confirmText="Restore Seed Data"
        cancelText="Cancel"
        variant="warning"
        onConfirm={() => {
          const reset = resetToSeedData();
          setRecords(reset);
          setIsResetConfirmOpen(false);
          showToast('Running log restored to seed data');
        }}
        onClose={() => setIsResetConfirmOpen(false)}
      />

    </div>
  );
}
