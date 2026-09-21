import { Task, TaskStats, TaskFilterStatus, TaskPriority, TaskCategory } from '../../types/task';

/**
 * Calcula estadísticas y métricas clave de las tareas del usuario
 */
export const calculateTaskStats = (tasks: Task[]): TaskStats => {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;
  const highPriority = tasks.filter((t) => !t.completed && (t.priority === 'high' || t.priority === 'urgent')).length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    total,
    completed,
    pending,
    highPriority,
    completionRate,
  };
};

/**
 * Filtra tareas según estado, prioridad, categoría y texto de búsqueda
 */
export const filterTasks = (
  tasks: Task[],
  status: TaskFilterStatus = 'all',
  priority?: TaskPriority | 'all',
  category?: TaskCategory | 'all',
  searchQuery: string = ''
): Task[] => {
  return tasks.filter((task) => {
    // Filtro por estado
    if (status === 'pending' && task.completed) return false;
    if (status === 'completed' && !task.completed) return false;

    // Filtro por prioridad
    if (priority && priority !== 'all' && task.priority !== priority) return false;

    // Filtro por categoría
    if (category && category !== 'all' && task.category !== category) return false;

    // Filtro por búsqueda
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const titleMatch = task.title.toLowerCase().includes(q);
      const descMatch = (task.description || '').toLowerCase().includes(q);
      if (!titleMatch && !descMatch) return false;
    }

    return true;
  });
};
