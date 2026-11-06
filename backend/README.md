# Backend

La aplicación FastAPI de MELOXO: un proceso, seis módulos y un PostgreSQL. Necesita Python 3.11 o superior; la imagen de
Docker usa 3.12.

| Carpeta | Contenido |
| --- | --- |
| [`app/`](app/README.md) | Código de la aplicación |
| [`migrations/`](migrations/README.md) | Migraciones de Alembic |
| [`seed/`](seed/README.md) | Datos de demo. Es un comando aparte |
| [`tests/`](tests/README.md) | Pruebas contra PostgreSQL real |

## Comandos

La primera vez, prepara el entorno desde esta carpeta:

```bash
python3 -m venv .venv
.venv/bin/pip install -e '.[dev]'
```

Después:

```bash
.venv/bin/pytest                                  # pruebas, con postgres en el puerto 5433
.venv/bin/pytest tests/modules/social      # solo un módulo
.venv/bin/alembic upgrade head                    # aplica las migraciones
.venv/bin/alembic revision --autogenerate --rev-id 0012 -m "tema"   # migración nueva
```

`docker compose up -d postgres`, desde la raíz, levanta la base en ese puerto. Las migraciones usan `DATABASE_URL` de
`.env`. Dentro de Docker no hay que correrlas a mano: el contenedor las aplica al arrancar.
