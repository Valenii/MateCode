export interface AuthResponse {
  success: boolean;
  user?: {
    uid: string;
    email: string;
    displayName?: string;
  };
  error?: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  displayName?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
