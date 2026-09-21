import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { isValidEmail, isValidPassword } from '../utils/validations';
import { Button } from '../components/Button';
import {
  UserPlus,
  Eye,
  EyeOff,
  Trash2,
  ChevronDown,
  ArrowLeft,
  AlertCircle,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';
import { SavedAccount } from '../types/user';

// Official Google Multicolor SVG Icon
export const GoogleLogoIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.97 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

const AVATAR_COLORS = [
  'linear-gradient(135deg, #475569, #334155)',
  'linear-gradient(135deg, #334155, #1e293b)',
  'linear-gradient(135deg, #3b82f6, #1d4ed8)',
  'linear-gradient(135deg, #64748b, #475569)',
  'linear-gradient(135deg, #0ea5e9, #0369a1)',
];

const getAvatarColor = (nameOrEmail: string) => {
  let hash = 0;
  for (let i = 0; i < nameOrEmail.length; i++) {
    hash = nameOrEmail.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

export const Login: React.FC = () => {
  const { savedAccounts, login, loginWithGoogle, resetPassword, removeAccount } = useAuth();
  const navigate = useNavigate();

  // Mode: 'account_select' | 'credentials' | 'forgot_password'
  const hasSavedAccounts = Boolean(savedAccounts && savedAccounts.length > 0);
  const [view, setView] = useState<'account_select' | 'credentials' | 'forgot_password'>(
    hasSavedAccounts ? 'account_select' : 'credentials'
  );

  const [selectedAccount, setSelectedAccount] = useState<SavedAccount | null>(
    hasSavedAccounts ? savedAccounts[0] : null
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRemovingAccounts, setIsRemovingAccounts] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [failedAvatars, setFailedAvatars] = useState<Record<string, boolean>>({});

  const handleAvatarError = (accountEmail: string) => {
    setFailedAvatars((prev) => ({ ...prev, [accountEmail]: true }));
  };

  // Maneja la selección de una cuenta desde la lista
  const handleSelectAccount = async (account: SavedAccount) => {
    if (isRemovingAccounts) {
      removeAccount(account.email);
      return;
    }

    setSelectedAccount(account);
    setEmail(account.email);
    setPassword('');
    setError(null);
    setView('credentials');
  };

  // Maneja el inicio de sesión con correo y contraseña
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const targetEmail = selectedAccount ? selectedAccount.email : email;

    if (!isValidEmail(targetEmail)) {
      setError('Por favor ingresa un correo electrónico válido.');
      return;
    }

    const passCheck = isValidPassword(password);
    if (!passCheck.isValid) {
      setError(passCheck.message || 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setError(null);
    setLoading(true);

    const res = await login({ email: targetEmail, password });
    setLoading(false);

    if (res.success) {
      navigate('/tasks');
    } else {
      setError(res.error || 'No se pudo iniciar sesión.');
    }
  };

  // Maneja el inicio de sesión con Google
  const handleGoogleSignIn = async () => {
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

  // Maneja la recuperación de contraseña
  const handleOpenForgotPassword = () => {
    setError(null);
    setSuccessMessage(null);
    if (selectedAccount) {
      setEmail(selectedAccount.email);
    }
    setView('forgot_password');
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = selectedAccount ? selectedAccount.email : email;

    if (!isValidEmail(targetEmail)) {
      setError('Por favor ingresa un correo electrónico válido.');
      return;
    }

    setError(null);
    setSuccessMessage(null);
    setResetLoading(true);

    const res = await resetPassword(targetEmail);
    setResetLoading(false);

    if (res.success) {
      setSuccessMessage(res.message || 'Se ha enviado un enlace a tu correo para restablecer tu contraseña.');
    } else {
      setError(res.error || 'No se pudo enviar el correo de recuperación.');
    }
  };

  // Switch to clean login form
  const handleUseAnotherAccount = () => {
    setSelectedAccount(null);
    setEmail('');
    setPassword('');
    setError(null);
    setSuccessMessage(null);
    setView('credentials');
  };

  // Back to account list or login
  const handleBackToAccounts = () => {
    setError(null);
    setSuccessMessage(null);
    setView('account_select');
  };

  const handleBackToLogin = () => {
    setError(null);
    setSuccessMessage(null);
    setView('credentials');
  };

  const uniqueAccounts = React.useMemo(() => {
    const seen = new Set<string>();
    return savedAccounts.filter((acc) => {
      const base = (acc.displayName || acc.email.split('@')[0])
        .toLowerCase()
        .replace(/\s*\(google\)\s*/g, '')
        .trim();
      if (seen.has(base) || seen.has(acc.email.toLowerCase())) {
        return false;
      }
      seen.add(base);
      seen.add(acc.email.toLowerCase());
      return true;
    });
  }, [savedAccounts]);

  return (
    <div className="google-auth-container animate-fade-in">
      <div className="google-card">
        {/* Google Card Header */}
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
            {view === 'account_select'
              ? 'Elegir una cuenta'
              : view === 'forgot_password'
              ? 'Recuperar contraseña'
              : 'Acceder'}
          </h2>
          <p className="google-subtitle">
            {view === 'account_select'
              ? 'para continuar en MateCode Gestor'
              : view === 'forgot_password'
              ? 'Te enviaremos las instrucciones de restablecimiento'
              : 'Utiliza tu cuenta de Google o correo corporativo'}
          </p>
        </div>

        {/* Success Notification */}
        {successMessage && (
          <div
            className="animate-fade-in"
            style={{
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.65rem',
            }}
          >
            <CheckCircle2 size={18} color="#34d399" style={{ flexShrink: 0, marginTop: '2px' }} />
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#a7f3d0', lineHeight: 1.4 }}>
              {successMessage}
            </p>
          </div>
        )}

        {/* Error Notification */}
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
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#fca5a5', lineHeight: 1.4 }}>
                {error}
              </p>
              {(error.toLowerCase().includes('regist') || error.toLowerCase().includes('encontrado')) && (
                <Link
                  to="/register"
                  style={{
                    display: 'inline-block',
                    marginTop: '0.4rem',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: '#93c5fd',
                    textDecoration: 'none',
                  }}
                >
                  ¿Deseas crear una cuenta nueva? Registrarse →
                </Link>
              )}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* VISTA 1: SELECTOR DE CUENTAS ESTILO GOOGLE           */}
        {/* ==================================================== */}
        {view === 'account_select' && (
          <div>
            <div className="account-list">
              {uniqueAccounts.map((acc) => {
                const displayName = acc.displayName || acc.email.split('@')[0];
                const initial = displayName.charAt(0).toUpperCase();

                return (
                  <button
                    key={acc.email}
                    type="button"
                    className="account-item"
                    onClick={() => handleSelectAccount(acc)}
                  >
                    <div className="account-item-left">
                      {acc.photoURL && !failedAvatars[acc.email] ? (
                        <img
                          src={acc.photoURL}
                          alt={displayName}
                          className="account-avatar"
                          onError={() => handleAvatarError(acc.email)}
                        />
                      ) : (
                        <div
                          className="account-avatar-fallback"
                          style={{ background: getAvatarColor(acc.email) }}
                        >
                          {initial}
                        </div>
                      )}

                      <div className="account-info">
                        <span className="account-name">{displayName}</span>
                        <span className="account-email">{acc.email}</span>
                      </div>
                    </div>

                    <div className="account-item-action">
                      {isRemovingAccounts ? (
                        <div
                          style={{
                            padding: '0.4rem',
                            borderRadius: '50%',
                            background: 'rgba(239, 68, 68, 0.2)',
                            color: '#f87171',
                            display: 'flex',
                          }}
                          title="Quitar esta cuenta"
                        >
                          <Trash2 size={16} />
                        </div>
                      ) : (
                        <span
                          style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)',
                            background: 'rgba(255, 255, 255, 0.05)',
                            padding: '0.2rem 0.55rem',
                            borderRadius: 'var(--radius-full)',
                          }}
                        >
                          Guardada
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}

              {/* Opción Usar otra cuenta */}
              <button
                type="button"
                className="account-item"
                onClick={handleUseAnotherAccount}
              >
                <div className="account-item-left">
                  <div
                    className="account-avatar-fallback"
                    style={{
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px dashed rgba(255, 255, 255, 0.2)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <UserPlus size={17} />
                  </div>
                  <div className="account-info">
                    <span className="account-name" style={{ color: 'var(--text-primary)' }}>
                      Usar otra cuenta
                    </span>
                    <span className="account-email">Acceder con correo o Google</span>
                  </div>
                </div>
              </button>
            </div>

            {/* Continuar con Google directo */}
            <button
              type="button"
              className="btn-google"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              style={{ marginBottom: '1.25rem' }}
            >
              <GoogleLogoIcon size={18} />
              <span>{googleLoading ? 'Iniciando sesión...' : 'Continuar con Google'}</span>
            </button>

            {/* Acciones inferiores de la vista de cuentas */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '0.5rem',
              }}
            >
              <button
                type="button"
                onClick={() => setIsRemovingAccounts(!isRemovingAccounts)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: isRemovingAccounts ? '#f87171' : 'var(--text-muted)',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  padding: '0.4rem 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                {isRemovingAccounts ? '✓ Listo' : 'Quitar una cuenta'}
              </button>

              <Link
                to="/register"
                style={{
                  color: '#60a5fa',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Crear cuenta
              </Link>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* VISTA 2: FORMULARIO DE ACCESO Y CREDENCIALES         */}
        {/* ==================================================== */}
        {view === 'credentials' && (
          <form onSubmit={handleSubmit} className="animate-fade-in">
            {/* Si se seleccionó una cuenta previa, mostrar el Chip Google */}
            {selectedAccount ? (
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <button
                  type="button"
                  onClick={handleBackToAccounts}
                  className="selected-account-chip"
                  title="Cambiar de cuenta"
                >
                  {selectedAccount.photoURL && !failedAvatars[selectedAccount.email] ? (
                    <img
                      src={selectedAccount.photoURL}
                      alt={selectedAccount.displayName || selectedAccount.email}
                      style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }}
                      onError={() => handleAvatarError(selectedAccount.email)}
                    />
                  ) : (
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: getAvatarColor(selectedAccount.email),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}
                    >
                      {(selectedAccount.displayName || selectedAccount.email).charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {selectedAccount.email}
                  </span>
                  <ChevronDown size={14} color="var(--text-muted)" />
                </button>
              </div>
            ) : (
              /* Input de Correo para cuenta nueva */
              <div className="google-input-group">
                <input
                  id="google-login-email"
                  type="email"
                  className="google-input"
                  placeholder="Correo electrónico o teléfono"
                  aria-label="Correo electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            )}

            {/* Input de Contraseña */}
            <div className="google-input-group" style={{ marginBottom: '0.75rem' }}>
              <input
                id="google-login-password"
                type={showPassword ? 'text' : 'password'}
                className="google-input"
                placeholder="Ingresa tu contraseña"
                aria-label="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus={Boolean(selectedAccount)}
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

            {/* Enlace de Recuperar Contraseña */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.25rem' }}>
              <button
                type="button"
                onClick={handleOpenForgotPassword}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#60a5fa',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  padding: '0.2rem 0',
                  transition: 'all var(--transition-fast)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* Botón Principal de Inicio de Sesión */}
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
              Iniciar Sesión
            </Button>

            {/* Separador O */}
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
              <span style={{ padding: '0 0.75rem' }}>o bien</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />
            </div>

            {/* Botón de Google */}
            <button
              type="button"
              className="btn-google"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              style={{ marginBottom: '1.5rem' }}
            >
              <GoogleLogoIcon size={18} />
              <span>{googleLoading ? 'Iniciando sesión...' : 'Continuar con Google'}</span>
            </button>

            {/* Footer de Acciones: Volver a Cuentas o Crear Cuenta */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '0.5rem',
              }}
            >
              {savedAccounts && savedAccounts.length > 0 ? (
                <button
                  type="button"
                  onClick={handleBackToAccounts}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <ArrowLeft size={15} />
                  <span>Ver todas las cuentas</span>
                </button>
              ) : (
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  ¿Nuevo en MateCode?
                </span>
              )}

              <Link
                to="/register"
                style={{
                  color: '#60a5fa',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Crear cuenta
              </Link>
            </div>
          </form>
        )}

        {/* ==================================================== */}
        {/* VISTA 3: RECUPERACIÓN DE CONTRASEÑA                  */}
        {/* ==================================================== */}
        {view === 'forgot_password' && (
          <form onSubmit={handleResetPasswordSubmit} className="animate-fade-in">
            {/* Si se seleccionó una cuenta previa, mostrar el Chip */}
            {selectedAccount ? (
              <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                <div className="selected-account-chip" style={{ cursor: 'default' }}>
                  {selectedAccount.photoURL ? (
                    <img
                      src={selectedAccount.photoURL}
                      alt={selectedAccount.displayName || selectedAccount.email}
                      style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: getAvatarColor(selectedAccount.email),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}
                    >
                      {(selectedAccount.displayName || selectedAccount.email).charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {selectedAccount.email}
                  </span>
                </div>
              </div>
            ) : (
              <div className="google-input-group" style={{ marginBottom: '1.25rem' }}>
                <input
                  id="google-reset-email"
                  type="email"
                  className="google-input"
                  placeholder="Correo electrónico asociado a tu cuenta"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            )}

            <div
              style={{
                background: 'rgba(59, 130, 246, 0.08)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem 1rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.65rem',
              }}
            >
              <KeyRound size={18} color="#60a5fa" style={{ flexShrink: 0, marginTop: '2px' }} />
              <p style={{ margin: 0, fontSize: '0.825rem', color: '#bfdbfe', lineHeight: 1.45 }}>
                Recibirás un enlace seguro de Firebase en tu correo para crear una nueva contraseña y recuperar tu acceso.
              </p>
            </div>

            {/* Botón Principal de Enviar Enlace */}
            <Button
              type="submit"
              variant="primary"
              isLoading={resetLoading}
              style={{
                width: '100%',
                marginBottom: '1.25rem',
                padding: '0.85rem',
                borderRadius: 'var(--radius-full)',
                fontWeight: 600,
                fontSize: '0.95rem',
              }}
            >
              Enviar enlace de recuperación
            </Button>

            {/* Volver a iniciar sesión */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '0.5rem',
              }}
            >
              <button
                type="button"
                onClick={handleBackToLogin}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <ArrowLeft size={15} />
                <span>Volver a iniciar sesión</span>
              </button>

              <Link
                to="/register"
                style={{
                  color: '#60a5fa',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Crear cuenta
              </Link>
            </div>
          </form>
        )}
      </div>

      {/* Pie de página Oficial Estilo Google */}
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

