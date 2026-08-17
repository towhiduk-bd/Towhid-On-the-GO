import React, { useState } from 'react';
import { generateSupabaseSqlSchema } from '../services/storage';
import { Database, Copy, Check, X, Code2, Server } from 'lucide-react';

interface SupabaseSqlModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseSqlModal: React.FC<SupabaseSqlModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const sql = generateSupabaseSqlSchema();

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0A0A0A] border border-white/20 p-6 sm:p-8 max-w-3xl w-full relative text-white max-h-[90vh] flex flex-col shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#D9FF00] text-black">
              <Database className="w-6 h-6 stroke-[3]" />
            </div>
            <div>
              <h3 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tighter text-white">Supabase SQL Schema</h3>
              <p className="text-xs uppercase tracking-wider text-white/40 font-bold mt-0.5">
                SQL table definition, indexes, and Row Level Security policies
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white p-1 border border-white/10 hover:border-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 overflow-y-auto flex-1 pr-1 text-xs">
          
          <div className="bg-black/60 p-4 border border-white/10 text-white/80 leading-relaxed space-y-2">
            <p className="font-bold uppercase tracking-wider text-white">
              Instructions for Supabase deployment:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-white/60 font-medium">
              <li>Log in to your <strong className="text-[#D9FF00]">Supabase Dashboard</strong>.</li>
              <li>Open the <strong className="text-white">SQL Editor</strong> tab from the sidebar.</li>
              <li>Paste the SQL script below and click <strong className="text-[#D9FF00]">Run</strong>.</li>
            </ol>
          </div>

          <div className="relative">
            <div className="absolute top-3 right-3 z-10">
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-black uppercase tracking-tighter italic bg-[#D9FF00] text-black hover:brightness-110 transition-all shadow-md"
              >
                {copied ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5 stroke-[3]" />}
                <span>{copied ? 'Copied SQL!' : 'Copy SQL'}</span>
              </button>
            </div>

            <pre className="bg-black/80 p-4 border border-white/10 text-[#D9FF00] font-mono text-[11px] overflow-x-auto leading-relaxed max-h-[350px]">
              {sql}
            </pre>
          </div>

        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-white/10 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
