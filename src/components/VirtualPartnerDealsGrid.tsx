import React from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, Plus } from 'lucide-react';
import { PartnerDealCard, PartnerDealItem } from './PartnerDealCard';

export type { PartnerDealItem };

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
  categoryFilter?: string;
  onResetFilter?: () => void;
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
  categoryFilter = 'all',
  onResetFilter,
}) => {
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
            : categoryFilter !== 'all'
            ? `No products currently in this category`
            : 'No partner products registered in catalog'}
        </h3>
        <p className="text-slate-400 text-[10px] sm:text-[11px] max-w-md mx-auto font-sans leading-relaxed">
          {searchQuery.trim()
            ? 'Try checking your search terms or filter categories like Photography, IT & Support, or Software.'
            : categoryFilter !== 'all'
            ? `There are no partner deals cataloged under this category at the moment. Switch to another category or reset your filter to browse all products.`
            : "No active gear recommendation cards are available right now. Check back soon for new curated deals."}
        </p>

        <div className="flex items-center justify-center gap-2 pt-2 flex-wrap">
          {categoryFilter !== 'all' && onResetFilter && (
            <button
              onClick={onResetFilter}
              className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase font-mono text-amber-500 border border-amber-500/30 px-3.5 py-1.5 rounded-xl hover:bg-amber-500 hover:text-black transition-colors cursor-pointer"
            >
              View All Deals
            </button>
          )}

          {isAuthorized && onSeedDeal && (
            <button
              onClick={onSeedDeal}
              className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase font-mono text-white bg-amber-500 hover:bg-amber-600 px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer"
            >
              <Plus size={11} className="stroke-[3px]" />
              Add Partner Product
            </button>
          )}
        </div>
      </div>
    );
  }

  // Pure Responsive Grid: Exactly 2 columns on mobile screens, 3 on tablet, 4 on desktop
  return (
    <div
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5 lg:gap-6 w-full transition-all duration-150"
    >
      {items.map((item, index) => (
        <PartnerDealCard
          key={item.id}
          item={item}
          index={index}
          currentTheme={currentTheme}
          isAuthorized={isAuthorized}
          onTrackClick={onTrackClick}
          onEditItem={onEditItem}
          onDeleteItem={onDeleteItem}
        />
      ))}
    </div>
  );
};

export default VirtualPartnerDealsGrid;
