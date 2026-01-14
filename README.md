# Brief Frontend

Frontend para la aplicación Brief - una herramienta de procesamiento y edición de archivos PSD con inteligencia artificial.

## 📋 Descripción

Brief Frontend es una aplicación web construida con Next.js que permite a los usuarios:

- **Subir archivos PSD** - Carga y analiza archivos de Photoshop
- **Visualizar capas** - Explora la estructura de capas del PSD
- **Modificar con IA** - Aplica modificaciones inteligentes a capas específicas
- **Gestionar tipos de capas** - Soporte para texto, smart objects, imágenes y grupos

## 🚀 Tecnologías

- [Next.js 16](https://nextjs.org/) - Framework de React
- [React 19](https://react.dev/) - Biblioteca de UI
- [TypeScript](https://www.typescriptlang.org/) - Tipado estático
- [Tailwind CSS 4](https://tailwindcss.com/) - Framework de estilos
- [ESLint](https://eslint.org/) - Linting de código

## 📦 Instalación

### Prerrequisitos

- Node.js 18.x o superior
- npm, yarn, pnpm o bun

### Pasos

1. Clona el repositorio:

   ```bash
   git clone https://github.com/tu-usuario/brief-frontend.git
   cd brief-frontend
   ```

2. Instala las dependencias:

   ```bash
   npm install
   ```

3. Copia el archivo de variables de entorno:

   ```bash
   cp .env.example .env
   ```

4. Configura las variables de entorno en `.env`

## 🔧 Uso

### Desarrollo

```bash
npm run dev
```

### Producción

```bash
npm run build
npm run start
```

### Linting

```bash
npm run lint
```

## 🔐 Variables de Entorno

| Variable              | Descripción     | Default                 |
| --------------------- | --------------- | ----------------------- |
| `NEXT_PUBLIC_API_URL` | URL del backend | `http://localhost:3000` |
