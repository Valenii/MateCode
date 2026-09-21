import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { Login } from '../../src/pages/Login';
import { AuthProvider } from '../../src/hooks/useAuth';
import { signInWithEmailAndPassword } from 'firebase/auth';

describe('Login Page', () => {
  it('debe renderizar el formulario de inicio de sesión', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { name: /acceder/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it('debe mostrar error si el email es inválido', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const passInput = screen.getByLabelText(/contraseña/i);
    const form = emailInput.closest('form')!;

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'email-invalido' } });
      fireEvent.change(passInput, { target: { value: '123456' } });
      fireEvent.submit(form);
    });

    expect(await screen.findByText(/por favor ingresa un correo electrónico válido/i)).toBeInTheDocument();
  });

  it('debe mostrar error y sugerir registro cuando el usuario no está registrado', async () => {
    vi.mocked(signInWithEmailAndPassword).mockRejectedValueOnce({ code: 'auth/user-not-found' });

    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const passInput = screen.getByLabelText(/contraseña/i);
    const form = emailInput.closest('form')!;

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'nadie_registrado@test.com' } });
      fireEvent.change(passInput, { target: { value: 'password123' } });
      fireEvent.submit(form);
    });

    expect(await screen.findByText(/usuario no encontrado/i)).toBeInTheDocument();
    expect(await screen.findByText(/registrarse →/i)).toBeInTheDocument();
  });
});

