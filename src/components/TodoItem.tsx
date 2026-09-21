import React, { useState } from 'react';
import { Task, UpdateTaskDTO } from '../types/task';
import { formatDate, getPriorityLabel, getPriorityColor, getCategoryLabel } from '../utils/formatters';
import { Check, Trash2, Edit2, Calendar, Mail, Save, X } from 'lucide-react';
import { Button } from './Button';

export interface TodoItemProps {
  task: Task;
  onToggleComplete: (taskId: string, currentStatus: boolean, title: string, notifyEmail?: boolean) => void;
  onUpdate: (taskId: string, updates: UpdateTaskDTO) => void;
  onDelete: (taskId: string) => void;
}

export const TodoItem: React.FC<TodoItemProps> = ({
  task,
  onToggleComplete,
  onUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDescription, setEditedDescription] = useState(task.description || '');
  const [editedPriority, setEditedPriority] = useState(task.priority);
  const [editedCategory, setEditedCategory] = useState(task.category);
  const [editedDueDate, setEditedDueDate] = useState(task.dueDate || '');
  const [editedNotifyEmail, setEditedNotifyEmail] = useState(task.notifyEmail || false);

  const priorityStyle = getPriorityColor(task.priority);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editedTitle.trim()) return;

    onUpdate(task.id, {
      title: editedTitle.trim(),
      description: editedDescription.trim(),
      priority: editedPriority,
      category: editedCategory,
      dueDate: editedDueDate || undefined,
      notifyEmail: editedNotifyEmail,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTitle(task.title);
    setEditedDescription(task.description || '');
    setEditedPriority(task.priority);
    setEditedCategory(task.category);
    setEditedDueDate(task.dueDate || '');
    setEditedNotifyEmail(task.notifyEmail || false);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <form onSubmit={handleSave} className="glass-card animate-fade-in" style={{ padding: '1.25rem', marginBottom: '1rem', border: '1px solid #3b82f6' }}>
        <div className="form-group">
          <label className="form-label" htmlFor={`edit-title-${task.id}`}>Título de la tarea</label>
          <input
            id={`edit-title-${task.id}`}
            type="text"
            className="form-input"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor={`edit-desc-${task.id}`}>Descripción</label>
          <textarea
            id={`edit-desc-${task.id}`}
            className="form-textarea"
            rows={2}
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Prioridad</label>
            <select
              className="form-select"
              value={editedPriority}
              onChange={(e) => setEditedPriority(e.target.value as any)}
            >
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
              <option value="urgent">Urgente</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Categoría</label>
            <select
              className="form-select"
              value={editedCategory}
              onChange={(e) => setEditedCategory(e.target.value as any)}
            >
              <option value="strategic">Estratégica</option>
              <option value="work">Trabajo</option>
              <option value="finance">Finanzas</option>
              <option value="learning">Capacitación</option>
              <option value="personal">Personal</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Calendar size={14} color="#ffffff" />
              <span>Fecha Límite</span>
            </label>
            <input
              type="date"
              className="form-input"
              value={editedDueDate ? editedDueDate.substring(0, 10) : ''}
              onChange={(e) => setEditedDueDate(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <input
            type="checkbox"
            id={`edit-notify-${task.id}`}
            checked={editedNotifyEmail}
            onChange={(e) => setEditedNotifyEmail(e.target.checked)}
            style={{ width: '16px', height: '16px', accentColor: '#3b82f6' }}
          />
          <label htmlFor={`edit-notify-${task.id}`} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            Notificar por email vía AWS SES al completar
          </label>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          <Button type="button" variant="secondary" size="sm" onClick={handleCancel} leftIcon={<X size={14} />}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" size="sm" leftIcon={<Save size={14} />}>
            Guardar Cambios
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div
      className="glass-card animate-fade-in"
      style={{
        padding: '1.1rem 1.25rem',
        marginBottom: '0.85rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        borderLeft: `4px solid ${priorityStyle.border}`,
        opacity: task.completed ? 0.75 : 1,
        transition: 'all var(--transition-normal)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
        {/* Checkbox and Title */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', flex: 1 }}>
          <button
            type="button"
            role="checkbox"
            aria-checked={task.completed}
            aria-label={task.completed ? 'Marcar tarea como pendiente' : 'Marcar tarea como completada'}
            onClick={() => onToggleComplete(task.id, task.completed, task.title, task.notifyEmail)}
            style={{
              marginTop: '2px',
              width: '22px',
              height: '22px',
              borderRadius: '6px',
              border: `2px solid ${task.completed ? 'var(--accent-emerald)' : 'var(--text-muted)'}`,
              background: task.completed ? 'var(--accent-emerald)' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#ffffff',
              transition: 'all var(--transition-fast)',
              flexShrink: 0,
            }}
          >
            {task.completed && <Check size={14} strokeWidth={3} />}
          </button>

          <div style={{ flex: 1 }}>
            <h3
              style={{
                fontSize: '1.05rem',
                lineHeight: 1.35,
                color: task.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                textDecoration: task.completed ? 'line-through' : 'none',
                fontWeight: 600,
                wordBreak: 'break-word',
              }}
            >
              {task.title}
            </h3>

            {task.description && (
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)',
                  marginTop: '0.35rem',
                  lineHeight: 1.45,
                  wordBreak: 'break-word',
                }}
              >
                {task.description}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
          <button
            type="button"
            className="btn btn-secondary btn-icon"
            onClick={() => setIsEditing(true)}
            aria-label="Editar tarea"
            title="Editar tarea"
            style={{ width: '32px', height: '32px', padding: 0 }}
          >
            <Edit2 size={14} />
          </button>
          <button
            type="button"
            className="btn btn-danger btn-icon"
            onClick={() => onDelete(task.id)}
            aria-label="Eliminar tarea"
            title="Eliminar tarea"
            style={{ width: '32px', height: '32px', padding: 0 }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Badges & Meta Info */}
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', paddingTop: '0.4rem', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        {/* Priority Badge */}
        <span
          className="badge"
          style={{
            background: priorityStyle.bg,
            color: priorityStyle.text,
            border: `1px solid ${priorityStyle.border}`,
          }}
        >
          {getPriorityLabel(task.priority)}
        </span>

        {/* Category Badge */}
        <span
          className="badge"
          style={{
            background: 'rgba(148, 163, 184, 0.1)',
            color: '#cbd5e1',
            border: '1px solid rgba(148, 163, 184, 0.2)',
          }}
        >
          {getCategoryLabel(task.category)}
        </span>

        {/* Due Date */}
        {task.dueDate && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.75rem',
              color: '#f8fafc',
              marginLeft: 'auto',
            }}
          >
            <Calendar size={13} color="#ffffff" />
            {formatDate(task.dueDate)}
          </span>
        )}

        {/* SES Notification Indicator */}
        {task.notifyEmail && (
          <span
            title="Notificaciones activas vía AWS SES"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.75rem',
              color: '#38bdf8',
              background: 'rgba(56, 189, 248, 0.1)',
              padding: '0.15rem 0.4rem',
              borderRadius: '4px',
            }}
          >
            <Mail size={12} />
            AWS SES
          </span>
        )}
      </div>
    </div>
  );
};
