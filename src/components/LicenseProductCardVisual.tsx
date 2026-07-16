import React from 'react';
import { motion } from 'motion/react';
import { 
  Laptop, 
  KeyRound, 
  Cpu, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle,
  FileSpreadsheet,
  Layers,
  Code
} from 'lucide-react';

interface LicenseProductCardVisualProps {
  licenseId: string;
  licenseName: string;
  licenseType?: string;
  currentTheme: 'normal' | 'mono' | 'light';
  customImageUrl?: string;
}

export const LicenseProductCardVisual: React.FC<LicenseProductCardVisualProps> = ({
  licenseId,
  licenseName,
  licenseType = 'Lifetime License Key',
  currentTheme,
  customImageUrl
}) => {
  // Check if image is an Unsplash default link or a custom link
  const isCustomImage = customImageUrl && 
    !customImageUrl.includes('images.unsplash.com') && 
    customImageUrl.trim() !== '';

  // Return custom image inside a polished tech frame if it's custom
  if (isCustomImage) {
    return (
      <div className="w-full h-full relative overflow-hidden group/img">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10 opacity-60" />
        <img 
          src={customImageUrl} 
          alt={licenseName}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
        />
        {/* Holographic scanning light overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/img:animate-[shimmer_1.5s_infinite] pointer-events-none z-20" />
      </div>
    );
  }

  // Otherwise, render a spectacular, high-tech animated digital product key card
  const normalizedId = licenseId.toLowerCase();
  
  // Choose brand style based on ID
  let brand = {
    gradient: 'from-blue-600 via-indigo-950 to-cyan-500',
    glowColor: 'shadow-blue-500/25',
    accentText: 'text-cyan-400',
    accentBg: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
    icon: Laptop,
    serialMock: 'WIN11-PRO-RETAIL-K99X-GENUINE',
    specText: 'AUTHENTIC OEM DIGITAL RETAIL KEY',
    chipColor: 'from-cyan-500 to-blue-600'
  };

  if (normalizedId.includes('2019')) {
    brand = {
      gradient: 'from-amber-600 via-orange-950 to-red-600',
      glowColor: 'shadow-orange-500/25',
      accentText: 'text-orange-400',
      accentBg: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30',
      icon: FileSpreadsheet,
      serialMock: 'OFF19-RTL-STND-2019-SUITE',
      specText: 'STANDALONE LIFETIME SUITE ACTIVATION',
      chipColor: 'from-amber-400 to-orange-600'
    };
  } else if (normalizedId.includes('2021')) {
    brand = {
      gradient: 'from-indigo-600 via-purple-950 to-rose-500',
      glowColor: 'shadow-purple-500/25',
      accentText: 'text-purple-400',
      accentBg: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
      icon: Layers,
      serialMock: 'OFF21-PRO-PLUS-2021-GENUINE',
      specText: 'PROFESSIONAL PLUS SEAMLESS BIND',
      chipColor: 'from-purple-500 to-rose-500'
    };
  } else if (normalizedId.includes('2024')) {
    brand = {
      gradient: 'from-zinc-900 via-violet-950 to-amber-500',
      glowColor: 'shadow-amber-500/25',
      accentText: 'text-amber-400',
      accentBg: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      icon: Sparkles,
      serialMock: 'OFF24-ENTERPRISE-PRO-99X-LATEST',
      specText: 'PREMIUM ENTERPRISE 2024 EDITION',
      chipColor: 'from-yellow-400 to-amber-500'
    };
  }

  const IconComponent = brand.icon;

  if (currentTheme === 'mono') {
    return (
      <div className="w-full h-full bg-zinc-950 border border-zinc-800 relative flex flex-col justify-between p-3 overflow-hidden select-none font-mono text-[9px] text-zinc-400">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:8px_8px] pointer-events-none" />
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5 z-10">
          <div className="flex items-center gap-1 font-black text-zinc-200">
            <Cpu size={10} className="text-zinc-400" />
            <span>LIC-ID: {licenseId.toUpperCase()}</span>
          </div>
          <span className="text-[8px] px-1 bg-zinc-800 rounded text-zinc-100 uppercase tracking-widest font-bold">MONO_KEY</span>
        </div>

        {/* Center content */}
        <div className="my-2 py-1 flex flex-col justify-center items-center gap-1 z-10 text-center">
          <IconComponent size={24} className="text-zinc-100 mb-1" />
          <div className="font-extrabold text-zinc-100 tracking-tight leading-tight line-clamp-1">{licenseName}</div>
          <div className="text-[7.5px] tracking-widest font-bold text-zinc-500 uppercase mt-0.5">{brand.specText}</div>
        </div>

        {/* Footer info & serial block */}
        <div className="border-t border-zinc-800 pt-1.5 flex flex-col gap-1 z-10">
          <div className="flex justify-between text-[7px] text-zinc-500">
            <span>KEY_STATE: SECURE</span>
            <span>TYPE: {licenseType.toUpperCase()}</span>
          </div>
          <div className="bg-zinc-900 px-1.5 py-1 rounded text-center text-zinc-200 text-[8px] font-bold tracking-widest border border-zinc-800 line-clamp-1">
            {brand.serialMock}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full h-full relative overflow-hidden flex flex-col justify-between p-4 select-none bg-gradient-to-br ${brand.gradient} ${brand.glowColor} group-hover:shadow-[0_12px_35px_rgba(0,0,0,0.5)] transition-all duration-500 rounded-xl border ${brand.borderColor}`}>
      
      {/* 3D Tech Grid & Ambient Light Spotlights */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none" />
      <div className="absolute -top-12 -left-12 w-28 h-28 rounded-full bg-white/5 blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-700" />
      <div className="absolute -bottom-12 -right-12 w-28 h-28 rounded-full bg-cyan-500/10 blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-700" />

      {/* Futuristic Header with Status Badge */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-1 text-[8px] font-mono tracking-widest text-white/60">
          <Cpu size={10} className="text-white/80 animate-pulse" />
          <span>DIGITAL PRODUCT CARD</span>
        </div>
        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/10 backdrop-blur-md border border-white/10 text-[7px] font-black uppercase text-emerald-400 tracking-wider">
          <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping" />
          <span>Verified Genuine</span>
        </div>
      </div>

      {/* Floating Glass Smart Chip / Brand Element */}
      <div className="flex items-center justify-between my-2.5 z-10">
        {/* Holographic Chip */}
        <div className={`w-8 h-6.5 rounded bg-gradient-to-tr ${brand.chipColor} border border-white/20 relative shadow-[0_2px_8px_rgba(0,0,0,0.3)] overflow-hidden flex items-center justify-center`}>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.1)_1px,transparent_1px)] bg-[size:4px_3px]" />
          <Code size={11} className="text-white/80" />
        </div>
        
        {/* Brand Icon */}
        <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/90 shadow-inner group-hover:rotate-[360deg] transition-transform duration-700">
          <IconComponent size={14} className="stroke-[2]" />
        </div>
      </div>

      {/* Title & Mock Product Serial Preview */}
      <div className="z-10 text-left">
        <div className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-white/50">{brand.specText}</div>
        <h4 className="text-xs sm:text-sm font-black text-white tracking-tight mt-0.5 drop-shadow leading-tight line-clamp-1">
          {licenseName}
        </h4>
        
        {/* Mock Serial Code Overlay with Shimmer Effect */}
        <div className="mt-2.5 bg-black/40 backdrop-blur-sm border border-white/5 p-1.5 rounded-lg text-center font-mono text-[8px] text-emerald-300 font-extrabold tracking-widest relative overflow-hidden group-hover:border-emerald-500/20 transition-colors">
          <span className="relative z-10 block line-clamp-1">{brand.serialMock}</span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite] pointer-events-none" />
        </div>
      </div>

      {/* Card Retexture Styling for Shimmer Sweep */}
      <style>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
};
