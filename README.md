# MateCode - Gestor Estratégico de Tareas

Aplicación web SPA moderna, escalable, persistente y segura desarrollada para **MateCode**, diseñada para que empleados y equipos organicen sus actividades diarias con autenticación, base de datos en la nube y notificaciones por correo electrónico.

---

## Enlaces del Entregable

- **Repositorio de GitHub**: https://github.com/Valenii/MateCode
- **Aplicación en Producción (Vercel)**: https://matecode.vercel.app (o la URL de tu proyecto en Vercel)

---

## Decisiones Arquitectónicas

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

##  Flujo de Envío de Emails (AWS SES)

```
[ Navegador / Frontend (React) ]
              │
              │  POST /api/sendEmail
              │  Header: Authorization: Bearer <ID token de Firebase>
              │  Body: { subject, bodyText, bodyHtml }  (sin destinatario)
              ▼
[ Vercel Serverless Function (Node.js) ]
              │  1. Verifica el token con Firebase Auth → obtiene el email del usuario
              │  2. Lee variables seguras: AWS_ACCESS_KEY_ID & AWS_SECRET_ACCESS_KEY
              │  3. Ejecuta SendEmailCommand hacia el email del token
              ▼
[ AWS SES (Simple Email Service) ]
              │
              ▼
[ Bandeja de Entrada del Usuario ]
```

**Seguridad del endpoint:** `/api/sendEmail` no es un relay abierto. Exige un usuario autenticado y el destinatario lo decide el servidor (el email de la cuenta), nunca el cliente. Si la petición no trae un token válido responde `401`.

**Modo simulación:** si no hay sesión de Firebase (modo demo) o el servidor no tiene credenciales de AWS, el correo se *simula* y la interfaz lo indica explícitamente ("Email simulado"). Para envío real hay que configurar las variables de AWS en Vercel.

> **AWS SES en sandbox:** las cuentas nuevas solo pueden enviar a direcciones verificadas. El remitente (`AWS_SES_SOURCE_EMAIL`) y el destinatario deben estar verificados en la consola de SES, en la misma región que `AWS_REGION`.

### Tipos de notificaciones enviadas:
1. **Creación de Tarea**: Email de confirmación al registrar una nueva tarea estratégica.
2. **Tarea Completada**: Notificación de felicitación al marcar una tarea como completada.
3. **Resumen / Reporte Diario**: Envío bajo demanda del resumen de avance y pendientes prioritarios.

---

##  Variables de Entorno

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
# IMPORTANTE: los secretos NO llevan prefijo VITE_ para que NUNCA se filtren al cliente.
# (La función también lee VITE_FIREBASE_API_KEY para validar el token de sesión;
#  esa clave es pública por diseño en Firebase, no es un secreto.)
# =========================================================
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=tu_aws_access_key_id
AWS_SECRET_ACCESS_KEY=tu_aws_secret_access_key
AWS_SES_SOURCE_EMAIL=notificaciones@matecode.com
```

---

##  Instrucciones de Instalación y Ejecución

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

## Testing con Vitest y React Testing Library

La suite de pruebas incluye **31 pruebas automatizadas** en 8 suites:
- **Función serverless (`api/sendEmail`)**: autenticación obligatoria (401), destinatario forzado al email del token, modo simulación, validación de campos y errores de SES. AWS SES y Firebase están mockeados: los tests no envían correos reales.
- **Validaciones**: Verificación de formatos de email, longitud de contraseñas y títulos de tareas.
- **Componentes**: Tests para `Button` (variantes, estado loading), `TodoItem` (checkbox, edición inline, eliminación), `TodoForm` (inputs y submit), y `TodoList` (estado vacío y renderizado de listas).
- **Páginas**: Tests de integración para vistas `Login` y `Register`.

Ejecutar tests:
```bash
npm test
```

---

## Bitácora de Desarrollo Asistido por Inteligencia Artificial

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
