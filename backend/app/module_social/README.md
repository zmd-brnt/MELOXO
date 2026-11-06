# module_social

Favoritas, seguidos, casetes, invitaciones y avisos.

Expone su interfaz a otros módulos en `public.py`.

## Avisos

Se calculan al leer, sin bus de eventos: cruzan los artistas seguidos con `published_since` de catálogo. Solo avisan las
publicaciones de Compositores, y solo las posteriores al momento de seguir y a la última marca de `notices_seen`.

Si catálogo falla, `GET /api/notices` responde 200 con `degraded: true`.
