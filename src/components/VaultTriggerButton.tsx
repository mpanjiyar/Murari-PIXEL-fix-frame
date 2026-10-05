import React from 'react';

interface VaultTriggerButtonProps {
  onClick: () => void;
  currentTheme?: 'light' | 'dark' | 'mono' | string;
  className?: string;
}

/**
 * Premium Futuristic Vault Trigger Icon
 * - Pure Tailwind CSS 3D hover animation:
 *   - Smooth rotation (-6deg on hover)
 *   - Slight scale-up (108%)
 *   - Subtle glow (neon-orange / amber depth)
 *   - Soft depth/shadow effect (shadow-lg, -translate-y-1, transform-gpu)
 *   - Smooth transition in and out (transition-all duration-300 ease-out)
 * - Lightweight, professional, zero flickering
 */
export const VaultTriggerButton: React.FC<VaultTriggerButtonProps> = ({
  onClick,
  currentTheme = 'dark',
  className = '',
}) => {
  const isLight = currentTheme === 'light';

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <button
        type="button"
        onClick={onClick}
        aria-label="Secure Text & File Vault"
        title="Secure Vault"
        className={`group relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] 
          /* Tailwind 3D Hover Animation */
          transform-gpu transition-all duration-300 ease-out
          hover:scale-108 hover:-rotate-6 hover:-translate-y-1 active:scale-95 active:translate-y-0
          ${
            isLight
              ? 'bg-gradient-to-b from-white to-slate-100 text-slate-800 border border-slate-200/90 shadow-sm hover:border-[#FF5500]/60 hover:shadow-[0_10px_25px_-5px_rgba(255,85,0,0.3),0_0_15px_rgba(255,85,0,0.2)]'
              : 'bg-gradient-to-b from-[#181926] to-[#0c0d15] text-slate-200 border border-white/10 shadow-[0_4px_16px_rgba(0,0,0,0.5)] hover:border-[#FF5500]/70 hover:shadow-[0_12px_28px_-6px_rgba(255,85,0,0.4),0_0_20px_rgba(255,85,0,0.3)]'
          }
        `}
      >
        {/* Subtle Ambient Radial Glow on Hover */}
        <div
          className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#FF5500]/0 to-[#FF5500]/0 group-hover:from-[#FF5500]/15 group-hover:to-transparent transition-all duration-300 pointer-events-none"
          aria-hidden="true"
        />

        {/* Micro Cyber Corner Notches for futuristic vault aesthetic */}
        <span
          className="absolute top-1 left-1 w-1.5 h-1.5 border-t border-l border-white/20 group-hover:border-[#FF5500] transition-colors duration-300 pointer-events-none"
          aria-hidden="true"
        />
        <span
          className="absolute bottom-1 right-1 w-1.5 h-1.5 border-b border-r border-white/20 group-hover:border-[#FF5500] transition-colors duration-300 pointer-events-none"
          aria-hidden="true"
        />

        {/* Bespoke Futuristic Vault Lock Icon with 3D Depth Shift */}
        <div className="relative flex items-center justify-center transform-gpu transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
          <svg
            className="w-5 h-5 sm:w-[21px] sm:h-[21px] transition-transform duration-300 group-hover:scale-105"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Outer Circular Safe Tumbler Dial with radial ticks */}
            <circle
              cx="12"
              cy="12"
              r="9.5"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeDasharray="2 2"
              className={isLight ? 'opacity-40 text-slate-500 group-hover:opacity-85 group-hover:text-[#FF5500] transition-colors' : 'opacity-35 text-slate-400 group-hover:opacity-90 group-hover:text-[#FF5500] transition-colors'}
            />

            {/* Futuristic Vault Body */}
            <rect
              x="6.75"
              y="9.5"
              width="10.5"
              height="8.5"
              rx="2.2"
              className={isLight ? 'fill-slate-100 group-hover:fill-white transition-colors' : 'fill-[#11121c] group-hover:fill-[#1a1b2a] transition-colors'}
              stroke="currentColor"
              strokeWidth="1.3"
            />

            {/* Hardened Locking Shackle */}
            <path
              d="M8.75 9.5V6.75C8.75 4.95482 10.2048 3.5 12 3.5C13.7952 3.5 15.25 4.95482 15.25 6.75V9.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              className="text-[#FF5500] transition-colors duration-200"
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

            {/* Micro Cyber Indicators */}
            <circle
              cx="8.5"
              cy="11.2"
              r="0.5"
              fill="currentColor"
              className={isLight ? 'text-slate-400' : 'text-slate-500'}
            />
            <circle
              cx="15.5"
              cy="11.2"
              r="0.5"
              fill="currentColor"
              className={isLight ? 'text-slate-400' : 'text-slate-500'}
            />
          </svg>
        </div>
      </button>
    </div>
  );
};
