# module_catalog

Canciones, artistas, álbumes, importación, subidas y streaming.

Expone su interfaz a otros módulos en `public.py`.

## Streaming

`GET /api/songs/{id}/stream` soporta `Range` y responde `206`. El elemento `<audio>` no puede enviar `Authorization`, así que
el navegador pide primero `POST /api/songs/{id}/stream-ticket` y usa `?ticket=`. El ticket es un JWT de 1 hora ligado a la pista.

Las pistas de Jamendo pasan por proxy, sin escribir a disco, con timeout de 3 s y un reintento. Con `JAMENDO_AUDIO_MODE=redirect`
se redirige a la URL oficial. La conexión a la base se libera antes de empezar a transmitir.

## Importación de Jamendo

`POST /api/admin/catalog/import` crea un job y devuelve `job_id`. El job importa por páginas, es idempotente por `jamendo_id` y
guarda su avance, así que `POST .../{job_id}/resume` continúa donde falló. Respeta los límites con espera de 1, 2 y 4 s. El
refresco diario solo actualiza metadatos que cambiaron.

## Subidas

Solo MP3 de hasta 15 MB y portadas JPG o PNG de hasta 2 MB, comprobados por contenido. El archivo se escribe primero en
`tmp/`, se valida y se mueve con un nombre UUID. Las portadas son públicas en `/api/media/covers/...`; el audio nunca se sirve
por esa ruta. Cuota: 20 pistas por Compositor.
