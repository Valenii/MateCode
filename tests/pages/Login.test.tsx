import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { Login } from '../../src/pages/Login';
import { AuthProvider } from '../../src/hooks/useAuth';

describe('Login Page', () => {
  it('debe renderizar el formulario de inicio de sesión', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('Bienvenido de nuevo')).toBeInTheDocument();
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ingresar al panel/i })).toBeInTheDocument();
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
});
