# 🚀 MateCode - Gestor Estratégico de Tareas

Aplicación web SPA moderna, escalable, persistente y segura desarrollada para **MateCode**, diseñada para que empleados y equipos organicen sus actividades diarias con autenticación, base de datos en la nube y notificaciones por correo electrónico.

---

## 📌 Enlaces del Entregable
- **Repositorio de GitHub**: `https://github.com/tu-usuario/matecode-task-manager` *(completar con tu URL)*
- **Aplicación en Producción (Vercel)**: `https://matecode-task-manager.vercel.app` *(completar con tu URL)*

---

## 🏗️ Decisiones Arquitectónicas

La aplicación sigue una **arquitectura por capas desacoplada**, pensada para ser escalable, testeable y mantenible:

1. **Separación de Responsabilidades por Capas**:
   - `pages/`: Vistas de usuario y composición de pantallas (`Login`, `Register`, `Tasks`).
   - `components/`: Componentes de UI modulares y reutilizables (`Button`, `TodoItem`, `TodoForm`, `TodoList`, `Navbar`), sin acoplamiento a servicios específicos.
   - `features/`: Lógica de dominio específica dividida en submódulos (`auth`, `tasks`).
   - `services/`: Adaptadores para servicios externos (`firebase.ts`, `api.ts`).
   - `hooks/`: Gestión reactiva de estado (`useAuth`, `useTasks`).
   - `routes/`: Control de rutas públicas y privadas con guards (`ProtectedRoute`, `AppRouter`).
   - `types/`: Tipado estricto en TypeScript (`Task`, `UserProfile`, `TaskStats`).
   - `utils/`: Funciones puras de validación y formateo.
   - `api/` & `functions/`: Funciones Serverless en Vercel para operaciones backend seguras.

2. **Backend as a Service (BaaS) con Firebase**:
   - **Authentication**: Manejo seguro de credenciales y sesiones con el patrón *Observer* (`onAuthStateChanged`), permitiendo persistencia de sesión transparente.
   - **Cloud Firestore**: Persistencia por usuario (`userId`) y sincronización en tiempo real mediante `onSnapshot` con limpieza de listeners en `useEffect` para evitar *memory leaks*.

3. **Seguridad Crítica: Aislamiento de Credenciales y AWS SES**:
   - **Problema**: Invocar AWS SES directamente desde el navegador expondría las claves IAM secretas de AWS en el bundle cliente.
   - **Solución**: Se implementó una **Serverless Function en Vercel** (`api/sendEmail.ts`). El frontend sólo realiza una petición `POST` al endpoint `/api/sendEmail`, y la función serverless se encarga de autenticarse con AWS SES usando credenciales alojadas exclusivamente en el entorno del servidor.

4. **Reglas de Seguridad en Cloud Firestore (`firestore.rules`)**:
   - Se garantiza el aislamiento multi-tenant: un usuario **solo** puede leer, crear, modificar o eliminar tareas donde `userId == request.auth.uid`.

---

## 📧 Flujo de Envío de Emails (AWS SES)

```
[ Navegador / Frontend (React) ]
              │
              │  POST /api/sendEmail (Payload JSON con datos de la tarea)
              ▼
[ Vercel Serverless Function (Node.js) ]
              │  (Lee variables seguras: AWS_ACCESS_KEY_ID & AWS_SECRET_ACCESS_KEY)
              │  (Ejecuta SendEmailCommand)
              ▼
[ AWS SES (Simple Email Service) ]
              │
              ▼
[ Bandeja de Entrada del Usuario ]
```

### Tipos de notificaciones enviadas:
1. **Creación de Tarea**: Email de confirmación al registrar una nueva tarea estratégica.
2. **Tarea Completada**: Notificación de felicitación al marcar una tarea como completada.
3. **Resumen / Reporte Diario**: Envío bajo demanda del resumen de avance y pendientes prioritarios.

---

## 🔐 Variables de Entorno

Crear el archivo `.env` en local tomando como base `.env.example`:

```env
# =========================================================
# 1. VARIABLES DE FRONTEND (Cliente Vite / Navegador)
# =========================================================
VITE_FIREBASE_API_KEY=tu_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_project_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id
VITE_FIREBASE_APP_ID=tu_app_id

# Modo Demo: Si no se configuran variables de Firebase, la app funciona con persistencia local
VITE_DEMO_MODE=true

# =========================================================
# 2. VARIABLES DE BACKEND (Vercel Serverless Functions)
# IMPORTANTE: NO llevan prefijo VITE_ para que NUNCA se filtren al cliente
# =========================================================
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=tu_aws_access_key_id
AWS_SECRET_ACCESS_KEY=tu_aws_secret_access_key
AWS_SES_SOURCE_EMAIL=notificaciones@matecode.com
```

---

## 💻 Instrucciones de Instalación y Ejecución

### Requisitos previos:
- Node.js v18+ y npm v9+

### Pasos:
```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env

# 3. Iniciar servidor de desarrollo local
npm run dev

# 4. Ejecutar tests unitarios y de componentes
npm test

# 5. Compilar proyecto para producción
npm run build
```

---

## 🧪 Testing con Vitest y React Testing Library

La suite de pruebas incluye **21 pruebas automatizadas** en 7 suites:
- **Validaciones**: Verificación de formatos de email, longitud de contraseñas y títulos de tareas.
- **Componentes**: Tests para `Button` (variantes, estado loading), `TodoItem` (checkbox, edición inline, eliminación), `TodoForm` (inputs y submit), y `TodoList` (estado vacío y renderizado de listas).
- **Páginas**: Tests de integración para vistas `Login` y `Register`.

Ejecutar tests:
```bash
npm test
```

---

## 🤖 Bitácora de Desarrollo Asistido por Inteligencia Artificial

### 1. ¿Cómo se integró la IA en el proceso de trabajo?
Se utilizó la IA como un compañero de pair programming guiado por prompts estructurados para:
- Definir contratos de datos e interfaces estrictas en TypeScript antes de programar la UI.
- Diseñar la arquitectura por capas y la función serverless desacoplada.
- Generar suites de tests comprehensivos para Vitest y React Testing Library.
- Redactar reglas de seguridad de Firestore con principio de mínimo privilegio.

### 2. ¿En qué situaciones fue más efectiva?
- **Identificación de riesgos de seguridad:** Detección de la necesidad de mover el SDK de AWS SES fuera del bundle de frontend hacia una función serverless en Vercel para evitar la fuga de credenciales.
- **Manejo de asincronía y reactividad:** Implementación correcta de `onAuthStateChanged` y `onSnapshot` con sus funciones de desuscripción para prevenir fugas de memoria.
- **Tipado estricto:** Modelado de DTOs (`CreateTaskDTO`, `UpdateTaskDTO`) omitiendo campos generados por el servidor (`id`, `createdAt`, `userId`).

### 3. Patrones y Buenas Prácticas descubiertas:
- **Patrón Adaptador / Fallback Silencioso:** Permitir que la aplicación funcione en modo de demostración local si las credenciales de Firebase no están presentes, facilitando las pruebas de componentes y el onboarding.
- **Mobile First & CSS Variables:** Centralización de tokens en `index.css` para consistencia visual, modo oscuro nativo y rendimiento óptimo sin sobrecarga de frameworks externos.
- **Commits Semánticos:** Estructuración de cambios mediante la convención de *Conventional Commits* (`feat:`, `fix:`, `test:`, `docs:`, `chore:`).
