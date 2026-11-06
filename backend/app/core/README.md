# Core

Piezas compartidas por todos los módulos.

- `config.py`: variables de entorno.
- `db.py`: motor, sesiones y base de los modelos. `session_scope()` es la sesión de `public.py`.
- `errors.py`: `AppError` y el formato uniforme de errores.
- `security.py`: contraseñas y JWT. `auth.py`: usuario actual y roles. `pagination.py`: páginas. `scheduler.py`: tareas periódicas.
