# modules/social

Favoritas, seguidos, casetes, invitaciones y avisos.

**Tablas:** `favorites`, `follows`, `notices_seen`, `tapes`, `tape_members`, `tape_tracks`, `tape_invites`, `invite_claims`.

**Lo que ofrece a otros módulos:** `count_tape_inclusions` y `tape_activity`, en `public.py`.

## Avisos

Se calculan al leer, sin bus de eventos: cruzan los artistas seguidos con `published_since` de catálogo. Solo avisan las
publicaciones de Compositores, y solo las posteriores al momento de seguir y a la última marca de `notices_seen`.

Si catálogo falla, `GET /api/notices` responde 200 con `degraded: true`.

## Casetes

`tapes.py` guarda las reglas y `tape_routes.py` las rutas. Toda escritura que dependa de un límite toma primero la fila del
casete con `SELECT ... FOR UPDATE`, así dos miembros nunca pasan juntos por la pista 12 ni por la plaza 8.

- **Orden:** `tapes.version` sube cuando cambian las pistas. Reordenar con una versión vieja responde 409.
- **Lados:** son solo la posición. La primera mitad de `TAPE_MAX_TRACKS` es Lado A y el resto Lado B.
- **Pista oculta o borrada:** conserva lugar y dedicatoria gracias a `metadata_cache`, con `available: false`.

## Invitaciones

Solo por enlace, sin búsqueda de personas. El token se guarda como hash, por eso se muestra una sola vez al crearlo.

Abrir el enlace crea una invitación pendiente. La lista de pendientes no puede devolver el token, así que Inicio acepta o
descarta con `POST /api/tapes/claims/{invite_id}/join` y `/dismiss`.

| Situación | Respuesta |
|---|---|
| Enlace revocado o caducado | 410 |
| Enlace sin usos restantes, o casete sin plazas | 409 |
| Ya eres miembro | 200 con `joined: false`, sin gastar un uso |
