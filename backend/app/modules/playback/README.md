# modules/playback

Eventos de reproducción, contadores e historial.

**Tablas:** `playback_events`, `playback_counters`.

**Lo que ofrece a otros módulos:** `events_since`, `duplicates_discarded` y `retention_for_songs`, en `public.py`.

## Idempotencia

`POST /api/playbacks` inserta con `ON CONFLICT (playback_id) DO NOTHING`. Si no insertó, suma 1 a `duplicates_discarded`
en la misma transacción. La respuesta es 201 si era nueva y 200 si era un reenvío.

`PATCH /api/playbacks/{playback_id}/progress` solo aumenta `listened_seconds`: no cuenta como reproducción ni como
duplicado. La gráfica de retención depende de ese dato.

`modules/analytics` lee estos eventos con `events_since`, nunca directo de las tablas.
