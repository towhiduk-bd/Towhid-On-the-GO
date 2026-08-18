import React, { useState } from 'react';
import { UserBio, TravelBlog } from '../types';
import { generateAutoHashtags } from '../utils/formatters';
import {
  User,
  MapPin,
  Mail,
  Facebook,
  Instagram,
  Flame,
  Globe,
  Compass,
  Camera,
  Code,
  Coffee,
  Activity,
  Award,
  ExternalLink,
  BookOpen,
  Calendar,
  Clock,
  Send,
  Copy,
  Image as ImageIcon,
  Maximize2,
  Check,
} from 'lucide-react';

interface PersonalBioProps {
  bio: UserBio;
}

export const PersonalBio: React.FC<PersonalBioProps> = ({ bio }) => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<TravelBlog | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const handleCopyEmail = () => {
    if (!bio.email) return;
    navigator.clipboard.writeText(bio.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const getHobbyIcon = (iconName: string) => {
    switch (iconName?.toLowerCase()) {
      case 'activity':
        return <Activity className="w-5 h-5 text-[#D9FF00]" />;
      case 'compass':
        return <Compass className="w-5 h-5 text-sky-400" />;
      case 'camera':
        return <Camera className="w-5 h-5 text-amber-400" />;
      case 'code':
        return <Code className="w-5 h-5 text-emerald-400" />;
      case 'coffee':
        return <Coffee className="w-5 h-5 text-orange-400" />;
      default:
        return <Globe className="w-5 h-5 text-[#D9FF00]" />;
    }
  };

  return (
    <div className="space-y-8 font-sans text-white">
      
      {/* Profile Header Hero Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border border-zinc-800 p-6 sm:p-10 shadow-2xl rounded-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <User className="w-64 h-64 text-[#D9FF00]" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar Badge */}
            <div className="relative group">
              <div className="px-4 py-3 sm:px-5 sm:py-4 bg-[#D9FF00] rounded-2xl flex items-center justify-center shrink-0 shadow-[0_0_25px_rgba(217,255,0,0.3)] border-2 border-black">
                <span className="text-2xl sm:text-3xl font-black italic text-black font-sans tracking-tighter">
                  TR_GO
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 p-1.5 bg-emerald-500 rounded-full border-2 border-black" title="Verified Runner">
                <Check className="w-3.5 h-3.5 text-black stroke-[3]" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight italic text-white">
                  {bio.name}
                </h2>
              </div>
              <p className="text-sm sm:text-base font-semibold text-zinc-300 mt-1">
                {bio.titleTagline}
              </p>
              <p className="text-xs font-bold text-zinc-400 mt-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#D9FF00]" />
                {bio.location}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Achievement Pills */}
        <div className="mt-8 pt-6 border-t border-zinc-800/80 flex flex-wrap items-center gap-3">
          <div className="px-3.5 py-1.5 bg-black/60 border border-zinc-800 rounded-xl flex items-center gap-2 text-xs font-bold text-zinc-200">
            <Award className="w-4 h-4 text-[#D9FF00]" />
            <span>21.1K Half Marathoner</span>
          </div>
          <div className="px-3.5 py-1.5 bg-black/60 border border-zinc-800 rounded-xl flex items-center gap-2 text-xs font-bold text-zinc-200">
            <Flame className="w-4 h-4 text-orange-400" />
            <span>30K Highway Finisher</span>
          </div>
          <div className="px-3.5 py-1.5 bg-black/60 border border-zinc-800 rounded-xl flex items-center gap-2 text-xs font-bold text-zinc-200">
            <Compass className="w-4 h-4 text-sky-400" />
            <span>Trail & Hill Explorer</span>
          </div>
          <div className="px-3.5 py-1.5 bg-black/60 border border-zinc-800 rounded-xl flex items-center gap-2 text-xs font-bold text-zinc-200">
            <Mail className="w-4 h-4 text-emerald-400" />
            <span>{bio.email}</span>
          </div>
        </div>
      </div>

      {/* Main Content Layout: About Me & Contact Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* About Me Story Card (2 Cols) */}
        <div className="lg:col-span-2 bg-zinc-900/90 border border-zinc-800 p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2.5 bg-[#D9FF00]/10 text-[#D9FF00] rounded-xl border border-[#D9FF00]/30">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-black uppercase italic tracking-tight text-white">
                  About Me
                </h3>
                <p className="text-xs text-zinc-400 font-medium">Personal story & athletic journey</p>
              </div>
            </div>

            <p className="text-sm sm:text-base text-zinc-200 leading-relaxed font-sans whitespace-pre-line">
              {bio.aboutMe}
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-[#D9FF00]" /> Based in Dhaka, Bangladesh
            </span>
            <span className="flex items-center gap-1.5 text-zinc-300">
              <Activity className="w-4 h-4 text-emerald-400" /> Active Marathon & Trail Runner
            </span>
          </div>
        </div>

        {/* Contact & Social Links Sidebar Card */}
        <div className="bg-zinc-900/90 border border-zinc-800 p-6 sm:p-8 rounded-2xl shadow-xl space-y-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-[#D9FF00]/10 text-[#D9FF00] rounded-xl border border-[#D9FF00]/30">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase italic tracking-tight text-white">
                Get In Touch
              </h3>
              <p className="text-xs text-zinc-400 font-medium">Direct channels & social links</p>
            </div>
          </div>

          <div className="space-y-3">
            {/* Email / Gmail */}
            <div className="p-3.5 bg-black/60 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 bg-red-500/10 text-red-400 rounded-lg shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Gmail</span>
                  <a
                    href={`mailto:${bio.email}`}
                    className="text-xs font-bold text-white hover:text-[#D9FF00] truncate block"
                  >
                    {bio.email}
                  </a>
                </div>
              </div>
              <button
                onClick={handleCopyEmail}
                className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-[10px] font-bold uppercase shrink-0 transition-colors"
                title="Copy Email address"
              >
                {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Facebook Link */}
            <a
              href={bio.facebookUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 bg-black/60 rounded-xl border border-zinc-800 hover:border-blue-500/50 hover:bg-blue-950/20 transition-all flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg group-hover:scale-110 transition-transform">
                  <Facebook className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Facebook</span>
                  <span className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                    Facebook Profile
                  </span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-zinc-500 group-hover:text-blue-400 transition-colors" />
            </a>

            {/* Instagram Link */}
            <a
              href={bio.instagramUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 bg-black/60 rounded-xl border border-zinc-800 hover:border-pink-500/50 hover:bg-pink-950/20 transition-all flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-500/10 text-pink-400 rounded-lg group-hover:scale-110 transition-transform">
                  <Instagram className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Instagram</span>
                  <span className="text-xs font-bold text-white group-hover:text-pink-400 transition-colors">
                    Instagram Feed
                  </span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-zinc-500 group-hover:text-pink-400 transition-colors" />
            </a>

            {/* Strava Athlete Profile */}
            <a
              href={bio.stravaProfileUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 bg-black/60 rounded-xl border border-zinc-800 hover:border-[#D9FF00]/50 hover:bg-[#D9FF00]/5 transition-all flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#D9FF00]/10 text-[#D9FF00] rounded-lg group-hover:scale-110 transition-transform">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Strava</span>
                  <span className="text-xs font-bold text-white group-hover:text-[#D9FF00] transition-colors">
                    Athlete Profile
                  </span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-zinc-500 group-hover:text-[#D9FF00] transition-colors" />
            </a>
          </div>
        </div>

      </div>

      {/* Hobbies & Interests Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-2xl font-black uppercase italic tracking-tight text-white flex items-center gap-2">
              <Compass className="w-6 h-6 text-[#D9FF00]" /> Hobbies & Interests
            </h3>
            <p className="text-xs text-zinc-400 font-medium">Passions outside the daily routine</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {bio.hobbies.map((hobby, idx) => (
            <div
              key={idx}
              className="bg-zinc-900/80 border border-zinc-800 p-5 rounded-2xl hover:border-zinc-700 transition-all hover:bg-zinc-900 group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 bg-black/60 rounded-xl border border-zinc-800 group-hover:border-[#D9FF00]/40">
                    {getHobbyIcon(hobby.icon)}
                  </div>
                  <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-zinc-800 text-zinc-300 rounded-full">
                    {hobby.category}
                  </span>
                </div>
                <h4 className="text-base font-extrabold text-white group-hover:text-[#D9FF00] transition-colors">
                  {hobby.title}
                </h4>
                <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed font-medium">
                  {hobby.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Travel Blog Section */}
      <div className="space-y-4 pt-4 border-t border-zinc-800">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-2xl font-black uppercase italic tracking-tight text-white flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-[#D9FF00]" /> Travel Blog & Trail Stories
            </h3>
            <p className="text-xs text-zinc-400 font-medium">Explorations, mountain treks & coastal journeys</p>
          </div>
        </div>

        {/* Blog Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {bio.travelBlogs.map((blog) => {
            const blogImgs = blog.images && blog.images.length > 0
              ? blog.images
              : blog.imageUrl ? [blog.imageUrl] : [];

            const cardTags = generateAutoHashtags(blog.title, blog.location, blog.summary, blog.tags);

            return (
              <div
                key={blog.id}
                onClick={() => setSelectedBlog(blog)}
                className="bg-zinc-900/90 border border-zinc-800 hover:border-[#D9FF00]/50 p-5 sm:p-6 rounded-2xl transition-all cursor-pointer group flex flex-col justify-between shadow-lg relative overflow-hidden"
              >
                <div>
                  {/* Blog Pictures Preview */}
                  {blogImgs.length > 0 && (
                    <div className="mb-4 rounded-xl overflow-hidden border border-zinc-800/80 bg-black/40">
                      {blogImgs.length === 1 ? (
                        <img
                          src={blogImgs[0]}
                          alt={blog.title}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80';
                          }}
                          className="h-44 w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="grid grid-cols-2 gap-1.5 h-44">
                          <img
                            src={blogImgs[0]}
                            alt={`${blog.title} 1`}
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80';
                            }}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <img
                            src={blogImgs[1]}
                            alt={`${blog.title} 2`}
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80';
                            }}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="text-xs font-bold text-[#D9FF00] flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#D9FF00]" /> {blog.location}
                    </span>
                    <div className="flex items-center gap-3 text-[11px] font-semibold text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {blog.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {blog.readTime}
                      </span>
                    </div>
                  </div>

                  <h4 className="text-lg font-black text-white group-hover:text-[#D9FF00] transition-colors leading-snug">
                    {blog.title}
                  </h4>

                  <p className="text-xs text-zinc-300 mt-2.5 leading-relaxed font-medium line-clamp-3">
                    {blog.summary}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {cardTags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-black/60 text-zinc-300 border border-zinc-800 rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                    {blogImgs.length > 0 && (
                      <span className="px-2 py-0.5 text-[10px] font-bold text-[#D9FF00] bg-[#D9FF00]/10 border border-[#D9FF00]/20 rounded flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" /> {blogImgs.length} {blogImgs.length === 1 ? 'Photo' : 'Photos'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Blog Details Modal */}
      {selectedBlog && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 max-w-2xl w-full p-6 sm:p-8 rounded-2xl shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <span className="text-xs font-bold text-[#D9FF00] flex items-center gap-1 mb-1">
                  <MapPin className="w-3.5 h-3.5" /> {selectedBlog.location}
                </span>
                <h3 className="text-2xl font-black text-white leading-tight">
                  {selectedBlog.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedBlog(null)}
                className="p-2 bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold text-zinc-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#D9FF00]" /> {selectedBlog.date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-sky-400" /> {selectedBlog.readTime}
              </span>
            </div>

            {/* Modal Image Gallery */}
            {(() => {
              const imgs = selectedBlog.images && selectedBlog.images.length > 0
                ? selectedBlog.images
                : selectedBlog.imageUrl ? [selectedBlog.imageUrl] : [];

              if (imgs.length === 0) return null;

              return (
                <div className="space-y-2">
                  <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5 text-[#D9FF00]" />
                    <span>Story Pictures ({imgs.length}) — Click to view full image</span>
                  </div>
                  <div className={imgs.length === 1 ? 'w-full' : 'grid grid-cols-1 sm:grid-cols-2 gap-3'}>
                    {imgs.map((img, iIdx) => (
                      <div
                        key={iIdx}
                        onClick={() => setLightboxImage(img)}
                        className="relative group rounded-xl overflow-hidden border border-zinc-700 bg-black cursor-pointer shadow-md"
                      >
                        <img
                          src={img}
                          alt={`${selectedBlog.title} ${iIdx + 1}`}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80';
                          }}
                          className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-xs font-bold text-white">
                          <Maximize2 className="w-4 h-4 text-[#D9FF00]" />
                          <span>View Full Picture</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            <p className="text-sm text-zinc-200 leading-relaxed font-sans whitespace-pre-line">
              {selectedBlog.summary}
            </p>

            <div className="flex items-center gap-2 flex-wrap pt-2">
              {generateAutoHashtags(selectedBlog.title, selectedBlog.location, selectedBlog.summary, selectedBlog.tags).map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-black text-[#D9FF00] border border-[#D9FF00]/30 rounded"
                >
                  #{tag}
                </span>
              ))}
            </div>

            <div className="pt-4 border-t border-zinc-800 flex justify-end">
              <button
                onClick={() => setSelectedBlog(null)}
                className="px-4 py-2 bg-zinc-800 text-zinc-300 hover:text-white font-bold uppercase text-xs rounded-lg transition-colors"
              >
                Close Story
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <img
              src={lightboxImage}
              alt="Enlarged view"
              referrerPolicy="no-referrer"
              className="max-w-full max-h-[85vh] object-contain rounded-xl border border-zinc-700 shadow-2xl"
            />
            <button
              onClick={() => setLightboxImage(null)}
              className="mt-3 px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase rounded-lg transition-colors"
            >
              Close View
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
