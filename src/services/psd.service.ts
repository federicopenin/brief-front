import type {
  PsdUploadResponse,
  PsdModifyResponse,
  EditFullResponse,
  DownloadFormat,
  DownloadUrls,
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

export function getPreviewUrl(filename: string): string {
  return `/api/psd/preview/${filename}`;
}

export function getDownloadUrls(filename: string): DownloadUrls {
  return {
    psd: `/api/psd/download/${filename}`,
    png: `/api/psd/download/${filename}/png`,
    pdf: `/api/psd/download/${filename}/pdf`,
  };
}

export function getDownloadUrl(
  filename: string,
  format: DownloadFormat = "psd",
): string {
  const urls = getDownloadUrls(filename);
  return urls[format];
}

export async function uploadPsd(file: File): Promise<PsdUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/psd/upload", {
    method: "POST",
    body: formData,
  });

  return handleResponse<PsdUploadResponse>(response, "Upload failed");
}

export async function modifyLayer(
  filename: string,
  layerId: string,
  prompt: string,
): Promise<PsdModifyResponse> {
  const response = await fetch("/api/psd/modify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      filename,
      layerId,
      prompt,
    }),
  });

  return handleResponse<PsdModifyResponse>(response, "Modification failed");
}

export async function replaceLogo(
  filename: string,
  layerId: string,
  brief: string,
  logo: File,
): Promise<PsdModifyResponse> {
  const formData = new FormData();
  formData.append("filename", filename);
  formData.append("layerId", layerId);
  formData.append("brief", brief);
  formData.append("logo", logo);

  const response = await fetch("/api/psd/replace-logo", {
    method: "POST",
    body: formData,
  });

  return handleResponse<PsdModifyResponse>(response, "Replace logo failed");
}

export async function editFullPsd(
  filename: string,
  prompt: string,
): Promise<EditFullResponse> {
  const response = await fetch("/api/psd/edit-full", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      filename,
      prompt,
    }),
  });

  return handleResponse<EditFullResponse>(response, "Full edit failed");
}
