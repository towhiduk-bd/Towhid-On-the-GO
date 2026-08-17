import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#0A0A0A] border border-white/20 p-6 sm:p-8 max-w-md w-full relative text-white space-y-6 shadow-2xl">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white p-1 border border-white/10 hover:border-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className={`p-3 ${variant === 'danger' ? 'bg-red-600 text-white' : 'bg-[#D9FF00] text-black'}`}>
            {variant === 'danger' ? <Trash2 className="w-6 h-6 stroke-[2.5]" /> : <AlertTriangle className="w-6 h-6 stroke-[2.5]" />}
          </div>
          <div>
            <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">
              {title}
            </h3>
            <p className="text-xs uppercase tracking-wider text-white/50 font-bold">
              Confirmation Required
            </p>
          </div>
        </div>

        <p className="text-sm text-white/80 leading-relaxed bg-white/5 p-4 border-l-2 border-red-500">
          {message}
        </p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider border border-white/20 transition-all"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-5 py-2.5 font-black text-xs uppercase tracking-wider transition-all shadow-lg ${
              variant === 'danger'
                ? 'bg-red-600 hover:bg-red-500 text-white border border-red-400/50'
                : 'bg-[#D9FF00] text-black hover:brightness-110'
            }`}
          >
            {confirmText}
          </button>
        </div>

      </div>
    </div>
  );
};
