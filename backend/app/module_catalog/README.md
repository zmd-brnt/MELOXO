# module_catalog

Canciones, artistas, álbumes, importación, subidas y streaming.

Expone su interfaz a otros módulos en `public.py`.

## Streaming

`GET /api/songs/{id}/stream` soporta `Range` y responde `206`. El elemento `<audio>` no puede enviar `Authorization`, así que
el navegador pide primero `POST /api/songs/{id}/stream-ticket` y usa `?ticket=`. El ticket es un JWT de 1 hora ligado a la pista.

Las pistas de Jamendo pasan por proxy, sin escribir a disco, con timeout de 3 s y un reintento. Con `JAMENDO_AUDIO_MODE=redirect`
se redirige a la URL oficial. La conexión a la base se libera antes de empezar a transmitir.
