import React from 'react';
import {
  Activity,
  FileSpreadsheet,
  Plus,
  Share2,
  Database,
  Download,
  Flame,
  Globe,
  User,
} from 'lucide-react';

interface NavbarProps {
  onOpenStravaModal: () => void;
  onOpenSqlModal: () => void;
  onExportCsv: () => void;
  onExportBackup?: () => void;
  onImportBackup?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  activeTab: 'log' | 'dashboard' | 'bio' | 'strava';
  setActiveTab: (tab: 'log' | 'dashboard' | 'bio' | 'strava') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenStravaModal,
  onOpenSqlModal,
  onExportCsv,
  onExportBackup,
  onImportBackup,
  activeTab,
  setActiveTab,
}) => {
  const [copied, setCopied] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleShare = () => {
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(window.location.href).catch(() => {});
      }
    } catch (_) {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <header className="sticky top-0 z-30 bg-[#0A0A0A]/95 backdrop-blur border-b border-white/10 text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Brand Logo & Heading */}
          <div className="flex items-center gap-3">
            <div className="h-10 px-2.5 bg-[#D9FF00] rounded-xl flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(217,255,0,0.3)] border border-black/50">
              <span className="text-sm font-black italic tracking-tighter text-black">TR_GO</span>
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tighter italic text-white font-sans">
                  TR_GO
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-white/5 text-white/70 border border-white/20">
                  <Globe className="w-3 h-3 text-[#D9FF00]" /> Verified Log
                </span>
              </div>
              <p className="text-[11px] uppercase tracking-[0.15em] text-white/40 hidden sm:block font-bold">
                Towhid’s Running & Endurance Event Hub
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
            
            {/* Export CSV button */}
            <button
              onClick={onExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/20 text-white font-bold uppercase tracking-widest text-xs hover:bg-white/10 transition-all"
              title="Export CSV"
            >
              <Download className="w-3.5 h-3.5 text-[#D9FF00]" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            {/* Public share button */}
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/20 text-white font-bold uppercase tracking-widest text-xs hover:bg-white/10 transition-all"
              title="Copy shareable public link"
            >
              <Share2 className="w-3.5 h-3.5 text-[#D9FF00]" />
              <span className="hidden sm:inline">{copied ? 'Copied!' : 'Share'}</span>
            </button>

            {/* Database schema button */}
            <button
              onClick={onOpenSqlModal}
              className="p-2 bg-white/5 border border-white/20 text-white hover:bg-white/10 transition-all hidden sm:flex"
              title="Database SQL Schema"
            >
              <Database className="w-4 h-4 text-white/70" />
            </button>

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

