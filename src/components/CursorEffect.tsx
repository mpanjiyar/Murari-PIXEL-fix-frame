/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';

export default function CursorEffect() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [trail, setTrail] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    // Check if the device matches touch capability
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    setIsVisible(true);

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    // Listen to hovering on clickable items
    const handleMouseOverClickable = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isClickable =
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.closest('button') ||
        target.closest('a') ||
        target.style.cursor === 'pointer' ||
        target.classList.contains('clickable-item');

      setIsHovering(!!isClickable);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    window.addEventListener('mouseover', handleMouseOverClickable);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('mouseover', handleMouseOverClickable);
    };
  }, []);

  useEffect(() => {
    let animationId: number;
    
    // Create soft trailing effect using lerp
    const updateTrail = () => {
      setTrail((prev) => {
        const dx = position.x - prev.x;
        const dy = position.y - prev.y;
        return {
          x: prev.x + dx * 0.15,
          y: prev.y + dy * 0.15,
        };
      });
      animationId = requestAnimationFrame(updateTrail);
    };

    animationId = requestAnimationFrame(updateTrail);
    return () => cancelAnimationFrame(animationId);
  }, [position]);

  if (!isVisible) return null;

  return (
    <>
      {/* Outer Glow Halo Ring */}
      <div
        className="fixed top-0 left-0 pointer-events-none z-50 rounded-full transition-transform duration-150 ease-out border-2 border-[#FF5500]/75 bg-[#FF5500]/5 -translate-x-1/2 -translate-y-1/2 shadow-[0_0_15px_rgba(255,85,0,0.4)]"
        style={{
          left: `${trail.x}px`,
          top: `${trail.y}px`,
          width: isHovering ? '48px' : '32px',
          height: isHovering ? '48px' : '32px',
        }}
      />
      {/* Inner Pinpoint Dot */}
      <div
        className="fixed top-0 left-0 pointer-events-none z-50 w-2 h-2 rounded-full bg-white -translate-x-1/2 -translate-y-1/2 shadow-[0_0_8px_#FF5500]"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      />
    </>
  );
}
