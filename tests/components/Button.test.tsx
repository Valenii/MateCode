import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from '../../src/components/Button';

describe('Button Component', () => {
  it('debe renderizar el texto del botón correctamente', () => {
    render(<Button>Guardar Tarea</Button>);
    expect(screen.getByRole('button', { name: /guardar tarea/i })).toBeInTheDocument();
  });

  it('debe ejecutar el callback onClick al hacer clic', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Hacer Clic</Button>);

    fireEvent.click(screen.getByRole('button', { name: /hacer clic/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('debe deshabilitarse y mostrar el spinner cuando isLoading es true', () => {
    render(<Button isLoading>Cargando...</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(screen.getByTestId('button-spinner')).toBeInTheDocument();
  });

  it('debe aplicar la clase de variante correspondiente', () => {
    const { container } = render(<Button variant="danger">Eliminar</Button>);
    expect(container.querySelector('.btn-danger')).toBeInTheDocument();
  });
});
