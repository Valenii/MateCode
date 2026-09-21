import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  verifyPasswordResetCode,
  confirmPasswordReset,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../../services/firebase';
import { RegisterCredentials, LoginCredentials, AuthResponse, SavedAccount } from './authTypes';
import { UserProfile } from '../../types/user';

const DEMO_USER_KEY = 'matecode_demo_user';
const DEMO_ACCOUNTS_KEY = 'matecode_demo_registered_accounts';
const SAVED_ACCOUNTS_KEY = 'matecode_saved_accounts_history';

interface DemoAccount {
  uid: string;
  email: string;
  password?: string;
  displayName?: string;
  photoURL?: string;
  createdAt: string;
}

export const getDemoAccounts = (): DemoAccount[] => {
  try {
    const stored = localStorage.getItem(DEMO_ACCOUNTS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        const clean = parsed.filter(
          (a: DemoAccount) =>
            !a.email.toLowerCase().includes('empleado@matecode.com') &&
            !a.email.toLowerCase().includes('valentina.morales@gmail.com') &&
            !a.displayName?.toLowerCase().includes('empleado') &&
            !a.displayName?.toLowerCase().includes('demo') &&
            !a.displayName?.toLowerCase().includes('valentina morales')
        );
        if (clean.length !== parsed.length) {
          localStorage.setItem(DEMO_ACCOUNTS_KEY, JSON.stringify(clean));
        }
        return clean;
      }
    }
  } catch (err) {
    console.error('Error reading registered accounts:', err);
  }

  return [];
};

const saveDemoAccounts = (accounts: DemoAccount[]): void => {
  try {
    const clean = accounts.filter(
      (a: DemoAccount) =>
        !a.email.toLowerCase().includes('empleado@matecode.com') &&
        !a.email.toLowerCase().includes('valentina.morales@gmail.com') &&
        !a.displayName?.toLowerCase().includes('empleado') &&
        !a.displayName?.toLowerCase().includes('demo') &&
        !a.displayName?.toLowerCase().includes('valentina morales')
    );
    localStorage.setItem(DEMO_ACCOUNTS_KEY, JSON.stringify(clean));
  } catch (err) {
    console.error('Error saving accounts:', err);
  }
};

/**
 * Obtiene la lista de cuentas conocidas/guardadas en este dispositivo (sin duplicados)
 */
export const getSavedAccounts = (): SavedAccount[] => {
  try {
    const stored = localStorage.getItem(SAVED_ACCOUNTS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        const seenNames = new Set<string>();
        const seenEmails = new Set<string>();
        const clean: SavedAccount[] = [];

        for (const a of parsed) {
          if (!a || !a.email) continue;
          
          const emailLower = a.email.toLowerCase();
          const isDemoOrMock =
            emailLower.includes('empleado@matecode.com') ||
            emailLower.includes('valentina.morales@gmail.com') ||
            a.uid?.includes('google-demo') ||
            a.displayName?.toLowerCase().includes('empleado') ||
            a.displayName?.toLowerCase().includes('valentina morales') ||
            a.displayName?.toLowerCase().includes('(google)');

          if (isDemoOrMock) continue;

          // Normalizar nombre base (ej. 'valentina' o nombre completo)
          const baseName = (a.displayName || a.email.split('@')[0])
            .toLowerCase()
            .trim();

          // Si ya existe una cuenta de la misma persona o mismo correo, solo conservar una
          if (seenEmails.has(emailLower) || seenNames.has(baseName)) {
            continue;
          }

          seenEmails.add(emailLower);
          seenNames.add(baseName);
          clean.push(a);
        }

        if (clean.length !== parsed.length) {
          localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(clean));
        }
        return clean;
      }
    }
  } catch (err) {
    console.error('Error reading saved accounts:', err);
  }

  return [];
};

/**
 * Guarda o actualiza una cuenta en el historial del dispositivo
 */
export const saveAccountToHistory = (account: SavedAccount): SavedAccount[] => {
  try {
    const current = getSavedAccounts();
    const filtered = current.filter(
      (a) => a.email.toLowerCase() !== account.email.toLowerCase()
    );
    const updated: SavedAccount[] = [
      {
        ...account,
        lastUsed: new Date().toISOString(),
      },
      ...filtered,
    ];
    localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Error saving account to history:', err);
    return [];
  }
};

/**
 * Elimina una cuenta del listado de cuentas guardadas en el dispositivo
 */
export const removeSavedAccount = (email: string): SavedAccount[] => {
  try {
    const current = getSavedAccounts();
    const updated = current.filter((a) => a.email.toLowerCase() !== email.toLowerCase());
    localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Error removing saved account:', err);
    return [];
  }
};

