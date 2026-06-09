import React from 'react';
import { Laptop, Cpu, HardDrive, Layers, Settings, Sparkles, Sliders } from 'lucide-react';

interface PixelFixBackgroundProps {
  currentTheme: 'normal' | 'mono' | 'light';
}

export const PixelFixBackground: React.FC<PixelFixBackgroundProps> = ({ currentTheme }) => {
  // Determine color palette based on current theme for technology background elements
  const themeStyles = {
    normal: {
      accentColor: 'text-indigo-500/10 dark:text-[#FF5500]/10',
      secondaryColor: 'text-blue-500/5',
      primaryShape: 'border-[#FF5500]/10 bg-[#FF5500]/2',
      dotColor: 'bg-[#FF5500]/15',
      gridColor: 'border-white/5',
      circuitColor: 'stroke-indigo-500/10 dark:stroke-[#FF5500]/15',
    },
    mono: {
      accentColor: 'text-zinc-400/5',
      secondaryColor: 'text-zinc-500/4',
      primaryShape: 'border-zinc-500/10 bg-zinc-500/1',
      dotColor: 'bg-zinc-500/10',
      gridColor: 'border-zinc-800/5 dark:border-white/5',
      circuitColor: 'stroke-zinc-500/5 dark:stroke-white/5',
    },
    light: {
      accentColor: 'text-indigo-600/6',
      secondaryColor: 'text-[#FF5500]/4',
      primaryShape: 'border-slate-300/30 bg-slate-100/50',
      dotColor: 'bg-slate-300/30',
      gridColor: 'border-slate-200/50',
      circuitColor: 'stroke-slate-300/30',
    },
  };

  const style = themeStyles[currentTheme] || themeStyles.normal;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Local keyframes for technology animations */}
      <style>{`
        @keyframes flow-pulse {
          0%, 100% {
            stroke-dashoffset: 40;
            opacity: 0.2;
          }
          50% {
            stroke-dashoffset: 0;
            opacity: 0.8;
          }
        }
        @keyframes float-tech-1 {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }
        @keyframes float-tech-2 {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(22px) rotate(-6deg);
          }
        }
        @keyframes microchip-glow {
          0%, 100% {
            filter: drop-shadow(0 0 2px rgba(239, 68, 68, 0.1));
            opacity: 0.35;
          }
          50% {
            filter: drop-shadow(0 0 8px rgba(255, 85, 0, 0.3));
            opacity: 0.75;
          }
        }
        @keyframes text-ticker {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-50%);
          }
        }
        
        .animate-flow-dash {
          stroke-dasharray: 8 12;
          animation: flow-pulse 6s linear infinite;
        }
        .animate-float-tech-1 {
          animation: float-tech-1 14s ease-in-out infinite;
        }
        .animate-float-tech-2 {
          animation: float-tech-2 16s ease-in-out infinite 1.5s;
        }
        .animate-microchip-glow {
          animation: microchip-glow 5s ease-in-out infinite;
        }
        .animate-ticker {
          animation: text-ticker 20s linear infinite;
        }
      `}</style>

      {/* Abstract Grid Backdrop */}
      <div className={`absolute inset-0 opacity-40 dark:opacity-20 grid grid-cols-6 h-full w-full border-l border-t ${style.gridColor}`}>
        <div className={`border-r border-b ${style.gridColor}`} />
        <div className={`border-r border-b ${style.gridColor}`} />
        <div className={`border-r border-b ${style.gridColor}`} />
        <div className={`border-r border-b ${style.gridColor}`} />
        <div className={`border-r border-b ${style.gridColor}`} />
        <div className={`border-r border-b ${style.gridColor}`} />
      </div>

      {/* Dynamic Digital Circuits & Vector Lines Paths */}
      <svg className="absolute inset-0 w-full h-full opacity-60 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        {/* Left top circuit branch */}
        <path 
          d="M 50 150 L 180 150 L 240 210 L 240 350 L 190 400" 
          fill="none" 
          className={`${style.circuitColor} animate-flow-dash`}
          strokeWidth="1.5" 
        />
        <circle cx="50" cy="150" r="3" className={`fill-indigo-500/30 dark:fill-[#FF5500]/30`} />
        <circle cx="190" cy="400" r="2.5" className={`fill-indigo-500/30 dark:fill-[#FF5500]/30`} />

        {/* Right middle circuit branch */}
        <path 
          d="M 950 200 L 850 200 L 780 270 L 780 420 L 840 480" 
          fill="none" 
          className={`${style.circuitColor} animate-flow-dash`}
          strokeWidth="1.5" 
        />
        <circle cx="950" cy="200" r="3" className={`fill-indigo-500/30 dark:fill-[#FF5500]/30`} />
        <circle cx="840" cy="480" r="2.5" className={`fill-indigo-500/30 dark:fill-[#FF5500]/30`} />

        {/* Left bottom circuit branch */}
        <path 
          d="M 120 750 L 220 750 L 280 690 L 400 690" 
          fill="none" 
          className={`${style.circuitColor} animate-flow-dash`}
          strokeWidth="1.5" 
        />
        <circle cx="120" cy="750" r="3" className={`fill-[#FF5500]/30`} />
        <circle cx="400" cy="690" r="2.5" className={`fill-[#FF5500]/30`} />

        {/* NEW: Additional micro-bus terminal tracks */}
        <path 
          d="M 450 100 L 520 100 L 550 130 L 550 180" 
          fill="none" 
          className={`${style.circuitColor}`}
          strokeWidth="1"
          strokeDasharray="4 4"
        />
        <circle cx="450" cy="100" r="2" className="fill-slate-400/40" />
        <circle cx="550" cy="180" r="2" className="fill-[#FF5500]/40" />

        <path 
          d="M 300 280 L 350 280 L 370 300 Q 390 320 420 320" 
          fill="none" 
          className={`${style.circuitColor}`}
          strokeWidth="1"
        />
        <circle cx="300" cy="280" r="2" className="fill-[#FF5500]/30" />
        <circle cx="420" cy="320" r="2" className="fill-slate-400/40" />

        {/* NEW: Micro diagonal wire mesh detail bottom-right */}
        <path 
          d="M 880 720 L 800 800 M 890 730 L 810 810 M 900 740 L 820 820" 
          fill="none" 
          className={`${style.circuitColor}`}
          strokeWidth="0.75"
        />

        {/* NEW: Status node lines tracks */}
        <path 
          d="M 720 120 L 720 170 L 680 210" 
          fill="none" 
          className={`${style.circuitColor}`}
          strokeWidth="1.2"
        />
        <circle cx="720" cy="120" r="2" className="fill-amber-500/40" />
        <circle cx="680" cy="210" r="2" className="fill-emerald-500/40" />
      </svg>

      {/* Interactive Floating IT Computer Elements */}

      {/* 1. Laptop / Workstation floating in top-left */}
      <div className="absolute top-[10%] left-[5%] md:left-[8%] animate-float-tech-1 opacity-70">
        <div className={`p-5 rounded-2xl border ${style.primaryShape} backdrop-blur-[1px] flex flex-col items-center gap-2`}>
          <Laptop className={`w-10 h-10 md:w-14 md:h-14 ${style.accentColor}`} strokeWidth={1} />
          <div className="text-center">
            <span className="text-[9px] uppercase tracking-wider block font-bold opacity-30">HOST SYSTEM</span>
            <span className="text-[7.5px] font-mono tracking-widest block opacity-25">ONLINE // DOORSTEP</span>
          </div>
        </div>
      </div>

      {/* 2. Microchip / CPU Core pulsating in top-right */}
      <div className="absolute top-[15%] right-[6%] md:right-[10%] animate-float-tech-2 opacity-80">
        <div className={`p-4 rounded-3xl border ${style.primaryShape} backdrop-blur-[2px] animate-microchip-glow flex flex-col items-center gap-1.5`}>
          <Cpu className={`w-12 h-12 md:w-16 md:h-16 ${style.accentColor}`} strokeWidth={0.8} />
          <div className="text-center">
            <span className="text-[10px] font-black uppercase tracking-wider block opacity-40">INTEL/AMD X64</span>
            <span className="text-[7.5px] font-mono tracking-widest block opacity-30 text-[#FF5500]">DIAGNOSTIC ENG</span>
          </div>
        </div>
      </div>

      {/* 3. Terminal Terminal Text Drifter (Background Log Simulation) */}
      <div className="absolute top-[40%] left-[3%] md:left-[5%] w-32 h-44 overflow-hidden border border-black/5 dark:border-white/5 rounded-xl bg-black/5 dark:bg-black/20 p-2.5 opacity-25">
        <div className="relative h-full overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-4 bg-gradient-to-b from-slate-900/10 to-transparent z-10" />
          <div className="animate-ticker font-mono text-[6.5px] text-[#FF5500] leading-normal uppercase space-y-1 py-1">
            <p>&gt; sys_init init_process</p>
            <p>&gt; load windows_11_os</p>
            <p>&gt; check network_config</p>
            <p>&gt; latency 14ms</p>
            <p>&gt; speedup optimization</p>
            <p>&gt; repair office_2024</p>
            <p>&gt; status normal_ok</p>
            <p>&gt; hardware_audit complete</p>
            <p>&gt; active connection_true</p>
            <p>&gt; sys_init init_process</p>
            <p>&gt; load windows_11_os</p>
            <p>&gt; check network_config</p>
            <p>&gt; latency 14ms</p>
          </div>
          <div className="absolute bottom-0 inset-x-0 h-4 bg-gradient-to-t from-slate-900/10 to-transparent z-10" />
        </div>
      </div>

      {/* 4. Hard Drive & Memory Stack floating middle right */}
      <div className="absolute top-[45%] right-[5%] md:right-[8%] animate-float-tech-1 opacity-60">
        <div className={`p-4 rounded-xl border ${style.primaryShape} flex items-center gap-3`}>
          <HardDrive className={`w-8 h-8 md:w-10 md:h-10 ${style.accentColor}`} strokeWidth={1} />
          <div className="border-l border-slate-300 dark:border-zinc-700/45 pl-2.5">
            <span className="text-[8.5px] uppercase tracking-wider block font-bold opacity-30">NVME BACKUP</span>
            <span className="text-[7px] font-mono block opacity-20">HEALTH: 100% EXCELLENT</span>
          </div>
        </div>
      </div>

      {/* 5. Layers Stack / Software Module on bottom-left */}
      <div className="absolute bottom-[20%] left-[8%] md:left-[11%] animate-float-tech-2 opacity-65">
        <div className={`p-4.5 rounded-2xl border ${style.primaryShape} flex flex-col items-center gap-2`}>
          <Layers className={`w-8 h-8 md:w-10 md:h-10 ${style.accentColor}`} strokeWidth={1.2} />
          <div className="text-center">
            <span className="text-[9px] uppercase tracking-wider block font-bold opacity-30">OS INTERFACE</span>
            <span className="text-[7px] font-mono block opacity-25">GENUINE CONFIG // CERT</span>
          </div>
        </div>
      </div>

      {/* 6. Settings Gears rotating slowly on bottom-right */}
      <div className="absolute bottom-[15%] right-[10%] md:right-[14%] animate-float-tech-1 opacity-50">
        <div className="relative">
          <Settings className={`w-12 h-12 md:w-16 md:h-16 ${style.accentColor} animate-[spin_40s_linear_infinite]`} strokeWidth={0.8} />
          <Settings className="w-6 h-6 text-orange-500/15 absolute -bottom-1 -right-1 animate-[spin_20s_linear_infinite_reverse]" strokeWidth={1} />
        </div>
      </div>

      {/* 7. Modern geometric shape nodes, crosses, triangles & spark indicators */}
      <div className="absolute top-[25%] left-[45%] w-10 h-10 border border-dashed border-sky-500/10 rounded-full animate-[spin_25s_linear_infinite] opacity-30" />
      <div className="absolute bottom-[35%] left-[30%] text-sm font-mono text-indigo-500/25 opacity-40 select-none">&lt;/&gt;</div>
      <div className="absolute top-[48%] right-[42%] text-sm font-mono text-[#FF5500]/20 opacity-30 select-none">DATA_PULSE</div>
      
      {/* Concentric diagnostic target squares */}
      <div className="absolute top-[18%] left-[22%] w-8 h-8 border border-slate-400/10 dark:border-white/5 rounded flex items-center justify-center animate-float-tech-1 opacity-40">
        <div className="w-4 h-4 border border-dashed border-sky-550/20 rounded-xs" />
      </div>

      <div className="absolute bottom-[24%] right-[20%] w-10 h-10 border border-dashed border-[#FF5500]/15 dark:border-[#FF5500]/10 rounded flex items-center justify-center animate-float-tech-2 opacity-35">
        <div className="w-5 h-5 border border-[#FF5500]/20 rounded-xs" />
      </div>

      {/* Scattered small binary values */}
      <span className="absolute top-[30%] left-[40%] text-[7.5px] font-mono tracking-widest text-[#FF5500]/20 opacity-35 select-none font-black">0101_SYS</span>
      <span className="absolute bottom-[42%] right-[12%] text-[7.5px] font-mono tracking-widest text-indigo-500/20 opacity-35 select-none font-black">1011_ACK</span>
      <span className="absolute top-[65%] left-[16%] text-[8px] font-mono text-slate-400/20 opacity-35 select-none font-bold">BUS:9600</span>

      {/* Sensor Angle bracket frames [ ] */}
      <div className="absolute top-[12%] left-[48%] flex items-center gap-1 opacity-20 font-mono text-[9px] font-extrabold text-[#FF5500]">
        <span>[</span><span className="text-[6.5px] opacity-60">ENG_ACTIVE</span><span>]</span>
      </div>

      {/* Miniature dotted diagnostic contact pads */}
      <div className="absolute bottom-[16%] left-[25%] p-1 rounded border border-dashed border-slate-300/30 dark:border-zinc-700/30 flex gap-0.5 opacity-30">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
        <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500]" />
      </div>

      {/* Small tech indicator crosses */}
      <div className="absolute top-[8%] left-[25%] text-xs font-mono font-bold opacity-15 text-[#FF5500] select-none">+</div>
      <div className="absolute top-[75%] right-[32%] text-xs font-mono font-bold opacity-20 text-[#FF5500] select-none">×</div>
      <div className="absolute bottom-[28%] left-[45%] text-xs font-mono font-bold opacity-15 text-slate-400 select-none">+</div>
      
      {/* High detail fine tech crosses */}
      <div className="absolute top-[52%] left-[12%] text-[9px] font-mono opacity-15 text-slate-400 select-none">+</div>
      <div className="absolute bottom-[10%] right-[38%] text-[9px] font-mono opacity-15 text-slate-400 select-none">+</div>
      <div className="absolute top-[28%] right-[16%] text-xs font-mono opacity-20 text-[#FF5500] select-none">×</div>

      {/* Light indicator beacons */}
      <div className="absolute top-[32%] left-[18%] w-1 h-1 rounded-full bg-emerald-500/20 animate-ping" />
      <div className="absolute bottom-[48%] right-[24%] w-1.5 h-1.5 rounded-full bg-indigo-500/20 animate-pulse" />
      <div className="absolute bottom-[12%] left-[38%] w-1 h-1 rounded-full bg-[#FF5500]/20 animate-ping" />
    </div>
  );
};
