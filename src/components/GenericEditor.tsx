"use client";

import { useState } from "react";
import {
  editFullPsd,
  getPreviewUrl,
  getDownloadUrlsFromHistory,
} from "@/services/psd.service";
import {
  getHistoryPresignedDownloadUrl,
  triggerNativeDownload,
} from "@/services/b2.service";
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
  const [editedHistoryId, setEditedHistoryId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [downloadingFormat, setDownloadingFormat] =
    useState<DownloadFormat | null>(null);
  const [previewLoading, setPreviewLoading] = useState(true);

  const handleSubmit = async () => {
    if (!prompt.trim()) return;

    setStatus("loading");
    setDownloadUrls(null);
    setErrorMessage("");
    setPreviewLoading(true);

    try {
      const result = await editFullPsd(
        data.filename,
        prompt,
        data.originalFilename,
      );
      if (result.status === "success" && result.historyId) {
        setStatus("success");
        setDownloadUrls(getDownloadUrlsFromHistory(result.historyId));
        setEditedHistoryId(result.historyId);
      } else {
        setStatus("error");
        setErrorMessage(result.message || "An error occurred");
      }
    } catch (e) {
      setStatus("error");
      setErrorMessage(e instanceof Error ? e.message : "An error occurred");
    }
  };

  const handleDownload = async (format: DownloadFormat) => {
    if (!editedHistoryId || downloadingFormat) return;

    setDownloadingFormat(format);
    try {
      // Get presigned URL with correct Content-Disposition from backend
      const { downloadUrl } = await getHistoryPresignedDownloadUrl(
        editedHistoryId,
        format,
      );

      // Construct filename: originalFilename_edited.format
      const baseName = data.originalFilename || data.filename;
      const downloadName = `${baseName.replace(/\.psd$/i, "")}_edited.${format}`;

      // Trigger native download
      triggerNativeDownload(downloadUrl, downloadName);
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
                  {data.originalFilename}
                </p>
              </div>
            </div>

            <div className="mb-6 rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-700">
              <div className="relative w-full h-64 bg-gray-100 dark:bg-zinc-800">
                {previewLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-zinc-800/50">
                    <div className="flex items-center gap-3 text-zinc-400">
                      <svg
                        className="animate-spin h-6 w-6"
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
                      <span>Loading preview...</span>
                    </div>
                  </div>
                )}
                <img
                  key={editedHistoryId || data.filename}
                  src={
                    editedHistoryId
                      ? `/api/history/${editedHistoryId}/png`
                      : getPreviewUrl(data.filename)
                  }
                  alt="PSD Preview"
                  className={`w-full h-full object-contain transition-opacity duration-300 ${
                    previewLoading ? "opacity-0" : "opacity-100"
                  }`}
                  onLoad={() => setPreviewLoading(false)}
                  onError={() => setPreviewLoading(false)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Modification Brief
                  </label>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const text = await navigator.clipboard.readText();
                        if (text) setPrompt((prev) => prev + text);
                      } catch {
                        console.error("Failed to read clipboard");
                      }
                    }}
                    disabled={status === "loading" || status === "success"}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Paste from clipboard"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    Paste
                  </button>
                </div>
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
