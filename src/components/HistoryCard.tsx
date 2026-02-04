"use client";

import { useState } from "react";
import type { HistoryItem, HistoryDownloadFormat } from "@/types";
import { getPresignedDownloadUrl } from "@/services/history.service";
import { toast } from "sonner";
import PreviewModal from "./PreviewModal";

interface HistoryCardProps {
  item: HistoryItem;
}

function getTimeRemaining(expiresAt: string): string {
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diff = expiry.getTime() - now.getTime();

  if (diff <= 0) return "Expired";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) return `${days}d ${hours}h remaining`;
  if (hours > 0) return `${hours}h remaining`;
  return "Less than 1h remaining";
}

function isExpiringSoon(expiresAt: string): boolean {
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diff = expiry.getTime() - now.getTime();
  return diff > 0 && diff < 24 * 60 * 60 * 1000;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HistoryCard({ item }: HistoryCardProps) {
  const [loadingFormat, setLoadingFormat] =
    useState<HistoryDownloadFormat | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const expiringSoon = isExpiringSoon(item.expiresAt);
  const timeRemaining = getTimeRemaining(item.expiresAt);

  const handleDownload = async (format: HistoryDownloadFormat) => {
    if (loadingFormat) return;

    setLoadingFormat(format);
    try {
      const { url, filename } = await getPresignedDownloadUrl(item.id, format);

      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Download failed. Please try again.");
    } finally {
      setLoadingFormat(null);
    }
  };

  const SpinnerIcon = () => (
    <svg
      className="animate-spin h-4 w-4"
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
  );

  return (
    <div className="group relative bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-5 hover:border-zinc-700/50 transition-all duration-300">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <svg
              className="w-5 h-5 text-purple-400 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-white font-medium truncate">
              {item.originalFilename}
            </h3>
          </div>
          <p className="text-zinc-500 text-sm">
            Created {formatDate(item.createdAt)}
          </p>
        </div>

        <div
          className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${
            expiringSoon
              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
              : "bg-zinc-800 text-zinc-400"
          }`}
        >
          {timeRemaining}
        </div>
      </div>

      {item.briefContent && (
        <div className="mt-3 p-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
          <div className="flex items-start gap-2">
            <svg
              className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
              />
            </svg>
            <p className="text-zinc-300 text-sm whitespace-pre-wrap">
              {item.briefContent}
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-2 mt-4">
        <button
          onClick={() => setShowPreview(true)}
          className="py-2 px-3 rounded-xl text-white font-medium text-sm flex items-center justify-center transition-all duration-200 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700"
          title="Preview"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
        </button>
        <button
          onClick={() => handleDownload("psd")}
          disabled={loadingFormat !== null}
          className={`flex-1 py-2 px-3 rounded-xl text-white font-medium text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
            loadingFormat === "psd"
              ? "bg-purple-600/50 cursor-wait"
              : loadingFormat !== null
                ? "bg-purple-600/30 cursor-not-allowed opacity-50"
                : "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500"
          }`}
        >
          {loadingFormat === "psd" ? <SpinnerIcon /> : "PSD"}
        </button>
        <button
          onClick={() => handleDownload("png")}
          disabled={loadingFormat !== null}
          className={`flex-1 py-2 px-3 rounded-xl text-white font-medium text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
            loadingFormat === "png"
              ? "bg-emerald-600/50 cursor-wait"
              : loadingFormat !== null
                ? "bg-emerald-600/30 cursor-not-allowed opacity-50"
                : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500"
          }`}
        >
          {loadingFormat === "png" ? <SpinnerIcon /> : "PNG"}
        </button>
        <button
          onClick={() => handleDownload("pdf")}
          disabled={loadingFormat !== null}
          className={`flex-1 py-2 px-3 rounded-xl text-white font-medium text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
            loadingFormat === "pdf"
              ? "bg-rose-600/50 cursor-wait"
              : loadingFormat !== null
                ? "bg-rose-600/30 cursor-not-allowed opacity-50"
                : "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500"
          }`}
        >
          {loadingFormat === "pdf" ? <SpinnerIcon /> : "PDF"}
        </button>
      </div>

      {showPreview && (
        <PreviewModal
          historyId={item.id}
          filename={item.originalFilename}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}
