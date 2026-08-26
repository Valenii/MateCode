import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTasks } from '../hooks/useTasks';
import { TodoForm } from '../components/TodoForm';
import { TodoList } from '../components/TodoList';
import { Button } from '../components/Button';
import { notifyTaskSummary } from '../services/api';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  BarChart3,
  Search,
  Filter,
  Layers,
  Sparkles,
  Send,
} from 'lucide-react';
import { TaskFilterStatus } from '../types/task';

export const Tasks: React.FC = () => {
  const { user, isFirebaseReady } = useAuth();
  const {
    tasks,
    stats,
    loading,
    notificationMsg,
    filterStatus,
    setFilterStatus,
    filterPriority,
    setFilterPriority,
    filterCategory,
    setFilterCategory,
    searchQuery,
    setSearchQuery,
    addTask,
    updateTask,
    toggleComplete,
    deleteTask,
  } = useTasks();

  const [showFilters, setShowFilters] = useState(false);
  const [isSendingSummary, setIsSendingSummary] = useState(false);
  const [localFeedback, setLocalFeedback] = useState<string | null>(null);

  const handleSendSummary = async () => {
    if (!user || !user.email) return;
    setIsSendingSummary(true);
    setLocalFeedback(null);

    const pendingTitles = tasks.filter((t) => !t.completed).slice(0, 5).map((t) => t.title);

    try {
      const res = await notifyTaskSummary(
        user.email,
        user.displayName || user.email.split('@')[0],
        stats.total,
        stats.pending,
        stats.completed,
        stats.highPriority,
        stats.completionRate,
        pendingTitles
      );

      if (res.success) {
        setLocalFeedback(`📧 Resumen enviado con éxito a ${user.email}`);
      } else {
        setLocalFeedback(`❌ Error al enviar resumen: ${res.error || 'Intenta de nuevo'}`);
      }
    } catch {
      setLocalFeedback('❌ Error al conectar con el servicio de email.');
    } finally {
      setIsSendingSummary(false);
      setTimeout(() => setLocalFeedback(null), 5000);
    }
  };

  return (
    <div className="main-content animate-fade-in">
      {/* Toast Notification */}
      {(notificationMsg || localFeedback) && (
        <div className="toast-notification">
          <span>{localFeedback || notificationMsg}</span>
        </div>
      )}

      {/* Header Welcome & Summary Action */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.35rem' }}>
            Hola, <span className="gradient-text">{user?.displayName || user?.email?.split('@')[0]}</span> 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Organiza, prioriza y ejecuta las metas estratégicas de tu jornada laboral.
          </p>
        </div>

        {/* Send Summary Email via Vercel Function & AWS SES */}
        <Button
          variant="secondary"
          size="sm"
          onClick={handleSendSummary}
          isLoading={isSendingSummary}
          leftIcon={<Send size={14} color="#38bdf8" />}
          title="Enviar reporte de tareas a tu correo mediante AWS SES"
        >
          Enviar Resumen a mi Correo
        </Button>
      </div>

      {/* Demo / BaaS Notice Banner */}
      {!isFirebaseReady && (
        <div
          className="glass-card"
          style={{
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            border: '1px solid rgba(234, 179, 8, 0.3)',
            background: 'rgba(234, 179, 8, 0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <Sparkles size={20} color="#facc15" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '0.85rem', color: '#fef08a' }}>
            <strong>Modo Demo Activo:</strong> Las tareas y autenticación se persisten de manera local en tu navegador. Para sincronizar con la nube en producción, ingresa las variables de <code>Firebase</code> y <code>AWS SES</code> en tu archivo <code>.env</code>.
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        {/* Card: Total */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Tareas</span>
            <Layers size={18} color="#60a5fa" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{stats.total}</div>
        </div>

        {/* Card: Pending */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Pendientes</span>
            <Clock size={18} color="#eab308" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#facc15' }}>{stats.pending}</div>
        </div>

        {/* Card: Completed */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Completadas</span>
            <CheckCircle2 size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#34d399' }}>{stats.completed}</div>
        </div>

        {/* Card: High Priority */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Alta Prioridad</span>
            <AlertTriangle size={18} color="#ef4444" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f87171' }}>{stats.highPriority}</div>
        </div>

        {/* Card: Progress */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Avance Global</span>
            <BarChart3 size={18} color="#a78bfa" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#c084fc' }}>{stats.completionRate}%</div>
          <div
            style={{
              marginTop: '0.4rem',
              width: '100%',
              height: '6px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(255, 255, 255, 0.1)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${stats.completionRate}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #3b82f6, #a855f7)',
                transition: 'width 0.4s ease',
              }}
            />
          </div>
        </div>
      </div>

      {/* Task Creation Form */}
      <TodoForm onAddTask={addTask} />

      {/* Filter and Search Bar */}
      <div
        className="glass-card"
        style={{
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: '0.35rem', background: 'rgba(0,0,0,0.2)', padding: '0.25rem', borderRadius: 'var(--radius-md)' }}>
            {(['all', 'pending', 'completed'] as TaskFilterStatus[]).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFilterStatus(st)}
                style={{
                  padding: '0.45rem 0.85rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: filterStatus === st ? 'var(--primary-600)' : 'transparent',
                  color: filterStatus === st ? '#ffffff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  textTransform: 'capitalize',
                }}
              >
                {st === 'all' ? 'Todas' : st === 'pending' ? 'Pendientes' : 'Completadas'}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: '320px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Buscar tareas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.25rem', paddingRight: '0.75rem', height: '38px', fontSize: '0.85rem' }}
            />
            <Search
              size={15}
              color="var(--text-muted)"
              style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
            />
          </div>

          {/* Toggle Additional Filters Button */}
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setShowFilters(!showFilters)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <Filter size={14} />
            <span>{showFilters ? 'Ocultar Filtros' : 'Filtros Avanzados'}</span>
          </button>
        </div>

        {/* Extended Filters */}
        {showFilters && (
          <div
            className="animate-fade-in"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '0.75rem',
              paddingTop: '0.75rem',
              borderTop: '1px solid var(--border-color)',
            }}
          >
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                Filtrar por Prioridad
              </label>
              <select
                className="form-select"
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as any)}
                style={{ height: '36px', fontSize: '0.85rem' }}
              >
                <option value="all">Todas las prioridades</option>
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                Filtrar por Categoría
              </label>
              <select
                className="form-select"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as any)}
                style={{ height: '36px', fontSize: '0.85rem' }}
              >
                <option value="all">Todas las categorías</option>
                <option value="strategic">Estratégica</option>
                <option value="work">Trabajo</option>
                <option value="finance">Finanzas</option>
                <option value="learning">Capacitación</option>
                <option value="personal">Personal</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Task List */}
      <TodoList
        tasks={tasks}
        loading={loading}
        onToggleComplete={toggleComplete}
        onUpdate={updateTask}
        onDelete={deleteTask}
      />
    </div>
  );
};
