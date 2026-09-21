# MateCode - Gestor Estratégico de Tareas

Aplicación web SPA para que empleados y equipos organicen sus tareas diarias, con autenticación de usuarios, persistencia en la nube por usuario y notificaciones por correo electrónico.

| | |
|---|---|
| **Aplicación en producción** | https://mate-code.vercel.app |
| **Repositorio** | https://github.com/Valenii/MateCode |

**Stack:** React 18 + TypeScript + Vite · Firebase (Authentication + Cloud Firestore) · AWS SES vía Vercel Functions · Vitest + React Testing Library · Deploy en Vercel.

---

## Cuenta de prueba para revisión

Para probar la aplicación en producción sin tener que registrarte, puedes iniciar sesión con esta cuenta de demostración, creada únicamente para la revisión del proyecto:

| | |
|---|---|
| **URL** | https://mate-code.vercel.app |
| **Correo** | `pedroprofesor87@gmail.com` |
| **Contraseña** | `Pedroperez234` |

**Cómo entrar:** abre la URL e inicia sesión escribiendo el correo y la contraseña en el formulario (con correo y contraseña, no con el botón de Google).

**Qué puedes probar:** crear, editar, completar y eliminar tareas, usar los filtros y la búsqueda, y el botón **Enviar Resumen a mi Correo**. Cada cuenta ve únicamente sus propias tareas.

**Sobre el envío de correos:** el resumen se envía mediante AWS SES al correo de la cuenta con la que inicias sesión. La cuenta de AWS está en *sandbox*, donde SES solo entrega a direcciones verificadas: si creas tu propia cuenta con otro correo, el resto de la aplicación funciona igual, pero SES rechazará el envío del resumen.

> Estas credenciales son solo para la revisión del proyecto y no contienen datos personales.

---

## Tabla de contenidos

