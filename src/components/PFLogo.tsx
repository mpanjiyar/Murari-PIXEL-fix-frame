/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

interface LogoProps {
  className?: string;
  size?: number;
}

export default function PFLogo({ className = '', size }: LogoProps) {
  // Constructing a precise grid vector representing the interlocking "P" and "F" logo.
  // The grid is 5x5, mapping the exact orange block pixels.
  // We can draw this cleanly as a single responsive SVG.
  return (
    <svg
      width={size || 36}
      height={size || 36}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 shrink-0 ${className} transition-all duration-300 hover:scale-105`}
    >
      {/* 
        Grid analysis based on the logo image:
        - The orange parts are composed of perfect thick grid squares.
        - Leftmost stem: (0, 20) to (20, 100). That's the P side going downwards.
        - P Loop: Contains a 20x20 white cutout at (20, 40).
        - Shared/right side vertical bar.
        - F Top bar: (40, 0) to (100, 20).
        - F Crossbar: (60, 40) to (80, 60).
      */}
      <g fill="currentColor">
        {/* P Stem (Leftmost col) */}
        <rect x="0" y="20" width="20" height="80" rx="1" />
        
        {/* P Loop Top Border */}
        <rect x="20" y="20" width="40" height="20" rx="1" />
        
        {/* P Loop Right Border & F Stem part */}
        <rect x="40" y="40" width="20" height="40" rx="1" />
        
        {/* P Loop Bottom Border */}
        <rect x="20" y="60" width="20" height="20" rx="1" />
        
        {/* F Uppermost Bar */}
        <rect x="40" y="0" width="60" height="20" rx="1" />
        
        {/* F Mid Crossbar */}
        <rect x="60" y="40" width="20" height="20" rx="1" />
      </g>
    </svg>
  );
}
