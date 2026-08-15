import React, { useCallback } from 'react';
import { motion } from 'motion/react';
import { Cpu, ShoppingBag, ExternalLink, Edit, X, Plus } from 'lucide-react';
import { LazyImage } from './LazyImage';
import { LicenseProductCardVisual } from './LicenseProductCardVisual';

export interface PartnerDealItem {
  id: string;
  title: string;
  description: string;
  category: string;
  url: string;
  imageUrl?: string;
  discountCode?: string;
  price?: string;
  clicks?: number;
  clickHistory?: Record<string, number>;
  daily_click_count?: Record<string, number>;
  last_clicked?: string;
  isSyncedLicense?: boolean;
}

interface VirtualPartnerDealsGridProps {
  items: PartnerDealItem[];
  currentTheme: 'normal' | 'mono' | 'light';
  isAuthorized: boolean;
  isLoading: boolean;
  onTrackClick: (id: string) => Promise<void>;
  onEditItem: (item: PartnerDealItem, index: number) => void;
  onDeleteItem: (item: PartnerDealItem) => void;
  onSeedDeal?: () => void;
  searchQuery?: string;
}

export const VirtualPartnerDealsGrid: React.FC<VirtualPartnerDealsGridProps> = ({
  items,
  currentTheme,
  isAuthorized,
  isLoading,
  onTrackClick,
  onEditItem,
  onDeleteItem,
  onSeedDeal,
  searchQuery = '',
}) => {
  // Single Deal Card Renderer
  const renderCard = useCallback(
    (item: PartnerDealItem, index: number) => {
      const isAmazon = /amazon\.(in|com|co\.uk|ca|de|fr|co\.jp|com\.au|es|it|com\.mx|com\.br|com\.tr|ae|sa|sg|se|pl|nl|be|com\.be|co\.za|eg)|\/amzn\.to\//i.test(
        item.url || ''
      );

      return (
        <motion.div
          key={item.id}
          variants={{
            hidden: { opacity: 0, y: 24 },
            visible: { 
              opacity: 1, 
              y: 0, 
              transition: { 
                duration: 0.5, 
                ease: [0.215, 0.61, 0.355, 1] 
              } 
            }
          }}
          className="relative flex flex-col h-full group"
          style={{
            contentVisibility: 'auto',
            containIntrinsicSize: '160px 280px',
          }}
        >
          {/* Main Card Anchor */}
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onTrackClick(item.id)}
            className={`flex flex-col h-full rounded-xl sm:rounded-2xl border overflow-hidden transition-all duration-300 relative text-left select-none group hover:-translate-y-1.5 transform-gpu will-change-transform ${
              currentTheme === 'light'
                ? 'bg-white border-slate-200/80 shadow-[0_4px_18px_-4px_rgba(0,0,0,0.03)] hover:border-amber-500/40 hover:shadow-[0_16px_32px_-8px_rgba(245,158,11,0.12),0_8px_16px_-8px_rgba(0,0,0,0.04)]'
                : currentTheme === 'mono'
                ? 'bg-black border-zinc-800 hover:border-zinc-300 shadow-none'
                : 'bg-zinc-950 border-white/[0.04] shadow-[0_4px_25px_rgba(0,0,0,0.3)] hover:border-amber-500/40 hover:shadow-[0_20px_40px_-10px_rgba(245,158,11,0.22),0_8px_20px_-10px_rgba(0,0,0,0.7)]'
            }`}
          >
            {/* Showroom Frame Image (Fixed Aspect Ratio 4:3 prevents layout shift) */}
            <div
              className={`relative aspect-[4/3] w-full overflow-hidden flex items-center justify-center p-2 sm:p-3.5 border-b transition-colors duration-300 ${
                currentTheme === 'light'
                  ? 'bg-slate-50/70 border-slate-100'
                  : currentTheme === 'mono'
                  ? 'bg-zinc-900 border-zinc-800'
                  : 'bg-zinc-900/20 border-white/[0.02]'
              }`}
            >
              <div className="w-full h-full rounded-lg sm:rounded-xl overflow-hidden bg-white flex items-center justify-center relative shadow-[inset_0_1px_4px_rgba(0,0,0,0.02)]">
                {item.isSyncedLicense ? (
                  <LicenseProductCardVisual
                    licenseId={item.id}
                    licenseName={item.title}
                    licenseType={item.category === 'software' ? 'Lifetime License Key' : undefined}
                    currentTheme={currentTheme}
                    customImageUrl={item.imageUrl}
                  />
                ) : (
                  <LazyImage
                    src={item.imageUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e'}
                    alt={item.title}
                    className="w-full h-full object-contain transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                    placeholderClassName="absolute inset-0 z-0"
                  />
                )}
              </div>

              {/* Source Micro-Badges */}
              <div className="absolute top-1.5 left-1.5 sm:top-2.5 sm:left-2.5 z-20 flex items-center gap-1">
                {item.isSyncedLicense ? (
                  <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-cyan-500/90 text-white font-mono text-[7px] sm:text-[8px] font-black tracking-widest uppercase flex items-center gap-0.5 sm:gap-1 shadow-sm backdrop-blur-md animate-pulse">
                    <Cpu size={8} className="stroke-[2.5]" />
                    <span>KEY</span>
                  </span>
                ) : isAmazon ? (
                  <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-amber-500/90 text-black font-mono text-[7px] sm:text-[8px] font-black tracking-widest uppercase flex items-center gap-0.5 sm:gap-1 shadow-sm backdrop-blur-md">
                    <ShoppingBag size={8} className="stroke-[2.5]" />
                    <span>AMAZON</span>
                  </span>
                ) : (
                  <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-500/90 text-white font-mono text-[7px] sm:text-[8px] font-black tracking-widest uppercase flex items-center gap-0.5 sm:gap-1 shadow-sm backdrop-blur-md">
                    <ExternalLink size={8} className="stroke-[2.5]" />
                    <span>DEAL</span>
                  </span>
                )}
              </div>
            </div>

            {/* Content Details */}
            <div className="flex-1 flex flex-col p-2.5 sm:p-4 min-w-0 justify-between">
              <div className="space-y-1 sm:space-y-1.5">
                <h3
                  className={`text-[11px] sm:text-sm font-bold tracking-tight leading-snug line-clamp-2 transition-colors duration-200 ${
                    currentTheme === 'light'
                      ? 'text-slate-900 group-hover:text-amber-600'
                      : currentTheme === 'mono'
                      ? 'text-white group-hover:text-zinc-300'
                      : 'text-zinc-100 group-hover:text-amber-400'
                  }`}
                >
                  {item.title}
                </h3>

                <p
                  className={`text-[9.5px] sm:text-[11px] leading-relaxed font-sans line-clamp-2 sm:line-clamp-3 ${
                    currentTheme === 'light'
                      ? 'text-slate-500 font-medium'
                      : currentTheme === 'mono'
                      ? 'text-zinc-400'
                      : 'text-slate-400'
                  }`}
                >
                  {item.description}
                </p>
              </div>

              {/* Footer Price & Code */}
              {((item.price && (item.isSyncedLicense || item.category === 'software')) || item.discountCode) && (
                <div className="mt-2 pt-2 sm:mt-3 sm:pt-2.5 flex items-center justify-between gap-1.5 border-t border-slate-100 dark:border-white/[0.02]">
                  {item.price && (item.isSyncedLicense || item.category === 'software') ? (
                    <div className="flex flex-col text-left">
                      <span className="text-[6.5px] sm:text-[8px] uppercase font-bold tracking-widest text-slate-400 dark:text-zinc-500 block leading-none">
                        Price
                      </span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span
                          className={`text-[10px] sm:text-[13px] font-black ${
                            currentTheme === 'light' ? 'text-slate-900' : 'text-emerald-400'
                          }`}
                        >
                          {item.price}
                        </span>
                        {item.isSyncedLicense && (
                          <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[6px] sm:text-[6.5px] font-black tracking-widest uppercase animate-pulse">
                            SYNCED
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div />
                  )}

                  {item.discountCode && (
                    <span className="px-1 sm:px-1.5 py-0.5 rounded bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 text-amber-500 font-mono text-[7.5px] sm:text-[8px] font-bold tracking-wider">
                      CODE: {item.discountCode}
                    </span>
                  )}
                </div>
              )}
            </div>
          </a>

          {/* Admin Control Bar */}
          {isAuthorized && (
            <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 flex items-center gap-1 z-25">
              <span className="px-1 sm:px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-md border border-white/10 text-white font-mono text-[7px] sm:text-[8px] font-semibold tracking-wider flex items-center gap-0.5">
                <span className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
                <span>{item.clicks || 0}</span>
              </span>

              <button
                onClick={(ev) => {
                  ev.preventDefault();
                  ev.stopPropagation();
                  onEditItem(item, index);
                }}
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-black/70 backdrop-blur-md hover:bg-amber-500 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-white/10 hover:border-amber-400"
                title="Edit deal parameters"
              >
                <Edit size={10} className="stroke-[2.5]" />
              </button>

              <button
                onClick={(ev) => {
                  ev.preventDefault();
                  ev.stopPropagation();
                  onDeleteItem(item);
                }}
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-black/70 backdrop-blur-md hover:bg-red-500 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-white/10 hover:border-red-400"
                title="Delete deal"
              >
                <X size={10} className="stroke-[2.5]" />
              </button>
            </div>
          )}
        </motion.div>
      );
    },
    [currentTheme, isAuthorized, onTrackClick, onEditItem, onDeleteItem]
  );

  // Skeleton Loader for 2-column mobile and adaptive desktop
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5 lg:gap-6 w-full">
        {[...Array(8)].map((_, i) => (
          <div
            key={`affiliate-sk-${i}`}
            className={`rounded-xl sm:rounded-2xl border overflow-hidden flex flex-col justify-between h-[260px] sm:h-[360px] shadow-sm animate-pulse ${
              currentTheme === 'light' ? 'bg-white border-slate-200' : 'bg-zinc-950 border-white/5'
            }`}
          >
            <div
              className={`aspect-[4/3] w-full relative ${
                currentTheme === 'light' ? 'bg-slate-100' : 'bg-zinc-900'
              }`}
            >
              <div className="absolute top-2 left-2 w-12 sm:w-16 h-3 sm:h-4 rounded bg-amber-500/20" />
            </div>

            <div className="flex-1 flex flex-col justify-between p-2.5 sm:p-4 space-y-2 text-left">
              <div className="space-y-1.5">
                <div
                  className={`w-5/6 h-3.5 sm:h-4 rounded ${
                    currentTheme === 'light' ? 'bg-slate-200' : 'bg-zinc-800'
                  }`}
                />
                <div
                  className={`w-1/2 h-2.5 sm:h-3 rounded ${
                    currentTheme === 'light' ? 'bg-slate-100' : 'bg-zinc-900'
                  }`}
                />
              </div>

              <div className="space-y-1 pt-1">
                <div
                  className={`w-full h-2.5 sm:h-3 rounded ${
                    currentTheme === 'light' ? 'bg-slate-100' : 'bg-zinc-900'
                  }`}
                />
                <div
                  className={`w-3/4 h-2.5 sm:h-3 rounded ${
                    currentTheme === 'light' ? 'bg-slate-100' : 'bg-zinc-900/60'
                  }`}
                />
              </div>

              <div className="pt-1.5">
                <div
                  className={`w-full h-6 sm:h-8 rounded-lg sm:rounded-xl ${
                    currentTheme === 'light' ? 'bg-slate-100' : 'bg-zinc-800'
                  }`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Zero State
  if (items.length === 0) {
    return (
      <div
        className={`p-8 sm:p-10 md:p-14 rounded-2xl sm:rounded-3xl border text-center space-y-3.5 transition-all ${
          currentTheme === 'light' ? 'bg-slate-50 border-slate-200/80 shadow-sm' : 'bg-white/5 border-white/5'
        }`}
      >
        <ShoppingBag className="mx-auto text-amber-500/80 stroke-[1.5px]" size={36} />
        <h3
          className={`text-xs sm:text-sm font-black tracking-wider uppercase font-mono ${
            currentTheme === 'light' ? 'text-slate-900' : 'text-white'
          }`}
        >
          {searchQuery.trim()
            ? `No partner deals match "${searchQuery}"`
            : 'No listings registered under database catalog filter'}
        </h3>
        <p className="text-slate-400 text-[10px] sm:text-[11px] max-w-md mx-auto font-sans leading-relaxed">
          {searchQuery.trim()
            ? 'Try checking your search terms or filter categories like Photography, SSD, or Software.'
            : "Murari hasn't indexed active gear recommendation cards in this category yet. Select another category or add a new deal."}
        </p>
        {isAuthorized && onSeedDeal && (
          <button
            onClick={onSeedDeal}
            className="mt-2 inline-flex items-center gap-1.5 text-[9px] font-bold uppercase font-mono text-amber-500 border border-amber-500/30 px-3.5 py-1.5 rounded-xl hover:bg-amber-500 hover:text-black transition-colors cursor-pointer"
          >
            <Plus size={11} className="stroke-[3px]" />
            Seed Curated Deal
          </button>
        )}
      </div>
    );
  }

  // Pure Responsive Grid: Exactly 2 columns on mobile screens, 3 on tablet, 4 on desktop
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.08,
            delayChildren: 0.04
          }
        }
      }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5 lg:gap-6 w-full"
    >
      {items.map((item, index) => renderCard(item, index))}
    </motion.div>
  );
};

export default VirtualPartnerDealsGrid;
