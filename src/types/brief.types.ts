export interface Brief {
  id: string;
  userUuid: string;
  content: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBriefRequest {
  content: string;
}

export interface UpdateBriefRequest {
  content: string;
}
