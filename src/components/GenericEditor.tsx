"use client";

import { useState } from "react";
import {
  editFullPsd,
  getPreviewUrl,
  getDownloadUrlsFromHistory,
} from "@/services/psd.service";
import { BackIcon, SpinnerIcon } from "./icons";
import type { PsdUploadResponse, DownloadUrls, DownloadFormat } from "@/types";

interface GenericEditorProps {
  data: PsdUploadResponse;
  onBack: () => void;
}

export default function GenericEditor({ data, onBack }: GenericEditorProps) {
  const [prompt, setPrompt] = useState<string>("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [downloadUrls, setDownloadUrls] = useState<DownloadUrls | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [downloadingFormat, setDownloadingFormat] =
    useState<DownloadFormat | null>(null);

  const handleSubmit = async () => {
    if (!prompt.trim()) return;

    setStatus("loading");
    setDownloadUrls(null);
    setErrorMessage("");

    try {
      const result = await editFullPsd(data.filename, prompt);
      if (result.status === "success" && result.historyId) {
        setStatus("success");
        setDownloadUrls(getDownloadUrlsFromHistory(result.historyId));
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
    setDownloadUrls(null);
    setErrorMessage("");
  };

  const handleDownload = async (format: DownloadFormat) => {
    if (!downloadUrls || downloadingFormat) return;

    setDownloadingFormat(format);
    try {
      const url = downloadUrls[format];
      const response = await fetch(url);

      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${data.filename.replace(".psd", "")}_edited.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download error:", error);
    } finally {
      setDownloadingFormat(null);
    }
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

            <div className="mb-6 rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-700">
              <img
                src={getPreviewUrl(data.filename)}
                alt="PSD Preview"
                className="w-full h-64 object-contain bg-gray-100 dark:bg-zinc-800"
              />
            </div>

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
                  placeholder="Describe what you want to change in the PSD... (e.g., 'Reemplazá todas las apariciones de 'PRODUCTO NUEVO' por 'NUEVOS PRODUCTOS'.)"
                  disabled={status === "loading" || status === "success"}
                />
              </div>

              {status === "error" && (
                <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 rounded-lg text-sm text-center">
                  {errorMessage || "Something went wrong. Please try again."}
                </div>
              )}

              {status === "success" && downloadUrls ? (
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-300 rounded-lg text-sm text-center">
                    Edit completed successfully!
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleDownload("psd")}
                      disabled={downloadingFormat !== null}
                      className={`py-3 px-4 rounded-xl text-white font-semibold text-center text-sm flex items-center justify-center gap-2 transition-all ${
                        downloadingFormat === "psd"
                          ? "bg-purple-600/50 cursor-wait"
                          : downloadingFormat !== null
                            ? "bg-purple-600/30 cursor-not-allowed opacity-50"
                            : "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 shadow-lg shadow-purple-500/20"
                      }`}
                    >
                      {downloadingFormat === "psd" ? (
                        <SpinnerIcon className="h-4 w-4" />
                      ) : (
                        "PSD"
                      )}
                    </button>
                    <button
                      onClick={() => handleDownload("png")}
                      disabled={downloadingFormat !== null}
                      className={`py-3 px-4 rounded-xl text-white font-semibold text-center text-sm flex items-center justify-center gap-2 transition-all ${
                        downloadingFormat === "png"
                          ? "bg-emerald-600/50 cursor-wait"
                          : downloadingFormat !== null
                            ? "bg-emerald-600/30 cursor-not-allowed opacity-50"
                            : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 shadow-lg shadow-green-500/20"
                      }`}
                    >
                      {downloadingFormat === "png" ? (
                        <SpinnerIcon className="h-4 w-4" />
                      ) : (
                        "PNG"
                      )}
                    </button>
                    <button
                      onClick={() => handleDownload("pdf")}
                      disabled={downloadingFormat !== null}
                      className={`py-3 px-4 rounded-xl text-white font-semibold text-center text-sm flex items-center justify-center gap-2 transition-all ${
                        downloadingFormat === "pdf"
                          ? "bg-rose-600/50 cursor-wait"
                          : downloadingFormat !== null
                            ? "bg-rose-600/30 cursor-not-allowed opacity-50"
                            : "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 shadow-lg shadow-red-500/20"
                      }`}
                    >
                      {downloadingFormat === "pdf" ? (
                        <SpinnerIcon className="h-4 w-4" />
                      ) : (
                        "PDF"
                      )}
                    </button>
                  </div>
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
