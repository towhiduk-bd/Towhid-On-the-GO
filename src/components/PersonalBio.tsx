import React, { useState } from 'react';
import { UserBio, TravelBlog } from '../types';
import { generateAutoHashtags } from '../utils/formatters';
import { ConfirmModal } from './ConfirmModal';
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
  Edit3,
  Check,
  Plus,
  Trash2,
  ExternalLink,
  BookOpen,
  Calendar,
  Clock,
  Send,
  Copy,
  Upload,
  Image as ImageIcon,
  AlertCircle,
  Maximize2,
  Hash,
  Sparkles,
} from 'lucide-react';

interface PersonalBioProps {
  bio: UserBio;
  onUpdateBio: (updatedBio: UserBio) => void;
  isAdmin: boolean;
}

export const PersonalBio: React.FC<PersonalBioProps> = ({ bio, onUpdateBio, isAdmin }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<UserBio>(bio);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<TravelBlog | null>(null);

  // Travel Blog Form & Upload State
  const MAX_BLOG_IMAGES = 2;
  const MAX_IMAGE_SIZE_BYTES = 800 * 1024; // 800 KB

  const [showBlogModal, setShowBlogModal] = useState(false);
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  const [blogTitle, setBlogTitle] = useState('');
  const [blogLocation, setBlogLocation] = useState('');
  const [blogDate, setBlogDate] = useState('');
  const [blogReadTime, setBlogReadTime] = useState('3 min read');
  const [blogSummary, setBlogSummary] = useState('');
  const [blogTags, setBlogTags] = useState<string[]>(['Travel', 'Running']);
  const [blogImages, setBlogImages] = useState<string[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Delete confirmation modals
  const [hobbyToDeleteIndex, setHobbyToDeleteIndex] = useState<number | null>(null);
  const [blogToDeleteId, setBlogToDeleteId] = useState<string | null>(null);

  // Hobby Form & Admin State
  const [showHobbyModal, setShowHobbyModal] = useState(false);
  const [editingHobbyIndex, setEditingHobbyIndex] = useState<number | null>(null);
  const [hobbyTitle, setHobbyTitle] = useState('');
  const [hobbyCategory, setHobbyCategory] = useState('OUTDOORS');
  const [hobbyDescription, setHobbyDescription] = useState('');
  const [hobbyIcon, setHobbyIcon] = useState('compass');

  const handleOpenAddHobbyModal = () => {
    setEditingHobbyIndex(null);
    setHobbyTitle('');
    setHobbyCategory('OUTDOORS');
    setHobbyDescription('');
    setHobbyIcon('compass');
    setShowHobbyModal(true);
  };

  const handleOpenEditHobbyModal = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const h = bio.hobbies[index];
    if (!h) return;
    setEditingHobbyIndex(index);
    setHobbyTitle(h.title);
    setHobbyCategory(h.category);
    setHobbyDescription(h.description);
    setHobbyIcon(h.icon || 'compass');
    setShowHobbyModal(true);
  };

  const handleSaveHobby = () => {
    if (!hobbyTitle.trim() || !hobbyDescription.trim()) return;

    const hobbyObj = {
      title: hobbyTitle.trim(),
      category: hobbyCategory.trim().toUpperCase() || 'GENERAL',
      description: hobbyDescription.trim(),
      icon: hobbyIcon || 'globe',
    };

    let updatedHobbies = [...bio.hobbies];
    if (editingHobbyIndex !== null && editingHobbyIndex >= 0) {
      updatedHobbies[editingHobbyIndex] = hobbyObj;
    } else {
      updatedHobbies.push(hobbyObj);
    }

    const updatedBio = {
      ...bio,
      hobbies: updatedHobbies,
    };

    onUpdateBio(updatedBio);
    setEditForm(updatedBio);
    setShowHobbyModal(false);
  };

  const handleDeleteHobby = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setHobbyToDeleteIndex(index);
  };

  const confirmDeleteHobby = () => {
    if (hobbyToDeleteIndex === null) return;
    const updatedHobbies = bio.hobbies.filter((_, idx) => idx !== hobbyToDeleteIndex);
    const updatedBio = {
      ...bio,
      hobbies: updatedHobbies,
    };
    onUpdateBio(updatedBio);
    setEditForm(updatedBio);
    setHobbyToDeleteIndex(null);
  };

  const handleSaveBio = () => {
    onUpdateBio(editForm);
    setIsEditing(false);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(bio.email || 'towhid.uk@gmail.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleOpenAddBlogModal = () => {
    setEditingBlogId(null);
    setBlogTitle('');
    setBlogLocation('');
    setBlogDate(new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
    setBlogReadTime('3 min read');
    setBlogSummary('');
    setBlogTags([]);
    setTagInput('');
    setBlogImages([]);
    setImageError(null);
    setShowBlogModal(true);
  };

  const handleOpenEditBlogModal = (blog: TravelBlog, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingBlogId(blog.id);
    setBlogTitle(blog.title);
    setBlogLocation(blog.location);
    setBlogDate(blog.date);
    setBlogReadTime(blog.readTime || '3 min read');
    setBlogSummary(blog.summary);
    setBlogTags(generateAutoHashtags(blog.title, blog.location, blog.summary, blog.tags));
    setTagInput('');
    const existingImgs = blog.images && blog.images.length > 0
      ? blog.images
      : blog.imageUrl ? [blog.imageUrl] : [];
    setBlogImages(existingImgs.slice(0, MAX_BLOG_IMAGES));
    setImageError(null);
    setShowBlogModal(true);
  };

  const handleAutoGenerateTags = () => {
    const auto = generateAutoHashtags(blogTitle, blogLocation, blogSummary);
    setBlogTags(auto);
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    const clean = tagInput.trim().replace(/#/g, '');
    if (clean && blogTags.length < 5 && !blogTags.includes(clean)) {
      setBlogTags((prev) => [...prev, clean].slice(0, 5));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setBlogTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError(null);
    const files: File[] = e.target.files ? Array.from(e.target.files) : [];
    if (!files.length) return;

    if (blogImages.length + files.length > MAX_BLOG_IMAGES) {
      setImageError(`You can upload a maximum of ${MAX_BLOG_IMAGES} pictures per travel blog.`);
      e.target.value = '';
      return;
    }

    for (const file of files) {
      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        const sizeInKb = (file.size / 1024).toFixed(1);
        setImageError(`"${file.name}" is ${sizeInKb} KB. Maximum allowed size is 800 KB per picture.`);
        e.target.value = '';
        return;
      }
    }

    const readPromises = files.map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        })
    );

    Promise.all(readPromises)
      .then((dataUrls) => {
        setBlogImages((prev) => [...prev, ...dataUrls].slice(0, MAX_BLOG_IMAGES));
      })
      .catch(() => {
        setImageError('Failed to process image file.');
      });

    e.target.value = '';
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setBlogImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    setImageError(null);
  };

  const handleSaveBlog = () => {
    if (!blogTitle.trim() || !blogSummary.trim()) {
      setImageError('Please enter story title and details.');
      return;
    }

    const finalTags = generateAutoHashtags(blogTitle, blogLocation, blogSummary, blogTags);

    let updatedBlogs: TravelBlog[];

    if (editingBlogId) {
      updatedBlogs = bio.travelBlogs.map((b) => {
        if (b.id === editingBlogId) {
          return {
            ...b,
            title: blogTitle.trim(),
            location: blogLocation.trim() || 'Bangladesh',
            date: blogDate.trim() || '2025',
            readTime: blogReadTime.trim() || '3 min read',
            summary: blogSummary.trim(),
            tags: finalTags,
            images: blogImages,
            imageUrl: blogImages[0] || undefined,
          };
        }
        return b;
      });
    } else {
      const newBlogItem: TravelBlog = {
        id: `blog-${Date.now()}`,
        title: blogTitle.trim(),
        location: blogLocation.trim() || 'Bangladesh',
        date: blogDate.trim() || '2025',
        readTime: blogReadTime.trim() || '3 min read',
        summary: blogSummary.trim(),
        tags: finalTags,
        images: blogImages,
        imageUrl: blogImages[0] || undefined,
      };
      updatedBlogs = [newBlogItem, ...bio.travelBlogs];
    }

    const updatedBio = {
      ...bio,
      travelBlogs: updatedBlogs,
    };
    onUpdateBio(updatedBio);
    setEditForm(updatedBio);
    setShowBlogModal(false);
  };

  const handleDeleteBlog = (blogId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBlogToDeleteId(blogId);
  };

  const confirmDeleteBlog = () => {
    if (!blogToDeleteId) return;
    const updatedBio = {
      ...bio,
      travelBlogs: bio.travelBlogs.filter((b) => b.id !== blogToDeleteId),
    };
    onUpdateBio(updatedBio);
    setEditForm(updatedBio);
    setBlogToDeleteId(null);
  };

  const getHobbyIcon = (iconName: string) => {
    switch (iconName.toLowerCase()) {
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
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#D9FF00] rounded-2xl flex items-center justify-center shrink-0 shadow-[0_0_25px_rgba(217,255,0,0.3)] border-2 border-black">
                <span className="text-3xl sm:text-4xl font-black italic text-black font-sans">
                  TR
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

          {/* Admin Edit Controls */}
          {isAdmin && (
            <div className="shrink-0 self-stretch sm:self-auto">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveBio}
                    className="px-4 py-2 bg-[#D9FF00] text-black font-black uppercase text-xs tracking-wider flex items-center gap-1.5 rounded-lg hover:brightness-110 shadow-lg"
                  >
                    <Check className="w-4 h-4 stroke-[3]" /> Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setEditForm(bio);
                      setIsEditing(false);
                    }}
                    className="px-3 py-2 bg-zinc-800 text-zinc-300 font-bold uppercase text-xs rounded-lg hover:bg-zinc-700"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2.5 bg-zinc-800/90 border border-zinc-700 text-zinc-200 hover:text-white hover:bg-zinc-700 font-bold uppercase text-xs tracking-wider flex items-center gap-2 rounded-lg transition-all"
                >
                  <Edit3 className="w-4 h-4 text-[#D9FF00]" /> Edit Personal Bio
                </button>
              )}
            </div>
          )}
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

      {/* Editing Form Section (When Admin Edit Mode is Active) */}
      {isEditing && (
        <div className="bg-zinc-900 border-2 border-[#D9FF00]/50 p-6 sm:p-8 rounded-2xl shadow-2xl space-y-6">
          <h3 className="text-lg font-black uppercase italic text-[#D9FF00] flex items-center gap-2">
            <Edit3 className="w-5 h-5" /> Edit Profile & Bio Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold">
            <div>
              <label className="block text-zinc-400 uppercase tracking-wider mb-1">Full Name</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full bg-black border border-zinc-700 px-3 py-2 text-white rounded focus:border-[#D9FF00] outline-none"
              />
            </div>
            <div>
              <label className="block text-zinc-400 uppercase tracking-wider mb-1">Tagline / Title</label>
              <input
                type="text"
                value={editForm.titleTagline}
                onChange={(e) => setEditForm({ ...editForm, titleTagline: e.target.value })}
                className="w-full bg-black border border-zinc-700 px-3 py-2 text-white rounded focus:border-[#D9FF00] outline-none"
              />
            </div>
            <div>
              <label className="block text-zinc-400 uppercase tracking-wider mb-1">Location</label>
              <input
                type="text"
                value={editForm.location}
                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                className="w-full bg-black border border-zinc-700 px-3 py-2 text-white rounded focus:border-[#D9FF00] outline-none"
              />
            </div>
            <div>
              <label className="block text-zinc-400 uppercase tracking-wider mb-1">Gmail / Email</label>
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="w-full bg-black border border-zinc-700 px-3 py-2 text-white rounded focus:border-[#D9FF00] outline-none"
              />
            </div>
            <div>
              <label className="block text-zinc-400 uppercase tracking-wider mb-1">Facebook URL</label>
              <input
                type="text"
                value={editForm.facebookUrl}
                onChange={(e) => setEditForm({ ...editForm, facebookUrl: e.target.value })}
                className="w-full bg-black border border-zinc-700 px-3 py-2 text-white rounded focus:border-[#D9FF00] outline-none"
              />
            </div>
            <div>
              <label className="block text-zinc-400 uppercase tracking-wider mb-1">Instagram URL</label>
              <input
                type="text"
                value={editForm.instagramUrl}
                onChange={(e) => setEditForm({ ...editForm, instagramUrl: e.target.value })}
                className="w-full bg-black border border-zinc-700 px-3 py-2 text-white rounded focus:border-[#D9FF00] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-zinc-400 uppercase tracking-wider mb-1 text-xs font-bold">
              About Me Biography
            </label>
            <textarea
              rows={4}
              value={editForm.aboutMe}
              onChange={(e) => setEditForm({ ...editForm, aboutMe: e.target.value })}
              className="w-full bg-black border border-zinc-700 p-3 text-sm text-white rounded focus:border-[#D9FF00] outline-none leading-relaxed"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-zinc-800 text-zinc-300 font-bold uppercase text-xs rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveBio}
              className="px-5 py-2 bg-[#D9FF00] text-black font-black uppercase text-xs rounded hover:brightness-110 shadow-lg"
            >
              Save Profile
            </button>
          </div>
        </div>
      )}

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
                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg shrink-0">
                  <Facebook className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Facebook</span>
                  <span className="text-xs font-bold text-white group-hover:text-blue-400">Towhid on Facebook</span>
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
                <div className="p-2 bg-pink-500/10 text-pink-400 rounded-lg shrink-0">
                  <Instagram className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Instagram</span>
                  <span className="text-xs font-bold text-white group-hover:text-pink-400">Towhid on Instagram</span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-zinc-500 group-hover:text-pink-400 transition-colors" />
            </a>

            {/* Strava Link */}
            <a
              href={bio.stravaUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 bg-black/60 rounded-xl border border-zinc-800 hover:border-orange-500/50 hover:bg-orange-950/20 transition-all flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 text-orange-400 rounded-lg shrink-0">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Strava Profile</span>
                  <span className="text-xs font-bold text-white group-hover:text-orange-400">Strava Athlete Logs</span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-zinc-500 group-hover:text-orange-400 transition-colors" />
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

          {isAdmin && (
            <button
              onClick={handleOpenAddHobbyModal}
              className="px-3.5 py-2 bg-[#D9FF00] text-black font-black uppercase text-xs tracking-wider flex items-center gap-1.5 rounded-lg hover:brightness-110 shadow-lg transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" /> Add Hobby
            </button>
          )}
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

              {isAdmin && (
                <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-end gap-1.5">
                  <button
                    onClick={(e) => handleOpenEditHobbyModal(idx, e)}
                    className="px-2.5 py-1 text-xs font-bold text-[#D9FF00] bg-[#D9FF00]/10 hover:bg-[#D9FF00]/25 border border-[#D9FF00]/40 rounded-lg flex items-center gap-1 transition-colors"
                    title="Edit Hobby"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={(e) => handleDeleteHobby(idx, e)}
                    className="p-1.5 text-zinc-400 hover:text-red-400 bg-zinc-800/80 hover:bg-zinc-800 rounded-lg transition-colors"
                    title="Delete Hobby"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
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

          {isAdmin && (
            <button
              onClick={handleOpenAddBlogModal}
              className="px-3.5 py-2 bg-[#D9FF00] text-black font-black uppercase text-xs tracking-wider flex items-center gap-1.5 rounded-lg hover:brightness-110 shadow-lg"
            >
              <Plus className="w-4 h-4 stroke-[3]" /> Add Travel Blog
            </button>
          )}
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
                  {/* Blog Pictures Preview (Max 2) */}
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

                  {isAdmin && (
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleOpenEditBlogModal(blog, e)}
                        className="px-2.5 py-1 text-xs font-bold text-[#D9FF00] bg-[#D9FF00]/10 hover:bg-[#D9FF00]/25 border border-[#D9FF00]/40 rounded-lg flex items-center gap-1 transition-colors"
                        title="Edit this Travel Story"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={(e) => handleDeleteBlog(blog.id, e)}
                        className="p-1.5 text-zinc-400 hover:text-red-400 bg-zinc-800/80 hover:bg-zinc-800 rounded-lg transition-colors"
                        title="Delete Blog Post"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
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

            {/* Modal Image Gallery (Max 2 Pictures) */}
            {(() => {
              const imgs = selectedBlog.images && selectedBlog.images.length > 0
                ? selectedBlog.images
                : selectedBlog.imageUrl ? [selectedBlog.imageUrl] : [];

              if (imgs.length === 0) return null;

              return (
                <div className="space-y-2">
                  <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5 text-[#D9FF00]" />
                    <span>Story Pictures ({imgs.length}/2) — Click to view full image</span>
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

            <div className="pt-4 border-t border-zinc-800 flex items-center justify-between gap-3">
              {isAdmin ? (
                <button
                  onClick={(e) => {
                    const current = selectedBlog;
                    setSelectedBlog(null);
                    handleOpenEditBlogModal(current, e);
                  }}
                  className="px-4 py-2 bg-[#D9FF00] hover:brightness-110 text-black font-black uppercase text-xs rounded-lg flex items-center gap-1.5 shadow-md transition-all"
                >
                  <Edit3 className="w-4 h-4 stroke-[2.5]" />
                  <span>Edit This Story</span>
                </button>
              ) : (
                <div />
              )}
              <button
                onClick={() => setSelectedBlog(null)}
                className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold uppercase text-xs rounded-lg transition-colors"
              >
                Close Story
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Blog Modal with 2-Picture Upload Option (Max 800KB) */}
      {showBlogModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 max-w-lg w-full p-6 rounded-2xl shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-black uppercase text-[#D9FF00] flex items-center gap-2">
                {editingBlogId ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                {editingBlogId ? 'Edit Travel Story' : 'Add New Travel Story / Blog'}
              </h3>
              <button
                onClick={() => setShowBlogModal(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs font-bold">
              <div>
                <label className="block text-zinc-400 uppercase tracking-wider mb-1">Story Title</label>
                <input
                  type="text"
                  placeholder="e.g. Bandarban Hill Trail Trek"
                  value={blogTitle}
                  onChange={(e) => setBlogTitle(e.target.value)}
                  className="w-full bg-black border border-zinc-700 px-3 py-2 text-white rounded outline-none focus:border-[#D9FF00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 uppercase tracking-wider mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Bandarban, Hill Tracts"
                    value={blogLocation}
                    onChange={(e) => setBlogLocation(e.target.value)}
                    className="w-full bg-black border border-zinc-700 px-3 py-2 text-white rounded outline-none focus:border-[#D9FF00]"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 uppercase tracking-wider mb-1">Date</label>
                  <input
                    type="text"
                    placeholder="e.g. March 2025"
                    value={blogDate}
                    onChange={(e) => setBlogDate(e.target.value)}
                    className="w-full bg-black border border-zinc-700 px-3 py-2 text-white rounded outline-none focus:border-[#D9FF00]"
                  />
                </div>
              </div>

              {/* Upload Maximum 2 Pictures (Max 800KB size) */}
              <div className="space-y-2 p-3 bg-black/50 rounded-xl border border-zinc-800">
                <div className="flex items-center justify-between">
                  <label className="text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-[#D9FF00]" />
                    <span>Story Pictures ({blogImages.length}/2)</span>
                  </label>
                  <span className="text-[10px] text-zinc-400 font-normal bg-zinc-800 px-2 py-0.5 rounded">
                    Max 2 photos • Max 800KB each
                  </span>
                </div>

                {blogImages.length < MAX_BLOG_IMAGES && (
                  <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-zinc-700 hover:border-[#D9FF00] rounded-xl cursor-pointer bg-zinc-900/60 hover:bg-zinc-800/60 transition-all text-center">
                    <Upload className="w-5 h-5 text-[#D9FF00] mb-1" />
                    <span className="text-xs text-white font-bold">Choose / Upload Picture</span>
                    <span className="text-[10px] text-zinc-400 mt-0.5">JPEG or PNG under 800 KB</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}

                {/* Error Banner */}
                {imageError && (
                  <div className="p-2.5 bg-red-950/80 border border-red-800 text-red-200 text-xs rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{imageError}</span>
                  </div>
                )}

                {/* Picture Thumbnails */}
                {blogImages.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {blogImages.map((imgSrc, idx) => (
                      <div key={idx} className="relative group rounded-lg overflow-hidden border border-zinc-700 h-28 bg-black">
                        <img src={imgSrc} alt={`Uploaded ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1.5 right-1.5 p-1 bg-black/80 text-red-400 hover:text-white rounded-md transition-colors"
                          title="Remove picture"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 text-[9px] font-mono bg-black/80 text-zinc-300 rounded">
                          Photo {idx + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-zinc-400 uppercase tracking-wider mb-1">Summary / Story Content</label>
                <textarea
                  rows={4}
                  placeholder="Share details of the trek, scenery, running trail, atmosphere..."
                  value={blogSummary}
                  onChange={(e) => setBlogSummary(e.target.value)}
                  className="w-full bg-black border border-zinc-700 p-3 text-xs text-white rounded outline-none focus:border-[#D9FF00]"
                />
              </div>

              {/* Auto Hashtags Section (Max 5) */}
              {(() => {
                const liveTags = generateAutoHashtags(blogTitle, blogLocation, blogSummary, blogTags);
                return (
                  <div className="space-y-2 p-3 bg-black/50 rounded-xl border border-zinc-800">
                    <div className="flex items-center justify-between">
                      <label className="text-zinc-300 uppercase tracking-wider flex items-center gap-1.5 font-bold">
                        <Hash className="w-4 h-4 text-[#D9FF00]" />
                        <span>Auto Hashtags ({liveTags.length}/5 max)</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleAutoGenerateTags}
                        className="text-[10px] text-[#D9FF00] bg-[#D9FF00]/10 hover:bg-[#D9FF00]/20 font-bold px-2 py-1 rounded border border-[#D9FF00]/30 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Auto-Generate</span>
                      </button>
                    </div>

                    <p className="text-[11px] text-zinc-400 font-normal">
                      Maximum 5 hashtags automatically updated based on title, location, and story content.
                    </p>

                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      {liveTags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 text-xs font-bold text-[#D9FF00] bg-black border border-[#D9FF00]/40 rounded-lg flex items-center gap-1.5 shadow-sm"
                        >
                          <span>#{tag}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="text-zinc-400 hover:text-red-400 font-bold text-xs"
                            title="Remove hashtag"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>

                    {liveTags.length < 5 && (
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          placeholder="Add custom hashtag..."
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddTag();
                            }
                          }}
                          className="flex-1 bg-zinc-900 border border-zinc-700 px-2.5 py-1.5 text-xs text-white rounded outline-none focus:border-[#D9FF00]"
                        />
                        <button
                          type="button"
                          onClick={handleAddTag}
                          className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs rounded border border-zinc-700"
                        >
                          Add
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setShowBlogModal(false)}
                className="px-4 py-2 bg-zinc-800 text-zinc-300 font-bold uppercase text-xs rounded"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveBlog}
                className="px-5 py-2 bg-[#D9FF00] text-black font-black uppercase text-xs rounded hover:brightness-110"
              >
                {editingBlogId ? 'Save Changes' : 'Publish Story'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal for Full Image View */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-lg flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-zinc-800 shadow-2xl">
            <img src={lightboxImage} alt="Full resolution" className="max-w-full max-h-[85vh] object-contain" />
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-3 right-3 p-2 bg-black/80 text-white hover:text-[#D9FF00] rounded-full border border-zinc-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Add / Edit Hobby Modal */}
      {showHobbyModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 max-w-md w-full p-6 rounded-2xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-black uppercase text-[#D9FF00] flex items-center gap-2">
                {editingHobbyIndex !== null ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                {editingHobbyIndex !== null ? 'Edit Hobby / Interest' : 'Add New Hobby / Interest'}
              </h3>
              <button
                type="button"
                onClick={() => setShowHobbyModal(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs font-bold">
              <div>
                <label className="block text-zinc-400 uppercase tracking-wider mb-1">Hobby Title</label>
                <input
                  type="text"
                  placeholder="e.g. Trail Exploration"
                  value={hobbyTitle}
                  onChange={(e) => setHobbyTitle(e.target.value)}
                  className="w-full bg-black border border-zinc-700 px-3 py-2 text-white rounded outline-none focus:border-[#D9FF00]"
                />
              </div>

              <div>
                <label className="block text-zinc-400 uppercase tracking-wider mb-1">Category Badge</label>
                <input
                  type="text"
                  placeholder="e.g. OUTDOORS, TECH, CREATIVE, FITNESS"
                  value={hobbyCategory}
                  onChange={(e) => setHobbyCategory(e.target.value)}
                  className="w-full bg-black border border-zinc-700 px-3 py-2 text-white rounded outline-none focus:border-[#D9FF00]"
                />
              </div>

              <div>
                <label className="block text-zinc-400 uppercase tracking-wider mb-1">Icon Style</label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 p-2 bg-black/50 border border-zinc-800 rounded-xl">
                  {[
                    { id: 'compass', name: 'Compass', icon: <Compass className="w-4 h-4" /> },
                    { id: 'activity', name: 'Activity', icon: <Activity className="w-4 h-4" /> },
                    { id: 'camera', name: 'Camera', icon: <Camera className="w-4 h-4" /> },
                    { id: 'code', name: 'Code', icon: <Code className="w-4 h-4" /> },
                    { id: 'coffee', name: 'Coffee', icon: <Coffee className="w-4 h-4" /> },
                    { id: 'globe', name: 'Globe', icon: <Globe className="w-4 h-4" /> },
                    { id: 'book', name: 'Book', icon: <BookOpen className="w-4 h-4" /> },
                    { id: 'flame', name: 'Flame', icon: <Flame className="w-4 h-4" /> },
                  ].map((ic) => (
                    <button
                      key={ic.id}
                      type="button"
                      onClick={() => setHobbyIcon(ic.id)}
                      className={`p-2 rounded-lg flex items-center justify-center transition-all border ${
                        hobbyIcon.toLowerCase() === ic.id
                          ? 'bg-[#D9FF00]/20 border-[#D9FF00] text-[#D9FF00]'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                      title={ic.name}
                    >
                      {ic.icon}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 uppercase tracking-wider mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Brief description of this passion or activity..."
                  value={hobbyDescription}
                  onChange={(e) => setHobbyDescription(e.target.value)}
                  className="w-full bg-black border border-zinc-700 p-2.5 text-xs text-white rounded outline-none focus:border-[#D9FF00]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setShowHobbyModal(false)}
                className="px-4 py-2 bg-zinc-800 text-zinc-300 font-bold uppercase text-xs rounded"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveHobby}
                className="px-5 py-2 bg-[#D9FF00] text-black font-black uppercase text-xs rounded hover:brightness-110"
              >
                {editingHobbyIndex !== null ? 'Save Changes' : 'Add Hobby'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Deleting Hobby */}
      <ConfirmModal
        isOpen={hobbyToDeleteIndex !== null}
        title="Delete Hobby / Interest"
        message={
          hobbyToDeleteIndex !== null && bio.hobbies[hobbyToDeleteIndex]
            ? `Are you sure you want to remove "${bio.hobbies[hobbyToDeleteIndex].title}" from your Hobbies & Interests?`
            : 'Are you sure you want to remove this hobby?'
        }
        confirmText="Delete Hobby"
        onConfirm={confirmDeleteHobby}
        onClose={() => setHobbyToDeleteIndex(null)}
      />

      {/* Confirmation Modal for Deleting Travel Blog */}
      <ConfirmModal
        isOpen={blogToDeleteId !== null}
        title="Delete Travel Story"
        message="Are you sure you want to delete this travel story blog post?"
        confirmText="Delete Story"
        onConfirm={confirmDeleteBlog}
        onClose={() => setBlogToDeleteId(null)}
      />

    </div>
  );
};
