# Interfaz web

La app que usa la gente: una SPA con React, Vite y TypeScript. Al ser una sola página, navegar no recarga nada y el audio
sigue sonando. En producción FastAPI sirve los archivos compilados, así que no hay un servidor aparte. Usa Node 24, la
misma versión del `Dockerfile`.

## Comandos

| Comando | Qué hace |
|---|---|
| `npm install` | Instala dependencias |
| `npm run dev` | Servidor de desarrollo; pasa `/api` a `localhost:8080` |
| `npm test` | Pruebas con Vitest |
| `npm run e2e` | Pruebas de navegador con Playwright |
| `npm run build` | Revisa tipos y compila a `dist/` |

Para `npm run dev` y `npm run e2e` hace falta el backend arriba: `docker compose up -d` desde la raíz.

## Carpetas

| Carpeta | Contenido |
|---|---|
| [`e2e/`](e2e/README.md) | Pruebas de navegador |
| [`public/`](public/README.md) | Favicons y manifiesto |
| [`src/`](src/README.md) | Código de la interfaz |
| [`src/api/`](src/api/README.md) | Cliente HTTP y tipos |
| [`src/assets/`](src/assets/README.md) | Logos |
| [`src/auth/`](src/auth/README.md) | Sesión |
| [`src/charts/`](src/charts/README.md) | Gráficas y exportación |
| [`src/components/`](src/components/README.md) | Piezas reutilizables |
| [`src/pages/`](src/pages/README.md) | Pantallas |
| [`src/player/`](src/player/README.md) | Reproductor |
| [`src/styles/`](src/styles/README.md) | Tokens y estilos |
