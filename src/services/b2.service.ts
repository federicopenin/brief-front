import type {
  PresignedUploadResponse,
  PresignedDownloadResponse,
  UploadProgress,
} from "@/types";
import type { HistoryDownloadFormat } from "@/types";
import { toast } from "sonner";

class SessionExpiredError extends Error {
  constructor() {
    super("Session expired");
    this.name = "SessionExpiredError";
  }
}

async function handleResponse<T>(
  response: Response,
  errorMsg: string,
): Promise<T> {
  if (response.status === 401) {
    toast.error("Session expired. Redirecting to login...");
    setTimeout(() => {
      window.location.href = "/login";
    }, 3500);
    throw new SessionExpiredError();
  }

  if (!response.ok) {
    throw new Error(`${errorMsg}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get a presigned URL for uploading a file directly to B2
 */
export async function getPresignedUploadUrl(
  fileName: string,
  fileType: string = "application/octet-stream",
): Promise<PresignedUploadResponse> {
  const response = await fetch("/api/psd/presign-upload", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fileName, fileType }),
  });

  return handleResponse<PresignedUploadResponse>(
    response,
    "Failed to get upload URL",
  );
}

/**
 * Upload a file directly to B2 using XMLHttpRequest for progress tracking.
 * This does NOT load the file into memory as a base64 string.
 */
export function uploadToB2(
  file: File,
  uploadUrl: string,
  onProgress?: (progress: UploadProgress) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress({
          loaded: event.loaded,
          total: event.total,
          percentage: Math.round((event.loaded / event.total) * 100),
        });
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });

    xhr.addEventListener("error", () => {
      reject(new Error("Upload failed due to network error"));
    });

    xhr.addEventListener("abort", () => {
      reject(new Error("Upload was aborted"));
    });

    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", "application/octet-stream");
    xhr.send(file);
  });
}

/**
 * Notify the backend that an upload is complete and process the file
 */
export async function processUploadedFile(
  fileKey: string,
  originalFilename: string,
): Promise<{
  filename: string;
  structure: unknown;
}> {
  const response = await fetch("/api/psd/process", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fileKey, originalFilename }),
  });

  return handleResponse(response, "Failed to process uploaded file");
}

/**
 * Get a presigned URL for downloading a file from B2
 */
export async function getPresignedDownloadUrl(
  filename: string,
): Promise<PresignedDownloadResponse> {
  const response = await fetch("/api/psd/presign-download", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ filename }),
  });

  return handleResponse<PresignedDownloadResponse>(
    response,
    "Failed to get download URL",
  );
}

/**
 * Get a presigned URL for downloading a history item from B2
 */
export async function getHistoryPresignedDownloadUrl(
  historyId: string,
  format: HistoryDownloadFormat = "psd",
): Promise<PresignedDownloadResponse> {
  const response = await fetch(`/api/history/${historyId}/presign-download`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ format }),
  });

  return handleResponse<PresignedDownloadResponse>(
    response,
    "Failed to get download URL",
  );
}

/**
 * Trigger a native browser download without loading the file into JS memory.
 * Uses a temporary anchor element with the download attribute.
 */
export function triggerNativeDownload(url: string, filename: string): void {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
