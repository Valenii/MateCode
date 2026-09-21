export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt?: string;
}

export interface SavedAccount {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  lastUsed?: string;
  isDemo?: boolean;
}

export interface AuthCredentials {
  email: string;
  password: string;
  displayName?: string;
}

export interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  isDemo: boolean;
}

