export interface PsdLayer {
  id: string;
  name: string;
  type: "text" | "smart_object" | "image" | "group";
  safeName: string;
  width: number;
  height: number;
  children?: PsdLayer[];
}

export interface PsdStructure {
  width: number;
  height: number;
  layers: PsdLayer[];
}

export interface PsdUploadResponse {
  filename: string;
  structure: PsdStructure;
}

export interface PsdModifyResponse {
  status: string;
  modifiedFilename: string;
  message?: string;
  historyId?: string;
}

export interface EditFullRequest {
  filename: string;
  prompt: string;
}

export interface EditFullResponse {
  status: "success" | "error";
  modifiedFilename?: string;
  message?: string;
  historyId?: string;
}

export interface FlatLayer {
  id: string;
  name: string;
  safeName: string;
  type: "text" | "smart_object" | "image" | "group";
  depth: number;
}

export type DownloadFormat = "psd" | "png" | "pdf";

export interface DownloadUrls {
  psd: string;
  png: string;
  pdf: string;
}
