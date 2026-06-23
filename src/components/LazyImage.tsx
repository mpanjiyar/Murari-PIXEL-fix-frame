import React, { useState, useEffect, useRef } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholderClassName?: string;
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
  id?: string;
  onError?: () => void;
}

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

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  placeholderClassName = '',
  referrerPolicy = 'no-referrer',
  id,
  onError,
}) => {
  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [attempt, setAttempt] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentSrc(src);
    setAttempt(0);
    setIsLoaded(false);
  }, [src]);

  useEffect(() => {
    // If the browser doesn't support IntersectionObserver, load immediately
    if (!('IntersectionObserver' in window)) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            if (containerRef.current) {
              observer.unobserve(containerRef.current);
            }
          }
        });
      },
      {
        rootMargin: '100px 0px', // Start loading slightly before the image is fully in view
        threshold: 0.01,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleImageError = () => {
    const fileId = getDriveFileId(src);
    if (fileId) {
      if (attempt === 0) {
        // Fallback 1: Standard raw export download query
        setCurrentSrc(`https://drive.google.com/uc?export=download&id=${fileId}`);
        setAttempt(1);
        return;
      } else if (attempt === 1) {
        // Fallback 2: docs.google.com domain export
        setCurrentSrc(`https://docs.google.com/uc?export=download&id=${fileId}`);
        setAttempt(2);
        return;
      } else if (attempt === 2) {
        // Fallback 3: Standard drive view / uc link without forced download
        setCurrentSrc(`https://drive.google.com/uc?id=${fileId}`);
        setAttempt(3);
        return;
      }
    }
    
    // Call the parent component's error handler if all attempts fail
    if (onError) {
      onError();
    }
  };

  return (
    <div
      ref={containerRef}
      id={id}
      className={`relative overflow-hidden w-full h-full ${placeholderClassName}`}
    >
      <style>{`
        @keyframes lazyImageShimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .lazy-image-shimmer {
          background: linear-gradient(
            90deg,
            rgba(226, 232, 240, 0.7) 25%,
            rgba(241, 245, 249, 0.9) 50%,
            rgba(226, 232, 240, 0.7) 75%
          );
          background-size: 200% 100%;
          animation: lazyImageShimmer 1.6s infinite linear;
        }
        .dark .lazy-image-shimmer {
          background: linear-gradient(
            90deg,
            rgba(31, 41, 55, 0.7) 25%,
            rgba(55, 65, 81, 0.9) 50%,
            rgba(31, 41, 55, 0.7) 75%
          );
          background-size: 200% 100%;
          animation: lazyImageShimmer 1.6s infinite linear;
        }
      `}</style>

      {/* Loading states / blur placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 lazy-image-shimmer flex items-center justify-center z-10">
          <svg
            className="w-8 h-8 text-slate-400 dark:text-zinc-600 animate-spin opacity-50"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      )}

      {isInView && (
        <img
          src={currentSrc}
          alt={alt}
          className={`${className} transition-all duration-700 ease-out will-change-[filter,opacity,transform] ${
            isLoaded 
              ? 'opacity-100 blur-none scale-100' 
              : 'opacity-0 blur-md scale-105'
          }`}
          referrerPolicy={referrerPolicy}
          onLoad={() => setIsLoaded(true)}
          onError={handleImageError}
        />
      )}
    </div>
  );
};
