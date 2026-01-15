"use client";

import { useState, useMemo, useRef } from "react";
import { flattenLayers } from "@/lib/psd-helpers";
import {
  modifyLayer,
  replaceLogo,
  getDownloadUrls,
} from "@/services/psd.service";
import { LayerCard } from "./LayerCard";
import { BackIcon, UploadFileIcon, SpinnerIcon } from "./icons";
import type {
  PsdUploadResponse,
  PsdModifyResponse,
  FlatLayer,
  DownloadUrls,
} from "@/types";

interface LayerModifierProps {
  data: PsdUploadResponse;
  onBack: () => void;
}

export default function LayerModifier({ data, onBack }: LayerModifierProps) {
  const [selectedLayerId, setSelectedLayerId] = useState<string>("");
  const [prompt, setPrompt] = useState<string>("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [downloadUrls, setDownloadUrls] = useState<DownloadUrls | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const flatLayers = useMemo(
    () => flattenLayers(data.structure.layers),
    [data]
  );

  const selectedLayer = flatLayers.find(
    (l: FlatLayer) => l.id === selectedLayerId
  );

  const handleSubmit = async () => {
    if (!selectedLayerId || !prompt.trim()) return;

    setStatus("loading");
    setDownloadUrls(null);

    try {
      let result: PsdModifyResponse;

      if (logoFile) {
        result = await replaceLogo(
          data.filename,
          selectedLayerId,
          prompt,
          logoFile
        );
      } else {
        result = await modifyLayer(data.filename, selectedLayerId, prompt);
      }

      setStatus("success");
      setDownloadUrls(getDownloadUrls(result.modifiedFilename));
    } catch (e) {
      console.error(e);
      setStatus("error");
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full py-6 animate-fadeIn pb-32">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="group relative flex items-center gap-3 px-4 py-2.5 rounded-full font-medium text-gray-300 bg-zinc-900/80 backdrop-blur-xl border border-zinc-700/50 hover:border-zinc-500/50 hover:text-white hover:bg-zinc-800/90 transition-all duration-300 hover:shadow-lg hover:shadow-black/20"
          >
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-zinc-800 group-hover:bg-gradient-to-br group-hover:from-cyan-500 group-hover:to-blue-600 transition-all duration-300">
              <BackIcon />
            </span>
            <span>Back</span>
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Select a Layer to Modify
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {data.filename}
            </p>
          </div>
        </div>

        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleLogoUpload}
            className="hidden"
            accept="image/*"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg border font-medium transition-all
              ${
                logoFile
                  ? "bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-zinc-600 dark:text-gray-300 dark:hover:bg-zinc-800"
              }
            `}
          >
            <UploadFileIcon />
            {logoFile ? "Change Logo" : "Replace Logo"}
          </button>
          {logoFile && (
            <div className="text-xs text-right mt-1 text-blue-600 dark:text-blue-400 truncate max-w-[150px] ml-auto">
              {logoFile.name}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {flatLayers.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No modifiable layers found.
          </div>
        ) : (
          flatLayers.map((layer: FlatLayer) => (
            <LayerCard
              key={layer.id}
              layer={layer}
              filename={data.filename}
              isSelected={selectedLayerId === layer.id}
              onSelect={setSelectedLayerId}
            />
          ))
        )}
      </div>

      <div
        className={`
          fixed bottom-4 left-4 right-4 md:left-[17rem] md:right-8 p-1 rounded-3xl
          bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 
          transition-all duration-500 ease-out z-50 
          ${
            selectedLayerId
              ? "translate-y-0 opacity-100 scale-100"
              : "translate-y-8 opacity-0 scale-95 pointer-events-none"
          }
        `}
      >
        <div className="bg-zinc-950/95 backdrop-blur-xl rounded-[22px] p-6">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Modification Brief for{" "}
                <span className="text-blue-600 font-bold">
                  {selectedLayer?.name}
                </span>
                {selectedLayer?.type === "text" && (
                  <span className="ml-2 text-xs text-blue-500 font-normal animate-pulse">
                    (Updating text content)
                  </span>
                )}
              </label>
              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={selectedLayer?.type === "text" ? 1 : 2}
                  className="block w-full rounded-xl border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 resize-none"
                  placeholder={
                    selectedLayer?.type === "text"
                      ? "Enter new text..."
                      : "Describe the changes..."
                  }
                  disabled={status === "success"}
                />
              </div>
            </div>

            <div className="w-full md:w-auto flex flex-col gap-2 min-w-[280px]">
              {status === "success" && downloadUrls ? (
                <div className="flex gap-2">
                  <a
                    href={downloadUrls.psd}
                    className="flex-1 py-2.5 px-3 rounded-xl text-white font-semibold text-center bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 shadow-lg shadow-purple-500/20 text-sm"
                    download
                  >
                    PSD
                  </a>
                  <a
                    href={downloadUrls.png}
                    className="flex-1 py-2.5 px-3 rounded-xl text-white font-semibold text-center bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 shadow-lg shadow-green-500/20 text-sm"
                    download
                  >
                    PNG
                  </a>
                  <a
                    href={downloadUrls.pdf}
                    className="flex-1 py-2.5 px-3 rounded-xl text-white font-semibold text-center bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 shadow-lg shadow-red-500/20 text-sm"
                    download
                  >
                    PDF
                  </a>
                </div>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!selectedLayerId || !prompt || status === "loading"}
                  className={`w-full py-2.5 px-4 rounded-xl text-white font-semibold shadow-lg transition-all
                    ${
                      !selectedLayerId || !prompt || status === "loading"
                        ? "bg-gray-400 cursor-not-allowed opacity-50"
                        : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 hover:scale-[1.02] active:scale-[0.98] shadow-blue-500/25"
                    }
                  `}
                >
                  {status === "loading" ? (
                    <span className="flex items-center justify-center gap-2">
                      <SpinnerIcon className="h-4 w-4 text-white" />
                      Processing...
                    </span>
                  ) : (
                    "Generate Changes"
                  )}
                </button>
              )}

              {status === "error" && (
                <span className="text-xs text-red-500 text-center">
                  Something went wrong. Try again.
                </span>
              )}
              {status === "success" && (
                <button
                  onClick={() => {
                    setStatus("idle");
                    setPrompt("");
                  }}
                  className="text-xs text-gray-400 underline hover:text-gray-600 text-center"
                >
                  Modify another layer
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
