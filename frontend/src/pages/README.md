# Pantallas

Una pantalla por ruta. Las rutas van en inglés y el texto en español. La lista completa está en `App.tsx`.

| Archivo | Ruta | Para qué sirve |
|---|---|---|
| `Home.tsx` | `/` | Inicio: casetes, invitaciones pendientes y lanzamientos |
| `Search.tsx` | `/search` | Buscar en el catálogo |
| `Library.tsx` | `/library` | Casetes, playlists y artistas que sigues |
| `Favorites.tsx` | `/favorites` | Canciones favoritas |
| `History.tsx` | `/history` | Lo escuchado |
| `Stats.tsx` | `/stats` | Estadísticas propias |
| `Profile.tsx` | `/profile` | Cuenta, y solicitud para ser Compositor |
| `Playlist.tsx` | `/playlists/:id` | Una playlist |
| `Artist.tsx` | `/artists/:id` | Un artista |
| `TapeCreate.tsx` | `/tapes/new` | Crear un casete |
| `TapeDetail.tsx` | `/tapes/:id` | Un casete: lados, dedicatorias y orden |
| `TapeInvite.tsx` | `/invite/:token` | Abrir un enlace de invitación |
| `Login.tsx`, `Register.tsx` | `/login`, `/register` | Entrar y registrarse, con `AuthForm.tsx` como base |
| `NotFound.tsx` | Cualquier otra | Página no encontrada |

Reordenar un casete funciona arrastrando y con los botones subir y bajar, que son la vía de teclado. Si otra persona cambió
el casete, el servidor responde 409 y la pantalla recarga.

## Subcarpetas

- [`composer/`](composer/README.md): vistas de Compositor.
- [`admin/`](admin/README.md): vistas de Administrador.
