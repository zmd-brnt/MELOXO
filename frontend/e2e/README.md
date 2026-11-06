# Pruebas de navegador

Playwright sobre la app real: Vite en `:5174` y el backend de Docker en `:8080`.

```bash
docker compose up -d            # desde la raíz del repositorio
cd frontend
npx playwright install chromium # solo la primera vez
npm run e2e
```

| Archivo | Para qué sirve |
|---|---|
| `setup.ts` | Crea por la API un Compositor, una pista y un casete. Lee `ADMIN_EMAIL` y `ADMIN_PASSWORD` de `.env` |
| `helpers.ts` | Inicio de sesión, avance con Tab y revisión con axe |
| `responsive.spec.ts` | Teléfono a 390 y 320 px: pestañas, reproductor, hoja y desbordes |
| `a11y.spec.ts` | Escritorio: flujo solo con teclado, foco visible y axe |
| `fixtures/tone.mp3` | Tono de 30 s generado con ffmpeg, sin derechos de terceros |

Hay dos proyectos en `playwright.config.ts`: `telefono` corre `responsive.spec.ts` y `escritorio` corre `a11y.spec.ts`.
No hace falta la semilla, porque `setup.ts` crea lo que necesita.

Cada ejecución agrega usuarios `compositor-…` y `oyente-…@meloxo.dev`, una pista y un casete a la base local. No uses
estas pruebas contra una base con datos que quieras conservar.
