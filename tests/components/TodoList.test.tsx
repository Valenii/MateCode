import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TodoList } from '../../src/components/TodoList';
import { Task } from '../../src/types/task';

const mockTasks: Task[] = [
  {
    id: 't-1',
    userId: 'u-1',
    title: 'Tarea 1 de prueba',
    completed: false,
    priority: 'low',
    category: 'work',
    createdAt: '2026-08-26T00:00:00.000Z',
    updatedAt: '2026-08-26T00:00:00.000Z',
  },
  {
    id: 't-2',
    userId: 'u-1',
    title: 'Tarea 2 de prueba',
    completed: true,
    priority: 'high',
    category: 'strategic',
    createdAt: '2026-08-26T00:00:00.000Z',
    updatedAt: '2026-08-26T00:00:00.000Z',
  },
];

describe('TodoList Component', () => {
  it('debe mostrar el estado vacío si la lista de tareas no contiene elementos', () => {
    render(
      <TodoList
        tasks={[]}
        onToggleComplete={vi.fn()}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText(/no hay tareas para mostrar/i)).toBeInTheDocument();
  });

  it('debe renderizar todas las tareas proporcionadas', () => {
    render(
      <TodoList
        tasks={mockTasks}
        onToggleComplete={vi.fn()}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText('Tarea 1 de prueba')).toBeInTheDocument();
    expect(screen.getByText('Tarea 2 de prueba')).toBeInTheDocument();
  });
});
