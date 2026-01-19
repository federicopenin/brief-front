"use client";

import { BackIcon } from "./icons";
import { getPreviewUrl } from "@/services/psd.service";
import type { PsdUploadResponse } from "@/types";

interface EditModeSelectorProps {
  data: PsdUploadResponse;
  onSelectLayerEdit: () => void;
  onSelectGenericEdit: () => void;
  onBack: () => void;
}

export default function EditModeSelector({
  data,
  onSelectLayerEdit,
  onSelectGenericEdit,
  onBack,
}: EditModeSelectorProps) {
  return (
    <div className="w-full max-w-lg mx-auto p-1 animate-fadeIn">
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative bg-white dark:bg-zinc-900 rounded-xl leading-none">
          <div className="w-full p-8">
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={onBack}
                className="group/btn relative flex items-center justify-center w-10 h-10 rounded-full bg-zinc-800 hover:bg-gradient-to-br hover:from-cyan-500 hover:to-blue-600 transition-all duration-300"
              >
                <BackIcon />
              </button>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Choose Edit Mode
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {data.filename}
                </p>
              </div>
            </div>

            <div className="mb-6 rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-700">
              <img
                src={getPreviewUrl(data.filename)}
                alt="PSD Preview"
                className="w-full h-48 object-contain bg-gray-100 dark:bg-zinc-800"
              />
            </div>

            <div className="space-y-4">
              <button
                onClick={onSelectLayerEdit}
                className="w-full p-6 rounded-xl border-2 border-gray-200 dark:border-zinc-700 hover:border-purple-500 dark:hover:border-purple-500 bg-gray-50 dark:bg-zinc-800/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300 group/card"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white group-hover/card:text-purple-600 dark:group-hover/card:text-purple-400 transition-colors">
                      Layer Edit
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Select and modify individual layers with AI assistance
                    </p>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400 group-hover/card:text-purple-500 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </button>

              <button
                onClick={onSelectGenericEdit}
                className="w-full p-6 rounded-xl border-2 border-gray-200 dark:border-zinc-700 hover:border-cyan-500 dark:hover:border-cyan-500 bg-gray-50 dark:bg-zinc-800/50 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-all duration-300 group/card"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white group-hover/card:text-cyan-600 dark:group-hover/card:text-cyan-400 transition-colors">
                      Generic Edit
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Describe changes for the entire PSD with a brief
                    </p>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400 group-hover/card:text-cyan-500 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
