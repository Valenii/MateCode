import { useState, useEffect, useCallback } from 'react';
import { Task, CreateTaskDTO, UpdateTaskDTO, TaskFilterStatus, TaskPriority, TaskCategory, TaskStats } from '../types/task';
import {
  fetchTasks,
  subscribeToTasks,
  createTask,
  updateTask,
  deleteTask,
} from '../features/tasks/taskService';
import { calculateTaskStats, filterTasks } from '../features/tasks/taskUtils';
import { notifyTaskCreated, notifyTaskCompleted } from '../services/api';
import { useAuth } from './useAuth';

export const useTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Filtros
  const [filterStatus, setFilterStatus] = useState<TaskFilterStatus>('all');
  const [filterPriority, setFilterPriority] = useState<TaskPriority | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<TaskCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const showToast = (message: string) => {
    setNotificationMsg(message);
    setTimeout(() => {
      setNotificationMsg(null);
    }, 4000);
  };

  // Carga y suscripción en tiempo real
  useEffect(() => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    let unsubscribe: () => void = () => {};

    try {
      unsubscribe = subscribeToTasks(user.uid, (updatedTasks) => {
        setTasks(updatedTasks);
        setLoading(false);
      });
    } catch (err: any) {
      console.warn('Error subscribing, fetching manually:', err);
      fetchTasks(user.uid)
        .then((data) => {
          setTasks(data);
        })
        .finally(() => setLoading(false));
    }

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [user]);

  // Agregar Tarea + Notificación por Email opcional
  const handleAddTask = useCallback(
    async (taskData: CreateTaskDTO) => {
      if (!user) return;
      try {
        setError(null);
        const newTask = await createTask(user.uid, taskData);
        
        // Optimistic / Fallback update
        setTasks((prev) => [newTask, ...prev.filter((t) => t.id !== newTask.id)]);

        // Si se seleccionó notificación por email con AWS SES
        if (taskData.notifyEmail && user.email) {
          showToast(`📧 Tarea creada. Enviando notificación vía AWS SES a ${user.email}...`);
          const emailRes = await notifyTaskCreated(
            user.email,
            taskData.title,
            taskData.priority,
            taskData.category,
            taskData.dueDate
          );
          if (emailRes.success) {
            showToast(`✅ Tarea creada y email enviado exitosamente.`);
          }
        } else {
          showToast('✅ Tarea creada correctamente.');
        }
      } catch (err: any) {
        console.error('Error adding task:', err);
        setError('No se pudo guardar la tarea. Intenta de nuevo.');
      }
    },
    [user]
  );

  // Actualizar Tarea
  const handleUpdateTask = useCallback(
    async (taskId: string, updates: UpdateTaskDTO) => {
      if (!user) return;
      try {
        setError(null);
        await updateTask(user.uid, taskId, updates);
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t))
        );
        showToast('✅ Tarea actualizada.');
      } catch (err: any) {
        console.error('Error updating task:', err);
        setError('No se pudo actualizar la tarea.');
      }
    },
    [user]
  );

  // Alternar Completado + Notificación opcional
  const handleToggleComplete = useCallback(
    async (taskId: string, currentStatus: boolean, taskTitle: string, notifyEmail?: boolean) => {
      if (!user) return;
      const nextStatus = !currentStatus;
      try {
        await updateTask(user.uid, taskId, { completed: nextStatus });
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, completed: nextStatus } : t))
        );

        if (nextStatus) {
          showToast(`🎉 ¡Tarea "${taskTitle}" completada!`);
          if (notifyEmail && user.email) {
            notifyTaskCompleted(user.email, taskTitle).then(() => {
              showToast(`📧 Confirmación de avance enviada vía AWS SES.`);
            });
          }
        }
      } catch (err: any) {
        console.error('Error toggling complete:', err);
        setError('Error al cambiar el estado de la tarea.');
      }
    },
    [user]
  );

  // Eliminar Tarea
  const handleDeleteTask = useCallback(
    async (taskId: string) => {
      if (!user) return;
      try {
        await deleteTask(user.uid, taskId);
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
        showToast('🗑️ Tarea eliminada.');
      } catch (err: any) {
        console.error('Error deleting task:', err);
        setError('No se pudo eliminar la tarea.');
      }
    },
    [user]
  );

  const filteredTasks = filterTasks(tasks, filterStatus, filterPriority, filterCategory, searchQuery);
  const stats: TaskStats = calculateTaskStats(tasks);

  return {
    tasks: filteredTasks,
    allTasksCount: tasks.length,
    stats,
    loading,
    error,
    notificationMsg,
    filterStatus,
    setFilterStatus,
    filterPriority,
    setFilterPriority,
    filterCategory,
    setFilterCategory,
    searchQuery,
    setSearchQuery,
    addTask: handleAddTask,
    updateTask: handleUpdateTask,
    toggleComplete: handleToggleComplete,
    deleteTask: handleDeleteTask,
  };
};
