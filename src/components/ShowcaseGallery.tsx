import React, { useState, useEffect } from 'react';
import { ConfirmModal } from './ConfirmModal';
import { Camera, Plus, Trash2, X, Image as ImageIcon, Maximize2, AlertCircle, Edit3, Check, RefreshCw } from 'lucide-react';

export interface ShowcasePhoto {
  id: string;
  dataUrl: string;
  title: string;
  caption?: string;
  uploadedAt: string;
}

const STORAGE_KEY = 'towhid_running_showcase_photos_v2';

// Default initial showcase photos
const DEFAULT_PHOTOS: ShowcasePhoto[] = [
  {
    id: 'sample-1',
    dataUrl: 'https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?auto=format&fit=crop&w=1200&q=80',
    title: 'Dhaka Half Marathon Finish Line',
    caption: 'Official PB 01:52:14 finish photo',
    uploadedAt: new Date().toISOString(),
  },
  {
    id: 'sample-2',
    dataUrl: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=1200&q=80',
    title: '30K Purbachal Endurance Run',
    caption: 'Longest road distance finish',
    uploadedAt: new Date().toISOString(),
  },
  {
    id: 'sample-3',
    dataUrl: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1200&q=80',
    title: 'Bhatiary Hill Trail Medal',
    caption: '15K Trail conquest in Chittagong',
    uploadedAt: new Date().toISOString(),
  },
];

interface ShowcaseGalleryProps {
  isAdmin: boolean;
  publicViewOnly: boolean;
}

/**
 * Utility to compress image data URL using Canvas
 * Downscales large images to max 1000px and 0.82 JPEG quality
 * Ensures small payload (<150KB) for localStorage safety
 */
function compressImage(dataUrl: string, maxDimension = 1000, quality = 0.82): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

