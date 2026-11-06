# Vistas de Compositor

Pantallas para quien publica música. Están bajo `/composer` y solo las ve el rol Compositor; el permiso real lo revisa
el backend.

| Archivo | Ruta | Para qué sirve |
|---|---|---|
| `Tracks.tsx` | `/composer` | Lista de pistas con su estado, publicar, ocultar y eliminar |
| `TrackForm.tsx` | `/composer/new` | Subir una pista, con validación previa y progreso |
| `Albums.tsx` | `/composer/albums` | Crear y ver álbumes y EP |
| `Profile.tsx` | `/composer/profile` | Editar el perfil de artista |
| `Stats.tsx` | `/composer/stats` | Reproducciones, retención, lanzamientos y conteo de inclusiones |
| `Request.tsx` | Dentro de `/profile` | Solicitud de un Oyente para ser Compositor |

Las inclusiones solo muestran un conteo: nunca quién agregó la pista ni en qué casete está.
