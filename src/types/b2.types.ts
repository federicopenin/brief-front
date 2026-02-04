export interface PresignedUploadResponse {
  uploadUrl: string;
  fileKey: string;
}

export interface PresignedDownloadResponse {
  downloadUrl: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}
