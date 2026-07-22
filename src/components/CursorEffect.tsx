/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef } from 'react';

export type CursorStyleOption = 'ember' | 'cyber' | 'gold' | 'camera' | 'code' | 'minimal' | 'arcade' | 'plasma' | 'default';

export interface CursorOptionConfig {
  id: CursorStyleOption;
  name: string;
  tagline: string;
  primaryColor: string;
  outerClassName: string;
  innerClassName: string;
  badge: string;
}

export const CURSOR_CONFIGS: Record<CursorStyleOption, CursorOptionConfig> = {
  ember: {
    id: 'ember',
    name: 'Ember Glow',
    tagline: 'Signature Amber Ring & White Pinpoint Dot',
    primaryColor: '#FF5500',
    outerClassName: 'w-8 h-8 rounded-full border-2 border-[#FF5500]/80 bg-[#FF5500]/10 shadow-[0_0_15px_rgba(255,85,0,0.5)]',
    innerClassName: 'w-2 h-2 rounded-full bg-white shadow-[0_0_10px_#FF5500]',
    badge: 'Popular',
  },
  cyber: {
    id: 'cyber',
    name: 'Cyber Violet',
    tagline: 'Neon Violet Halo with Cyan Target Center',
    primaryColor: '#A855F7',
    outerClassName: 'w-9 h-9 rounded-full border-2 border-purple-500/80 bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.5)]',
    innerClassName: 'w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]',
    badge: 'Futuristic',
  },
  gold: {
    id: 'gold',
    name: 'Gold Diamond',
    tagline: 'Luxury Rotated Gold Diamond & Champagne Dot',
    primaryColor: '#F59E0B',
    outerClassName: 'w-8 h-8 rotate-45 border-2 border-amber-400/90 bg-amber-400/10 shadow-[0_0_18px_rgba(251,191,36,0.6)]',
    innerClassName: 'w-2 h-2 rounded-full bg-amber-200 shadow-[0_0_8px_#f59e0b]',
    badge: 'Premium',
  },
  camera: {
    id: 'camera',
    name: 'Camera Aperture',
    tagline: "Photographer's Aperture Ring & Rec Indicator",
    primaryColor: '#F43F5E',
    outerClassName: 'w-9 h-9 rounded-full border-2 border-dashed border-rose-500/80 bg-rose-500/10 shadow-[0_0_15px_rgba(244,63,94,0.5)]',
    innerClassName: 'w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_10px_#f43f5e]',
    badge: 'Photography',
  },
  code: {
    id: 'code',
    name: 'Matrix Code',
    tagline: 'Developer Terminal Brackets & Laser Dot',
    primaryColor: '#10B981',
    outerClassName: 'w-9 h-9 rounded-lg border-2 border-emerald-400/80 bg-emerald-500/10 shadow-[0_0_15px_rgba(52,211,153,0.5)]',
    innerClassName: 'w-2 h-2 rounded-full bg-emerald-300 shadow-[0_0_10px_#10b981]',
    badge: 'Dev Mode',
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal Pinpoint',
    tagline: 'Ultra-Subtle Pure Pinpoint Pointer',
    primaryColor: '#64748B',
    outerClassName: 'w-6 h-6 rounded-full border border-slate-300/40 bg-white/5 shadow-[0_0_8px_rgba(255,255,255,0.2)]',
    innerClassName: 'w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_#ffffff]',
    badge: 'Clean',
  },
  arcade: {
    id: 'arcade',
    name: 'Arcade Crosshair',
    tagline: 'Classic Retro Gaming Reticle',
    primaryColor: '#EF4444',
    outerClassName: 'w-8 h-8 border-2 border-red-500/90 bg-red-500/10 shadow-[0_0_12px_rgba(239,68,68,0.6)]',
    innerClassName: 'w-2 h-2 rounded-xs bg-yellow-400 shadow-[0_0_8px_#eab308]',
    badge: 'Retro',
  },
  plasma: {
    id: 'plasma',
    name: 'Electric Plasma',
    tagline: 'High-Voltage Electric Cyan Aura',
    primaryColor: '#06B6D4',
    outerClassName: 'w-10 h-10 rounded-full border-2 border-cyan-400/80 bg-cyan-500/15 shadow-[0_0_20px_rgba(6,182,212,0.6)]',
    innerClassName: 'w-2.5 h-2.5 rounded-full bg-sky-200 shadow-[0_0_12px_#38bdf8]',
    badge: 'Electric',
  },
  default: {
    id: 'default',
    name: 'Native System OS',
    tagline: 'Standard Browser Pointer (Custom Overlay Off)',
    primaryColor: '#94A3B8',
    outerClassName: 'hidden',
    innerClassName: 'hidden',
    badge: 'Standard',
  }
};

