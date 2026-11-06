# module_playback

Eventos de reproducción, contadores e historial.

Expone su interfaz a otros módulos en `public.py`.

## Idempotencia

`POST /api/playbacks` inserta con `ON CONFLICT (playback_id) DO NOTHING`. Si no insertó, suma 1 a `duplicates_discarded`
en la misma transacción. La respuesta es 201 si era nueva y 200 si era un reenvío.

`PATCH /api/playbacks/{playback_id}/progress` solo aumenta `listened_seconds`: no cuenta como reproducción ni como
duplicado. La gráfica de retención depende de ese dato.

`module_analytics` lee estos eventos con `events_since`, nunca directo de las tablas.