/**
 * Inicia sesión utilizando Google OAuth real a través de Firebase Authentication
 */
export const signInWithGoogle = async (): Promise<AuthResponse> => {
  if (!isFirebaseConfigured || !auth) {
    return {
      success: false,
      error: 'Firebase no está configurado. Revisa las variables en tu archivo .env',
    };
  }

  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, provider);
    const fbUser = result.user;

    const profile: UserProfile = {
      uid: fbUser.uid,
      email: fbUser.email || '',
      displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Usuario Google',
      photoURL: fbUser.photoURL || undefined,
      createdAt: fbUser.metadata.creationTime || new Date().toISOString(),
    };

    saveAccountToHistory({
      uid: profile.uid,
      email: profile.email,
      displayName: profile.displayName,
      photoURL: profile.photoURL,
      isDemo: false,
    });

    return {
      success: true,
      user: profile,
    };
  } catch (error: any) {
    if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
      return { success: false, error: 'Inicio de sesión con Google cancelado.' };
    }
    if (error.code === 'auth/operation-not-allowed') {
      return {
        success: false,
        error: 'El proveedor Google aún no está habilitado en tu Firebase Console. Ve a Firebase > Authentication > Sign-in method y activa Google.',
      };
    }
    if (error.code === 'auth/unauthorized-domain') {
      return {
        success: false,
        error: 'Dominio no autorizado en Firebase. Agrega localhost en Firebase Console > Authentication > Settings > Authorized domains.',
      };
    }
    return {
      success: false,
      error: `Error al iniciar sesión con Google: ${error.message || 'Inténtalo nuevamente.'}`,
    };
  }
};

/**
 * Registra un nuevo usuario en Firebase Auth o modo Demo
 */
export const registerUser = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
  const { email, password, displayName, photoURL } = credentials;

  if (isFirebaseConfigured && auth) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName, photoURL });
      }

      const profile: UserProfile = {
        uid: userCredential.user.uid,
        email: userCredential.user.email || email,
        displayName: displayName || userCredential.user.displayName || undefined,
        photoURL: photoURL || userCredential.user.photoURL || undefined,
      };

      saveAccountToHistory({
        uid: profile.uid,
        email: profile.email,
        displayName: profile.displayName,
        photoURL: profile.photoURL,
        isDemo: false,
      });

      return {
        success: true,
        user: profile,
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

  // Fallback / Modo Demo con validación estricta
  const accounts = getDemoAccounts();
  const existing = accounts.find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
  if (existing) {
    return { success: false, error: 'El correo electrónico ya está registrado en el sistema.' };
  }

  const newAccount: DemoAccount = {
    uid: `demo-${Date.now()}`,
    email: email.trim().toLowerCase(),
    password,
    displayName: displayName?.trim() || email.split('@')[0],
    photoURL,
    createdAt: new Date().toISOString(),
  };

  saveDemoAccounts([...accounts, newAccount]);

  const activeUser: UserProfile = {
    uid: newAccount.uid,
    email: newAccount.email,
    displayName: newAccount.displayName,
    photoURL: newAccount.photoURL,
    createdAt: newAccount.createdAt,
  };
  localStorage.setItem(DEMO_USER_KEY, JSON.stringify(activeUser));

  saveAccountToHistory({
    uid: activeUser.uid,
    email: activeUser.email,
    displayName: activeUser.displayName,
    photoURL: activeUser.photoURL,
    isDemo: true,
  });

  return {
    success: true,
    user: activeUser,
  };
};

/**
 * Inicia sesión con correo y contraseña
 */
