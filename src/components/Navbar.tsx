import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { LogOut, User } from 'lucide-react';
import { Button } from './Button';

export const Navbar: React.FC = () => {
  const { user, isFirebaseReady, logout } = useAuth();
  const [imgError, setImgError] = React.useState(false);

  return (
    <header
      style={{
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-color)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        padding: '0.85rem 1.25rem',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '1.2rem',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.35)',
            }}
          >
            M
          </div>
          <div>
            <span style={{ fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.02em' }}>
              Mate<span className="gradient-text">Code</span>
            </span>
            <span
              style={{
                display: 'block',
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
                fontWeight: 500,
                lineHeight: 1,
              }}
            >
              GESTOR ESTRATÉGICO
            </span>
          </div>
        </div>

        {/* Right side / User info & Status */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Status badge */}
            <div
              style={{
                display: 'none',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.75rem',
                padding: '0.25rem 0.6rem',
                borderRadius: 'var(--radius-full)',
                background: isFirebaseReady ? 'rgba(16, 185, 129, 0.12)' : 'rgba(59, 130, 246, 0.12)',
                color: isFirebaseReady ? '#34d399' : '#60a5fa',
                border: `1px solid ${isFirebaseReady ? 'rgba(16, 185, 129, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
              }}
              className="desktop-badge"
            >
              {isFirebaseReady ? '☁️ Firebase Cloud' : '🔒 Sesión Activa'}
            </div>

            {/* User display */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {user.photoURL && !imgError ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || user.email}
                  onError={() => setImgError(true)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '1.5px solid rgba(59, 130, 246, 0.5)',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'rgba(59, 130, 246, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#60a5fa',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                  }}
                >
                  <User size={16} />
                </div>
              )}
              <span
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  maxWidth: '140px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user.displayName || user.email.split('@')[0]}
              </span>
            </div>


            {/* Logout button */}
            <Button
              variant="secondary"
              size="sm"
              onClick={logout}
              leftIcon={<LogOut size={14} />}
              title="Cerrar sesión"
            >
              Salir
            </Button>
          </div>
        ) : (
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Empowering Teams
          </div>
        )}
      </div>

      <style>{`
        @media (min-width: 640px) {
          .desktop-badge {
            display: inline-flex !important;
          }
        }
      `}</style>
    </header>
  );
};
