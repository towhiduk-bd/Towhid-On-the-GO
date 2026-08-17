import React from 'react';
import {
  Activity,
  FileSpreadsheet,
  Lock,
  Plus,
  Share2,
  Database,
  Download,
  LogOut,
  ShieldCheck,
  Flame,
  Globe,
  User,
} from 'lucide-react';

interface NavbarProps {
  isAdmin: boolean;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenAddModal: () => void;
  onOpenImportModal: () => void;
  onOpenStravaModal: () => void;
  onOpenSqlModal: () => void;
  onExportCsv: () => void;
  onExportBackup?: () => void;
  onImportBackup?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  activeTab: 'log' | 'dashboard' | 'bio' | 'strava';
  setActiveTab: (tab: 'log' | 'dashboard' | 'bio' | 'strava') => void;
  publicViewOnly: boolean;
  setPublicViewOnly: (val: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isAdmin,
  onOpenLogin,
  onLogout,
  onOpenAddModal,
  onOpenImportModal,
  onOpenStravaModal,
  onOpenSqlModal,
  onExportCsv,
  onExportBackup,
  onImportBackup,
  activeTab,
  setActiveTab,
  publicViewOnly,
  setPublicViewOnly,
}) => {
  const [copied, setCopied] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <header className="sticky top-0 z-30 bg-[#0A0A0A]/95 backdrop-blur border-b border-white/10 text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Brand Logo & Heading */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#D9FF00] rounded-full flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(217,255,0,0.3)]">
              <div className="w-4 h-4 bg-black rounded-xs rotate-45"></div>
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tighter italic text-white font-sans">
                  Towhid's Running Event Log
                </h1>
                {isAdmin && !publicViewOnly ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    <ShieldCheck className="w-3 h-3" /> Admin
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-white/5 text-white/70 border border-white/20">
                    <Globe className="w-3 h-3 text-[#D9FF00]" /> Public
                  </span>
                )}
              </div>
              <p className="text-[11px] uppercase tracking-[0.15em] text-white/40 hidden sm:block font-bold">
                Official Event History & Strava Analytics
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-2 bg-white/5 p-1.5 rounded-full border border-white/10">
            <button
              onClick={() => setActiveTab('log')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                activeTab === 'log'
                  ? 'bg-[#D9FF00] text-black shadow-lg font-black'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              Records Log
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-[#D9FF00] text-black shadow-lg font-black'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('bio')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-1.5 ${
                activeTab === 'bio'
                  ? 'bg-[#D9FF00] text-black shadow-lg font-black'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Personal BIO
            </button>
            <button
              onClick={onOpenStravaModal}
              className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-[#D9FF00] hover:bg-[#D9FF00]/10 transition-all flex items-center gap-1.5"
            >
              <Flame className="w-3.5 h-3.5 text-[#D9FF00]" />
              Strava
            </button>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            
            {/* Admin actions if logged in */}
            {isAdmin && !publicViewOnly ? (
              <>
                <button
                  onClick={onOpenAddModal}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#D9FF00] text-black font-black uppercase tracking-tighter italic text-xs hover:brightness-110 active:scale-95 transition-all shadow-md"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span className="hidden sm:inline">Add Run</span>
                </button>

                <button
                  onClick={onOpenImportModal}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/5 border border-white/20 text-white font-bold uppercase tracking-widest text-xs hover:bg-white/10 transition-all"
                  title="Import Excel file"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-[#D9FF00]" />
                  <span className="hidden md:inline">Import</span>
                </button>

                {/* Export CSV button */}
                <button
                  onClick={onExportCsv}
                  className="p-2 bg-white/5 border border-white/20 text-white hover:bg-white/10 transition-all"
                  title="Export CSV"
                >
                  <Download className="w-4 h-4 text-[#D9FF00]" />
                </button>

                {/* Full Site Backup Sync & Netlify ZIP Download */}
                <a
                  href="/site-deploy.zip"
                  download="netlify-site-deploy.zip"
                  className="px-2.5 py-2 bg-sky-500/20 border border-sky-500/40 text-sky-400 text-xs font-bold uppercase tracking-wider hover:bg-sky-500/30 transition-all flex items-center gap-1.5"
                  title="Download compiled static site ZIP ready for Netlify Drop"
                >
                  <Download className="w-3.5 h-3.5 text-sky-400" />
                  <span>Download ZIP</span>
                </a>

                {onExportBackup && (
                  <button
                    onClick={onExportBackup}
                    className="p-2 bg-white/5 border border-white/20 text-white hover:bg-white/10 transition-all hidden sm:flex"
                    title="Download Full Site Backup JSON"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                  </button>
                )}

                {onImportBackup && (
                  <>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={onImportBackup}
                      accept=".json"
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold uppercase tracking-wider hover:bg-emerald-500/30 transition-all flex items-center gap-1.5"
                      title="Import Backup JSON to Sync Netlify Site"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Sync JSON</span>
                    </button>
                  </>
                )}

                {/* Database schema button */}
                <button
                  onClick={onOpenSqlModal}
                  className="p-2 bg-white/5 border border-white/20 text-white hover:bg-white/10 transition-all hidden sm:flex"
                  title="Supabase SQL Schema Setup"
                >
                  <Database className="w-4 h-4 text-white/70" />
                </button>
              </>
            ) : null}

            {/* Public share button */}
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/20 text-white font-bold uppercase tracking-widest text-xs hover:bg-white/10 transition-all"
              title="Copy shareable public link"
            >
              <Share2 className="w-3.5 h-3.5 text-[#D9FF00]" />
              <span className="hidden sm:inline">{copied ? 'Copied!' : 'Share'}</span>
            </button>

            {/* Admin Toggle / Login Button */}
            {isAdmin ? (
              <div className="flex items-center gap-1 bg-white/5 p-1 border border-white/20">
                <button
                  onClick={() => setPublicViewOnly(!publicViewOnly)}
                  className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-all ${
                    publicViewOnly
                      ? 'bg-white/10 text-white'
                      : 'bg-[#D9FF00] text-black font-black'
                  }`}
                  title="Toggle Admin view vs Preview Public view"
                >
                  {publicViewOnly ? 'Preview' : 'Admin'}
                </button>
                <button
                  onClick={onLogout}
                  className="p-1.5 text-white/40 hover:text-red-400 transition-all"
                  title="Exit Admin session"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/20 text-white font-bold uppercase tracking-widest text-xs hover:bg-white/10 transition-all"
              >
                <Lock className="w-3.5 h-3.5 text-[#D9FF00]" />
                <span className="hidden sm:inline">Admin Login</span>
              </button>
            )}

          </div>
        </div>

        {/* Mobile Navigation Tabs Bar */}
        <div className="flex md:hidden items-center justify-around py-2.5 border-t border-white/10 text-xs font-bold uppercase tracking-widest">
          <button
            onClick={() => setActiveTab('log')}
            className={`px-3 py-1 transition-all ${
              activeTab === 'log' ? 'text-[#D9FF00] border-b-2 border-[#D9FF00]' : 'text-white/50'
            }`}
          >
            Log
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1 transition-all ${
              activeTab === 'dashboard' ? 'text-[#D9FF00] border-b-2 border-[#D9FF00]' : 'text-white/50'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('bio')}
            className={`px-3 py-1 transition-all flex items-center gap-1 ${
              activeTab === 'bio' ? 'text-[#D9FF00] border-b-2 border-[#D9FF00]' : 'text-white/50'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            BIO
          </button>
          <button
            onClick={onOpenStravaModal}
            className="px-3 py-1 text-[#D9FF00] flex items-center gap-1"
          >
            <Flame className="w-3.5 h-3.5" />
            Strava
          </button>
        </div>

      </div>
    </header>
  );
};

