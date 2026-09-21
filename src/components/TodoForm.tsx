import React, { useState } from 'react';
import { CreateTaskDTO, TaskPriority, TaskCategory } from '../types/task';
import { validateTaskInput } from '../utils/validations';
import { PlusCircle, Mail, Calendar, AlertCircle } from 'lucide-react';
import { Button } from './Button';

export interface TodoFormProps {
  onAddTask: (task: CreateTaskDTO) => Promise<void> | void;
}

export const TodoForm: React.FC<TodoFormProps> = ({ onAddTask }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [category, setCategory] = useState<TaskCategory>('work');
  const [dueDate, setDueDate] = useState('');
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateTaskInput(title);
    if (!validation.isValid) {
      setError(validation.message || 'Error en los datos ingresados');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await onAddTask({
        title: title.trim(),
        description: description.trim() || undefined,
        completed: false,
        priority,
        category,
        dueDate: dueDate || undefined,
        notifyEmail,
      });

      // Reset form
      setTitle('');
      setDescription('');
      setPriority('medium');
      setCategory('work');
      setDueDate('');
      setNotifyEmail(true);
      setIsExpanded(false);
    } catch (err: any) {
      setError('Ocurrió un problema al agregar la tarea.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
      <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <PlusCircle size={20} color="#38bdf8" />
        <span>Nueva Tarea Estratégica</span>
      </h3>

      {error && (
        <div
          className="animate-fade-in"
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#fca5a5',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Title Input */}
      <div className="form-group">
        <label className="form-label" htmlFor="task-title">
          ¿Qué objetivo o tarea necesitas gestionar? *
        </label>
        <input
          id="task-title"
          type="text"
          className="form-input"
          placeholder="Ej: Presentar informe de ventas Q3 a dirección"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onFocus={() => setIsExpanded(true)}
          required
        />
      </div>

      {/* Collapsible / Detailed fields */}
      {isExpanded && (
        <div className="animate-fade-in">
          <div className="form-group">
            <label className="form-label" htmlFor="task-description">
              Descripción y detalles clave
            </label>
            <textarea
              id="task-description"
              className="form-textarea"
              rows={2}
              placeholder="Detalla pasos, entregables o enlaces relevantes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '1rem',
              marginBottom: '1.25rem',
            }}
          >
            {/* Priority */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="task-priority">Prioridad</label>
              <select
                id="task-priority"
                className="form-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
              >
                <option value="low">🟢 Baja</option>
                <option value="medium">🟡 Media</option>
                <option value="high">🟠 Alta</option>
                <option value="urgent">🔴 Urgente</option>
              </select>
            </div>

            {/* Category */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="task-category">Categoría</label>
              <select
                id="task-category"
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
              >
                <option value="strategic">🎯 Estratégica</option>
                <option value="work">💼 Trabajo</option>
                <option value="finance">💳 Finanzas</option>
                <option value="learning">📚 Capacitación</option>
                <option value="personal">👤 Personal</option>
              </select>
            </div>

            {/* Due Date */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="task-duedate" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Calendar size={15} color="#ffffff" strokeWidth={2.2} />
                <span>Fecha Límite</span>
              </label>
              <input
                id="task-duedate"
                type="date"
                className="form-input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          {/* Email Notification Option (AWS SES) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              background: 'rgba(56, 189, 248, 0.08)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              marginBottom: '1.25rem',
            }}
          >
            <input
              type="checkbox"
              id="notify-email"
              checked={notifyEmail}
              onChange={(e) => setNotifyEmail(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: '#0284c7', cursor: 'pointer' }}
            />
            <label
              htmlFor="notify-email"
              style={{
                fontSize: '0.85rem',
                color: '#e0f2fe',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <Mail size={16} color="#38bdf8" />
              <span>Enviar confirmación de tarea a mi correo por <strong>AWS SES</strong></span>
            </label>
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
        {isExpanded && (
          <Button
            type="button"
            variant="secondary"
            onClick={() => setIsExpanded(false)}
          >
            Contraer
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          leftIcon={<PlusCircle size={18} />}
        >
          Crear Tarea
        </Button>
      </div>
    </form>
  );
};
