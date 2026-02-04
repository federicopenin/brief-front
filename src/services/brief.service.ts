import type { Brief } from "@/types";
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

export async function getBriefs(): Promise<Brief[]> {
  const response = await fetch("/api/brief");
  return handleResponse<Brief[]>(response, "Failed to load briefs");
}

export async function getBrief(id: string): Promise<Brief> {
  const response = await fetch(`/api/brief/${id}`);
  return handleResponse<Brief>(response, "Failed to load brief");
}

export async function createBrief(content: string): Promise<Brief> {
  const response = await fetch("/api/brief", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content }),
  });
  return handleResponse<Brief>(response, "Failed to create brief");
}

export async function updateBrief(id: string, content: string): Promise<Brief> {
  const response = await fetch(`/api/brief/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content }),
  });
  return handleResponse<Brief>(response, "Failed to update brief");
}

export async function deleteBrief(id: string): Promise<void> {
  const response = await fetch(`/api/brief/${id}`, {
    method: "DELETE",
  });

  if (response.status === 401) {
    toast.error("Session expired. Redirecting to login...");
    setTimeout(() => {
      window.location.href = "/login";
    }, 3500);
    throw new SessionExpiredError();
  }

  if (!response.ok) {
    throw new Error(`Failed to delete brief: ${response.statusText}`);
  }
}
