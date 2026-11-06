# Módulos

Los seis módulos del negocio. Cada uno es dueño de sus tablas y solo se habla con los demás por su `public.py`.

| Módulo | Responsabilidad |
| --- | --- |
| [`users/`](users/README.md) | Cuentas, roles, solicitudes de Compositor y auditoría |
| [`playlists/`](playlists/README.md) | Playlists y sus pistas |
| [`catalog/`](catalog/README.md) | Canciones, artistas, álbumes, importación, subidas y streaming |
| [`playback/`](playback/README.md) | Eventos de reproducción, contadores e historial |
| [`social/`](social/README.md) | Favoritas, seguidos, casetes, invitaciones y avisos |
| [`analytics/`](analytics/README.md) | Agregados para gráficas, latencia y salud |

Qué significa cada archivo de un módulo está en el [README de la aplicación](../README.md#qué-hay-en-un-módulo).
