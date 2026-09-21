import { SavedAccount, UserProfile } from '../../types/user';

export interface AuthResponse {
  success: boolean;
  user?: UserProfile;
  error?: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  displayName?: string;
  photoURL?: string;
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

export type { SavedAccount };

