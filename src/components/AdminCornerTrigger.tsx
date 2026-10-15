import React from 'react';

interface AdminCornerTriggerProps {
  currentTheme?: 'light' | 'normal' | 'mono' | string;
  isAuthorized?: boolean;
  onOpenAdmin: () => void;
}

export const AdminCornerTrigger: React.FC<AdminCornerTriggerProps> = ({
  currentTheme = 'dark',
  isAuthorized = false,
  onOpenAdmin,
}) => {
  const isLight = currentTheme === 'light';

  return (
    <div
      style={{
        position: 'fixed',
        right: '12px',
        bottom: '12px',
        zIndex: 45,
      }}
      className="pb-[env(safe-area-inset-bottom,0px)] pr-[env(safe-area-inset-right,0px)] group select-none pointer-events-auto"
    >
      <button
        type="button"
        onClick={onOpenAdmin}
        aria-label="Admin Portal"
        title={isAuthorized ? "Admin Portal (Authorized)" : "Admin Portal"}
        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer shadow-md focus:outline-none focus:ring-2 focus:ring-[#FF5500] focus:ring-offset-2 ${
          isLight
            ? 'bg-slate-100/90 hover:bg-white text-slate-600 hover:text-slate-900 border border-slate-300/80 shadow-slate-300/50'
            : 'bg-zinc-900/90 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/10 shadow-black/60'
        } hover:scale-110 active:scale-95`}
      >
        <span className="sr-only">Admin Portal</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="16"
          height="16"
          className="transition-transform duration-300 group-hover:rotate-45"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>

        {isAuthorized && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-zinc-950" />
        )}
      </button>
    </div>
  );
};
