import React from 'react';
import { Task, UpdateTaskDTO } from '../types/task';
import { TodoItem } from './TodoItem';
import { Inbox } from 'lucide-react';

export interface TodoListProps {
  tasks: Task[];
  loading?: boolean;
  onToggleComplete: (taskId: string, currentStatus: boolean, title: string, notifyEmail?: boolean) => void;
  onUpdate: (taskId: string, updates: UpdateTaskDTO) => void;
  onDelete: (taskId: string) => void;
}

export const TodoList: React.FC<TodoListProps> = ({
  tasks,
  loading = false,
  onToggleComplete,
  onUpdate,
  onDelete,
}) => {
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '2rem 0', alignItems: 'center' }}>
        <div className="spinner" style={{ width: '2rem', height: '2rem', borderWidth: '3px' }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Sincronizando tareas con Cloud Firestore...</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div
        className="glass-card animate-fade-in"
        style={{
          padding: '3rem 1.5rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.75rem',
          color: 'var(--text-secondary)',
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'rgba(59, 130, 246, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#60a5fa',
            marginBottom: '0.5rem',
          }}
        >
          <Inbox size={28} />
        </div>
        <h4 style={{ fontSize: '1.15rem', color: 'var(--text-primary)' }}>No hay tareas para mostrar</h4>
        <p style={{ fontSize: '0.9rem', maxWidth: '380px' }}>
          No se encontraron actividades con los filtros actuales. ¡Crea una nueva tarea para comenzar a organizar tu día!
        </p>
      </div>
    );
  }

  return (
    <div className="todo-list" style={{ display: 'flex', flexDirection: 'column' }}>
      {tasks.map((task) => (
        <TodoItem
          key={task.id}
          task={task}
          onToggleComplete={onToggleComplete}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
