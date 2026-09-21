import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { Register } from '../../src/pages/Register';
import { AuthProvider } from '../../src/hooks/useAuth';

describe('Register Page', () => {
  it('debe renderizar el formulario de registro con todos los campos', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { name: /crear una cuenta/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/nombre completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^contraseña/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirmar contraseña/i)).toBeInTheDocument();
  });

  it('debe advertir si las contraseñas no coinciden', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/nombre completo/i), { target: { value: 'Valentina' } });
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: 'valentina@matecode.com' } });
    fireEvent.change(screen.getByLabelText(/^contraseña/i), { target: { value: '123456' } });
    fireEvent.change(screen.getByLabelText(/confirmar contraseña/i), { target: { value: '654321' } });

    fireEvent.click(screen.getByRole('button', { name: /crear cuenta y comenzar/i }));

    expect(await screen.findByText(/las contraseñas ingresadas no coinciden/i)).toBeInTheDocument();
  });

  it('debe registrar exitosamente un nuevo usuario', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/nombre completo/i), { target: { value: 'Nuevo Empleado' } });
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: 'nuevo.usuario@empresa.com' } });
    fireEvent.change(screen.getByLabelText(/^contraseña/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirmar contraseña/i), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: /crear cuenta y comenzar/i }));

    // No debe mostrar errores
    expect(screen.queryByText(/las contraseñas ingresadas no coinciden/i)).not.toBeInTheDocument();
  });
});

