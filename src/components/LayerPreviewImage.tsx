"use client";

import { useState, useEffect, useRef } from "react";

interface LayerPreviewImageProps {
  filename: string;
  layerId: string;
  alt: string;
  className?: string;
  loadDelay?: number;
}

export function LayerPreviewImage({
  filename,
  layerId,
  alt,
  className,
  loadDelay = 0,
}: LayerPreviewImageProps) {
  const [error, setError] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "100px" },
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const timer = setTimeout(() => {
      setShouldLoad(true);
    }, loadDelay);

    return () => clearTimeout(timer);
  }, [isVisible, loadDelay]);

  if (error) return null;

  return (
    <div ref={imgRef} className={className || "w-10 h-10"}>
      {shouldLoad ? (
        <img
          src={`/api/psd/layer-preview/${filename}/${layerId}`}
          alt={alt}
          className="w-full h-full object-contain"
          onError={() => setError(true)}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-zinc-800/50 animate-pulse rounded">
          <svg
            className="w-6 h-6 text-zinc-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
