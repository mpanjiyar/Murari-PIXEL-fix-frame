import React, { useState, useEffect, useRef } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  lowResSrc?: string;
  className?: string;
  placeholderClassName?: string;
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
  id?: string;
  onError?: () => void;
  style?: React.CSSProperties;
}

// Global image cache policy to prevent flickering and improve load performance across the gallery and feed
const globalImageCache = new Set<string>();

const getDriveFileId = (url: string): string | null => {
  if (!url) return null;
  // Match lh3.googleusercontent.com/d/{id} or /u/0/d/{id}
  let match = url.match(/lh3\.googleusercontent\.com\/(?:u\/\d+\/)?d\/([^/&#?]+)/);
  if (match) return match[1];

  // Match docs.google.com/uc?id={id} or drive.google.com/uc?id={id}
  match = url.match(/[?&]id=([^&]+)/);
  if (match) return match[1];

  // Match drive.google.com/file/d/{id}
  match = url.match(/drive\.google\.com\/file\/d\/([^/&#?]+)/);
  if (match) return match[1];

  return null;
};

const getLowResUrl = (url: string): string | null => {
  if (!url) return null;
  
  // Unsplash image URL optimization
  if (url.includes('images.unsplash.com')) {
    try {
      const urlObj = new URL(url);
      urlObj.searchParams.set('w', '50');
      urlObj.searchParams.set('q', '20');
      urlObj.searchParams.set('auto', 'format');
      return urlObj.toString();
    } catch (e) {
      return url.replace(/w=\d+/, 'w=50').replace(/q=\d+/, 'q=20');
    }
  }

  // Google Drive image URL optimization (fetch smaller thumbnail size if possible to prevent main thread blocking)
  if (url.includes('drive.google.com') || url.includes('docs.google.com') || url.includes('lh3.googleusercontent.com')) {
    const fileId = getDriveFileId(url);
    if (fileId) {
      return `https://lh3.googleusercontent.com/d/${fileId}=s100`;
    }
  }

  return null;
};

// Generates an elegant seed-based background gradient for abstract placeholder colors (blur-up effect)
const hashString = (str: string): number => {
  let hash = 0;
  if (!str) return hash;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
};

const getPlaceholderGradient = (str: string, theme: 'normal' | 'mono' | 'light'): string => {
  if (!str) return 'linear-gradient(135deg, #1e1b4b, #311005)';
  const h = hashString(str);
  
  if (theme === 'mono') {
    // brutalist technical mono shades
    return 'linear-gradient(135deg, #09090b, #18181b, #27272a)';
  }
  
  const hue1 = h % 360;
  const hue2 = (h + 80) % 360;
  const hue3 = (h + 160) % 360;
  
  if (theme === 'light') {
    // Premium soft pastel gradients
    return `linear-gradient(135deg, hsl(${hue1}, 85%, 94%), hsl(${hue2}, 75%, 91%), hsl(${hue3}, 80%, 93%))`;
  }
  
  // Sleek dark-mode aesthetic gradients
  return `linear-gradient(135deg, hsl(${hue1}, 60%, 14%), hsl(${hue2}, 45%, 11%), hsl(${hue3}, 55%, 16%))`;
};

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  lowResSrc,
  className = '',
  placeholderClassName = '',
  referrerPolicy = 'no-referrer',
  id,
  onError,
  style,
}) => {
  const [isInView, setIsInView] = useState(() => !src || globalImageCache.has(src));
  const [isLoaded, setIsLoaded] = useState(() => globalImageCache.has(src));
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [attempt, setAttempt] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentTheme, setCurrentTheme] = useState<'normal' | 'mono' | 'light'>('normal');
  const resolvedLowRes = lowResSrc || getLowResUrl(src);

  // Synchronize and track the theme for loading skeleton aesthetic consistency
  useEffect(() => {
    const syncTheme = () => {
      const saved = localStorage.getItem('mp_portfolio_theme_v2') as any;
      if (saved === 'light' || saved === 'mono' || saved === 'normal') {
        setCurrentTheme(saved);
      }
    };
    syncTheme();
    window.addEventListener('storage', syncTheme);
    const interval = setInterval(syncTheme, 1000);
    return () => {
      window.removeEventListener('storage', syncTheme);
      clearInterval(interval);
    };
  }, []);

  // Sync state with src changes and resolve caching instantaneously
  useEffect(() => {
    const cached = globalImageCache.has(src);
    setCurrentSrc(src);
    setAttempt(0);
    setIsLoaded(cached);
    setHasError(false);
    if (cached) {
      setIsInView(true);
    } else {
      setIsInView(false);
    }
  }, [src]);

  // Handle proper Intersection Observer for lazy loading
  useEffect(() => {
    if (isInView) return;

    if (!('IntersectionObserver' in window)) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
          }
        });
      },
      {
        rootMargin: '150px 0px', // Preload images 150px before they enter view
        threshold: 0.01,
      }
    );

    const currentRef = containerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      observer.disconnect();
    };
  }, [src, isInView]);

  const handleImageError = () => {
    const fileId = getDriveFileId(src);
    if (fileId) {
      if (attempt === 0) {
        setCurrentSrc(`https://drive.google.com/uc?export=download&id=${fileId}`);
        setAttempt(1);
        return;
      } else if (attempt === 1) {
        setCurrentSrc(`https://docs.google.com/uc?export=download&id=${fileId}`);
        setAttempt(2);
        return;
      } else if (attempt === 2) {
        setCurrentSrc(`https://drive.google.com/uc?id=${fileId}`);
        setAttempt(3);
        return;
      }
    }
    
    // Fallback for YouTube thumbnails if high-resolution is not available
    if (currentSrc.includes('maxresdefault.jpg')) {
      const hqSrc = currentSrc.replace('maxresdefault.jpg', 'hqdefault.jpg');
      setCurrentSrc(hqSrc);
      return;
    }
    
    setHasError(true);
    setIsLoaded(true);

    if (onError) {
      onError();
    }
  };

  const placeholderGradient = getPlaceholderGradient(src, currentTheme);

  return (
    <div
      ref={containerRef}
      id={id}
      className={`relative overflow-hidden w-full h-full ${placeholderClassName}`}
    >
      <style>{`
        @keyframes customShimmerSweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .shimmer-sweep-layer::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.08) 20%,
            rgba(255, 255, 255, 0.18) 60%,
            transparent
          );
          transform: translateX(-100%);
          animation: customShimmerSweep 1.8s infinite ease-out;
        }
        .light .shimmer-sweep-layer::after {
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.4) 20%,
            rgba(255, 255, 255, 0.6) 60%,
            transparent
          );
        }
      `}</style>

      {/* 1. BLUR-UP PLACEHOLDER & SKELETON LAYER */}
      {!isLoaded && !hasError && (
        <div 
          className="absolute inset-0 z-10 flex flex-col items-center justify-center transition-opacity duration-300 pointer-events-none"
          style={{ background: placeholderGradient }}
        >
          {/* Subtle pulsating colored background orb to act as blurred layout filler */}
          <div className="absolute inset-0 blur-[30px] opacity-40 scale-110 pointer-events-none bg-gradient-to-tr from-amber-500/25 via-[#FF5500]/10 to-indigo-500/20 animate-pulse duration-[4000ms]" />

          {/* Shimmer sweep layer overlaying the color fill */}
          <div className="absolute inset-0 shimmer-sweep-layer mix-blend-overlay opacity-80" />

          {/* SKELETON COMPONENT SPECIFIC LAYOUT: Tech-aesthetic placeholder icon & layout details */}
          <div className="flex flex-col items-center gap-2 z-20">
            {/* Center animated graphic depending on theme */}
            <div className={`p-3.5 rounded-full backdrop-blur-md border ${
              currentTheme === 'light' 
                ? 'bg-white/40 border-black/5 text-[#FF5500]' 
                : currentTheme === 'mono'
                  ? 'bg-zinc-900/60 border-zinc-700 text-zinc-400'
                  : 'bg-black/40 border-white/5 text-[#FF5500]'
            } shadow-[0_8px_30px_rgb(0,0,0,0.06)] animate-pulse`}>
              <svg 
                className="w-5 h-5 opacity-80" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            
            {/* Pulsing micro-text lines for visual filler */}
            <div className="flex flex-col items-center gap-1.5 w-16">
              <div className={`h-1.5 w-12 rounded-full ${currentTheme === 'light' ? 'bg-black/10' : 'bg-white/10'} animate-pulse`} />
              <div className={`h-1 w-8 rounded-full ${currentTheme === 'light' ? 'bg-black/5' : 'bg-white/5'} animate-pulse`} />
            </div>
          </div>
        </div>
      )}

      {/* 2. ERROR STATE UNREACHABLE ASSETS */}
      {hasError ? (
        <div className="absolute inset-0 bg-slate-100 dark:bg-zinc-950 flex flex-col items-center justify-center p-4 text-center select-none z-10 border border-dashed border-slate-200 dark:border-zinc-800">
          <svg
            className="w-7 h-7 text-slate-350 dark:text-zinc-700 mb-1.5 animate-bounce duration-[3000ms]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-[9px] font-mono uppercase tracking-widest font-black text-slate-400 dark:text-zinc-500">
            Image Offline
          </span>
        </div>
      ) : (
        <>
          {/* Progressive low-res blurred preview image */}
          {resolvedLowRes && isInView && (
            <img
              src={resolvedLowRes}
              alt=""
              decoding="async"
              className={`absolute inset-0 w-full h-full object-cover filter blur-[10px] scale-[1.05] transition-opacity duration-700 pointer-events-none z-0 ${
                isLoaded ? 'opacity-0' : 'opacity-100'
              }`}
              style={{ transitionDelay: isLoaded ? '100ms' : '0ms' }}
              referrerPolicy={referrerPolicy}
            />
          )}

          {isInView && (
            <img
              key={currentSrc}
              src={currentSrc}
              alt={alt}
              decoding="async"
              loading="lazy"
              className={`absolute inset-0 w-full h-full object-cover ${className} transition-all duration-700 ease-out will-change-[filter,opacity,transform] z-10 ${
                isLoaded 
                  ? 'opacity-100 blur-0 scale-100' 
                  : 'opacity-0 blur-xl scale-[1.04]'
              }`}
              style={style}
              referrerPolicy={referrerPolicy}
              onLoad={() => {
                globalImageCache.add(src);
                if (currentSrc !== src) {
                  globalImageCache.add(currentSrc);
                }
                setIsLoaded(true);
              }}
              onError={handleImageError}
            />
          )}
        </>
      )}
    </div>
  );
};
