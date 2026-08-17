import React, { useState } from 'react';
import { Lock, KeyRound, ShieldAlert, CheckCircle2, X } from 'lucide-react';
import { getAdminPasscode, setAdminPasscode } from '../services/storage';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [showChangePass, setShowChangePass] = useState(false);
  const [newPass, setNewPass] = useState('');
  const [passChangedMsg, setPassChangedMsg] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const currentPass = getAdminPasscode();
    if (passcode.trim() === currentPass) {
      setError('');
      onLoginSuccess();
      onClose();
    } else {
      setError('Incorrect passcode. Try default "towhid123".');
    }
  };

  const handleQuickDemoLogin = () => {
    const currentPass = getAdminPasscode();
    setPasscode(currentPass);
    onLoginSuccess();
    onClose();
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPass.trim() || newPass.trim().length < 4) {
      setError('Passcode must be at least 4 characters.');
      return;
    }
    setAdminPasscode(newPass.trim());
    setPassChangedMsg('Passcode updated successfully!');
    setNewPass('');
    setShowChangePass(false);
    setTimeout(() => setPassChangedMsg(''), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0A0A0A] border border-white/20 p-6 sm:p-8 max-w-md w-full relative text-white space-y-6 shadow-2xl">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white p-1 border border-white/10 hover:border-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#D9FF00] text-black">
            <Lock className="w-6 h-6 stroke-[3]" />
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">Admin Login</h2>
            <p className="text-xs uppercase tracking-wider text-white/40 font-bold">Management Access</p>
          </div>
        </div>

        {passChangedMsg && (
          <div className="p-3 bg-[#D9FF00]/10 border border-[#D9FF00]/30 text-[#D9FF00] text-xs font-bold uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{passChangedMsg}</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-1.5">
              Enter Admin Passcode
            </label>
            <input
              type="password"
              value={passcode}
              onChange={(e) => {
                setPasscode(e.target.value);
                setError('');
              }}
              placeholder="Enter passcode..."
              className="w-full bg-black/60 border border-white/20 focus:border-[#D9FF00] px-4 py-3 text-sm font-bold text-white placeholder-white/30 outline-none transition-all"
              autoFocus
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 bg-[#D9FF00] text-black font-black uppercase tracking-tighter italic text-xs py-3 px-4 hover:brightness-110 transition-all"
            >
              Unlock Admin
            </button>
            <button
              type="button"
              onClick={handleQuickDemoLogin}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold uppercase tracking-wider py-3 px-4 text-xs transition-all"
              title="Use default admin passcode 'towhid123'"
            >
              Demo Admin
            </button>
          </div>
        </form>

        <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-white/40">
          <span>Default: <code className="text-[#D9FF00] font-mono bg-black/60 px-2 py-0.5 border border-white/10">towhid123</code></span>
          <button
            onClick={() => setShowChangePass(!showChangePass)}
            className="text-[#D9FF00] hover:underline flex items-center gap-1"
          >
            <KeyRound className="w-3.5 h-3.5" />
            {showChangePass ? 'Cancel' : 'Change Pass'}
          </button>
        </div>

        {showChangePass && (
          <form onSubmit={handleChangePassword} className="p-4 bg-black/60 border border-white/20 space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-white/40">
              New Admin Passcode
            </label>
            <input
              type="password"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              placeholder="New password (min 4 chars)..."
              className="w-full bg-black/80 border border-white/20 focus:border-[#D9FF00] px-3 py-2 text-xs font-bold text-white outline-none"
            />
            <button
              type="submit"
              className="w-full bg-white text-black font-black uppercase tracking-tighter italic py-2 text-xs hover:bg-[#D9FF00] transition-all"
            >
              Save New Passcode
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
