# Pruebas de la semilla

Corren la semilla con tamaños reducidos, Jamendo simulado y PostgreSQL real. `ffmpeg` solo existe en la imagen de
Docker, así que aquí los tonos se reemplazan por un MP3 mínimo; la corrida real se verifica con
`docker compose exec app python -m seed all`.
