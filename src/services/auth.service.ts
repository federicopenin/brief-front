import type { LoginCredentials, User, SessionResponse } from "@/types";

export async function login(credentials: LoginCredentials): Promise<User> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Login failed");
  }

  const data = await response.json();
  return data.user;
}

export async function logout(): Promise<void> {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Logout failed");
  }
}

export async function getSession(): Promise<SessionResponse> {
  const response = await fetch("/api/auth/session", {
    method: "GET",
  });

  if (!response.ok) {
    return { authenticated: false };
  }

  return response.json();
}
