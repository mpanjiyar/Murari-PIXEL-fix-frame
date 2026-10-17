import React, { useState, useMemo } from 'react';
import {
  Search,
  BookOpen,
  Filter,
  CheckCircle2,
  X,
  Sparkles,
  ExternalLink,
  Youtube,
  Instagram,
  Tv,
  Folder,
  ArrowUpDown,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MegaPackResource } from '../types';
import { MasterVaultCard } from './MasterVaultCard';
import { ResourceRegistryCard } from './ResourceRegistryCard';
import { useMegaPackRegistry } from '../hooks/useMegaPackRegistry';

interface MegaPackBundleDirectoryProps {
  masterDriveLink?: string;
  downloadToken?: string;
  customerName?: string;
  orderId?: string;
  onCopyLink?: (text: string, label: string) => void;
  copiedLabel?: string | null;
  currentTheme?: string;
  onRequestUnlock?: () => void;
}

export const MegaPackBundleDirectory: React.FC<MegaPackBundleDirectoryProps> = ({
  masterDriveLink: propMasterDriveLink,
  downloadToken,
  customerName,
  orderId,
  onCopyLink,
  copiedLabel,
  currentTheme = 'dark',
  onRequestUnlock,
}) => {
  // Access is strictly gated: only buyers with valid approved orderId / token have unlocked access
  const isApprovedAccess = Boolean(downloadToken && orderId);
  const {
    resources,
    masterDriveLink: liveMasterDriveLink,
    isLoading,
    refreshResources,
  } = useMegaPackRegistry(propMasterDriveLink, { token: downloadToken, orderId });

  const effectiveMasterDriveLink = isApprovedAccess ? (propMasterDriveLink || liveMasterDriveLink || '') : '';

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'default' | 'title' | 'category'>('default');
  const [showUsageGuide, setShowUsageGuide] = useState<boolean>(false);

  // Category definitions matching the PDF structure
  const categories = useMemo(() => [
    { id: 'all', label: 'All Resources', count: resources.length },
    { id: 'quick_access', label: 'Quick Access', count: resources.filter(r => r.category === 'quick_access').length },
    { id: 'core', label: 'Core & Premium', count: resources.filter(r => r.category === 'core').length },
    { id: 'creative', label: 'Creative & Lifestyle', count: resources.filter(r => r.category === 'creative').length },
    { id: 'trending', label: 'Tools & Trending', count: resources.filter(r => r.category === 'trending').length },
    { id: 'ai_gadgets', label: 'AI & Gadgets', count: resources.filter(r => r.category === 'ai_gadgets').length },
    { id: 'bonuses', label: 'Bonuses & Tools', count: resources.filter(r => r.category === 'bonuses').length },
  ], [resources]);

  // Filtered and sorted resources
  const filteredResources = useMemo(() => {
    let result = resources.filter(item => {
      if (activeCategory !== 'all' && item.category !== activeCategory) {
        return false;
      }
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      return (
        item.title.toLowerCase().includes(q) ||
        item.categoryLabel.toLowerCase().includes(q) ||
        (item.badge && item.badge.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q))
      );
    });

    if (sortBy === 'title') {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'category') {
      result = [...result].sort((a, b) => a.category.localeCompare(b.category));
    } else {
      result = [...result].sort((a, b) => a.sortOrder - b.sortOrder);
    }

    return result;
  }, [resources, activeCategory, searchQuery, sortBy]);

  const handleCardCopy = (url: string, title: string) => {
    if (onCopyLink) {
      onCopyLink(url, title);
    } else {
      try {
        navigator.clipboard.writeText(url);
      } catch (_) {}
    }
  };

  return (
    <div className="space-y-8 w-full max-w-7xl mx-auto" id="megapack-bundle-directory">
      {/* 1. SECTION 2 & 5: PREMIUM MASTER VAULT HERO CARD */}
      <MasterVaultCard
        masterDriveLink={effectiveMasterDriveLink}
        isUnlocked={isApprovedAccess}
        customerName={customerName}
        orderId={orderId}
        currentTheme={currentTheme}
        onRequestUnlock={onRequestUnlock}
      />

      {/* 2. NAVIGATION, SEARCH & FILTER CONTROL BAR */}
      <div className="space-y-4">
        {/* Category Filter Pills (Scrollable on small mobile) */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeCategory === cat.id
                  ? 'bg-teal-500 text-black shadow-md shadow-teal-500/20'
                  : 'bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 border border-white/10'
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeCategory === cat.id ? 'bg-black/20 text-black' : 'bg-black/50 text-zinc-400'
                }`}
              >
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search, Sort and Guide Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search 53 resources by keyword (e.g. Anime, 4K, Luxury, Gym, ChatGPT)..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-zinc-950 border border-white/15 focus:border-teal-500 text-xs font-mono text-white placeholder-zinc-500 outline-none transition-colors shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-white cursor-pointer"
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Sort & Guide Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Sort Selector */}
            <div className="flex items-center gap-1 bg-zinc-950 border border-white/15 rounded-xl px-2.5 py-1.5 text-xs font-mono text-zinc-300">
              <ArrowUpDown size={13} className="text-teal-400" />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs font-mono text-zinc-200 outline-none cursor-pointer"
              >
                <option value="default" className="bg-zinc-900 text-white">Default PDF Order</option>
                <option value="title" className="bg-zinc-900 text-white">Title (A-Z)</option>
                <option value="category" className="bg-zinc-900 text-white">By Category</option>
              </select>
            </div>

            {/* Toggle Usage Guide */}
            <button
              type="button"
              onClick={() => setShowUsageGuide(!showUsageGuide)}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
                showUsageGuide
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-zinc-900 border-white/15 hover:bg-zinc-800 text-zinc-300'
              }`}
            >
              <BookOpen size={14} />
              <span className="hidden sm:inline">How To Use</span>
            </button>

            {/* Refresh Live Cache */}
            <button
              type="button"
              onClick={() => refreshResources()}
              disabled={isLoading}
              className="p-2.5 rounded-xl bg-zinc-900 border border-white/15 hover:bg-zinc-800 text-zinc-400 hover:text-teal-400 transition-colors cursor-pointer"
              title="Refresh resources from server"
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin text-teal-400' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* 3. USAGE GUIDE ACCORDION (PAGE 8 OF PDF) */}
      <AnimatePresence>
        {showUsageGuide && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-3xl bg-zinc-950 border border-amber-500/30 p-6 sm:p-7 space-y-6 text-left">
              <div className="border-b border-white/10 pb-4">
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                  PAGE 8 • CREATOR USAGE GUIDE
                </span>
                <h4 className="text-lg font-bold text-white mt-1">
                  How To Use Your Mega Pack
                </h4>
                <p className="text-xs text-zinc-400 mt-1">
                  Open resources, organize your downloads, and edit responsibly for maximum virality and retention.
                </p>
              </div>

              {/* 3 Step Workflow */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-mono font-bold text-xs">
                    01
                  </div>
                  <h5 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Open A Link
                  </h5>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Select an OPEN RESOURCE button. If the host asks, sign in with your own account. If a link does not open, copy it into your browser.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-mono font-bold text-xs">
                    02
                  </div>
                  <h5 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Download &amp; Organize
                  </h5>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Save files to a clearly named folder. Keep a backup, scan unfamiliar files, and respect the access rules of the original host.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-mono font-bold text-xs">
                    03
                  </div>
                  <h5 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Edit Your Video
                  </h5>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Import files into editors like CapCut, VN, Premiere Pro, or DaVinci Resolve. Trim, add captions or voice-overs, and export.
                  </p>
                </div>
              </div>

              {/* Do's and Don'ts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/20 space-y-2">
                  <span className="text-xs font-bold font-mono text-emerald-400 flex items-center gap-1.5 uppercase">
                    <CheckCircle2 size={14} /> DO
                  </span>
                  <ul className="text-[11px] text-zinc-300 space-y-1 list-disc list-inside">
                    <li>Use permitted content and check platform rules before posting.</li>
                    <li>Customize responsibly. Add captions, commentary, or narration.</li>
                    <li>Keep links organized. Save backups of your project files.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/20 space-y-2">
                  <span className="text-xs font-bold font-mono text-rose-400 flex items-center gap-1.5 uppercase">
                    <X size={14} /> DO NOT
                  </span>
                  <ul className="text-[11px] text-zinc-300 space-y-1 list-disc list-inside">
                    <li>Do not resell this bundle or its direct access links.</li>
                    <li>Do not claim ownership of third-party clips, music, or artworks.</li>
                    <li>Do not bypass access restrictions or leak private folders.</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. RESOURCE CARDS GRID */}
      {filteredResources.length === 0 ? (
        <div className="p-12 rounded-3xl bg-zinc-950 border border-white/10 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-white/5 text-zinc-400 flex items-center justify-center mx-auto">
            <Search size={22} />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white font-mono">No Resources Found</h4>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              No digital resources matched &quot;{searchQuery}&quot; in category &quot;{activeCategory}&quot;.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setActiveCategory('all');
            }}
            className="px-4 py-2 rounded-xl bg-teal-500 text-black text-xs font-mono font-bold uppercase transition-transform active:scale-95 cursor-pointer"
          >
            Clear Filters &amp; View All
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400 px-1">
            <span>
              Showing <strong className="text-white">{filteredResources.length}</strong> of {resources.length} resources
            </span>
            {searchQuery && (
              <span className="text-teal-400">
                Filtered by &quot;{searchQuery}&quot;
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredResources.map(resource => (
              <ResourceRegistryCard
                key={resource.id}
                resource={resource}
                fallbackMasterUrl={effectiveMasterDriveLink}
                onCopy={handleCardCopy}
                isCopied={copiedLabel === resource.title}
                onRequestUnlock={onRequestUnlock}
              />
            ))}
          </div>
        </div>
      )}

      {/* 5. CREATOR COMMUNITY & SUPPORT (PAGE 9 OF PDF) */}
      <div className="rounded-3xl bg-gradient-to-br from-zinc-900 to-black border border-white/10 p-6 sm:p-8 space-y-6 text-left">
        <div className="border-b border-white/10 pb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#FF5500] font-bold block">
              PAGE 9 • CREATOR COMMUNITY
            </span>
            <h4 className="text-lg sm:text-xl font-bold text-white">
              Thank You! Welcome to the Pixel Fix Creator Community
            </h4>
          </div>
          <span className="px-3 py-1 rounded-full text-[10px] font-mono text-zinc-400 bg-black/60 border border-white/10">
            Keep Creating. Keep Learning.
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* YouTube */}
          <div className="p-5 rounded-2xl bg-black/60 border border-white/10 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-500 flex items-center justify-center">
                <Youtube size={22} />
              </div>
              <h5 className="text-sm font-bold text-white font-mono">YouTube</h5>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Watch video tutorials, CapCut editing breakdowns, and technical hardware troubleshooting.
              </p>
            </div>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Visit Channel</span>
              <ExternalLink size={13} />
            </a>
          </div>

          {/* Instagram */}
          <div className="p-5 rounded-2xl bg-black/60 border border-white/10 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-500 flex items-center justify-center">
                <Instagram size={22} />
              </div>
              <h5 className="text-sm font-bold text-white font-mono">Instagram</h5>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Follow @pixelframes for portrait cinematography, wedding reels, and behind-the-scenes editing.
              </p>
            </div>
            <a
              href="https://instagram.com/pixelframes"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Follow Pixel Frames</span>
              <ExternalLink size={13} />
            </a>
          </div>

          {/* Mega Movie Library */}
          <div className="p-5 rounded-2xl bg-black/60 border border-white/10 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Tv size={22} />
              </div>
              <h5 className="text-sm font-bold text-white font-mono">Mega Movie Library</h5>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Open the shared 4K movie clips repository for scene analysis, color study, and sound design.
              </p>
            </div>
            <a
              href={effectiveMasterDriveLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Open Library</span>
              <ExternalLink size={13} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
