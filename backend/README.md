# Backend

Aplicación FastAPI de MELOXO: un proceso, seis módulos, un PostgreSQL.

- `app/`: código de la aplicación.
- `migrations/`: migraciones de Alembic.
- `tests/`: pruebas contra PostgreSQL real.

```bash
.venv/bin/pytest                                  # pruebas (requiere postgres en el puerto 5433)
.venv/bin/alembic upgrade head                    # aplicar migraciones
.venv/bin/alembic revision --autogenerate -m "x"  # nueva migración
```
