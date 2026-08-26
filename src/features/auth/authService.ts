import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../../services/firebase';
import { RegisterCredentials, LoginCredentials, AuthResponse } from './authTypes';
import { UserProfile } from '../../types/user';

const DEMO_USER_KEY = 'matecode_demo_user';

/**
 * Registra un nuevo usuario en Firebase Auth o modo Demo
 */
export const registerUser = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
  const { email, password, displayName } = credentials;

  if (isFirebaseConfigured && auth) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
      }
      return {
        success: true,
        user: {
          uid: userCredential.user.uid,
          email: userCredential.user.email || email,
          displayName: displayName || userCredential.user.displayName || undefined,
        },
      };
    } catch (error: any) {
      let message = 'Ocurrió un error al registrar el usuario.';
      if (error.code === 'auth/email-already-in-use') {
        message = 'El correo electrónico ya está registrado.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'El correo electrónico no es válido.';
      } else if (error.code === 'auth/weak-password') {
        message = 'La contraseña es muy débil (mínimo 6 caracteres).';
      }
      return { success: false, error: message };
    }
  }

  // Fallback / Modo Demo
  const demoUser: UserProfile = {
    uid: `demo-${Date.now()}`,
    email,
    displayName: displayName || email.split('@')[0],
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(DEMO_USER_KEY, JSON.stringify(demoUser));
  return {
    success: true,
    user: demoUser,
  };
};

/**
 * Inicia sesión con correo y contraseña
 */
export const loginUser = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const { email, password } = credentials;

  if (isFirebaseConfigured && auth) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return {
        success: true,
        user: {
          uid: userCredential.user.uid,
          email: userCredential.user.email || email,
          displayName: userCredential.user.displayName || undefined,
        },
      };
    } catch (error: any) {
      let message = 'Credenciales inválidas.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        message = 'Correo o contraseña incorrectos.';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Demasiados intentos fallidos. Intenta más tarde.';
      }
      return { success: false, error: message };
    }
  }

  // Fallback / Modo Demo
  const demoUser: UserProfile = {
    uid: 'demo-user-matecode',
    email,
    displayName: email.split('@')[0],
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(DEMO_USER_KEY, JSON.stringify(demoUser));
  return {
    success: true,
    user: demoUser,
  };
};

/**
 * Cierra la sesión activa
 */
export const logoutUser = async (): Promise<void> => {
  if (isFirebaseConfigured && auth) {
    await signOut(auth);
  }
  localStorage.removeItem(DEMO_USER_KEY);
};

/**
 * Suscribe a los cambios de estado de autenticación
 */
export const onAuthChange = (
  callback: (user: UserProfile | null, isDemo: boolean) => void
): (() => void) => {
  if (isFirebaseConfigured && auth) {
    return onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        callback(
          {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || undefined,
            photoURL: firebaseUser.photoURL || undefined,
          },
          false
        );
      } else {
        callback(null, false);
      }
    });
  }

  // Modo Demo / Fallback
  const stored = localStorage.getItem(DEMO_USER_KEY);
  if (stored) {
    try {
      callback(JSON.parse(stored), true);
    } catch {
      callback(null, true);
    }
  } else {
    callback(null, true);
  }

  return () => {};
};
