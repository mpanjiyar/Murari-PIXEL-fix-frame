import React from 'react';
import { motion } from 'motion/react';
import { Sliders, Trash2 } from 'lucide-react';
import { GalleryItem } from '../types';
import { LazyImage } from './LazyImage';

export interface GalleryItemCardProps {
  item: GalleryItem;
  tags: ('Recent' | 'Featured' | 'Client Favorites')[];
  categoryLabel: string;
  cardStyle: string;
  isAuthorized: boolean;
  onPreview: (item: GalleryItem) => void;
  onEdit: (item: GalleryItem) => void;
  onDelete: (item: GalleryItem) => void;
}

export const GalleryItemCard = React.memo<GalleryItemCardProps>(
  ({
    item,
    tags,
    categoryLabel,
    cardStyle,
    isAuthorized,
    onPreview,
    onEdit,
    onDelete,
  }) => {
    return (
      <motion.div
        key={item.id}
        onClick={() => onPreview(item)}
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: [0.215, 0.61, 0.355, 1] },
          },
          show: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: [0.215, 0.61, 0.355, 1] },
          },
        }}
        whileHover={{
          y: -6,
          scale: 1.02,
          transition: { type: 'spring', stiffness: 400, damping: 22 },
        }}
        className={`group rounded-2xl overflow-hidden border ${cardStyle} flex flex-col justify-between aspect-square relative cursor-pointer shadow-sm hover:shadow-lg hover:border-[#FF5500]/30 transition-all duration-300`}
      >
        {isAuthorized && (
          <div
            className="absolute top-3 right-3 z-20 flex gap-1 sm:gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => onEdit(item)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold uppercase text-[7px] sm:text-[10px] tracking-wider px-1.5 py-0.5 rounded shadow flex items-center gap-0.5 sm:gap-1 cursor-pointer"
            >
              <Sliders size={8} /> Edit
            </button>
            <button
              type="button"
              onClick={() => onDelete(item)}
              className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold uppercase text-[7px] sm:text-[10px] tracking-wider px-1.5 py-0.5 rounded shadow flex items-center gap-0.5 sm:gap-1 cursor-pointer"
            >
              <Trash2 size={8} /> Del
            </button>
          </div>
        )}

        {/* Automatic Collection Tags Badge */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10 flex flex-wrap gap-1 pointer-events-none">
          {tags.map((tag) => (
            <span
              key={tag}
              className={`text-[6.5px] sm:text-[9px] uppercase font-mono font-extrabold tracking-wider px-1.5 sm:px-2 py-0.5 rounded backdrop-blur-md shadow-md border flex items-center gap-0.5 sm:gap-1 ${
                tag === 'Recent'
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30'
                  : tag === 'Featured'
                  ? 'bg-amber-950/80 text-amber-300 border-amber-500/30'
                  : 'bg-pink-950/80 text-pink-300 border-pink-500/30'
              }`}
            >
              {tag === 'Recent' && <span className="text-[6.5px] sm:text-[9px]">🆕</span>}
              {tag === 'Featured' && <span className="text-[6.5px] sm:text-[9px]">⭐</span>}
              {tag === 'Client Favorites' && <span className="text-[6.5px] sm:text-[9px]">❤️</span>}
              {tag}
            </span>
          ))}
        </div>

        <LazyImage
          src={item.imageUrl}
          alt={item.altText}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          placeholderClassName="absolute inset-0 z-0"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent p-2.5 sm:p-4 flex flex-col justify-end">
          <span className="text-[8px] sm:text-[10px] uppercase font-mono font-bold text-[#FF5500]">
            {categoryLabel.toUpperCase()}
          </span>
          <h3 className="text-[10.5px] sm:text-sm font-black text-white mt-0.5 sm:mt-1 leading-tight line-clamp-1">
            {item.title}
          </h3>
          <div className="flex justify-between items-center text-[8.5px] sm:text-[10px] text-slate-500 pt-1.5 sm:pt-2 border-t border-white/5 mt-1.5 sm:mt-2">
            <span className="truncate">🗓️ {item.date}</span>
            <span
              className="font-mono text-[7px] sm:text-[9px] uppercase text-zinc-400 bg-white/5 px-1.5 sm:px-2 py-0.5 rounded truncate max-w-[50px] sm:max-w-none"
              title={item.cameraInfo}
            >
              {item.cameraInfo || 'Nikon'}
            </span>
          </div>
        </div>
      </motion.div>
    );
  }
);

GalleryItemCard.displayName = 'GalleryItemCard';
