import React from 'react';
import { Camera, Aperture, Film, Image, Sparkles, Focus, Maximize2, Crop, Sliders, Layers } from 'lucide-react';

interface PixelFrameBackgroundProps {
  currentTheme: 'normal' | 'mono' | 'light';
}

export const PixelFrameBackground: React.FC<PixelFrameBackgroundProps> = ({ currentTheme }) => {
  // Determine color palette based on current theme for photography-related background elements
  const themeStyles = {
    normal: {
      accentColor: 'text-[#FF5500]/10',
      secondaryColor: 'text-amber-500/5',
      primaryShape: 'border-[#FF5500]/10 bg-[#FF5500]/2',
      dotColor: 'bg-[#FF5500]/15',
      textColor: 'text-[#FF5500]/30',
      lineColor: 'stroke-white/5',
      gridColor: 'border-white/5',
    },
    mono: {
      accentColor: 'text-zinc-400/5',
      secondaryColor: 'text-zinc-500/4',
      primaryShape: 'border-zinc-500/10 bg-zinc-500/1',
      dotColor: 'bg-zinc-500/10',
      textColor: 'text-zinc-400/30',
      lineColor: 'stroke-zinc-800/10 dark:stroke-white/5',
      gridColor: 'border-zinc-800/5 dark:border-white/5',
    },
    light: {
      accentColor: 'text-[#FF5500]/6',
      secondaryColor: 'text-amber-500/4',
      primaryShape: 'border-slate-300/30 bg-slate-100/50',
      dotColor: 'bg-slate-300/30',
      textColor: 'text-[#FF5500]/20',
      lineColor: 'stroke-slate-200/40',
      gridColor: 'border-slate-200/50',
    },
  };

  const style = themeStyles[currentTheme] || themeStyles.normal;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Injecting premium local keyframe animations to prevent external config dependencies */}
      <style>{`
        @keyframes float-gentle {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-25px) rotate(6deg);
          }
        }
        @keyframes float-opposing {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(30px) rotate(-8deg);
          }
        }
        @keyframes rotate-aperture {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes float-drifter {
          0%, 100% {
            transform: translate(0px, 0px) scale(1);
          }
          50% {
            transform: translate(30px, -20px) scale(1.08);
          }
        }
        @keyframes subtle-shimmer {
          0%, 100% {
            opacity: 0.15;
          }
          50% {
            opacity: 0.45;
          }
        }
        
        .animate-float-1 {
          animation: float-gentle 12s ease-in-out infinite;
        }
        .animate-float-2 {
          animation: float-opposing 15s ease-in-out infinite;
        }
        .animate-float-3 {
          animation: float-gentle 18s ease-in-out infinite 2s;
        }
        .animate-float-4 {
          animation: float-drifter 22s ease-in-out infinite;
        }
        .animate-rotate-slow {
          animation: rotate-aperture 35s linear infinite;
        }
        .animate-shimmer-slow {
          animation: subtle-shimmer 8s ease-in-out infinite;
        }
      `}</style>

      {/* Abstract Background Grid Layer */}
      <div className={`absolute inset-0 opacity-40 dark:opacity-20 grid grid-cols-6 h-full w-full border-l border-t ${style.gridColor}`}>
        <div className={`border-r border-b ${style.gridColor}`} />
        <div className={`border-r border-b ${style.gridColor}`} />
        <div className={`border-r border-b ${style.gridColor}`} />
        <div className={`border-r border-b ${style.gridColor}`} />
        <div className={`border-r border-b ${style.gridColor}`} />
        <div className={`border-r border-b ${style.gridColor}`} />
      </div>

      {/* Decorative photography-related animations */}

      {/* 1. Large Aperture Floating in Top Right Corner */}
      <div className="absolute top-[8%] right-[5%] md:right-[10%] animate-float-1 opacity-70">
        <div className="flex flex-col items-center">
          <Aperture className={`w-20 h-20 md:w-36 md:h-36 ${style.accentColor} animate-rotate-slow`} strokeWidth={0.8} />
          <span className="text-[9px] uppercase font-mono tracking-[0.25em] opacity-25 mt-2 hidden md:inline-block">f/1.4 Focus Zone</span>
        </div>
      </div>

      {/* 2. Camera Icon floating middle left */}
      <div className="absolute top-[35%] left-[4%] md:left-[8%] animate-float-2 opacity-60">
        <div className={`p-6 rounded-3xl border ${style.primaryShape} backdrop-blur-[2px] shadow-sm flex flex-col items-center gap-1.5`}>
          <Camera className={`w-10 h-10 md:w-16 md:h-16 ${style.accentColor}`} strokeWidth={1} />
          <div className="text-center">
            <span className="text-[10px] font-black uppercase tracking-wider block opacity-30">Candid Frame</span>
            <span className="text-[7.5px] font-mono tracking-widest block opacity-20">50MM PORTRAIT</span>
          </div>
        </div>
      </div>

      {/* 3. Film strip floating bottom right */}
      <div className="absolute bottom-[20%] right-[8%] md:right-[12%] animate-float-3 opacity-50">
        <div className={`p-5 rounded-2xl border ${style.primaryShape} flex items-center gap-3`}>
          <Film className={`w-8 h-8 md:w-12 md:h-12 ${style.accentColor}`} strokeWidth={1} />
          <div className="border-l border-slate-350 dark:border-zinc-700/40 pl-3">
            <span className="text-[9px] uppercase tracking-wider block font-bold opacity-30">RAW CINEMATIC</span>
            <span className="text-[8px] font-mono block opacity-20">4K 60FPS RECORD</span>
          </div>
        </div>
      </div>

      {/* 4. Photo Frame / Image placeholder element floating bottom left */}
      <div className="absolute bottom-[35%] left-[6%] md:left-[12%] animate-float-4 opacity-55">
        <div className="relative">
          {/* Simulated Polaroid / Frame */}
          <div className={`w-28 h-36 md:w-36 md:h-44 p-2.5 rounded-xl border ${style.primaryShape} backdrop-blur-[1px] flex flex-col justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)]`}>
            {/* Aspect Ratio Box inside frame */}
            <div className="relative flex-1 rounded-lg border border-dashed border-slate-300 dark:border-zinc-700/40 flex items-center justify-center bg-black/5 dark:bg-white/1">
              <Image className={`w-6 h-6 md:w-8 md:h-8 ${style.accentColor}`} strokeWidth={1} />
              <Focus className="absolute top-1 left-1 w-3.5 h-3.5 text-orange-500/20" />
              <Focus className="absolute bottom-1 right-1 w-3.5 h-3.5 text-orange-500/20 rotate-180" />
            </div>
            {/* Captions space */}
            <div className="pt-2 text-center">
              <div className="h-1 w-10 bg-slate-350 dark:bg-zinc-700/40 mx-auto rounded-full" />
              <span className="text-[8px] font-mono text-center tracking-normal opacity-35 mt-1 block">GOLDEN HOUR.RAW</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Delicate Sparkles around modern geometric circles */}
      <div className="absolute top-[22%] left-[20%] animate-float-3 opacity-40">
        <Sparkles className={`w-6 h-6 mr-10 ${style.accentColor}`} strokeWidth={1.5} />
      </div>
      <div className="absolute bottom-[10%] left-[25%] animate-float-1 opacity-45">
        <Sparkles className={`w-8 h-8 ${style.accentColor}`} strokeWidth={1.2} />
      </div>

      {/* 6. Dynamic Focus crop markers and target lines */}
      <div className="absolute top-[5%] left-[5%] w-16 h-16 pointer-events-none opacity-20 border-l-2 border-t-2 border-slate-400 dark:border-zinc-500/40 rounded-tl-lg" />
      <div className="absolute top-[5%] right-[5%] w-16 h-16 pointer-events-none opacity-20 border-r-2 border-t-2 border-slate-400 dark:border-zinc-500/40 rounded-tr-lg" />
      <div className="absolute bottom-[5%] left-[5%] w-16 h-16 pointer-events-none opacity-20 border-l-2 border-b-2 border-slate-400 dark:border-zinc-500/40 rounded-bl-lg" />
      <div className="absolute bottom-[5%] right-[5%] w-16 h-16 pointer-events-none opacity-20 border-r-2 border-b-2 border-slate-400 dark:border-zinc-500/40 rounded-br-lg" />

      {/* 6.1 Viewfinder Outer Corner Boundary Bracket Details */}
      <div className="absolute top-[15%] left-[10%] w-6 h-6 opacity-15 border-l border-t border-slate-400 dark:border-zinc-500/50" />
      <div className="absolute top-[15%] right-[10%] w-6 h-6 opacity-15 border-r border-t border-slate-400 dark:border-zinc-500/50" />
      <div className="absolute bottom-[15%] left-[10%] w-6 h-6 opacity-15 border-l border-b border-slate-400 dark:border-zinc-500/50" />
      <div className="absolute bottom-[15%] right-[10%] w-6 h-6 opacity-15 border-r border-b border-slate-400 dark:border-zinc-500/50" />

      {/* 6.2 EV Exposure Step Scale Index Indicator (Floating on the right) */}
      <div className="absolute top-[40%] right-[3%] md:right-[5%] flex flex-col items-center gap-1.5 animate-float-2 opacity-35">
        <Sliders className={`w-4 h-4 ${style.accentColor}`} strokeWidth={1.2} />
        <div className="flex flex-col items-center font-mono text-[7px] leading-none opacity-60 font-black tracking-normal space-y-1">
          <span className={style.textColor}>+2.0</span>
          <span className="opacity-35">|</span>
          <span className="opacity-35">|</span>
          <span className={style.textColor}>0.0 ◄</span>
          <span className="opacity-35">|</span>
          <span className="opacity-35">|</span>
          <span className="opacity-40">-2.0</span>
        </div>
        <span className="text-[6px] font-mono tracking-widest opacity-35 uppercase rotate-90 mt-4 origin-center">EV SCALE</span>
      </div>

      {/* 6.3 Aspect Crop Ratio Metadata Badge & Grid State Overlay (Top Center) */}
      <div className="absolute top-[4%] left-1/2 -translate-x-1/2 flex items-center gap-4 py-1.5 px-3 bg-black/5 dark:bg-white/1 border border-black/5 dark:border-white/5 rounded-full backdrop-blur-sm animate-float-4 opacity-40">
        <div className="flex items-center gap-1.5">
          <Crop className="w-3.5 h-3.5 text-[#FF5500]" strokeWidth={1.5} />
          <span className="text-[8.5px] font-mono tracking-widest uppercase text-slate-500 dark:text-zinc-400 font-extrabold">CROP 3:2</span>
        </div>
        <div className="w-1 h-1 rounded-full bg-slate-350 dark:bg-zinc-650" />
        <span className="text-[8.5px] font-mono tracking-widest text-[#FF5500] font-black uppercase">GRID: ACTIVE</span>
      </div>

      {/* 6.4 Dynamic Zoom Multiplier Capsule Selector (Bottom Center) */}
      <div className="absolute bottom-[4%] left-1/2 -translate-x-1/2 flex items-center gap-1 p-0.5 bg-black/5 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-full shadow-inner opacity-45 hover:opacity-100 transition-opacity">
        {['0.5x', '1x', '2x', '3x', '5x'].map((zoom) => (
          <span 
            key={zoom}
            className={`px-2 py-0.5 text-[8.5px] font-mono font-black rounded-full cursor-default ${
              zoom === '1x' 
                ? 'bg-[#FF5500] text-white' 
                : 'text-slate-500 dark:text-zinc-550'
            }`}
          >
            {zoom}
          </span>
        ))}
      </div>

      {/* 7. Center Focus Crosshair floating backdrop */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.08] dark:opacity-[0.05] animate-shimmer-slow">
        <div className="relative w-48 h-48 md:w-80 md:h-80 rounded-full border-2 border-dashed border-slate-450 dark:border-white/50 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border border-solid border-slate-450 dark:border-white/50 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-orange-500" />
          </div>
          <div className="absolute left-[-20px] top-1/2 w-8 h-0.5 bg-slate-400 dark:bg-white" />
          <div className="absolute right-[-20px] top-1/2 w-8 h-0.5 bg-slate-400 dark:bg-white" />
          <div className="absolute top-[-20px] left-1/2 -translate-x-1/2 w-0.5 h-8 bg-slate-400 dark:bg-white" />
          <div className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 w-0.5 h-8 bg-slate-400 dark:bg-white" />
        </div>
      </div>

      {/* 8. Modernist geometric shapes floating in open gaps */}
      {/* Circle top left */}
      <div className="absolute top-[18%] left-[45%] w-16 h-16 rounded-full border border-dashed border-slate-300 dark:border-white/5 animate-rotate-slow opacity-40" />
      {/* Square middle right */}
      <div className="absolute top-[55%] right-[22%] w-12 h-12 border border-slate-350 dark:border-white/5 animate-float-4 opacity-30 rounded-lg rotate-12" />
      {/* Triangles/Crosses */}
      <div className="absolute top-[45%] left-[30%] animate-float-2 opacity-20 text-[20px] font-mono leading-none text-[#FF5500]">+</div>
      <div className="absolute bottom-[28%] right-[35%] animate-float-1 opacity-25 text-[24px] font-mono leading-none text-[#FF5500]">×</div>
      
      {/* Additional high-detail floating tech crosses */}
      <div className="absolute top-[10%] left-[32%] text-xs font-mono font-bold opacity-20 text-[#FF5500] select-none">+</div>
      <div className="absolute top-[75%] left-[18%] text-xs font-mono font-bold opacity-15 text-slate-500 select-none">×</div>
      <div className="absolute top-[30%] right-[30%] text-xs font-mono font-bold opacity-15 text-[#FF5500] select-none">+</div>
      <div className="absolute bottom-[40%] right-[15%] text-xs font-mono font-bold opacity-25 text-slate-400 select-none">×</div>

      {/* 8.1 Fine Line Grid Intersectors (Rule of Thirds Guidelines) */}
      <div className="absolute inset-x-0 top-1/3 h-px border-t border-dashed border-slate-400/10 dark:border-white/5" />
      <div className="absolute inset-x-0 top-2/3 h-px border-t border-dashed border-slate-400/10 dark:border-white/5" />
      <div className="absolute inset-y-0 left-1/3 w-px border-l border-dashed border-slate-400/10 dark:border-white/5" />
      <div className="absolute inset-y-0 left-2/3 w-px border-l border-dashed border-slate-400/10 dark:border-white/5" />

      {/* Delicate floating background dots */}
      <div className="absolute top-[12%] left-[15%] w-1.5 h-1.5 rounded-full bg-amber-500/10 dark:bg-[#FF5500]/10 animate-ping" />
      <div className="absolute top-[68%] left-[42%] w-2 h-2 rounded-full bg-violet-550/10 dark:bg-violet-500/10 animate-pulse" />
      <div className="absolute bottom-[15%] right-[45%] w-1.5 h-1.5 rounded-full bg-green-550/10 dark:bg-[#FF5500]/10 animate-bounce" />
      <div className="absolute top-[52%] left-[24%] w-1 h-1 rounded-full bg-[#FF5500]/25 animate-ping" />
    </div>
  );
};
