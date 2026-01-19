"use client";

import { useState } from "react";

interface LayerPreviewImageProps {
  filename: string;
  layerId: string;
  alt: string;
  className?: string;
}

export function LayerPreviewImage({
  filename,
  layerId,
  alt,
  className,
}: LayerPreviewImageProps) {
  const [error, setError] = useState(false);

  if (error) return null;

  return (
    <img
      src={`/api/psd/layer-preview/${filename}/${layerId}`}
      alt={alt}
      className={
        className ||
        "w-10 h-10 object-contain bg-gray-200 dark:bg-zinc-700 rounded border border-gray-300 dark:border-gray-600"
      }
      onError={() => setError(true)}
      loading="lazy"
    />
  );
}
