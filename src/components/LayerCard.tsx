"use client";

import { LayerPreviewImage } from "./LayerPreviewImage";
import { LayerIcon } from "./icons";
import type { FlatLayer } from "@/types";

interface LayerCardProps {
  layer: FlatLayer;
  filename: string;
  isSelected: boolean;
  onSelect: (layerId: string) => void;
  index?: number;
}

export function LayerCard({
  layer,
  filename,
  isSelected,
  onSelect,
  index = 0,
}: LayerCardProps) {
  //const loadDelay = Math.floor(index / 3) * 300;
  const loadDelay = index * 1000;
  return (
    <div
      onClick={() => onSelect(layer.id)}
      className={`
        relative group cursor-pointer rounded-xl border-2 transition-all duration-200 overflow-hidden flex flex-col
        ${
          isSelected
            ? "border-blue-500 shadow-xl scale-[1.02] ring-2 ring-blue-500/20"
            : "border-gray-200 dark:border-zinc-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md"
        }
        bg-white dark:bg-zinc-800
      `}
    >
      <div className="aspect-square bg-checkerboard relative w-full border-b border-gray-100 dark:border-zinc-700/50">
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-zinc-900/50">
          <LayerPreviewImage
            filename={filename}
            layerId={layer.id}
            alt={layer.name}
            className="w-full h-full object-contain drop-shadow-sm"
            loadDelay={loadDelay}
          />
        </div>
        <div className="absolute top-2 left-2">
          <span className="inline-flex items-center justify-center p-1.5 bg-white/90 dark:bg-black/50 backdrop-blur-sm rounded-lg shadow-sm">
            <LayerIcon type={layer.type} />
          </span>
        </div>
      </div>

      <div className="p-3">
        <h3
          className={`font-semibold text-base truncate ${
            isSelected
              ? "text-blue-600 dark:text-blue-400"
              : "text-gray-700 dark:text-gray-200"
          }`}
        >
          {layer.name}
        </h3>
        <p className="text-xs text-gray-400 mt-0.5 truncate">
          {layer.safeName}
        </p>
      </div>
    </div>
  );
}
