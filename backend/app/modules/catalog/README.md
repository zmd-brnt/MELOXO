# modules/catalog

Canciones, artistas, álbumes, importación, subidas y streaming.

**Tablas:** `artists`, `albums`, `songs`, `import_jobs`, `published_events`.

**Lo que ofrece a otros módulos:** `get_songs`, `get_artists`, `song_is_playable`, `songs_owned_by`, `published_since`, `upcoming_for_artists`, `release_counts`, `catalog_by_source`, `jamendo_status`, `publish_due_tracks` y `refresh_metadata`, en `public.py`.

Además de los archivos de siempre: `streaming.py` entrega el audio, `jamendo.py` es el cliente de la API, `import_jobs.py` importa por lote, `uploads.py` valida y guarda archivos, `publishing.py` publica y modera, y `composer.py` con `composer_routes.py` atienden al Compositor.

## Streaming

`GET /api/songs/{id}/stream` soporta `Range` y responde `206`. El elemento `<audio>` no puede enviar `Authorization`, así que
el navegador pide primero `POST /api/songs/{id}/stream-ticket` y usa `?ticket=`. El ticket es un JWT de 1 hora ligado a la pista.

Las pistas de Jamendo pasan por proxy, sin escribir a disco, con timeout de 3 s y un reintento. Con `JAMENDO_AUDIO_MODE=redirect`
se redirige a la URL oficial. La conexión a la base se libera antes de empezar a transmitir.

Si la URL de audio guardada responde con error 4xx, se pide una nueva a Jamendo, se guarda y se reintenta una vez. Así no
importa si el parámetro `from` de esas URLs caduca.

## Importación de Jamendo

`POST /api/admin/catalog/import` crea un job y devuelve `job_id`. El job importa por páginas, es idempotente por `jamendo_id` y
guarda su avance, así que `POST .../{job_id}/resume` continúa donde falló. Respeta los límites con espera de 1, 2 y 4 s. El
refresco diario solo actualiza metadatos que cambiaron.

## Subidas

Solo MP3 de hasta 15 MB y portadas JPG o PNG de hasta 2 MB. El MP3 se comprueba leyendo el archivo; la portada, solo por
sus primeros bytes. El archivo se escribe primero en
`tmp/`, se valida y se mueve con un nombre UUID. Las portadas son públicas en `/api/media/covers/...`; el audio nunca se sirve
por esa ruta. Cuota: 20 pistas por Compositor.

## Publicación programada

Cada 30 s, `publish_due_tracks` publica lo vencido con `FOR UPDATE SKIP LOCKED`, así dos procesos no publican la misma pista.
`published_events` es el registro único de `track_published`. Ocultar y restaurar no lo tocan: un administrador devuelve
la pista al estado que tenía, guardado en `status_before_hide`, y solo restaura lo que ocultó un administrador.
