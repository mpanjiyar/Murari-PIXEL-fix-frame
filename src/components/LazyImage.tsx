import React, { useState, useEffect, useRef } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholderClassName?: string;
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
  id?: string;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  placeholderClassName = '',
  referrerPolicy = 'no-referrer',
  id,
}) => {
  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  return (
    <div
      ref={containerRef}
      id={id}
      className={`relative overflow-hidden w-full h-full ${placeholderClassName}`}
    >
      {/* Loading states / blur placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-slate-200 dark:bg-zinc-800 animate-pulse flex items-center justify-center">
          <svg
            className="w-8 h-8 text-slate-300 dark:text-zinc-600 animate-spin"
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
          src={src}
          alt={alt}
          className={`${className} transition-opacity duration-700 ease-out ${
            isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
          referrerPolicy={referrerPolicy}
          onLoad={() => setIsLoaded(true)}
        />
      )}
    </div>
  );
};
