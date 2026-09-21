import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { ResetPassword } from '../pages/ResetPassword';
import { Tasks } from '../pages/Tasks';
import { ProtectedRoute } from './ProtectedRoute';
import { useAuth } from '../hooks/useAuth';

export const AppRouter: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div className="spinner" style={{ width: '3rem', height: '3rem', borderWidth: '3px' }} />
      </div>
    );
  }

  return (
    <Routes>
      {/* Rutas Públicas */}
      <Route
        path="/login"
        element={user ? <Navigate to="/tasks" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/tasks" replace /> : <Register />}
      />
      <Route
        path="/reset-password"
        element={<ResetPassword />}
      />

      {/* Rutas Protegidas */}
      <Route element={<ProtectedRoute />}>
        <Route path="/tasks" element={<Tasks />} />
      </Route>

      {/* Redirección por defecto */}
      <Route
        path="/"
        element={<Navigate to={user ? '/tasks' : '/login'} replace />}
      />
      <Route
        path="*"
        element={<Navigate to={user ? '/tasks' : '/login'} replace />}
      />
    </Routes>
  );
};
