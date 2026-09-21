import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { isValidEmail, isValidPassword } from '../utils/validations';
import { Button } from '../components/Button';
import {
  Eye,
  EyeOff,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import { GoogleLogoIcon } from './Login';

export const Register: React.FC = () => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!displayName.trim()) {
      setError('Por favor ingresa tu nombre completo.');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Por favor ingresa un correo electrónico válido.');
      return;
    }

    const passCheck = isValidPassword(password);
    if (!passCheck.isValid) {
      setError(passCheck.message || 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas ingresadas no coinciden.');
      return;
    }

    setError(null);
    setLoading(true);

    const res = await register({
      email,
      password,
      displayName: displayName.trim(),
    });

    setLoading(false);

    if (res.success) {
      navigate('/tasks');
    } else {
      setError(res.error || 'No se pudo crear la cuenta.');
    }
  };

  const handleGoogleSignUp = async () => {
    setError(null);
    setGoogleLoading(true);
    const res = await loginWithGoogle();
    setGoogleLoading(false);

    if (res.success) {
      navigate('/tasks');
    } else if (res.error) {
      setError(res.error);
    }
  };

  return (
    <div className="google-auth-container animate-fade-in">
      <div className="google-card">
        {/* Header */}
        <div className="google-card-header">
          <div className="google-logo-wrapper">
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '0.45rem 1rem',
                borderRadius: 'var(--radius-full)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <GoogleLogoIcon size={22} />
              <span style={{ fontWeight: 700, fontSize: '0.95rem', letterSpacing: '-0.02em', color: '#f8fafc' }}>
                Mate<span className="gradient-text">Code</span>
              </span>
            </div>
          </div>

          <h2 className="google-title">Crear una cuenta</h2>
          <p className="google-subtitle">Empieza a gestionar tus tareas estratégicas</p>
        </div>

        {/* Error notification */}
        {error && (
          <div
            className="animate-fade-in"
            style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.65rem',
            }}
          >
            <AlertCircle size={18} color="#f87171" style={{ flexShrink: 0, marginTop: '2px' }} />
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#fca5a5', lineHeight: 1.4 }}>
              {error}
            </p>
          </div>
        )}

        {/* Botón Registro Rápido con Google */}
        <button
          type="button"
          className="btn-google"
          onClick={handleGoogleSignUp}
          disabled={googleLoading}
          style={{ marginBottom: '1.25rem' }}
        >
          <GoogleLogoIcon size={18} />
          <span>{googleLoading ? 'Conectando con Google...' : 'Registrarse con Google'}</span>
        </button>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            margin: '1.25rem 0',
            color: 'var(--text-muted)',
            fontSize: '0.8rem',
          }}
        >
          <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />
          <span style={{ padding: '0 0.75rem' }}>o con correo</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />
        </div>

        <form onSubmit={handleSubmit}>
          {/* Nombre Completo */}
          <div className="google-input-group">
            <input
              id="reg-name"
              type="text"
              className="google-input"
              placeholder="Nombre y Apellido"
              aria-label="Nombre completo"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </div>

          {/* Correo Electrónico */}
          <div className="google-input-group">
            <input
              id="reg-email"
              type="email"
              className="google-input"
              placeholder="Correo electrónico corporativo o personal"
              aria-label="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Contraseña */}
          <div className="google-input-group">
            <input
              id="reg-password"
              type={showPassword ? 'text' : 'password'}
              className="google-input"
              placeholder="Contraseña (mínimo 6 caracteres)"
              aria-label="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ paddingRight: '2.75rem' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '0.85rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: showPassword ? '#38bdf8' : 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.35rem',
                transition: 'color var(--transition-fast)',
              }}
              title={showPassword ? 'Ocultar contraseña (ver en puntitos)' : 'Mostrar contraseña (ver texto)'}
            >
              {showPassword ? <Eye size={19} /> : <EyeOff size={19} />}
            </button>
          </div>

          {/* Confirmar Contraseña */}
          <div className="google-input-group" style={{ marginBottom: '1.5rem' }}>
            <input
              id="reg-confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              className="google-input"
              placeholder="Confirmar contraseña"
              aria-label="Confirmar contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{ paddingRight: '2.75rem' }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{
                position: 'absolute',
                right: '0.85rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: showConfirmPassword ? '#38bdf8' : 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.35rem',
                transition: 'color var(--transition-fast)',
              }}
              title={showConfirmPassword ? 'Ocultar contraseña (ver en puntitos)' : 'Mostrar contraseña (ver texto)'}
            >
              {showConfirmPassword ? <Eye size={19} /> : <EyeOff size={19} />}
            </button>
          </div>

          {/* Botón de Enviar */}
          <Button
            type="submit"
            variant="primary"
            isLoading={loading}
            style={{
              width: '100%',
              marginBottom: '1rem',
              padding: '0.85rem',
              borderRadius: 'var(--radius-full)',
              fontWeight: 600,
              fontSize: '0.95rem',
            }}
          >
            Crear cuenta y comenzar
          </Button>

          {/* Enlace para volver a iniciar sesión */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '0.5rem',
            }}
          >
            <Link
              to="/login"
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                fontSize: '0.85rem',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                textDecoration: 'none',
              }}
            >
              <ArrowLeft size={15} />
              <span>Ya tengo una cuenta</span>
            </Link>

            <Link
              to="/login"
              style={{
                color: '#60a5fa',
                fontSize: '0.875rem',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Acceder
            </Link>
          </div>
        </form>
      </div>

      {/* Pie de página Google */}
      <footer className="google-footer">
        <div>
          <span>Español (Latinoamérica)</span>
        </div>
        <div className="google-footer-links">
          <a href="#help" onClick={(e) => e.preventDefault()}>
            Ayuda
          </a>
          <a href="#privacy" onClick={(e) => e.preventDefault()}>
            Privacidad
          </a>
          <a href="#terms" onClick={(e) => e.preventDefault()}>
            Condiciones
          </a>
        </div>
      </footer>
    </div>
  );
};

