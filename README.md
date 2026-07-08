# 🏋️‍♂️ WOD the FAQ

**WOD the FAQ** es una aplicación web social premium diseñada para entusiastas de CrossFit y entrenamiento funcional. Su objetivo principal es permitir a los atletas compartir los resultados de sus entrenamientos (WODs), competir amistosamente en leaderboards grupales y mantenerse conectados con su comunidad.

---

## 🚀 Características Clave

* **Grupos y Boxes**: Crea y únete a comunidades personalizadas. Soporta dos tipos de dinámicas:
  * **Grupo Privado (Para amigos/compañeros)**: Todos los miembros comparten permisos equivalentes. El primer miembro en publicar un WOD establece el entrenamiento oficial de ese día para todo el grupo.
  * **Grupo de Box (Oficial)**: Pensado para gimnasios y entrenadores. Solo los administradores (coaches) pueden programar el WOD diario, controlando así el leaderboard oficial del Box.
* **Inteligencia Artificial con Gemini**: Los administradores pueden subir una foto de la pizarra física del Box y la IA (`gemini-2.5-flash`) transcribirá y estructurará automáticamente el WOD (Fuerza, Metcon, Time Cap, Notas).
* **Registro de Performance**: Registra marcas de forma precisa:
  * Modalidades RX y Scaled (Adaptado).
  * Soporte de unidades en KG y LB.
  * Control de resultados en tiempo, repeticiones o repeticiones fallidas por límite de tiempo (CAP).
  * Posibilidad de adjuntar una foto del resultado como prueba.
* **Leaderboard con Podio 3D**: Clasificación diaria dinámica e interactiva que posiciona a los atletas en un podio visual de 1º, 2º y 3º puesto.
* **Feed Comunitario y Chat**: Visualiza los resultados de tus compañeros, lee sus adaptaciones/sensaciones y comenta o chatea en tiempo real en la sala integrada del grupo.

---

## 🛠️ Stack Tecnológico

### Frontend
* **Core**: React 19, TypeScript, Vite 6.
* **Estilos**: Tailwind CSS v4 (con integración nativa vía `@tailwindcss/vite` e `index.css`).
* **Animaciones**: Framer Motion (`motion`).
* **Iconos**: Lucide React.

### Backend
* **Servidor**: Express (Node.js) ejecutado mediante `tsx` para desarrollo ágil y compilado con `esbuild` en producción.
* **API de IA**: SDK oficial de Google GenAI (`@google/genai`) con el modelo `gemini-2.5-flash`.

### Base de Datos y Autenticación
* **Firebase Auth**: Login social mediante cuenta de Google y Apple, además de autenticación por email.
* **Cloud Firestore**: Almacenamiento no relacional en tiempo real para usuarios, grupos, WODs, marcas y chats.

---

## 📂 Estructura del Código

```bash
├── api/
│   └── transcribe.ts            # Endpoint serverless / Handler para la API de Gemini (Vercel)
├── src/
│   ├── components/
│   │   └── layout/
│   │       ├── BottomNav.tsx    # Navegación inferior persistente de la SPA
│   │       └── TopBar.tsx       # Barra superior de la cabecera
│   ├── contexts/
│   │   └── AuthContext.tsx      # Contexto de autenticación y sincronización del usuario en Firestore
│   ├── lib/
│   │   ├── db.ts                # Funciones CRUD para colecciones de Firestore (grupos, miembros, resultados)
│   │   ├── firebase.ts          # Inicialización y configuración de los servicios Firebase
│   │   └── imageUtils.ts        # Redimensionamiento y compresión de fotos de marcas en el cliente
│   ├── screens/
│   │   ├── LoginScreen.tsx      # Pantalla de acceso y onboarding
│   │   ├── HomeScreen.tsx       # Listado de squads y accesos a crear/unirse
│   │   ├── CreateGroupScreen.tsx# Formulario de creación de grupos (Privado vs Oficial Box)
│   │   ├── JoinGroupScreen.tsx  # Ingreso de código de invitación al squad
│   │   └── WodScreen.tsx        # Detalle de WOD, log de marcas, chat y leaderboard (Podio)
│   ├── types.ts                 # Definiciones de tipos e interfaces de TypeScript
│   ├── index.css                # Configuración de Tailwind CSS v4, fuentes y variables de diseño
│   ├── main.tsx                 # Entrada principal de la aplicación React
│   └── App.tsx                  # Enrutador principal de la SPA
├── server.ts                    # Servidor Express de desarrollo y middleware de Vite
├── tsconfig.json                # Configuración del compilador TypeScript
├── package.json                 # Gestión de dependencias y scripts de construcción
└── vercel.json                  # Configuración de despliegue y ruteo para Vercel
```

---

## 💻 Configuración Local

### Requisitos Previos
* **Node.js** instalado en el sistema.
* Una cuenta de **Firebase** configurada con un proyecto que tenga Auth y Firestore activos.
* Una clave de API de **Google AI Studio** para usar las funciones de Gemini.

### Pasos para iniciar

1. **Clonar el proyecto** e instalar las dependencias:
   ```bash
   npm install
   ```

2. **Configurar las variables de entorno**:
   Crea un archivo `.env.local` en la raíz del proyecto (basándote en `.env.example`) y completa los campos:
   ```env
   GEMINI_API_KEY=tu_clave_de_api_de_gemini
   VITE_FIREBASE_API_KEY=tu_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=tu_firebase_auth_domain
   VITE_FIREBASE_PROJECT_ID=tu_firebase_project_id
   VITE_FIREBASE_STORAGE_BUCKET=tu_firebase_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=tu_firebase_messaging_sender_id
   VITE_FIREBASE_APP_ID=tu_firebase_app_id
   ```

3. **Iniciar en modo desarrollo**:
   ```bash
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 🚀 Producción y Despliegue

### Construir localmente
Para compilar tanto el frontend de React como el servidor de producción Express en Node.js, ejecuta:
```bash
npm run build
```
Esto creará el paquete final en la carpeta `/dist`.

### Desplegar en Vercel
El archivo [vercel.json](file:///Users/cristianbanobelchi/Library/CloudStorage/GoogleDrive-babelscris@gmail.com/Mi%20unidad/WOD%20the%20FAQ/vercel.json) ya está configurado para enrutar las peticiones de la SPA de React y las APIs de Vercel Functions (`/api/transcribe.ts`). 
Simplemente vincula tu repositorio de GitHub a Vercel y añade tus variables de entorno en el panel de control.