interface CursorEffectProps {
  cursorStyle?: CursorStyleOption;
}

export default function CursorEffect({ cursorStyle = 'ember' }: CursorEffectProps) {
  const outerCircleRef = useRef<HTMLDivElement>(null);
  const innerDotRef = useRef<HTMLDivElement>(null);

  // Core tracking with refs for zero-latency, bypass React state updates entirely
  const positionRef = useRef({ x: 0, y: 0 });
  const trailRef = useRef({ x: 0, y: 0 });
  const isHoveringRef = useRef(false);
  const isVisibleRef = useRef(false);
  const hasInitializedRef = useRef(false);

  // Animatable values tracked via refs for fluid interpolation (lerp)
  const currentScaleRef = useRef(1);
  const currentOpacityRef = useRef(0);

  useEffect(() => {
    if (cursorStyle === 'default') return;

    // Disable on touch devices to prevent mobile cursor sticking bugs
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    // Direct Mousemove handler
    const handleMouseMove = (e: MouseEvent) => {
      if (!hasInitializedRef.current) {
        positionRef.current = { x: e.clientX, y: e.clientY };
        trailRef.current = { x: e.clientX, y: e.clientY };
        hasInitializedRef.current = true;
      } else {
        positionRef.current = { x: e.clientX, y: e.clientY };
      }
      isVisibleRef.current = true;
    };

    const handleMouseLeave = () => {
      isVisibleRef.current = false;
    };

    const handleMouseEnter = () => {
      isVisibleRef.current = true;
    };

    // Live element hovering tracker
    const handleMouseOverClickable = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      const isClickable = !!(
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.closest('button') ||
        target.closest('a') ||
        target.style.cursor === 'pointer' ||
        target.classList.contains('clickable-item')
      );

      isHoveringRef.current = isClickable;
    };

    // Attach passive listeners for maximum scrolling and tracking thread performance
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    document.addEventListener('mouseenter', handleMouseEnter, { passive: true });
    window.addEventListener('mouseover', handleMouseOverClickable, { passive: true });

    // Core Animation Frame Loop
    let animationId: number;

    const tick = () => {
      // 1. Interpolate Visibility/Opacity
      const targetOpacity = isVisibleRef.current ? 1 : 0;
      currentOpacityRef.current += (targetOpacity - currentOpacityRef.current) * 0.15;

      // 2. Interpolate Scale on Hover
      const targetScale = isHoveringRef.current ? 1.4 : 1;
      currentScaleRef.current += (targetScale - currentScaleRef.current) * 0.2;

      // 3. Interpolate Position Trail (using snappy 0.22 factor)
      const dx = positionRef.current.x - trailRef.current.x;
      const dy = positionRef.current.y - trailRef.current.y;
      trailRef.current.x += dx * 0.22;
      trailRef.current.y += dy * 0.22;

      // Render styles directly to DOM bypassing React render overhead
      const opacityStr = currentOpacityRef.current.toFixed(3);

      if (innerDotRef.current) {
        innerDotRef.current.style.transform = `translate3d(${positionRef.current.x}px, ${positionRef.current.y}px, 0) translate(-50%, -50%)`;
        innerDotRef.current.style.opacity = opacityStr;
        innerDotRef.current.style.display = currentOpacityRef.current < 0.01 ? 'none' : 'block';
      }

      if (outerCircleRef.current) {
        outerCircleRef.current.style.transform = `translate3d(${trailRef.current.x}px, ${trailRef.current.y}px, 0) translate(-50%, -50%) scale(${currentScaleRef.current.toFixed(3)})`;
        outerCircleRef.current.style.opacity = opacityStr;
        outerCircleRef.current.style.display = currentOpacityRef.current < 0.01 ? 'none' : 'block';
      }

      animationId = requestAnimationFrame(tick);
    };

    animationId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('mouseover', handleMouseOverClickable);
      cancelAnimationFrame(animationId);
    };
  }, [cursorStyle]);

  if (cursorStyle === 'default') {
    return null;
  }

  const currentConfig = CURSOR_CONFIGS[cursorStyle] || CURSOR_CONFIGS.ember;

  return (
    <>
      {/* Outer Glow Halo Ring */}
      <div
        id="cursor-outer-halo"
        ref={outerCircleRef}
        className={`fixed top-0 left-0 pointer-events-none z-[9999] will-change-transform ${currentConfig.outerClassName}`}
        style={{
          display: 'none',
          opacity: 0,
        }}
      />
      {/* Inner Pinpoint Dot */}
      <div
        id="cursor-inner-dot"
        ref={innerDotRef}
        className={`fixed top-0 left-0 pointer-events-none z-[9999] will-change-transform ${currentConfig.innerClassName}`}
        style={{
          display: 'none',
          opacity: 0,
        }}
      />
    </>
  );
}


