import { API_BASE_URL } from "@/lib/constants";
import type {
  PsdUploadResponse,
  PsdModifyResponse,
  EditFullResponse,
} from "@/types";

export async function uploadPsd(file: File): Promise<PsdUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/psd/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }

  return response.json();
}

export async function modifyLayer(
  filename: string,
  layerId: string,
  prompt: string
): Promise<PsdModifyResponse> {
  const response = await fetch(`${API_BASE_URL}/psd/modify`, {
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

  if (!response.ok) {
    throw new Error(`Modification failed: ${response.statusText}`);
  }

  return response.json();
}

export async function replaceLogo(
  filename: string,
  layerId: string,
  brief: string,
  logo: File
): Promise<PsdModifyResponse> {
  const formData = new FormData();
  formData.append("filename", filename);
  formData.append("layerId", layerId);
  formData.append("brief", brief);
  formData.append("logo", logo);

  const response = await fetch(`${API_BASE_URL}/psd/replace-logo`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Replace logo failed: ${response.statusText}`);
  }

  return response.json();
}

export async function editFullPsd(
  filename: string,
  prompt: string
): Promise<EditFullResponse> {
  const response = await fetch(`${API_BASE_URL}/psd/edit-full`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      filename,
      prompt,
    }),
  });

  if (!response.ok) {
    throw new Error(`Full edit failed: ${response.statusText}`);
  }

  return response.json();
}
