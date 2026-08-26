/**
 * Valida un formato de correo electrónico estándar.
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Valida una contraseña (mínimo 6 caracteres según Firebase Auth).
 */
export const isValidPassword = (password: string): { isValid: boolean; message?: string } => {
  if (!password || password.length < 6) {
    return { isValid: false, message: 'La contraseña debe tener al menos 6 caracteres.' };
  }
  return { isValid: true };
};

/**
 * Valida los datos requeridos de una tarea.
 */
export const validateTaskInput = (title: string): { isValid: boolean; message?: string } => {
  if (!title || title.trim().length === 0) {
    return { isValid: false, message: 'El título de la tarea es obligatorio.' };
  }
  if (title.trim().length < 3) {
    return { isValid: false, message: 'El título debe contener al menos 3 caracteres.' };
  }
  if (title.trim().length > 120) {
    return { isValid: false, message: 'El título no puede exceder los 120 caracteres.' };
  }
  return { isValid: true };
};
