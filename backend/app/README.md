# Aplicación

`main.py` crea la app, registra las rutas y arranca las tareas periódicas. `core/` tiene lo compartido y cada carpeta de
[`modules/`](modules/README.md) es dueña de sus tablas.

**Regla de frontera:** un módulo solo importa de otro a través de `public.py`, y `public.py` trabaja con tipos simples y
abre su propia sesión. `backend/tests/test_boundaries.py` hace fallar la suite si se rompe la regla. En la rama 02, esas
funciones públicas se vuelven llamadas HTTP.

## Qué hay en un módulo

No todos tienen todos los archivos, pero cuando existen significan lo mismo:

| Archivo | Para qué sirve |
| --- | --- |
| `routes.py` | Rutas de la API |
| `schemas.py` | Lo que entra y sale de la API |
| `service.py` | Reglas del negocio |
| `models.py` | Tablas del módulo |
| `public.py` | Lo único que pueden usar los demás módulos |
| `demo.py` | Inserción y limpieza de los datos de la semilla |

## Tareas periódicas

Corren dentro del proceso, y `DISABLE_SCHEDULER` las apaga. Una tarea nueva tiene que ser segura con dos procesos a la vez,
porque en la rama 03 habrá réplicas.

| Tarea | Cada cuánto | Módulo |
| --- | --- | --- |
| Publicar pistas programadas | 30 s | `modules/catalog` |
| Actualizar agregados | 2 s | `modules/analytics` |
| Volcar la latencia | 30 s | `modules/analytics` |
| Refrescar metadatos de Jamendo | 24 h, la primera a la hora de arrancar | `modules/catalog` |

## Rutas generales

- `GET /api/health`: responde si el proceso está vivo.
- `/api/docs`: documentación interactiva de todas las rutas.
- Lo que no empieza con `/api` lo atiende la interfaz, si `STATIC_DIR` está definida.
