"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import FileUploader from "@/components/FileUploader";
import EditModeSelector from "@/components/EditModeSelector";
import LayerModifier from "@/components/LayerModifier";
import GenericEditor from "@/components/GenericEditor";
import Sidebar from "@/components/Sidebar";
import type { PsdUploadResponse } from "@/types";

type AppStep = "upload" | "select-mode" | "layer-edit" | "generic-edit";

function NewProcessingContent() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<AppStep>("upload");
  const [psdData, setPsdData] = useState<PsdUploadResponse | null>(null);

  useEffect(() => {
    const isReedit = searchParams.get("reedit") === "true";
    if (isReedit) {
      const storedData = sessionStorage.getItem("reeditData");
      if (storedData) {
        try {
          const data = JSON.parse(storedData) as PsdUploadResponse;
          setPsdData(data);
          setStep("select-mode");
          sessionStorage.removeItem("reeditData");
        } catch (e) {
          console.error("Failed to parse reedit data:", e);
        }
      }
    }
  }, [searchParams]);

  const handleUploadSuccess = (data: PsdUploadResponse) => {
    setPsdData(data);
    setStep("select-mode");
  };

  const handleBack = () => {
    setStep("upload");
    setPsdData(null);
  };

  const handleBackToModeSelection = () => {
    setStep("select-mode");
  };

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-black selection:bg-purple-500 selection:text-white">
      <Sidebar />
      <main className="flex-1 ml-64 flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-2xl relative">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob dark:bg-purple-900 dark:mix-blend-normal" />
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000 dark:bg-pink-900 dark:mix-blend-normal" />
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000 dark:bg-blue-900 dark:mix-blend-normal" />

          <div className="relative">
            {step === "upload" && (
              <FileUploader onUploadSuccess={handleUploadSuccess} />
            )}
            {step === "select-mode" && psdData && (
              <EditModeSelector
                data={psdData}
                onSelectLayerEdit={() => setStep("layer-edit")}
                onSelectGenericEdit={() => setStep("generic-edit")}
                onBack={handleBack}
              />
            )}
            {step === "layer-edit" && psdData && (
              <LayerModifier
                data={psdData}
                onBack={handleBackToModeSelection}
              />
            )}
            {step === "generic-edit" && psdData && (
              <GenericEditor
                data={psdData}
                onBack={handleBackToModeSelection}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function NewProcessingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <NewProcessingContent />
    </Suspense>
  );
}
