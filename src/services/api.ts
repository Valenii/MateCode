export interface EmailPayload {
  to: string;
  subject: string;
  bodyText: string;
  bodyHtml?: string;
}

export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  isSimulated?: boolean;
  message?: string;
}

/**
 * Envía un correo electrónico invocando la Serverless Function en Vercel (/api/sendEmail)
 * lo que garantiza que NUNCA se expongan credenciales de AWS en el código cliente/navegador.
 */
export const sendEmail = async (payload: EmailPayload): Promise<EmailResponse> => {
  const { to, subject, bodyText, bodyHtml } = payload;

  try {
    const response = await fetch('/api/sendEmail', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        subject,
        bodyText,
        bodyHtml,
      }),
    });

    if (!response.ok) {
      // Si la ruta serverless no está disponible (ej. dev local estándar de Vite sin Vercel CLI)
      if (response.status === 404) {
        console.info(`[Modo Simulación Local] Email para: ${to} | Asunto: ${subject}`);
        return {
          success: true,
          messageId: `sim-local-${Date.now()}`,
          isSimulated: true,
          message: 'Notificación simulada localmente (deploya en Vercel para invocación serverless de AWS SES).',
        };
      }

      const errData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errData.error || `Error en el servidor (${response.status})`,
      };
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    // Si falla la conexión de red con el endpoint local
    console.info(`[Simulación Fallback] Correo para: ${to} | Asunto: ${subject}`);
    return {
      success: true,
      messageId: `sim-dev-${Date.now()}`,
      isSimulated: true,
    };
  }
};

/**
 * Notificación de creación de tarea
 */
export const notifyTaskCreated = async (
  userEmail: string,
  taskTitle: string,
  priority: string,
  category: string,
  dueDate?: string
): Promise<EmailResponse> => {
  const subject = `[MateCode] Nueva tarea asignada: ${taskTitle}`;
  const bodyText = `Hola,\n\nHas registrado una nueva tarea en tu gestor estratégico MateCode:\n\nTítulo: ${taskTitle}\nPrioridad: ${priority}\nCategoría: ${category}\nFecha límite: ${dueDate || 'Sin fecha'}\n\nAccede a MateCode para gestionar su avance.`;

  const bodyHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f8fafc; padding: 24px; border-radius: 12px; border: 1px solid #1e293b;">
      <h2 style="color: #38bdf8; margin-top: 0;">🚀 MateCode - Gestor Estratégico</h2>
      <p style="font-size: 16px; color: #cbd5e1;">Se ha registrado una nueva tarea en tu panel de control:</p>
      <div style="background: #1e293b; padding: 16px; border-radius: 8px; border-left: 4px solid #38bdf8; margin: 20px 0;">
        <h3 style="margin: 0 0 10px 0; color: #ffffff;">${taskTitle}</h3>
        <p style="margin: 4px 0; color: #94a3b8;"><strong>Prioridad:</strong> <span style="color: #f59e0b;">${priority.toUpperCase()}</span></p>
        <p style="margin: 4px 0; color: #94a3b8;"><strong>Categoría:</strong> ${category}</p>
        <p style="margin: 4px 0; color: #94a3b8;"><strong>Fecha límite:</strong> ${dueDate || 'Sin fecha asignada'}</p>
      </div>
      <p style="font-size: 14px; color: #64748b;">Notificación automática emitida por el servicio AWS SES de MateCode vía Vercel Serverless Function.</p>
    </div>
  `;

  return sendEmail({ to: userEmail, subject, bodyText, bodyHtml });
};

/**
 * Notificación de tarea completada
 */
export const notifyTaskCompleted = async (
  userEmail: string,
  taskTitle: string
): Promise<EmailResponse> => {
  const subject = `[MateCode] ¡Tarea completada!: ${taskTitle}`;
  const bodyText = `Hola,\n\n¡Excelente trabajo! Has completado la tarea "${taskTitle}".\n\nSigue así en tu gestión estratégica.`;

  const bodyHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f8fafc; padding: 24px; border-radius: 12px; border: 1px solid #1e293b;">
      <h2 style="color: #10b981; margin-top: 0;">✅ ¡Tarea Completada!</h2>
      <p style="font-size: 16px; color: #cbd5e1;">Has marcado como completada la siguiente actividad:</p>
      <div style="background: #1e293b; padding: 16px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0;">
        <h3 style="margin: 0; color: #ffffff;">${taskTitle}</h3>
      </div>
      <p style="font-size: 14px; color: #64748b;">MateCode Gestor Estratégico de Tareas.</p>
    </div>
  `;

  return sendEmail({ to: userEmail, subject, bodyText, bodyHtml });
};

/**
 * Notificación de resumen / reporte diario de tareas
 */
export const notifyTaskSummary = async (
  userEmail: string,
  userName: string,
  total: number,
  pending: number,
  completed: number,
  highPriority: number,
  completionRate: number,
  pendingTasksList: string[]
): Promise<EmailResponse> => {
  const subject = `[MateCode] Resumen de tus tareas estratégicas`;
  const bodyText = `Hola ${userName},\n\nAquí tienes el resumen de tu jornada en MateCode:\n\n- Tareas Totales: ${total}\n- Pendientes: ${pending}\n- Completadas: ${completed}\n- Alta Prioridad: ${highPriority}\n- Tasa de avance: ${completionRate}%\n\nTareas pendientes prioritarias:\n${pendingTasksList.map((t) => `• ${t}`).join('\n')}\n\nIngresa al panel para continuar gestionando tu productividad.`;

  const bodyHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f8fafc; padding: 24px; border-radius: 12px; border: 1px solid #1e293b;">
      <h2 style="color: #38bdf8; margin-top: 0;">📊 MateCode - Resumen de Productividad</h2>
      <p style="font-size: 16px; color: #cbd5e1;">Hola <strong>${userName}</strong>, este es el estado actual de tus actividades:</p>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 20px 0;">
        <div style="background: #1e293b; padding: 12px; border-radius: 8px;">
          <span style="color: #94a3b8; font-size: 12px;">Total</span>
          <h3 style="margin: 4px 0 0 0; color: #ffffff;">${total}</h3>
        </div>
        <div style="background: #1e293b; padding: 12px; border-radius: 8px;">
          <span style="color: #94a3b8; font-size: 12px;">Pendientes</span>
          <h3 style="margin: 4px 0 0 0; color: #facc15;">${pending}</h3>
        </div>
        <div style="background: #1e293b; padding: 12px; border-radius: 8px;">
          <span style="color: #94a3b8; font-size: 12px;">Completadas</span>
          <h3 style="margin: 4px 0 0 0; color: #34d399;">${completed}</h3>
        </div>
        <div style="background: #1e293b; padding: 12px; border-radius: 8px;">
          <span style="color: #94a3b8; font-size: 12px;">Avance</span>
          <h3 style="margin: 4px 0 0 0; color: #c084fc;">${completionRate}%</h3>
        </div>
      </div>

      <h4 style="color: #e2e8f0; margin-bottom: 8px;">Pendientes principales:</h4>
      <ul style="color: #94a3b8; padding-left: 20px; line-height: 1.6;">
        ${pendingTasksList.length > 0 ? pendingTasksList.map((t) => `<li>${t}</li>`).join('') : '<li>¡No tienes tareas pendientes pendientes! Todo al día.</li>'}
      </ul>

      <p style="font-size: 14px; color: #64748b; margin-top: 24px;">Enviado de forma segura mediante AWS SES & Vercel Functions.</p>
    </div>
  `;

  return sendEmail({ to: userEmail, subject, bodyText, bodyHtml });
};
