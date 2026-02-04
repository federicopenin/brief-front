export interface HistoryItem {
  id: string;
  originalFilename: string;
  createdAt: string;
  expiresAt: string;
  briefContent?: string | null;
}

export type HistoryDownloadFormat = "psd" | "png" | "pdf";
