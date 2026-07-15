import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Keyboard, ShieldAlert, Cpu, HardDrive, Key, HelpCircle, Activity } from 'lucide-react';

interface BiosKeysBackgroundProps {
  currentTheme: 'light' | 'dark' | string;
}

interface KeycapData {
  id: string;
  label: string;
  subLabel?: string;
  isBiosKey: boolean;
  x: number; // percentage width
  y: number; // percentage height
  scale: number;
  rotation: number;
  delay: number;
  glowColor: string;
}

export const BiosKeysBackground: React.FC<BiosKeysBackgroundProps> = ({ currentTheme }) => {
  const isLight = currentTheme === 'light';

  // Seed data for the keycaps to be arranged dynamically across the background space
  const keycaps: KeycapData[] = useMemo(() => [
    // BIOS Keys
    { id: 'f1', label: 'F1', subLabel: 'HELP', isBiosKey: true, x: 8, y: 12, scale: 0.95, rotation: -6, delay: 0, glowColor: 'rgba(255, 85, 0, 0.4)' },
    { id: 'f2', label: 'F2', subLabel: 'SETUP', isBiosKey: true, x: 26, y: 8, scale: 1.05, rotation: 4, delay: 0.8, glowColor: 'rgba(255, 85, 0, 0.5)' },
    { id: 'f8', label: 'F8', subLabel: 'SAFE MODE', isBiosKey: true, x: 82, y: 15, scale: 1.0, rotation: -8, delay: 1.5, glowColor: 'rgba(59, 130, 246, 0.4)' },
    { id: 'f9', label: 'F9', subLabel: 'DIAGNOSTIC', isBiosKey: true, x: 92, y: 45, scale: 0.9, rotation: 12, delay: 2.2, glowColor: 'rgba(255, 85, 0, 0.4)' },
    { id: 'f10', label: 'F10', subLabel: 'SAVE & EXIT', isBiosKey: true, x: 12, y: 78, scale: 1.1, rotation: -5, delay: 0.4, glowColor: 'rgba(16, 185, 129, 0.5)' },
    { id: 'f11', label: 'F11', subLabel: 'RECOVERY', isBiosKey: true, x: 74, y: 88, scale: 0.95, rotation: 8, delay: 1.2, glowColor: 'rgba(255, 85, 0, 0.4)' },
    { id: 'f12', label: 'F12', subLabel: 'BOOT MENU', isBiosKey: true, x: 86, y: 65, scale: 1.15, rotation: -10, delay: 0.7, glowColor: 'rgba(255, 85, 0, 0.6)' },
    { id: 'del', label: 'DEL', subLabel: 'ENTER SETUP', isBiosKey: true, x: 4, y: 42, scale: 1.1, rotation: 15, delay: 1.9, glowColor: 'rgba(239, 68, 68, 0.5)' },
    { id: 'esc', label: 'ESC', subLabel: 'ABORT', isBiosKey: true, x: 42, y: 5, scale: 1.0, rotation: -12, delay: 2.5, glowColor: 'rgba(239, 68, 68, 0.4)' },
    { id: 'enter', label: 'ENTER', subLabel: 'CONFIRM', isBiosKey: true, x: 88, y: 28, scale: 1.05, rotation: 5, delay: 3.1, glowColor: 'rgba(16, 185, 129, 0.4)' },

    // Commonly used keyboard shortcuts
    { id: 'ctrlc', label: 'Ctrl + C', subLabel: 'COPY', isBiosKey: false, x: 18, y: 28, scale: 0.9, rotation: 5, delay: 0.3, glowColor: 'rgba(99, 102, 241, 0.3)' },
    { id: 'ctrlv', label: 'Ctrl + V', subLabel: 'PASTE', isBiosKey: false, x: 32, y: 35, scale: 0.95, rotation: -4, delay: 1.1, glowColor: 'rgba(99, 102, 241, 0.3)' },
    { id: 'ctrlx', label: 'Ctrl + X', subLabel: 'CUT', isBiosKey: false, x: 50, y: 20, scale: 0.9, rotation: 8, delay: 1.8, glowColor: 'rgba(236, 72, 153, 0.3)' },
    { id: 'ctrlz', label: 'Ctrl + Z', subLabel: 'UNDO', isBiosKey: false, x: 62, y: 12, scale: 1.0, rotation: -6, delay: 2.6, glowColor: 'rgba(20, 184, 166, 0.3)' },
    { id: 'ctrla', label: 'Ctrl + A', subLabel: 'SELECT ALL', isBiosKey: false, x: 14, y: 58, scale: 0.95, rotation: 7, delay: 0.9, glowColor: 'rgba(139, 92, 246, 0.3)' },
    { id: 'ctrls', label: 'Ctrl + S', subLabel: 'SAVE', isBiosKey: false, x: 38, y: 82, scale: 1.0, rotation: -5, delay: 1.7, glowColor: 'rgba(16, 185, 129, 0.3)' },
    { id: 'ctrlp', label: 'Ctrl + P', subLabel: 'PRINT', isBiosKey: false, x: 72, y: 48, scale: 0.9, rotation: 10, delay: 2.4, glowColor: 'rgba(245, 158, 11, 0.3)' },
    { id: 'ctrlf', label: 'Ctrl + F', subLabel: 'FIND', isBiosKey: false, x: 54, y: 56, scale: 0.95, rotation: -8, delay: 0.5, glowColor: 'rgba(59, 130, 246, 0.3)' },
    { id: 'ctrln', label: 'Ctrl + N', subLabel: 'NEW FILE', isBiosKey: false, x: 44, y: 92, scale: 0.9, rotation: 12, delay: 1.3, glowColor: 'rgba(14, 165, 233, 0.3)' },
    { id: 'ctrlt', label: 'Ctrl + T', subLabel: 'NEW TAB', isBiosKey: false, x: 58, y: 78, scale: 1.0, rotation: -4, delay: 2.1, glowColor: 'rgba(168, 85, 247, 0.3)' },
    { id: 'alttab', label: 'Alt + Tab', subLabel: 'SWITCH APP', isBiosKey: false, x: 28, y: 64, scale: 1.02, rotation: 6, delay: 2.9, glowColor: 'rgba(234, 179, 8, 0.3)' },
    { id: 'wind', label: 'Win + D', subLabel: 'DESKTOP', isBiosKey: false, x: 2, y: 94, scale: 0.9, rotation: -15, delay: 3.4, glowColor: 'rgba(244, 63, 94, 0.3)' },
    { id: 'winl', label: 'Win + L', subLabel: 'LOCK OS', isBiosKey: false, x: 94, y: 82, scale: 0.95, rotation: 14, delay: 0.2, glowColor: 'rgba(225, 29, 72, 0.3)' }
  ], []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Dynamic Glow Accents in the corners */}
      <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-gradient-radial from-[#FF5500]/4 to-transparent blur-3xl rounded-full" />
      <div className="absolute bottom-1/4 right-1/10 w-[450px] h-[450px] bg-gradient-radial from-indigo-500/4 to-transparent blur-3xl rounded-full" />
      
      {/* Digital Grid Layout overlay */}
      <div 
        className={`absolute inset-0 opacity-[0.25] dark:opacity-[0.12]`}
        style={{
          backgroundImage: isLight 
            ? 'linear-gradient(rgba(148, 163, 184, 0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.12) 1px, transparent 1px)' 
            : 'linear-gradient(rgba(249, 115, 22, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(249, 115, 22, 0.04) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      {/* Cybernetic circuit line vectors connecting key clusters */}
      <svg className="absolute inset-0 w-full h-full opacity-30 dark:opacity-20 stroke-current text-slate-350 dark:text-[#FF5500]/15 fill-none" strokeWidth="0.75">
        {/* Horizontal & vertical bus lines */}
        <path d="M 10 100 L 900 100 M 150 40 L 150 700 M 700 80 L 700 850 M 50 500 L 950 500" strokeDasharray="4 8" />
        <circle cx="150" cy="100" r="2.5" className="fill-[#FF5500]" />
        <circle cx="700" cy="500" r="2.5" className="fill-indigo-500" />
        <circle cx="850" cy="650" r="3" className="fill-[#FF5500] animate-pulse" />
      </svg>

      {/* Floating Mechanical Keycaps */}
      {keycaps.map((k) => (
        <motion.div
          key={k.id}
          className="absolute hidden sm:block select-none"
          style={{
            left: `${k.x}%`,
            top: `${k.y}%`,
          }}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{
            opacity: k.isBiosKey ? [0.12, 0.28, 0.12] : [0.06, 0.16, 0.06],
            y: [0, -12, 0],
            rotate: [k.rotation, k.rotation + 3, k.rotation],
            scale: k.scale
          }}
          transition={{
            duration: k.isBiosKey ? 8 + k.delay : 12 + k.delay,
            repeat: Infinity,
            ease: "easeInOut",
            delay: k.delay
          }}
        >
          {/* Futuristic Translucent 3D Keycap Design */}
          <div 
            className={`flex flex-col items-center justify-between p-2 rounded-xl border text-center transition-all duration-300 backdrop-blur-xs ${
              k.isBiosKey
                ? isLight
                  ? 'bg-orange-50/15 border-orange-500/15 shadow-[0_2px_12px_-3px_rgba(255,85,0,0.15)] text-orange-600'
                  : 'bg-zinc-950/20 border-[#FF5500]/10 shadow-[0_2px_15px_-4px_rgba(255,85,0,0.25)] text-[#FF5500]'
                : isLight
                  ? 'bg-indigo-50/10 border-indigo-500/10 text-indigo-600'
                  : 'bg-zinc-950/15 border-zinc-800/20 text-zinc-400'
            }`}
            style={{
              width: k.label.length > 5 ? '85px' : '65px',
              height: '56px',
              boxShadow: `inset 0 1px 1px rgba(255,255,255,${isLight ? 0.05 : 0.02}), 0 4px 10px -2px ${k.glowColor}`
            }}
          >
            {/* Inner cap ring representing key profile switch */}
            <div className={`absolute inset-0.5 rounded-lg border-dashed border ${k.isBiosKey ? 'border-[#FF5500]/10' : 'border-current/5'} pointer-events-none`} />

            {/* Glowing top line */}
            <div className={`w-1/2 h-[1px] ${k.isBiosKey ? 'bg-gradient-to-r from-transparent via-[#FF5500]/40 to-transparent' : 'bg-gradient-to-r from-transparent via-current/20 to-transparent'}`} />

            {/* Label Key Name */}
            <span className="text-xs font-black tracking-tighter uppercase font-mono z-10 leading-none">
              {k.label}
            </span>

            {/* Key Action/Diagnostic Label */}
            {k.subLabel && (
              <span className={`text-[6px] font-bold tracking-widest uppercase font-mono leading-none opacity-80 ${
                k.isBiosKey ? 'text-[#FF5500]' : 'text-slate-400'
              }`}>
                {k.subLabel}
              </span>
            )}
          </div>
        </motion.div>
      ))}

      {/* Decorative Technical Telemetry/Label tags embedded into background to anchor theme */}
      <div className="absolute bottom-6 left-1/10 hidden lg:flex items-center gap-3 opacity-20 text-[9px] font-mono text-slate-500">
        <Keyboard size={11} />
        <span>SYS_HOTKEY_GRID_ONLINE</span>
        <span>•</span>
        <span>ROM_MAPPER_v1.4</span>
      </div>

      <div className="absolute top-6 right-1/10 hidden lg:flex items-center gap-3 opacity-20 text-[9px] font-mono text-slate-500">
        <ShieldAlert size={11} className="text-[#FF5500]" />
        <span>SECURE_BOOT_BYPASS_ENGAGED</span>
        <span>•</span>
        <span>F_LOCK_OK</span>
      </div>
    </div>
  );
};
