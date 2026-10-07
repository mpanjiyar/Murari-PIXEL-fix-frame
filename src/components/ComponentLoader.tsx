import React from 'react';

interface ComponentLoaderProps {
  className?: string;
  minHeight?: string;
}

export const ComponentLoader: React.FC<ComponentLoaderProps> = ({
  className = '',
  minHeight = 'min-h-[240px]',
}) => {
  return (
    <div
      className={`w-full ${minHeight} flex flex-col items-center justify-center p-8 rounded-2xl border border-white/5 bg-slate-900/10 backdrop-blur-sm animate-pulse ${className}`}
    >
      <div className="w-8 h-8 rounded-full border-2 border-[#FF5500] border-t-transparent animate-spin mb-3" />
      <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
        Loading module...
      </span>
    </div>
  );
};

export default ComponentLoader;
