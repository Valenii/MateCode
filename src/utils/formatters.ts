import { TaskPriority, TaskCategory } from '../types/task';

/**
 * Formatea una fecha ISO a un formato legible en español.
 */
export const formatDate = (isoString?: string): string => {
  if (!isoString) return 'Sin fecha';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'Fecha inválida';
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return 'Fecha inválida';
  }
};

/**
 * Formatea una fecha y hora ISO para detalle.
 */
export const formatDateTime = (isoString?: string): string => {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return '';
  }
};

/**
 * Etiqueta legible en español para prioridades.
 */
export const getPriorityLabel = (priority: TaskPriority): string => {
  const labels: Record<TaskPriority, string> = {
    low: 'Baja',
    medium: 'Media',
    high: 'Alta',
    urgent: 'Urgente',
  };
  return labels[priority] || priority;
};

/**
 * Colores / clases para prioridades.
 */
export const getPriorityColor = (priority: TaskPriority): { bg: string; text: string; border: string } => {
  switch (priority) {
    case 'urgent':
      return { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444', border: '#ef4444' };
    case 'high':
      return { bg: 'rgba(249, 115, 22, 0.15)', text: '#f97316', border: '#f97316' };
    case 'medium':
      return { bg: 'rgba(234, 179, 8, 0.15)', text: '#eab308', border: '#eab308' };
    case 'low':
    default:
      return { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6', border: '#3b82f6' };
  }
};

/**
 * Etiqueta legible en español para categorías.
 */
export const getCategoryLabel = (category: TaskCategory): string => {
  const labels: Record<TaskCategory, string> = {
    strategic: 'Estratégica',
    work: 'Trabajo',
    finance: 'Finanzas',
    learning: 'Capacitación',
    personal: 'Personal',
  };
  return labels[category] || category;
};
