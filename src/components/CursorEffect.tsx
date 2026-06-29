/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';

export default function CursorEffect() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const outerCircleRef = useRef<HTMLDivElement>(null);
  const innerDotRef = useRef<HTMLDivElement>(null);

  // Coordinate tracking with refs to bypass React state updates on every pixel moved
  const positionRef = useRef({ x: 0, y: 0 });
  const trailRef = useRef({ x: 0, y: 0 });
  const isHoveringRef = useRef(false);

  // Keep hover ref in sync with React state
  useEffect(() => {
    isHoveringRef.current = isHovering;
  }, [isHovering]);

  useEffect(() => {
    // Check if the device matches touch capability
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    setIsVisible(true);

    const handleMouseMove = (e: MouseEvent) => {
      positionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    // Listen to hovering on clickable items (only triggers state update on actual transition)
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

      setIsHovering((prev) => {
        if (prev !== isClickable) return isClickable;
        return prev;
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    window.addEventListener('mouseover', handleMouseOverClickable, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('mouseover', handleMouseOverClickable);
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let animationId: number;

    const updateCoordinates = () => {
      // Smooth interpolation (lerp)
      const dx = positionRef.current.x - trailRef.current.x;
      const dy = positionRef.current.y - trailRef.current.y;
      
      trailRef.current.x += dx * 0.16;
      trailRef.current.y += dy * 0.16;

      // Update inner dot style directly via DOM
      if (innerDotRef.current) {
        innerDotRef.current.style.transform = `translate3d(${positionRef.current.x}px, ${positionRef.current.y}px, 0) translate(-50%, -50%)`;
      }

      // Update outer halo style directly via DOM
      if (outerCircleRef.current) {
        const size = isHoveringRef.current ? '48px' : '32px';
        outerCircleRef.current.style.transform = `translate3d(${trailRef.current.x}px, ${trailRef.current.y}px, 0) translate(-50%, -50%)`;
        outerCircleRef.current.style.width = size;
        outerCircleRef.current.style.height = size;
      }

      animationId = requestAnimationFrame(updateCoordinates);
    };

    animationId = requestAnimationFrame(updateCoordinates);
    return () => cancelAnimationFrame(animationId);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <>
      {/* Outer Glow Halo Ring */}
      <div
        id="cursor-outer-halo"
        ref={outerCircleRef}
        className="fixed top-0 left-0 pointer-events-none z-50 rounded-full border-2 border-[#FF5500]/75 bg-[#FF5500]/5 shadow-[0_0_15px_rgba(255,85,0,0.4)] will-change-transform transition-[width,height] duration-200 ease-out"
        style={{
          width: '32px',
          height: '32px',
          transform: `translate3d(${trailRef.current.x}px, ${trailRef.current.y}px, 0) translate(-50%, -50%)`,
        }}
      />
      {/* Inner Pinpoint Dot */}
      <div
        id="cursor-inner-dot"
        ref={innerDotRef}
        className="fixed top-0 left-0 pointer-events-none z-50 w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#FF5500] will-change-transform"
        style={{
          transform: `translate3d(${positionRef.current.x}px, ${positionRef.current.y}px, 0) translate(-50%, -50%)`,
        }}
      />
    </>
  );
}
