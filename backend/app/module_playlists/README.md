# module_playlists

Playlists y sus pistas.

Expone su interfaz a otros módulos en `public.py`.

## Degradación elegante

Cada fila de `playlist_songs` guarda en `metadata_cache` los datos de la pista. Se escribe al agregar y se refresca al
leer si el catálogo responde. Si el catálogo falla, la lectura responde 200 con `degraded: true` y los datos de la caché;
agregar pistas responde 503 porque no se puede validar la canción.

Una pista oculta o borrada sigue en la lista con `available: false`, para que quien la guardó vea que ya no está.