export const ShowcaseGallery: React.FC<ShowcaseGalleryProps> = ({ isAdmin, publicViewOnly }) => {
  const [photos, setPhotos] = useState<ShowcasePhoto[]>([]);
  const [selectedPhotoForView, setSelectedPhotoForView] = useState<ShowcasePhoto | null>(null);
  
  // Admin Upload/Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPhotoIndex, setEditingPhotoIndex] = useState<number | null>(null); // null means new photo or slot selection
  const [targetSlotIndex, setTargetSlotIndex] = useState<number>(0);
  
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPhotos(parsed);
          return;
        }
      }
    } catch (e) {
      console.error('Failed to load showcase photos', e);
    }
    // Fallback default
    setPhotos(DEFAULT_PHOTOS);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PHOTOS));
    } catch (e) {
      console.error('Failed to save default showcase photos', e);
    }
  }, []);

  const saveToStorage = (updatedPhotos: ShowcasePhoto[]) => {
    setPhotos(updatedPhotos);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPhotos));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
      alert('Note: Storage quota full. Photo is updated in session memory.');
    }
  };

  const handleOpenUploadForSlot = (slotIndex: number) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setTargetSlotIndex(slotIndex);
    const existing = photos[slotIndex];

    if (existing) {
      setEditingPhotoIndex(slotIndex);
      setTitle(existing.title);
      setCaption(existing.caption || '');
      setPreviewDataUrl(existing.dataUrl);
    } else {
      setEditingPhotoIndex(null);
      setTitle(`Run Highlight #${slotIndex + 1}`);
      setCaption('');
      setPreviewDataUrl(null);
    }
    setIsModalOpen(true);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Strict 1MB size check
    const MAX_BYTES = 1024 * 1024; // 1MB
    if (file.size > MAX_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setErrorMsg(`Selected image is ${sizeMB} MB. Maximum allowed size is 1.00 MB. Please select a smaller photo.`);
      e.target.value = '';
      return;
    }

    setIsCompressing(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      if (event.target?.result) {
        const rawUrl = event.target.result as string;
        // Compress photo to lightweight web format
        const compressed = await compressImage(rawUrl, 1000, 0.82);
        setPreviewDataUrl(compressed);
        setIsCompressing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSavePhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewDataUrl) {
      setErrorMsg('Please select a photo file (max 1MB).');
      return;
    }

    const newPhotoObj: ShowcasePhoto = {
      id: `photo-${Date.now()}`,
      dataUrl: previewDataUrl,
      title: title.trim() || `Run Highlight #${targetSlotIndex + 1}`,
      caption: caption.trim() || 'Finisher Memory',
      uploadedAt: new Date().toISOString(),
    };

    let updated = [...photos];
    if (targetSlotIndex < updated.length) {
      // Replace existing photo at target slot
      updated[targetSlotIndex] = newPhotoObj;
    } else {
      // Append as new photo
      updated.push(newPhotoObj);
    }

    // Keep max 3 photos
    if (updated.length > 3) {
      updated = updated.slice(0, 3);
    }

    saveToStorage(updated);
    setIsModalOpen(false);
    setPreviewDataUrl(null);
    setTitle('');
    setCaption('');
    setErrorMsg(null);
  };

  const [slotToDelete, setSlotToDelete] = useState<number | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleDeleteSlot = (indexToDelete: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSlotToDelete(indexToDelete);
  };

  const confirmDeleteSlot = () => {
    if (slotToDelete !== null) {
      const updated = photos.filter((_, idx) => idx !== slotToDelete);
      saveToStorage(updated);
      setIsModalOpen(false);
      setSlotToDelete(null);
    }
  };

  const handleResetDefaults = () => {
    setShowResetConfirm(true);
  };

  return (
    <div className="space-y-4">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white/[0.02] border border-white/10 p-4">
        <div>
          <h3 className="text-xl sm:text-2xl font-black uppercase italic tracking-tighter text-white flex items-center gap-2">
            <Camera className="w-5 h-5 text-[#D9FF00]" />
            <span>Featured Event Highlights</span>
          </h3>
          <p className="text-[11px] uppercase tracking-wider text-white/40 font-bold mt-0.5">
            Admin Showcase — Top 3 Race Photos & Medals (Max 1MB per image)
          </p>
        </div>

        {isAdmin && !publicViewOnly && (
          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <button
              onClick={() => handleOpenUploadForSlot(photos.length >= 3 ? 0 : photos.length)}
              className="flex-1 sm:flex-none px-3.5 py-2 bg-[#D9FF00] text-black font-black uppercase tracking-tighter italic text-xs hover:brightness-110 shadow-md flex items-center justify-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{photos.length >= 3 ? 'Replace Showcase Photo' : `Upload Photo (${photos.length}/3)`}</span>
            </button>

            <button
              onClick={handleResetDefaults}
              className="p-2 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white border border-white/10 transition-colors"
              title="Reset default photos"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* 3-Photo Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[0, 1, 2].map((slotIdx) => {
          const photo = photos[slotIdx];

          if (photo) {
            return (
              <div
                key={photo.id || slotIdx}
                onClick={() => setSelectedPhotoForView(photo)}
                className="group relative bg-[#0A0A0A] border border-white/15 hover:border-[#D9FF00] transition-all cursor-pointer overflow-hidden aspect-[16/10] flex flex-col justify-end shadow-lg"
              >
                {/* Image */}
                <img
                  src={photo.dataUrl}
                  alt={photo.title}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?auto=format&fit=crop&w=1200&q=80';
                  }}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85 group-hover:opacity-100"
                />

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                {/* Top Left Badge */}
                <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 bg-[#D9FF00] text-black font-black text-[10px] uppercase tracking-wider">
                    Photo #{slotIdx + 1}
                  </span>
                </div>

                {/* Admin Quick Action Controls */}
                {isAdmin && !publicViewOnly && (
                  <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleOpenUploadForSlot(slotIdx)}
                      className="px-2 py-1 bg-black/80 hover:bg-[#D9FF00] text-white hover:text-black border border-white/20 transition-all font-bold text-[10px] uppercase tracking-wider flex items-center gap-1"
                      title="Replace this photo"
                    >
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                    <button
                      onClick={(e) => handleDeleteSlot(slotIdx, e)}
                      className="p-1 bg-black/80 hover:bg-red-600 text-white border border-white/20 transition-all"
                      title="Delete photo"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* Bottom Title & Caption */}
                <div className="relative z-10 p-4 space-y-0.5">
                  <h4 className="text-sm font-black uppercase italic tracking-tighter text-white group-hover:text-[#D9FF00] transition-colors truncate">
                    {photo.title}
                  </h4>
                  {photo.caption && (
                    <p className="text-[11px] font-bold text-white/70 font-mono truncate">
                      {photo.caption}
                    </p>
                  )}
                </div>

                {/* Click to Expand Icon */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-[#D9FF00] p-2 border border-[#D9FF00]">
                  <Maximize2 className="w-4 h-4" />
                </div>
              </div>
            );
          }

          // Empty Slot
          return (
            <div
              key={`empty-slot-${slotIdx}`}
              onClick={() => {
                if (isAdmin && !publicViewOnly) {
                  handleOpenUploadForSlot(slotIdx);
                }
              }}
              className={`border-2 border-dashed border-white/10 hover:border-[#D9FF00]/50 p-6 flex flex-col items-center justify-center text-center space-y-2 aspect-[16/10] transition-all bg-white/[0.01] ${
                isAdmin && !publicViewOnly ? 'cursor-pointer hover:bg-white/[0.03]' : ''
              }`}
            >
              <div className="p-3 bg-white/5 border border-white/10 text-white/30 group-hover:text-[#D9FF00]">
                <ImageIcon className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-white/40">
                {isAdmin && !publicViewOnly ? `Slot #${slotIdx + 1}: Upload Photo` : `Slot #${slotIdx + 1} Empty`}
              </p>
              <span className="text-[10px] text-white/20 font-mono uppercase">Max size: 1.00 MB</span>
            </div>
          );
        })}
      </div>

      {/* Lightbox Fullscreen View Modal */}
      {selectedPhotoForView && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full bg-[#0A0A0A] border border-white/20 p-4 sm:p-6 shadow-2xl space-y-4">
            <button
              onClick={() => setSelectedPhotoForView(null)}
              className="absolute top-4 right-4 z-20 text-white/60 hover:text-white p-1.5 border border-white/20 hover:border-white bg-black/80 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="relative max-h-[70vh] flex items-center justify-center overflow-hidden bg-black border border-white/10">
              <img
                src={selectedPhotoForView.dataUrl}
                alt={selectedPhotoForView.title}
                referrerPolicy="no-referrer"
                className="max-h-[70vh] w-auto object-contain"
              />
            </div>

            <div className="flex items-center justify-between border-t border-white/10 pt-3">
              <div>
                <h3 className="text-xl font-black uppercase italic tracking-tighter text-[#D9FF00]">
                  {selectedPhotoForView.title}
                </h3>
                {selectedPhotoForView.caption && (
                  <p className="text-xs font-bold text-white/70 font-mono mt-0.5">
                    {selectedPhotoForView.caption}
                  </p>
                )}
              </div>

              {isAdmin && !publicViewOnly && (
                <button
                  onClick={() => {
                    const idx = photos.findIndex((p) => p.id === selectedPhotoForView.id);
                    setSelectedPhotoForView(null);
                    if (idx !== -1) handleOpenUploadForSlot(idx);
                  }}
                  className="px-3.5 py-1.5 bg-[#D9FF00] text-black font-black uppercase tracking-tighter italic text-xs hover:brightness-110 flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit This Photo
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Admin Upload / Edit Photo Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0A0A0A] border border-white/20 p-6 sm:p-8 max-w-lg w-full relative text-white space-y-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#D9FF00] text-black font-black">
                  <Camera className="w-6 h-6 stroke-[3]" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black uppercase italic tracking-tighter text-white">
                    Showcase Photo Slot #{targetSlotIndex + 1}
                  </h3>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white/40 mt-0.5">
                    Maximum photo size: 1.00 MB | Compressed automatically
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/40 hover:text-white p-1 border border-white/10 hover:border-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Slot Selector Tabs */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-3 text-xs">
              <span className="text-[10px] font-bold uppercase text-white/40 tracking-wider">Select Slot:</span>
              {[0, 1, 2].map((sIdx) => (
                <button
                  key={`slot-tab-${sIdx}`}
                  type="button"
                  onClick={() => handleOpenUploadForSlot(sIdx)}
                  className={`px-3 py-1 font-black uppercase tracking-wider text-[11px] transition-all border ${
                    targetSlotIndex === sIdx
                      ? 'bg-[#D9FF00] text-black border-[#D9FF00]'
                      : 'bg-white/5 text-white/60 border-white/10 hover:text-white'
                  }`}
                >
                  Slot #{sIdx + 1} {photos[sIdx] ? '✓' : ''}
                </button>
              ))}
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-bold uppercase tracking-wider flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSavePhoto} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-1">
                  Choose Photo File (Max 1MB) <span className="text-[#D9FF00]">*</span>
                </label>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleFileSelect}
                  className="w-full bg-black border border-white/20 px-3 py-2 text-xs font-mono text-white/80 file:bg-[#D9FF00] file:text-black file:border-0 file:px-3 file:py-1 file:font-black file:uppercase file:text-xs file:mr-3 cursor-pointer"
                />
              </div>

              {isCompressing && (
                <div className="text-xs text-[#D9FF00] font-mono animate-pulse flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Compressing and optimizing photo...</span>
                </div>
              )}

              {previewDataUrl && !isCompressing && (
                <div className="border border-white/20 p-2 bg-black relative max-h-48 overflow-hidden flex items-center justify-center">
                  <img src={previewDataUrl} alt="Preview" className="max-h-44 object-contain" />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-1">
                  Photo Title / Event Name
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Dhaka Marathon Finish 2025"
                  className="w-full bg-black border border-white/20 focus:border-[#D9FF00] px-3 py-2 text-xs font-bold text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-1">
                  Caption / Memory Notes
                </label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="e.g. Official HM Finish Time 01:52:14"
                  className="w-full bg-black border border-white/20 focus:border-[#D9FF00] px-3 py-2 text-xs font-mono text-white/80 outline-none"
                />
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                {photos[targetSlotIndex] ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteSlot(targetSlotIndex)}
                    className="px-3 py-2 text-xs font-bold uppercase tracking-wider bg-red-600 hover:bg-red-500 text-white flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                ) : (
                  <span />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-white/10 hover:bg-white/20 text-white border border-white/20"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!previewDataUrl || isCompressing}
                    className="px-6 py-2 bg-[#D9FF00] text-black font-black uppercase tracking-tighter italic text-xs hover:brightness-110 disabled:opacity-40"
                  >
                    Save Photo
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={slotToDelete !== null}
        title="Remove Showcase Photo"
        message={
          slotToDelete !== null
            ? `Are you sure you want to remove photo from Slot #${slotToDelete + 1}?`
            : ''
        }
        confirmText="Remove Photo"
        cancelText="Cancel"
        variant="danger"
        onConfirm={confirmDeleteSlot}
        onClose={() => setSlotToDelete(null)}
      />

      <ConfirmModal
        isOpen={showResetConfirm}
        title="Reset Showcase Photos"
        message="Are you sure you want to reset the showcase gallery back to default highlight photos?"
        confirmText="Reset Photos"
        cancelText="Cancel"
        variant="warning"
        onConfirm={() => {
          saveToStorage(DEFAULT_PHOTOS);
          setShowResetConfirm(false);
        }}
        onClose={() => setShowResetConfirm(false)}
      />

    </div>
  );
};
