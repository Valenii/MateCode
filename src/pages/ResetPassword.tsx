import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { verifyResetCode, confirmNewPassword } from '../features/auth/authService';
import { isValidPassword } from '../utils/validations';
import { Button } from '../components/Button';
import { GoogleLogoIcon } from './Login';
import {
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';

export const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const oobCode = searchParams.get('oobCode') || '';

  const [status, setStatus] = useState<'checking' | 'valid' | 'invalid' | 'done'>('checking');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!oobCode) {
      setStatus('invalid');
      setError('No se proporcionó ningún código de recuperación en el enlace.');
      return;
    }

    verifyResetCode(oobCode).then((res) => {
      if (res.valid) {
        setEmail(res.email || '');
        setStatus('valid');
      } else {
        setStatus('invalid');
        setError(res.error || 'El enlace de recuperación ha expirado o ya ha sido utilizado.');
      }
    });
  }, [oobCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

    const res = await confirmNewPassword(oobCode, password);
    setLoading(false);

    if (res.success) {
      setStatus('done');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } else {
      setError(res.error || 'No se pudo actualizar la contraseña.');
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

          <h2 className="google-title">
            {status === 'done' ? '¡Contraseña actualizada!' : 'Crear nueva contraseña'}
          </h2>
          <p className="google-subtitle">
            {status === 'done'
              ? 'Tu cuenta ha sido protegida con éxito'
              : email
              ? `Estás cambiando la clave de ${email}`
              : 'Ingresa tu nueva clave de acceso seguro'}
          </p>
        </div>

        {/* State 1: Checking */}
        {status === 'checking' && (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div className="spinner" style={{ width: '2.5rem', height: '2.5rem', margin: '0 auto 1.25rem' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Verificando el enlace de seguridad...
            </p>
          </div>
        )}

        {/* State 2: Invalid Link */}
        {status === 'invalid' && (
          <div className="animate-fade-in">
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
              }}
            >
              <AlertCircle size={20} color="#f87171" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h4 style={{ margin: '0 0 0.35rem 0', color: '#fca5a5', fontSize: '0.9rem' }}>
                  Enlace no válido o expirado
                </h4>
                <p style={{ margin: 0, fontSize: '0.825rem', color: '#fca5a5', lineHeight: 1.45 }}>
                  {error || 'La petición para cambiar la contraseña ha caducado o el enlace ya ha sido utilizado.'}
                </p>
              </div>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Para tu seguridad, los enlaces de recuperación solo sirven una vez. Puedes solicitar un nuevo enlace desde la pantalla de acceso.
            </p>

            <Link to="/login" style={{ textDecoration: 'none' }}>
              <Button
                variant="primary"
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                }}
              >
                <RefreshCw size={16} style={{ marginRight: '0.5rem' }} />
                Solicitar un nuevo enlace
              </Button>
            </Link>
          </div>
        )}

        {/* State 3: Password Changed Successfully */}
        {status === 'done' && (
          <div className="animate-fade-in" style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
              }}
            >
              <CheckCircle2 size={32} color="#34d399" />
            </div>

            <h3 style={{ color: '#f8fafc', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
              ¡Cambio completado!
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem', lineHeight: 1.45 }}>
              Tu contraseña ha sido actualizada correctamente. Te redirigiremos automáticamente al inicio de sesión en unos segundos...
            </p>

            <Link to="/login" style={{ textDecoration: 'none' }}>
              <Button
                variant="primary"
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                }}
              >
                Ir a Iniciar Sesión ahora
              </Button>
            </Link>
          </div>
        )}

        {/* State 4: Valid Link -> Form to enter new password */}
        {status === 'valid' && (
          <form onSubmit={handleSubmit} className="animate-fade-in">
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

            <div
              style={{
                background: 'rgba(59, 130, 246, 0.08)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem 1rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.65rem',
              }}
            >
              <KeyRound size={18} color="#60a5fa" style={{ flexShrink: 0, marginTop: '2px' }} />
              <p style={{ margin: 0, fontSize: '0.825rem', color: '#bfdbfe', lineHeight: 1.45 }}>
                Elige una contraseña segura de al menos 6 caracteres para proteger tu cuenta de MateCode.
              </p>
            </div>

            {/* Nueva Contraseña */}
            <div className="google-input-group">
              <input
                id="reset-password-input"
                type={showPassword ? 'text' : 'password'}
                className="google-input"
                placeholder="Nueva contraseña"
                aria-label="Nueva contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus
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
                title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <Eye size={19} /> : <EyeOff size={19} />}
              </button>
            </div>

            {/* Confirmar Nueva Contraseña */}
            <div className="google-input-group" style={{ marginBottom: '1.5rem' }}>
              <input
                id="reset-confirm-password-input"
                type={showConfirmPassword ? 'text' : 'password'}
                className="google-input"
                placeholder="Confirmar nueva contraseña"
                aria-label="Confirmar nueva contraseña"
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
                title={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showConfirmPassword ? <Eye size={19} /> : <EyeOff size={19} />}
              </button>
            </div>

            {/* Submit Button */}
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
              Guardar nueva contraseña
            </Button>

            {/* Back link */}
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '0.5rem' }}>
              <Link
                to="/login"
                style={{
                  color: '#94a3b8',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  textDecoration: 'none',
                }}
              >
                <ArrowLeft size={15} />
                <span>Cancelar e ir al login</span>
              </Link>
            </div>
          </form>
        )}
      </div>

      {/* Footer */}
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
