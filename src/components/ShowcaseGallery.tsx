import React, { useState, useEffect } from 'react';
import { Camera, X, Image as ImageIcon, Maximize2 } from 'lucide-react';

export interface ShowcasePhoto {
  id: string;
  dataUrl: string;
  title: string;
  caption?: string;
  uploadedAt: string;
}

const STORAGE_KEY = 'towhid_running_showcase_photos_v2';

// Default showcase highlight photos
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

export const ShowcaseGallery: React.FC = () => {
  const [photos, setPhotos] = useState<ShowcasePhoto[]>([]);
  const [selectedPhotoForView, setSelectedPhotoForView] = useState<ShowcasePhoto | null>(null);

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
    setPhotos(DEFAULT_PHOTOS);
  }, []);

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
            Event Highlights — Race Photos & Finisher Medals
          </p>
        </div>
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
              className="border-2 border-dashed border-white/10 p-6 flex flex-col items-center justify-center text-center space-y-2 aspect-[16/10] bg-white/[0.01]"
            >
              <div className="p-3 bg-white/5 border border-white/10 text-white/30">
                <ImageIcon className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-white/40">
                Slot #{slotIdx + 1}
              </p>
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
              <button
                onClick={() => setSelectedPhotoForView(null)}
                className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white font-bold uppercase text-xs rounded transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
