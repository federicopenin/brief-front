"use client";

import { useState, useEffect } from "react";
import type { Brief } from "@/types";
import { createBrief, updateBrief } from "@/services/brief.service";
import { toast } from "sonner";

interface BriefModalProps {
  brief?: Brief | null;
  onClose: () => void;
  onSaved: (brief: Brief) => void;
}

export default function BriefModal({
  brief,
  onClose,
  onSaved,
}: BriefModalProps) {
  const [content, setContent] = useState(brief?.content || "");
  const [isSaving, setIsSaving] = useState(false);

  const isEdit = !!brief;

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSaving(true);
    try {
      let saved: Brief;
      if (isEdit && brief) {
        saved = await updateBrief(brief.id, content.trim());
        toast.success("Brief updated successfully");
      } else {
        saved = await createBrief(content.trim());
        toast.success("Brief created successfully");
      }
      onSaved(saved);
      onClose();
    } catch (error) {
      console.error("Save error:", error);
      toast.error(isEdit ? "Failed to update brief" : "Failed to create brief");
    } finally {
      setIsSaving(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-lg mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">
            {isEdit ? "Edit Brief" : "New Brief"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Brief Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 text-white p-4 resize-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none transition-colors"
              placeholder="Write your brief here... (e.g., 'Change background to black and add stars')"
              autoFocus
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 py-3 px-4 rounded-xl text-white font-medium bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!content.trim() || isSaving}
              className={`flex-1 py-3 px-4 rounded-xl text-white font-medium flex items-center justify-center gap-2 transition-all duration-200 ${
                !content.trim() || isSaving
                  ? "bg-zinc-700 cursor-not-allowed opacity-50"
                  : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500"
              }`}
            >
              {isSaving ? (
                <>
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
                  Saving...
                </>
              ) : isEdit ? (
                "Update Brief"
              ) : (
                "Create Brief"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