export const loginUser = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const { email, password } = credentials;

  if (isFirebaseConfigured && auth) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password || '');
      const profile: UserProfile = {
        uid: userCredential.user.uid,
        email: userCredential.user.email || email,
        displayName: userCredential.user.displayName || undefined,
        photoURL: userCredential.user.photoURL || undefined,
      };

      saveAccountToHistory({
        uid: profile.uid,
        email: profile.email,
        displayName: profile.displayName,
        photoURL: profile.photoURL,
        isDemo: false,
      });

      return {
        success: true,
        user: profile,
      };
    } catch (error: any) {
      let message = 'Credenciales inválidas.';
      if (error.code === 'auth/user-not-found') {
        message = 'Usuario no encontrado. No existe una cuenta registrada con este correo electrónico. Por favor regístrate para comenzar.';
      } else if (error.code === 'auth/wrong-password') {
        message = 'Contraseña incorrecta. Por favor verifica tus credenciales e intenta nuevamente.';
      } else if (error.code === 'auth/invalid-credential') {
        message = 'Usuario no encontrado o contraseña incorrecta. Si aún no tienes cuenta, debes registrarte primero.';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Demasiados intentos fallidos. Por seguridad, intenta nuevamente en unos minutos.';
      }
      return { success: false, error: message };
    }
  }

  // Fallback / Modo Demo con validación de credenciales
  const accounts = getDemoAccounts();
  const foundAccount = accounts.find((a) => a.email.toLowerCase() === email.trim().toLowerCase());

  if (!foundAccount) {
    return {
      success: false,
      error: 'Usuario no encontrado. No existe una cuenta registrada con este correo. Por favor regístrate para acceder al panel.',
    };
  }

  if (password && foundAccount.password && foundAccount.password !== password.trim()) {
    return {
      success: false,
      error: 'Contraseña incorrecta. Por favor verifica tus credenciales e intenta nuevamente.',
    };
  }

  const activeUser: UserProfile = {
    uid: foundAccount.uid,
    email: foundAccount.email,
    displayName: foundAccount.displayName || foundAccount.email.split('@')[0],
    photoURL: foundAccount.photoURL,
    createdAt: foundAccount.createdAt,
  };
  localStorage.setItem(DEMO_USER_KEY, JSON.stringify(activeUser));

  saveAccountToHistory({
    uid: activeUser.uid,
    email: activeUser.email,
    displayName: activeUser.displayName,
    photoURL: activeUser.photoURL,
    isDemo: true,
  });

  return {
    success: true,
    user: activeUser,
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

/**
 * Envía un correo para restablecer la contraseña a través de Firebase Auth o Modo Demo
 */
export const resetPassword = async (
  email: string
): Promise<{ success: boolean; error?: string; message?: string }> => {
  const cleanEmail = email.trim().toLowerCase();

  if (isFirebaseConfigured && auth) {
    try {
      const actionCodeSettings = {
        url: `${window.location.origin}/reset-password`,
        handleCodeInApp: true,
      };
      await sendPasswordResetEmail(auth, cleanEmail, actionCodeSettings);
      return {
        success: true,
        message: `Se ha enviado un enlace para restablecer tu contraseña a ${cleanEmail}. Revisa tu bandeja de entrada o spam.`,
      };
    } catch (error: any) {
      let message = 'No se pudo enviar el correo de recuperación.';
      if (error.code === 'auth/user-not-found') {
        message = 'No existe una cuenta registrada con este correo electrónico.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'El formato del correo electrónico no es válido.';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Demasiados intentos. Por favor espera unos minutos antes de volver a intentar.';
      }
      return { success: false, error: message };
    }
  }

  // Fallback / Modo Demo
  const accounts = getDemoAccounts();
  const exists = accounts.some((a) => a.email.toLowerCase() === cleanEmail);

  if (!exists && !cleanEmail.includes('@')) {
    return { success: false, error: 'Por favor ingresa un correo válido registrado.' };
  }

  return {
    success: true,
    message: `Instrucciones de recuperación enviadas a ${cleanEmail}. Si existe en el sistema, recibirás el enlace en breve.`,
  };
};

/**
 * Verifica que el código de reseteo (oobCode) sea válido antes de mostrar el formulario
 */
export const verifyResetCode = async (
  oobCode: string
): Promise<{ valid: boolean; email?: string; error?: string }> => {
  if (isFirebaseConfigured && auth) {
    try {
      const email = await verifyPasswordResetCode(auth, oobCode);
      return { valid: true, email };
    } catch (error: any) {
      return { valid: false, error: 'El enlace de recuperación ha expirado o ya ha sido utilizado. Por favor solicita uno nuevo.' };
    }
  }

  // Modo Demo
  if (oobCode) {
    return { valid: true, email: 'usuario.demo@matecode.com' };
  }
  return { valid: false, error: 'Código de recuperación inválido.' };
};

/**
 * Confirma y aplica la nueva contraseña usando el oobCode recibido por email
 */
export const confirmNewPassword = async (
  oobCode: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> => {
  if (isFirebaseConfigured && auth) {
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      return { success: true };
    } catch (error: any) {
      let message = 'No se pudo cambiar la contraseña. El enlace puede haber expirado o ser inválido.';
      if (error.code === 'auth/weak-password') {
        message = 'La contraseña ingresada es muy débil. Usa al menos 6 caracteres.';
      }
      return { success: false, error: message };
    }
  }

  // Modo Demo
  return { success: true };
};