1. [Cuenta de prueba para revisión](#cuenta-de-prueba-para-revisión)
2. [Funcionalidades](#funcionalidades)
3. [Estructura del proyecto](#estructura-del-proyecto)
4. [Setup](#setup)
5. [Scripts](#scripts)
6. [Variables de entorno](#variables-de-entorno)
7. [Configuración de servicios](#configuración-de-servicios)
8. [Deploy en Vercel](#deploy-en-vercel)
9. [Flujo de envío de emails](#flujo-de-envío-de-emails)
10. [Decisiones arquitectónicas](#decisiones-arquitectónicas)
11. [Testing](#testing)
12. [Errores frecuentes](#errores-frecuentes)
13. [Bitácora de desarrollo asistido por IA](#bitácora-de-desarrollo-asistido-por-inteligencia-artificial)

---

## Funcionalidades

- **Autenticación:** registro e inicio de sesión con email y contraseña o con Google, cierre de sesión, recuperación de contraseña y mensajes de error claros.
- **Rutas privadas:** las tareas solo son visibles para un usuario autenticado (`ProtectedRoute`).
- **Gestión de tareas (CRUD):** crear (título y descripción), listar, editar, eliminar y marcar como completada. Cada tarea admite prioridad, categoría y fecha de vencimiento.
- **Persistencia y sincronización:** datos en Cloud Firestore, filtrados por `userId`, con actualización en tiempo real (`onSnapshot`) y estados de carga.
- **Filtros y búsqueda:** por estado (todas, pendientes, completadas), prioridad, categoría y texto.
- **Email con resumen:** un botón envía por correo el estado de todas las tareas mediante AWS SES.
- **Modo demo:** si no hay variables de Firebase, la app funciona con `localStorage` para facilitar el desarrollo y las pruebas.

---

## Estructura del proyecto

```
MateCode/
├─ api/
│  └─ sendEmail.ts          # Vercel Function: envío de emails con AWS SES
├─ functions/
│  └─ sendEmail.ts          # Re-exporta api/sendEmail (ver nota abajo)
├─ src/
│  ├─ components/           # Button, Navbar, TodoForm, TodoItem, TodoList
│  ├─ features/
│  │  ├─ auth/              # authService, authTypes
│  │  └─ tasks/             # taskService, taskUtils
│  ├─ hooks/                # useAuth, useTasks
│  ├─ pages/                # Login, Register, ResetPassword, Tasks
│  ├─ routes/               # AppRouter, ProtectedRoute
│  ├─ services/             # firebase.ts, api.ts (cliente del endpoint de email)
│  ├─ types/                # task.ts, user.ts
│  └─ utils/                # validations, formatters
├─ tests/                   # tests unitarios, de componentes, de páginas y de la función
├─ firestore.rules          # reglas de seguridad de Firestore
├─ vercel.json              # rewrite del SPA (excluye las rutas de api/)
├─ .env.example             # plantilla de variables de entorno (sin secretos)
└─ README.md
```

> **`api/` vs `functions/`:** Vercel solo publica como funciones las carpetas `api/`. La lógica real vive en `api/sendEmail.ts`; `functions/sendEmail.ts` la re-exporta para respetar la estructura de proyecto pedida.

---

## Setup

### Requisitos previos

- **Node.js 18 o superior** (recomendado 20+) y **npm**.
- Un proyecto de **Firebase** (para el modo real; sin él la app corre en modo demo).
- Una cuenta de **AWS** con SES (solo para el envío real de correos).

### Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/Valenii/MateCode.git
cd MateCode

# 2. Instalar dependencias
npm install

# 3. Crear el archivo de variables de entorno a partir de la plantilla
#    macOS / Linux:
cp .env.example .env
#    Windows (PowerShell):
Copy-Item .env.example .env

# 4. Completar los valores en .env (ver la sección "Variables de entorno")

# 5. Iniciar el servidor de desarrollo
npm run dev
```

La aplicación queda disponible en **http://localhost:5173**.

### Modo demo (sin configurar nada)

Si `.env` no tiene las variables de Firebase, la app se ejecuta en **modo demo**: las cuentas y tareas se guardan en el `localStorage` del navegador y los correos se **simulan** (no se envía nada real). Es útil para explorar la interfaz y para correr los tests.

### Probar el envío de correos en local

`npm run dev` sirve también la función `api/sendEmail.ts` mediante un plugin de Vite pensado solo para desarrollo (ver `vite.config.ts`), y carga las variables de tu `.env` como lo haría Vercel. Para un envío **real** necesitas:

1. Firebase configurado en `.env` e iniciar sesión con una cuenta real (en modo demo el envío siempre se simula).
2. Las variables `AWS_*` completas en `.env`.
3. Remitente y destinatario verificados en SES si tu cuenta está en *sandbox* (ver [AWS SES](#aws-ses)).

---

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga en caliente. Incluye la función `/api/sendEmail`. |
| `npm run build` | Comprueba los tipos (`tsc`) y genera el build de producción en `dist/`. |
| `npm run preview` | Sirve localmente el build de `dist/` para revisarlo antes de desplegar. |
| `npm test` | Ejecuta toda la suite de tests una vez (`vitest run`). |
| `npm run test:watch` | Ejecuta los tests en modo observación mientras editas. |

---

## Variables de entorno

Copia `.env.example` a `.env` y completa los valores. **`.env` está en `.gitignore`: nunca se sube al repositorio.** `.env.example` sí se versiona y solo contiene valores de ejemplo.

### Frontend (Firebase)

Llevan el prefijo `VITE_`, por lo que Vite las incorpora al bundle del navegador. **No son secretos**: la configuración web de Firebase es pública por diseño y la seguridad de los datos la garantizan las reglas de Firestore.

| Variable | Descripción |
|---|---|
| `VITE_FIREBASE_API_KEY` | API key de la app web de Firebase |
| `VITE_FIREBASE_AUTH_DOMAIN` | Dominio de autenticación (`tu-proyecto.firebaseapp.com`) |
| `VITE_FIREBASE_PROJECT_ID` | ID del proyecto de Firebase |
| `VITE_FIREBASE_STORAGE_BUCKET` | Bucket de almacenamiento |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | ID del remitente de mensajería |
| `VITE_FIREBASE_APP_ID` | ID de la app web |

### Backend (AWS SES, solo servidor)

**Son secretos y no llevan el prefijo `VITE_`**, por lo que nunca llegan al navegador. Solo las lee la función serverless.

| Variable | Descripción |
|---|---|
| `AWS_REGION` | Región de SES, por ejemplo `us-east-1`. Debe coincidir con la región donde verificaste tu identidad. |
| `AWS_ACCESS_KEY_ID` | Access key del usuario IAM con permiso `ses:SendEmail` |
| `AWS_SECRET_ACCESS_KEY` | Secret key del mismo usuario IAM |
| `AWS_SES_SOURCE_EMAIL` | Correo remitente, verificado en SES |

> Además, la función lee `VITE_FIREBASE_API_KEY` para validar el token de sesión del usuario. Esa clave es pública, no es un secreto.
>
> `VITE_DEMO_MODE` aparece en `.env.example`, pero el código no la lee: el modo demo se activa solo cuando faltan las variables de Firebase.

### Dónde se configura cada una

| Entorno | Dónde |
|---|---|
| Desarrollo local | Archivo `.env` en la raíz del proyecto |
| Producción | Vercel → tu proyecto → *Settings* → *Environment Variables* |

---

## Configuración de servicios

### Firebase

1. Crea un proyecto en la [consola de Firebase](https://console.firebase.google.com/) y registra una **app web**. Copia su configuración a las variables `VITE_FIREBASE_*`.
2. **Authentication → Sign-in method:** habilita **Correo/Contraseña** y **Google**.
3. **Authentication → Settings → Authorized domains:** agrega el dominio de producción `mate-code.vercel.app` (`localhost` ya viene autorizado).
4. **Firestore Database:** crea la base de datos y publica las reglas del archivo [`firestore.rules`](firestore.rules).

### AWS SES

1. **Verifica una identidad** de tipo *Email address* en SES (en la región que usarás) y confirma el correo que AWS te envía.
2. **Sandbox:** las cuentas nuevas solo pueden enviar a direcciones **verificadas**. Para las pruebas, usa el mismo correo como remitente y destinatario, o verifica también el del destinatario. Para enviar a cualquier dirección, solicita *Production access* en SES.
3. **Crea un usuario IAM** para la aplicación, sin acceso a la consola, con esta política de mínimo privilegio:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       { "Effect": "Allow", "Action": ["ses:SendEmail"], "Resource": "*" }
     ]
   }
   ```
4. Genera una *access key* para ese usuario y guárdala en `.env` (local) y en las variables de entorno de Vercel. Nunca la subas al repositorio.

---

## Deploy en Vercel

**URL de producción: https://mate-code.vercel.app**

El proyecto se despliega automáticamente desde GitHub: cada `push` a la rama `main` genera un nuevo deploy de producción.

### Primer despliegue

1. Sube el código a GitHub.
2. En [vercel.com/new](https://vercel.com/new) importa el repositorio `Valenii/MateCode`. Vercel detecta Vite: el comando de build es `npm run build` y el directorio de salida es `dist`.
3. **Antes de desplegar**, carga en *Environment Variables* las 10 variables de la sección anterior (6 `VITE_FIREBASE_*` y 4 `AWS_*`).
4. Pulsa **Deploy**.
5. En Firebase, autoriza el dominio de producción (*Authentication → Settings → Authorized domains*).

> **Importante:** las variables `VITE_*` se incrustan en el JavaScript durante el *build*. Si agregas o cambias una variable después de desplegar, hay que **redesplegar** para que se aplique. Lo mismo ocurre con las variables `AWS_*` de la función.

### Cómo se sirve la app

- `vercel.json` reescribe todas las rutas del SPA a `index.html` (para que `/login` o `/tasks` funcionen al recargar), **excluyendo** las rutas de `api/` para no interceptar la función serverless.
- La carpeta `api/` se publica como Vercel Function en `/api/sendEmail`.

---

## Flujo de envío de emails

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
[ Bandeja de entrada del usuario ]
```

**Tipos de notificaciones:**
1. **Resumen de tareas:** botón *Enviar Resumen a mi Correo* en el panel. Incluye el total, pendientes, completadas, tasa de avance y las tareas pendientes de **todas** las tareas, sin importar los filtros activos.
2. **Tarea creada:** confirmación opcional al registrar una tarea.
3. **Tarea completada:** aviso opcional al completarla.

**Seguridad del endpoint:**
- Las credenciales de AWS solo existen en el servidor; el navegador nunca las recibe.
- `/api/sendEmail` no es un relay abierto: exige un usuario autenticado (responde `401` sin token válido) y el destinatario lo decide el servidor —siempre el email de la cuenta—, nunca el cliente.
- Frontend y API comparten origen en Vercel, por lo que no se habilita CORS.

**Modo simulación:** si no hay sesión de Firebase (modo demo) o el servidor no tiene credenciales de AWS, el correo se *simula* y la interfaz lo indica ("Email simulado") en lugar de afirmar que se envió.

---

## Decisiones arquitectónicas

La aplicación sigue una **arquitectura por capas desacoplada**, pensada para ser escalable, testeable y mantenible:

1. **Separación de responsabilidades:**
   - `pages/`: vistas y composición de pantallas.
   - `components/`: componentes de UI reutilizables, sin acoplamiento a servicios.
   - `features/`: lógica de dominio (`auth`, `tasks`).
   - `services/`: adaptadores hacia servicios externos (`firebase.ts`, `api.ts`).
   - `hooks/`: estado reactivo (`useAuth`, `useTasks`).
   - `routes/`: rutas públicas y privadas con guards.
   - `types/`: tipado estricto con TypeScript (`Task`, `UserProfile`, DTOs).
   - `utils/`: funciones puras de validación y formateo.
   - `api/` y `functions/`: funciones serverless para operaciones de backend.

2. **Backend as a Service con Firebase:**
   - **Authentication:** sesión gestionada con el patrón *Observer* (`onAuthStateChanged`), con persistencia transparente.
   - **Cloud Firestore:** documentos por usuario (`userId`) y sincronización en tiempo real con `onSnapshot`, liberando los listeners en `useEffect` para evitar fugas de memoria.

3. **Aislamiento de credenciales:** invocar AWS SES desde el navegador expondría las claves IAM en el bundle. Por eso el frontend solo hace un `POST` a `/api/sendEmail` y es la función serverless quien se autentica con SES usando variables de entorno del servidor.

4. **Reglas de seguridad de Firestore (`firestore.rules`):** solo un usuario autenticado puede leer, modificar o eliminar las tareas cuyo `userId` coincide con su `uid`, y solo puede crear tareas a su nombre.

5. **Tipado con DTOs:** `CreateTaskDTO` y `UpdateTaskDTO` omiten los campos generados por el servidor (`id`, `createdAt`, `userId`).

6. **Fallback silencioso a modo demo:** la aplicación funciona sin credenciales de Firebase, lo que facilita el onboarding y las pruebas.

---

## Testing

La suite incluye **31 pruebas automatizadas** en 8 suites, con Vitest y React Testing Library:

- **Función serverless (`api/sendEmail`):** autenticación obligatoria (401), destinatario forzado al email del token, modo simulación, validación de campos y errores de SES.
- **Validaciones:** formato de email, longitud de contraseña y título de tareas.
- **Componentes:** `Button`, `TodoItem`, `TodoForm` y `TodoList`.
- **Páginas:** `Login` y `Register`.

Los servicios externos (Firebase y AWS SES) están **mockeados** en `tests/setupTests.ts` y en cada suite: los tests no dependen de credenciales, de la red ni envían correos reales.

```bash
npm test
```

---

## Errores frecuentes

| Síntoma | Causa y solución |
|---|---|
| *"Dominio no autorizado en Firebase"* al entrar con Google | El dominio desde el que abres la app no está en *Authentication → Settings → Authorized domains*. Agrega el dominio que aparece en tu barra de direcciones (por ejemplo `mate-code.vercel.app`). |
| No se puede iniciar sesión ni registrarse con correo y contraseña (`PASSWORD_LOGIN_DISABLED` / `auth/operation-not-allowed`) | El proveedor **Correo electrónico/contraseña** no está habilitado en *Authentication → Sign-in method* del proyecto de Firebase. Actívalo y guarda. |
| La UI dice *"Email simulado"* | No hay sesión real de Firebase (modo demo), faltan las variables `AWS_*` en el servidor, o agregaste variables sin redesplegar. |
| Error `Email address is not verified` | El remitente o el destinatario no están verificados en SES, están en otra región, o la cuenta está en *sandbox*. |
| `401 Sesión inválida o expirada` | El token de sesión caducó. Cierra sesión y vuelve a entrar. |
| `500 El servidor no está configurado correctamente` | Falta `VITE_FIREBASE_API_KEY` en las variables de entorno del servidor. |
| `/api/sendEmail` responde 404 en local | Reinicia `npm run dev`: la función se sirve mediante un plugin de Vite que se carga al arrancar. |

---

## Bitácora de Desarrollo Asistido por Inteligencia Artificial

### 1. ¿Cómo se integró la IA en el proceso de trabajo?
Se utilizó la IA como un compañero de pair programming guiado por prompts estructurados para:
- Definir contratos de datos e interfaces estrictas en TypeScript antes de programar la UI.
- Diseñar la arquitectura por capas y la función serverless desacoplada.
- Generar suites de tests comprehensivos para Vitest y React Testing Library.
- Redactar reglas de seguridad de Firestore con principio de mínimo privilegio.

### 2. ¿En qué situaciones fue más efectiva?
- **Identificación de riesgos de seguridad:** detección de la necesidad de mover el SDK de AWS SES fuera del bundle de frontend hacia una función serverless en Vercel para evitar la fuga de credenciales.
- **Manejo de asincronía y reactividad:** implementación correcta de `onAuthStateChanged` y `onSnapshot` con sus funciones de desuscripción para prevenir fugas de memoria.
- **Tipado estricto:** modelado de DTOs (`CreateTaskDTO`, `UpdateTaskDTO`) omitiendo campos generados por el servidor (`id`, `createdAt`, `userId`).

### 3. Patrones y buenas prácticas descubiertas
- **Patrón Adaptador / fallback silencioso:** permitir que la aplicación funcione en modo demo si las credenciales de Firebase no están presentes, facilitando las pruebas de componentes y el onboarding.
- **Mobile First y CSS Variables:** centralización de tokens en `index.css` para consistencia visual, modo oscuro nativo y rendimiento óptimo sin sobrecarga de frameworks externos.
- **Commits semánticos:** estructuración de cambios mediante *Conventional Commits* (`feat:`, `fix:`, `test:`, `docs:`, `chore:`).
