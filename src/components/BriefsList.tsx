"use client";

import { useState, useEffect } from "react";
import type { Brief } from "@/types";
import { getBriefs } from "@/services/brief.service";
import BriefCard from "./BriefCard";
import BriefModal from "./BriefModal";

export default function BriefsList() {
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingBrief, setEditingBrief] = useState<Brief | null>(null);

  useEffect(() => {
    loadBriefs();
  }, []);

  async function loadBriefs() {
    try {
      const data = await getBriefs();
      setBriefs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load briefs");
    } finally {
      setLoading(false);
    }
  }

  const handleEdit = (brief: Brief) => {
    setEditingBrief(brief);
    setShowModal(true);
  };

  const handleSaved = (saved: Brief) => {
    setBriefs((prev) => {
      const exists = prev.find((b) => b.id === saved.id);
      if (exists) {
        return prev.map((b) => (b.id === saved.id ? saved : b));
      }
      return [saved, ...prev];
    });
  };

  const handleDeleted = (id: string) => {
    setBriefs((prev) => prev.filter((b) => b.id !== id));
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBrief(null);
  };

  const handleAddNew = () => {
    setEditingBrief(null);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-zinc-400">
          <svg
            className="animate-spin h-5 w-5"
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
          <span>Loading briefs...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="text-red-400 mb-2">{error}</div>
        <button
          onClick={() => {
            setError(null);
            setLoading(true);
            loadBriefs();
          }}
          className="text-sm text-zinc-400 hover:text-white underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <button
          onClick={handleAddNew}
          className="py-3 px-5 rounded-xl text-white font-medium text-sm flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition-all duration-200 shadow-lg shadow-cyan-500/20"
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Brief
        </button>
      </div>

      {briefs.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-zinc-900 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-zinc-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <h3 className="text-white font-medium mb-1">No briefs yet</h3>
          <p className="text-zinc-500 text-sm">
            Create your first brief to speed up your editing workflow
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {briefs.map((brief) => (
            <BriefCard
              key={brief.id}
              brief={brief}
              onEdit={handleEdit}
              onDeleted={handleDeleted}
            />
          ))}
        </div>
      )}

      {showModal && (
        <BriefModal
          brief={editingBrief}
          onClose={handleCloseModal}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}
