import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TodoForm } from '../../src/components/TodoForm';

describe('TodoForm Component', () => {
  it('debe renderizar el campo de entrada principal', () => {
    render(<TodoForm onAddTask={vi.fn()} />);
    expect(screen.getByPlaceholderText(/ej: presentar informe de ventas/i)).toBeInTheDocument();
  });

  it('debe enviar la nueva tarea al completar el formulario', async () => {
    const handleAdd = vi.fn();
    render(<TodoForm onAddTask={handleAdd} />);

    const input = screen.getByPlaceholderText(/ej: presentar informe de ventas/i);
    await act(async () => {
      fireEvent.change(input, { target: { value: 'Completar integración de AWS SES' } });
    });

    const submitBtn = screen.getByRole('button', { name: /crear tarea/i });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(handleAdd).toHaveBeenCalledTimes(1);
    expect(handleAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Completar integración de AWS SES',
        completed: false,
      })
    );
  });
});
