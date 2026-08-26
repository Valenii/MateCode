import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TodoItem } from '../../src/components/TodoItem';
import { Task } from '../../src/types/task';

const mockTask: Task = {
  id: 'task-123',
  userId: 'user-1',
  title: 'Implementar autenticación BaaS',
  description: 'Conectar Firebase Auth',
  completed: false,
  priority: 'high',
  category: 'work',
  dueDate: '2026-09-01T00:00:00.000Z',
  createdAt: '2026-08-26T00:00:00.000Z',
  updatedAt: '2026-08-26T00:00:00.000Z',
  notifyEmail: true,
};

describe('TodoItem Component', () => {
  it('debe renderizar el título y descripción de la tarea', () => {
    render(
      <TodoItem
        task={mockTask}
        onToggleComplete={vi.fn()}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText('Implementar autenticación BaaS')).toBeInTheDocument();
    expect(screen.getByText('Conectar Firebase Auth')).toBeInTheDocument();
    expect(screen.getByText('Alta')).toBeInTheDocument();
    expect(screen.getByText('Trabajo')).toBeInTheDocument();
  });

  it('debe llamar a onToggleComplete al hacer clic en el checkbox', () => {
    const handleToggle = vi.fn();
    render(
      <TodoItem
        task={mockTask}
        onToggleComplete={handleToggle}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(handleToggle).toHaveBeenCalledWith('task-123', false, 'Implementar autenticación BaaS', true);
  });

  it('debe llamar a onDelete al hacer clic en el botón de eliminar', () => {
    const handleDelete = vi.fn();
    render(
      <TodoItem
        task={mockTask}
        onToggleComplete={vi.fn()}
        onUpdate={vi.fn()}
        onDelete={handleDelete}
      />
    );

    const deleteBtn = screen.getByLabelText('Eliminar tarea');
    fireEvent.click(deleteBtn);

    expect(handleDelete).toHaveBeenCalledWith('task-123');
  });
});
