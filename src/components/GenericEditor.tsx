"use client";

import { useState } from "react";
import { editFullPsd } from "@/services/psd.service";
import { BackIcon, SpinnerIcon } from "./icons";
import type { PsdUploadResponse } from "@/types";

interface GenericEditorProps {
  data: PsdUploadResponse;
  onBack: () => void;
}

export default function GenericEditor({ data, onBack }: GenericEditorProps) {
  const [prompt, setPrompt] = useState<string>("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleSubmit = async () => {
    if (!prompt.trim()) return;

    setStatus("loading");
    setDownloadUrl(null);
    setErrorMessage("");

    try {
      const result = await editFullPsd(data.filename, prompt);
      if (result.status === "success" && result.downloadUrl) {
        setStatus("success");
        setDownloadUrl(result.downloadUrl);
      } else {
        setStatus("error");
        setErrorMessage(result.message || "An error occurred");
      }
    } catch (e) {
      setStatus("error");
      setErrorMessage(e instanceof Error ? e.message : "An error occurred");
    }
  };

  const handleReset = () => {
    setStatus("idle");
    setPrompt("");
    setDownloadUrl(null);
    setErrorMessage("");
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-1 animate-fadeIn">
      <div className="relative group">
        <div
          className={`absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 ${
            status === "loading" ? "animate-pulse" : ""
          }`}
        ></div>
        <div className="relative bg-white dark:bg-zinc-900 rounded-xl leading-none">
          <div className="w-full p-8">
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={onBack}
                disabled={status === "loading"}
                className="group/btn relative flex items-center justify-center w-10 h-10 rounded-full bg-zinc-800 hover:bg-gradient-to-br hover:from-cyan-500 hover:to-blue-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <BackIcon />
              </button>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Generic Edit
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {data.filename}
                </p>
              </div>
            </div>

            {data.previewUrl && (
              <div className="mb-6 rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-700">
                <img
                  src={data.previewUrl}
                  alt="PSD Preview"
                  className="w-full h-64 object-contain bg-gray-100 dark:bg-zinc-800"
                />
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Modification Brief
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                  className="block w-full rounded-xl border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm p-4 resize-none"
                  placeholder="Describe what you want to change in the PSD... (e.g., 'Replace the text producto nuevo with nuevos productos')"
                  disabled={status === "loading" || status === "success"}
                />
              </div>

              {status === "error" && (
                <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 rounded-lg text-sm text-center">
                  {errorMessage || "Something went wrong. Please try again."}
                </div>
              )}

              {status === "success" && downloadUrl ? (
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-300 rounded-lg text-sm text-center">
                    Edit completed successfully!
                  </div>
                  <a
                    href={downloadUrl}
                    className="w-full py-3 px-4 rounded-xl text-white font-semibold text-center block bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 shadow-lg shadow-green-500/20 transition-all"
                    download
                  >
                    Download Modified PSD
                  </a>
                  <button
                    onClick={handleReset}
                    className="w-full text-sm text-gray-400 underline hover:text-gray-600 text-center"
                  >
                    Make another edit
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!prompt.trim() || status === "loading"}
                  className={`w-full py-3 px-4 rounded-xl text-white font-semibold shadow-lg transform transition-all duration-200 ${
                    !prompt.trim() || status === "loading"
                      ? "bg-gray-400 cursor-not-allowed opacity-50"
                      : "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 hover:scale-[1.02] active:scale-[0.98] shadow-cyan-500/30"
                  }`}
                >
                  {status === "loading" ? (
                    <span className="flex items-center justify-center gap-2">
                      <SpinnerIcon className="h-5 w-5 text-white" />
                      Processing...
                    </span>
                  ) : (
                    "Edit PSD"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
