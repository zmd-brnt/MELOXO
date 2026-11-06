# Core

Lo que usan todos los módulos. Aquí no van reglas de negocio.

| Archivo | Para qué sirve |
| --- | --- |
| `config.py` | Variables de entorno |
| `db.py` | Motor, sesiones y base de los modelos. `session_scope()` es la sesión de `public.py` |
| `errors.py` | `AppError` y el formato uniforme de errores |
| `security.py` | Contraseñas y JWT |
| `auth.py` | Usuario actual y roles |
| `pagination.py` | Páginas de resultados |
| `scheduler.py` | Tareas periódicas |
