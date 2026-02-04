import type {
  HistoryItem,
  HistoryDownloadFormat,
  PresignedUrlResponse,
} from "@/types";
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

export async function getHistory(): Promise<HistoryItem[]> {
  const response = await fetch("/api/history");
  return handleResponse<HistoryItem[]>(response, "Failed to load history");
}

export function getHistoryDownloadUrl(
  id: string,
  format: HistoryDownloadFormat = "psd",
): string {
  if (format === "psd") {
    return `/api/history/${id}`;
  }
  return `/api/history/${id}/${format}`;
}

export function getHistoryPreviewUrl(id: string): string {
  return `/api/history/${id}/png`;
}

export async function getPresignedDownloadUrl(
  id: string,
  format: HistoryDownloadFormat = "psd",
): Promise<PresignedUrlResponse> {
  const response = await fetch(`/api/history/${id}/url/${format}`);
  return handleResponse<PresignedUrlResponse>(
    response,
    "Failed to get download URL",
  );
}
