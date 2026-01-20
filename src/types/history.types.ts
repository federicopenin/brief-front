export interface HistoryItem {
  id: string;
  originalFilename: string;
  createdAt: string;
  expiresAt: string;
}

export type HistoryDownloadFormat = "psd" | "png" | "pdf";
