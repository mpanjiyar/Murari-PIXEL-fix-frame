import React from 'react';

interface VaultTriggerButtonProps {
  onClick: () => void;
  currentTheme?: 'light' | 'dark' | 'mono' | string;
  className?: string;
  tooltipText?: string;
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
}

/**
 * Premium Minimal Vault Trigger Icon
 * - Pure GPU-accelerated Tailwind CSS hover animation:
 *   - Subtle scale-up (108%)
 *   - Soft neon-amber/orange glow
 *   - Micro-rotation (-6deg) with lock tumbler depth shift
 *   - Floating "Private Vault" tooltip
 *   - Instant, snappy click response
 * - Zero visual clutter, minimal footprint
 */
export const VaultTriggerButton: React.FC<VaultTriggerButtonProps> = ({
  onClick,
  currentTheme = 'dark',
  className = '',
  tooltipText = 'Private Vault',
  tooltipPosition = 'top',
}) => {
  const isLight = currentTheme === 'light';

  // Tooltip position positioning
  const tooltipPosClasses =
    tooltipPosition === 'bottom'
      ? 'top-full mt-2 left-1/2 -translate-x-1/2'
      : tooltipPosition === 'left'
      ? 'right-full mr-2 top-1/2 -translate-y-1/2'
      : tooltipPosition === 'right'
      ? 'left-full ml-2 top-1/2 -translate-y-1/2'
      : 'bottom-full mb-2 left-1/2 -translate-x-1/2';

  return (
    <div className={`relative inline-flex items-center justify-center group ${className}`}>
      {/* Floating Tooltip */}
      <div
        role="tooltip"
        className={`absolute ${tooltipPosClasses} pointer-events-none z-50 whitespace-nowrap px-2.5 py-1 rounded-lg text-[10px] font-mono font-extrabold uppercase tracking-wider transition-all duration-200 ease-out transform-gpu
          opacity-0 scale-95 translate-y-1 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0
          ${
            isLight
              ? 'bg-slate-900/95 text-white shadow-md border border-slate-800'
              : 'bg-black/90 text-[#FF5500] shadow-[0_4px_20px_rgba(0,0,0,0.8)] border border-[#FF5500]/30'
          }
        `}
      >
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500] animate-pulse" />
          {tooltipText}
        </span>
      </div>

      {/* Minimal Icon Trigger Button */}
      <button
        type="button"
        onClick={onClick}
        aria-label={tooltipText}
        className={`relative flex items-center justify-center w-10 h-10 sm:w-10 sm:h-10 rounded-xl cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] 
          /* GPU-Accelerated Hover & Click Animation */
          transform-gpu transition-all duration-300 ease-out will-change-transform
          hover:scale-108 hover:-rotate-6 hover:-translate-y-0.5
          active:scale-95 active:rotate-0 active:translate-y-0
          ${
            isLight
              ? 'bg-gradient-to-b from-white to-slate-100 text-slate-800 border border-slate-200/90 shadow-sm hover:border-[#FF5500]/60 hover:shadow-[0_8px_25px_-5px_rgba(255,85,0,0.35),0_0_15px_rgba(255,85,0,0.2)]'
              : 'bg-gradient-to-b from-[#181926] to-[#0c0d15] text-slate-200 border border-white/10 shadow-[0_4px_16px_rgba(0,0,0,0.5)] hover:border-[#FF5500]/70 hover:shadow-[0_10px_28px_-6px_rgba(255,85,0,0.45),0_0_20px_rgba(255,85,0,0.3)]'
          }
        `}
      >
        {/* Soft Radial Glow on Hover */}
        <div
          className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#FF5500]/0 to-[#FF5500]/0 group-hover:from-[#FF5500]/20 group-hover:to-transparent transition-all duration-300 pointer-events-none"
          aria-hidden="true"
        />

        {/* Micro Cyber Corner Notches for luxury vault aesthetic */}
        <span
          className="absolute top-1 left-1 w-1.5 h-1.5 border-t border-l border-white/20 group-hover:border-[#FF5500] transition-colors duration-300 pointer-events-none"
          aria-hidden="true"
        />
        <span
          className="absolute bottom-1 right-1 w-1.5 h-1.5 border-b border-r border-white/20 group-hover:border-[#FF5500] transition-colors duration-300 pointer-events-none"
          aria-hidden="true"
        />

        {/* Futuristic Vault Lock Icon */}
        <div className="relative flex items-center justify-center transform-gpu transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
          <svg
            className="w-5 h-5 transition-transform duration-300 group-hover:scale-105"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Outer Circular Safe Tumbler Dial */}
            <circle
              cx="12"
              cy="12"
              r="9.5"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeDasharray="2 2"
              className={
                isLight
                  ? 'opacity-40 text-slate-500 group-hover:opacity-85 group-hover:text-[#FF5500] transition-colors'
                  : 'opacity-35 text-slate-400 group-hover:opacity-90 group-hover:text-[#FF5500] transition-colors'
              }
            />

            {/* Futuristic Vault Body */}
            <rect
              x="6.75"
              y="9.5"
              width="10.5"
              height="8.5"
              rx="2.2"
              className={
                isLight
                  ? 'fill-slate-100 group-hover:fill-white transition-colors'
                  : 'fill-[#11121c] group-hover:fill-[#1a1b2a] transition-colors'
              }
              stroke="currentColor"
              strokeWidth="1.3"
            />

            {/* Hardened Locking Shackle with slight unlock lift on hover */}
            <path
              d="M8.75 9.5V6.75C8.75 4.95482 10.2048 3.5 12 3.5C13.7952 3.5 15.25 4.95482 15.25 6.75V9.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              className="text-[#FF5500] transition-all duration-300 group-hover:-translate-y-0.5"
            />

            {/* Cipher Keyhole / Core Tumbler */}
            <circle
              cx="12"
              cy="13.2"
              r="1.3"
              className="fill-[#FF5500] transition-transform duration-300 group-hover:scale-110"
            />
            <path
              d="M12 14.5V16"
              stroke="#FF5500"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </button>
    </div>
  );
};
export default VaultTriggerButton;
