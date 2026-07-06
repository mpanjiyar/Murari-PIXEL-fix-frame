import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { LazyImage } from './LazyImage';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
  currentTheme?: 'light' | 'dark';
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeImage,
  afterImage,
  beforeLabel = "RAW / UNEDITED",
  afterLabel = "PIXEL FRAME RETOUCHED",
  className = "",
  currentTheme = 'dark',
}) => {
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging) return;
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  }, [isDragging, handleMove]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  }, [isDragging, handleMove]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleTouchMove, handleMouseUp]);

  const onStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    if ('touches' in e) {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX);
      }
    } else {
      handleMove(e.clientX);
    }
  }, [handleMove]);

  return (
    <div 
      id="before-after-slider-container"
      ref={containerRef}
      className={`relative select-none overflow-hidden aspect-video w-full rounded-2xl border shadow-xl bg-zinc-950 ${
        currentTheme === 'light' ? 'border-slate-200' : 'border-white/10'
      } ${className}`}
    >
      {/* After Image (Full width background) */}
      <div className="absolute inset-0 w-full h-full">
        <LazyImage
          src={afterImage}
          alt="Edited Photography"
          className="w-full h-full object-cover pointer-events-none"
          placeholderClassName="absolute inset-0 z-0 bg-zinc-900"
        />
        <div className="absolute bottom-4 right-4 z-10 px-2.5 py-1 rounded-md bg-black/75 text-white text-[9px] font-mono font-bold tracking-wider uppercase backdrop-blur-xs border border-white/10">
          {afterLabel}
        </div>
      </div>

      {/* Before Image (Overlaid and clipped dynamically) */}
      <div 
        className="absolute inset-0 w-full h-full overflow-hidden"
        style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
      >
        <LazyImage
          src={beforeImage}
          alt="Raw / Original Photography"
          className={`w-full h-full object-cover pointer-events-none ${
            beforeImage === afterImage 
              ? 'saturate-[0.45] contrast-[0.75] brightness-[0.93] sepia-[0.04]' 
              : ''
          }`}
          placeholderClassName="absolute inset-0 z-0 bg-zinc-900"
        />
        <div className="absolute bottom-4 left-4 z-10 px-2.5 py-1 rounded-md bg-amber-500 text-white text-[9px] font-mono font-bold tracking-wider uppercase shadow-md">
          {beforeImage === afterImage ? "SIMULATED RAW" : beforeLabel}
        </div>
      </div>

      {/* Interactive Drag Bar & Handle */}
      <div 
        className="absolute top-0 bottom-0 z-30 w-1 bg-white hover:bg-amber-400 cursor-ew-resize transition-colors duration-200"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
        onMouseDown={onStart}
        onTouchStart={onStart}
      >
        {/* Glowing Pulser for Drag Bar */}
        <div className="absolute inset-0 w-full h-full bg-white/20 animate-pulse blur-xs" />

        {/* Handle Button */}
        <div 
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center shadow-2xl cursor-ew-resize select-none border-2 transition-transform duration-200 ${
            isDragging ? 'scale-110 border-amber-400 bg-amber-500 text-white' : 'border-white bg-zinc-900 text-zinc-100 hover:scale-105'
          }`}
        >
          <div className="flex items-center gap-0.5">
            <ChevronLeft size={14} className="animate-pulse" />
            <ChevronRight size={14} className="animate-pulse" />
          </div>
        </div>
      </div>

      {/* Instructions Overlay (Fades out when interactive slider is used) */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none animate-fade-in">
        <div className="px-3 py-1.5 rounded-full bg-black/85 backdrop-blur-md text-[8.5px] font-mono text-zinc-300 tracking-wider flex items-center gap-2 border border-white/5 shadow-lg">
          <RefreshCw size={10} className="text-amber-500 animate-spin-slow" />
          <span>DRAG THE SLIDER TO REVEAL RAW VS RETOUCHED DETAILS</span>
        </div>
      </div>
    </div>
  );
};
