# Interfaz web

SPA con React, Vite y TypeScript. FastAPI la sirve en producción, por eso el audio sigue sonando al navegar.

## Comandos

| Comando | Qué hace |
|---|---|
| `npm install` | Instala dependencias |
| `npm run dev` | Servidor de desarrollo; pasa `/api` a `localhost:8080` |
| `npm test` | Pruebas con Vitest |
| `npm run build` | Revisa tipos y compila a `dist/` |

## Carpetas

| Carpeta | Contenido |
|---|---|
| [`public/`](public/README.md) | Favicons y manifiesto |
| [`src/api/`](src/api/README.md) | Cliente HTTP y tipos |
| [`src/assets/`](src/assets/README.md) | Logos |
| [`src/auth/`](src/auth/README.md) | Sesión |
| [`src/charts/`](src/charts/README.md) | Gráficas y exportación |
| [`src/components/`](src/components/README.md) | Piezas reutilizables |
| [`src/pages/`](src/pages/README.md) | Pantallas |
| [`src/player/`](src/player/README.md) | Reproductor |
| [`src/styles/`](src/styles/README.md) | Tokens y estilos |

## Pruebas de navegador

Ver [`e2e/`](e2e/README.md). Necesitan el stack de Docker en marcha.
