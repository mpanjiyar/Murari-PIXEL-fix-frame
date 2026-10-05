import React from 'react';
import { motion } from 'motion/react';
import { Cpu, ShoppingBag, ExternalLink, Edit, X } from 'lucide-react';
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
  originalPrice?: string;
  discountPercentage?: string;
  availability?: string;
  partnerSource?: 'Amazon' | 'Flipkart' | 'Direct' | 'Other' | string;
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
  clicks?: number;
  clickHistory?: Record<string, number>;
  daily_click_count?: Record<string, number>;
  last_clicked?: string;
  isSyncedLicense?: boolean;
}

export interface PartnerDealCardProps {
  item: PartnerDealItem;
  index: number;
  currentTheme: 'normal' | 'mono' | 'light';
  isAuthorized: boolean;
  onTrackClick: (id: string) => Promise<void>;
  onEditItem: (item: PartnerDealItem, index: number) => void;
  onDeleteItem: (item: PartnerDealItem) => void;
}

export const PartnerDealCard = React.memo<PartnerDealCardProps>(
  ({
    item,
    index,
    currentTheme,
    isAuthorized,
    onTrackClick,
    onEditItem,
    onDeleteItem,
  }) => {
    const isFlipkart = item.partnerSource === 'Flipkart' || /flipkart\.com|dl\.flipkart\.com|fkrt\.(it|co)/i.test(item.url || '');
    const isAmazon = !isFlipkart && (item.partnerSource === 'Amazon' || /amazon\.(in|com|co\.uk|ca|de|fr|co\.jp|com\.au|es|it|com\.mx|com\.br|com\.tr|ae|sa|sg|se|pl|nl|be|com\.be|co\.za|eg)|\/amzn\.to\//i.test(item.url || ''));

    const [imgSrc, setImgSrc] = React.useState<string>(item.imageUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop');

    React.useEffect(() => {
      setImgSrc(item.imageUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop');
    }, [item.imageUrl]);

    return (
      <div
        key={item.id}
        className="relative flex flex-col h-full group transition-all duration-200"
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
          } ${item.isPublished === false ? 'opacity-70 border-dashed border-amber-500/40' : ''}`}
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
                <img
                  src={imgSrc}
                  alt={item.title}
                  loading="lazy"
                  decoding="async"
                  onError={() => {
                    setImgSrc('https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop');
                  }}
                  className="w-full h-full object-contain transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                />
              )}
            </div>

            {/* Source Micro-Badges */}
            <div className="absolute top-1.5 left-1.5 sm:top-2.5 sm:left-2.5 z-20 flex items-center gap-1 flex-wrap">
              {item.isSyncedLicense ? (
                <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-cyan-500/90 text-white font-mono text-[7px] sm:text-[8px] font-black tracking-widest uppercase flex items-center gap-0.5 sm:gap-1 shadow-sm backdrop-blur-md animate-pulse">
                  <Cpu size={8} className="stroke-[2.5]" />
                  <span>KEY</span>
                </span>
              ) : isFlipkart ? (
                <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-[#2874F0] text-white font-mono text-[7px] sm:text-[8px] font-black tracking-widest uppercase flex items-center gap-0.5 sm:gap-1 shadow-sm backdrop-blur-md">
                  <ShoppingBag size={8} className="stroke-[2.5]" />
                  <span>FLIPKART</span>
                </span>
              ) : isAmazon ? (
                <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-[#FF9900] text-black font-mono text-[7px] sm:text-[8px] font-black tracking-widest uppercase flex items-center gap-0.5 sm:gap-1 shadow-sm backdrop-blur-md font-bold">
                  <ShoppingBag size={8} className="stroke-[2.5]" />
                  <span>AMAZON</span>
                </span>
              ) : (
                <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-500/90 text-white font-mono text-[7px] sm:text-[8px] font-black tracking-widest uppercase flex items-center gap-0.5 sm:gap-1 shadow-sm backdrop-blur-md">
                  <ExternalLink size={8} className="stroke-[2.5]" />
                  <span>DEAL</span>
                </span>
              )}

              {item.isPublished === false && isAuthorized && (
                <span className="px-1.5 py-0.5 rounded-full bg-amber-500/90 text-black font-mono text-[6.5px] sm:text-[7.5px] font-black tracking-wider uppercase shadow-sm">
                  DRAFT
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

            {/* Footer Price & Code (Shown for ALL products with a price or promo code) */}
            {(item.price || item.discountCode) && (
              <div className="mt-2 pt-2 sm:mt-3 sm:pt-2.5 flex items-center justify-between gap-1.5 border-t border-slate-100 dark:border-white/[0.02]">
                {item.price ? (
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
                      {item.discountPercentage && (
                        <span className="text-[7px] sm:text-[8px] px-1 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold">
                          {item.discountPercentage}
                        </span>
                      )}
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
      </div>
    );
  }
);

PartnerDealCard.displayName = 'PartnerDealCard';
