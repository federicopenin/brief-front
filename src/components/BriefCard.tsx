"use client";

import { useState } from "react";
import type { Brief } from "@/types";
import { deleteBrief } from "@/services/brief.service";
import { toast } from "sonner";

interface BriefCardProps {
  brief: Brief;
  onEdit: (brief: Brief) => void;
  onDeleted: (id: string) => void;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function BriefCard({
  brief,
  onEdit,
  onDeleted,
}: BriefCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(brief.content);
      toast.success("Brief copied to clipboard!");
    } catch {
      toast.error("Failed to copy brief");
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteBrief(brief.id);
      toast.success("Brief deleted successfully");
      onDeleted(brief.id);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete brief");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="group relative bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-5 hover:border-zinc-700/50 transition-all duration-300">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-zinc-500 text-xs">
            {brief.createdAt === brief.updatedAt
              ? `Created ${formatDate(brief.createdAt)}`
              : `Edited ${formatDate(brief.updatedAt)}`}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-white text-sm whitespace-pre-wrap">
          {brief.content}
        </p>
      </div>

      {showDeleteConfirm ? (
        <div className="flex gap-2">
          <button
            onClick={() => setShowDeleteConfirm(false)}
            disabled={isDeleting}
            className="flex-1 py-2 px-3 rounded-xl text-white font-medium text-sm bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 py-2 px-3 rounded-xl text-white font-medium text-sm bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 transition-all duration-200 flex items-center justify-center gap-2"
          >
            {isDeleting ? (
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
            ) : (
              "Confirm Delete"
            )}
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="py-2 px-3 rounded-xl text-white font-medium text-sm flex items-center justify-center transition-all duration-200 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500"
            title="Copy to clipboard"
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
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </button>
          <button
            onClick={() => onEdit(brief)}
            className="flex-1 py-2 px-3 rounded-xl text-white font-medium text-sm flex items-center justify-center gap-2 transition-all duration-200 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700"
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
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Edit
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="py-2 px-3 rounded-xl text-white font-medium text-sm flex items-center justify-center transition-all duration-200 bg-zinc-800 hover:bg-red-600/80 border border-zinc-700 hover:border-red-500/50"
            title="Delete"
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
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
