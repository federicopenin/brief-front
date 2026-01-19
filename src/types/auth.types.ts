export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  uuid: string;
  email: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface SessionResponse {
  authenticated: boolean;
  user?: User;
}
