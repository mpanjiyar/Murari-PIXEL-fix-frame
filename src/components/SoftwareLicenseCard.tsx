import React from 'react';
import { Edit, Trash2, Laptop, KeyRound, CheckCircle, ExternalLink } from 'lucide-react';
import { SoftwareLicense } from '../types';
import { LicenseProductCardVisual } from './LicenseProductCardVisual';
import WhatsAppIcon from './WhatsAppIcon';

export interface SoftwareLicenseCardProps {
  license: SoftwareLicense;
  currentTheme: 'normal' | 'mono' | 'light';
  cardStyle: string;
  isAuthorized: boolean;
  onEdit: (license: SoftwareLicense) => void;
  onDelete: (license: SoftwareLicense) => void;
}

export const SoftwareLicenseCard = React.memo<SoftwareLicenseCardProps>(
  ({
    license,
    currentTheme,
    cardStyle,
    isAuthorized,
    onEdit,
    onDelete,
  }) => {
    return (
      <div
        key={license.id}
        onClick={() => {
          const textMessage = `Hi Murari, I am interested in purchasing a software license for "${license.name}" priced at ${license.price}. Please provide the payment details and guide me on how to get the activation key. Thanks!`;
          window.open(`https://wa.me/918638875231?text=${encodeURIComponent(textMessage)}`, '_blank');
        }}
        className={`relative p-3.5 sm:p-5 rounded-2xl border text-left cursor-pointer transition-all duration-300 flex flex-col justify-between h-full group select-none overflow-hidden hover:border-green-500/40 hover:scale-[1.015] hover:bg-green-500/5 ${cardStyle}`}
      >
        {isAuthorized && (
          <div className="absolute top-3 right-3 flex items-center gap-1 z-20">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(license);
              }}
              className="p-1 rounded bg-amber-500 hover:bg-amber-600 text-white transition-colors cursor-pointer"
            >
              <Edit size={10} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(license);
              }}
              className="p-1 rounded bg-rose-500 hover:bg-rose-600 text-white transition-colors cursor-pointer"
            >
              <Trash2 size={10} />
            </button>
          </div>
        )}

        <div className="space-y-4 flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            {/* MODERN LUXURY BRAND VISUAL CARD */}
            <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 dark:bg-zinc-800/60 relative">
              <LicenseProductCardVisual
                licenseId={license.id}
                licenseName={license.name}
                licenseType={license.licenseType}
                currentTheme={currentTheme}
                customImageUrl={license.imageUrl}
              />
            </div>

            <div className="flex items-start justify-between">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors bg-slate-500/10 text-slate-400 group-hover:text-green-500 group-hover:bg-green-500/10">
                <Laptop size={14} />
              </div>
              {license.badge && (
                <span className="text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-full border tracking-widest bg-slate-100 text-slate-500 border-slate-200 dark:bg-white/5 dark:text-zinc-400 dark:border-white/5 group-hover:border-green-500/20 group-hover:bg-green-500/10 group-hover:text-green-500 transition-colors">
                  {license.badge}
                </span>
              )}
            </div>

            <div>
              <h3
                className={`text-xs sm:text-sm font-black leading-tight group-hover:text-green-500 transition-colors ${
                  currentTheme === 'light' ? 'text-slate-900' : 'text-white'
                }`}
              >
                {license.name}
              </h3>

              <div className="mt-1 flex items-center gap-1 text-[8.5px] sm:text-[10px] text-emerald-500 font-bold uppercase tracking-wider">
                <KeyRound size={10} className="sm:size-[11px]" />
                <span>{license.licenseType || 'Lifetime Key'}</span>
              </div>

              <p className="text-[9.5px] sm:text-[11px] text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
                {license.description}
              </p>
            </div>
          </div>

          {/* DYNAMIC SPECS & FEATURES */}
          <div className="space-y-1.5 mt-2 pt-2 border-t border-slate-500/5">
            {license.compatibility && (
              <div className="flex items-center gap-1.5 text-[8.5px] font-mono uppercase tracking-wider text-slate-500">
                <Laptop size={10} className="shrink-0" />
                <span className="line-clamp-1">{license.compatibility}</span>
              </div>
            )}

            {license.features && (
              <div className="space-y-1">
                {license.features
                  .split(',')
                  .slice(0, 2)
                  .map((f: string, i: number) => (
                    <div
                      key={i}
                      className="flex items-center gap-1.5 text-[9px] sm:text-[10px] text-slate-400"
                    >
                      <CheckCircle size={9} className="text-emerald-500 shrink-0" />
                      <span className="line-clamp-1">{f.trim()}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        <div className="pt-2 mt-2 border-t border-slate-500/10 flex items-baseline justify-between">
          <div>
            <span className="text-[7.5px] sm:text-[8px] uppercase font-bold tracking-widest text-slate-400 block">
              Retail Cost
            </span>
            <span
              className={`text-xs sm:text-base font-extrabold ${
                currentTheme === 'light' ? 'text-slate-900' : 'text-white'
              }`}
            >
              {license.price}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {license.url && (
              <a
                href={license.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="bg-[#FF5500] hover:bg-[#FF4400] text-white p-1 sm:p-1.5 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer shadow-md shadow-[#FF5500]/10 hover:scale-105 active:scale-95"
                title="Buy Online"
              >
                <ExternalLink size={11} className="stroke-[2.5]" />
              </a>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const textMessage = `Hi Murari, I am interested in purchasing a software license for "${license.name}" priced at ${license.price}. Please provide the payment details and guide me on how to get the activation key. Thanks!`;
                window.open(`https://wa.me/918638875231?text=${encodeURIComponent(textMessage)}`, '_blank');
              }}
              className="bg-green-600 hover:bg-green-700 text-white p-1 sm:p-1.5 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer shadow-md shadow-green-600/10 hover:scale-105 active:scale-95"
              title="Inquire on WhatsApp"
            >
              <WhatsAppIcon size={11} />
            </button>
          </div>
        </div>
      </div>
    );
  }
);

SoftwareLicenseCard.displayName = 'SoftwareLicenseCard';
