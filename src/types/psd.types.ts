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
  previewUrl: string;
}

export interface PsdModifyResponse {
  status: string;
  downloadUrl: string;
}

export interface EditFullRequest {
  filename: string;
  prompt: string;
}

export interface EditFullResponse {
  status: "success" | "error";
  downloadUrl?: string;
  message?: string;
}

export interface FlatLayer {
  id: string;
  name: string;
  safeName: string;
  type: "text" | "smart_object" | "image" | "group";
  depth: number;
}
