/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';

export default function CursorEffect() {
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
  }, []);

  return (
    <>
      {/* Outer Glow Halo Ring */}
      <div
        id="cursor-outer-halo"
        ref={outerCircleRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999] w-8 h-8 rounded-full border-2 border-[#FF5500]/75 bg-[#FF5500]/5 shadow-[0_0_15px_rgba(255,85,0,0.4)] will-change-transform"
        style={{
          display: 'none',
          opacity: 0,
        }}
      />
      {/* Inner Pinpoint Dot */}
      <div
        id="cursor-inner-dot"
        ref={innerDotRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999] w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#FF5500] will-change-transform"
        style={{
          display: 'none',
          opacity: 0,
        }}
      />
    </>
  );
}

