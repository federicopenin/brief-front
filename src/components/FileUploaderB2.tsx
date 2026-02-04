"use client";

import { useState, useRef } from "react";
import {
  getPresignedUploadUrl,
  uploadToB2,
  processUploadedFile,
} from "@/services/b2.service";
import { formatFileSize, isPsdFile } from "@/lib/utils";
import { UploadIcon, FileIcon, SpinnerIcon } from "./icons";
import type { PsdUploadResponse, UploadProgress } from "@/types";

interface FileUploaderB2Props {
  onUploadSuccess: (data: PsdUploadResponse) => void;
}

export default function FileUploaderB2({
  onUploadSuccess,
}: FileUploaderB2Props) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<
    "idle" | "uploading" | "processing" | "success" | "error"
  >("idle");
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile: File) => {
    if (isPsdFile(selectedFile.name)) {
      setFile(selectedFile);
      setStatus("idle");
      setProgress(null);
      setErrorMessage(null);
    } else {
      alert("Please upload a .psd file");
    }
  };

  const onButtonClick = () => {
    inputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!file) return;

    setStatus("uploading");
    setProgress({ loaded: 0, total: file.size, percentage: 0 });
    setErrorMessage(null);

    try {
      const { uploadUrl, fileKey } = await getPresignedUploadUrl(file.name);
      await uploadToB2(file, uploadUrl, setProgress);
      setStatus("processing");
      console.log("Upload success, processing...", {
        fileKey,
        originalFilename: file.name,
      });
      const result = await processUploadedFile(fileKey, file.name);

      setStatus("success");
      setTimeout(() => {
        console.log("Calling onUploadSuccess with:", {
          ...result,
          originalFilename: file.name,
        });
        onUploadSuccess({
          ...result,
          originalFilename: file.name,
        } as PsdUploadResponse);
      }, 1500);
    } catch (error) {
      console.error("Upload error:", error);
      setStatus("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Upload failed. Please try again.",
      );
    }
  };

  const getProgressText = () => {
    if (!progress) return "";
    if (status === "processing") return "Processing file...";
    return `${formatFileSize(progress.loaded)} / ${formatFileSize(progress.total)}`;
  };

  return (
    <div className="w-full max-w-md mx-auto p-1">
      <div className="relative group">
        <div
          className={`absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 ${
            status === "uploading" || status === "processing"
              ? "animate-pulse"
              : ""
          }`}
        ></div>
        <div className="relative bg-white dark:bg-zinc-900 rounded-xl leading-none flex items-center divide-x divide-gray-600">
          <div className="w-full p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                Upload PSD
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Drag and drop your Photoshop file here
              </p>
            </div>

            <div
              className={`relative flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-xl transition-all duration-300 ease-in-out ${
                dragActive
                  ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 scale-105"
                  : "border-gray-300 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-gray-50 dark:hover:bg-zinc-800/50"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={onButtonClick}
            >
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept=".psd"
                onChange={handleChange}
              />

              {!file ? (
                <div className="flex flex-col items-center pointer-events-none">
                  <UploadIcon />
                  <span className="text-gray-500 dark:text-gray-400 font-medium">
                    Click to select or drag file
                  </span>
                  <span className="text-gray-400 text-xs mt-1">
                    .PSD files only (up to 250MB)
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <FileIcon />
                  <span className="text-gray-800 dark:text-white font-medium truncate max-w-[200px]">
                    {file.name}
                  </span>
                  <span className="text-gray-500 text-xs mt-1">
                    {formatFileSize(file.size)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setStatus("idle");
                      setProgress(null);
                    }}
                    className="mt-2 text-red-500 text-xs hover:text-red-600 font-medium"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {(status === "uploading" || status === "processing") &&
              progress && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <span>{getProgressText()}</span>
                    <span>{progress.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-pink-600 to-purple-600 rounded-full transition-all duration-300 ease-out"
                      style={{
                        width: `${status === "processing" ? 100 : progress.percentage}%`,
                      }}
                    ></div>
                  </div>
                  {status === "processing" && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                      Processing your file on the server...
                    </p>
                  )}
                </div>
              )}

            {status === "error" && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 rounded-lg text-sm text-center animate-shake">
                {errorMessage || "Upload failed. Please try again."}
              </div>
            )}

            {status === "success" && (
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-300 rounded-lg text-sm text-center">
                Success! File uploaded correctly.
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={
                !file ||
                status === "uploading" ||
                status === "processing" ||
                status === "success"
              }
              className={`w-full mt-6 py-3 px-4 rounded-xl text-white font-semibold shadow-lg transform transition-all duration-200 
                ${
                  !file || status === "success"
                    ? "bg-gray-400 cursor-not-allowed opacity-50"
                    : status === "uploading" || status === "processing"
                      ? "bg-gradient-to-r from-pink-600 to-purple-600 cursor-wait"
                      : "bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 hover:scale-[1.02] active:scale-[0.98] shadow-purple-500/30"
                }
              `}
            >
              {status === "uploading" ? (
                <span className="flex items-center justify-center">
                  <SpinnerIcon className="-ml-1 mr-2 h-5 w-5 text-white" />
                  Uploading... {progress?.percentage}%
                </span>
              ) : status === "processing" ? (
                <span className="flex items-center justify-center">
                  <SpinnerIcon className="-ml-1 mr-2 h-5 w-5 text-white" />
                  Processing...
                </span>
              ) : status === "success" ? (
                "Uploaded"
              ) : (
                "Upload File"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
