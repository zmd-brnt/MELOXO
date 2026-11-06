# Pruebas

Corren contra PostgreSQL real en la base `meloxo_test`, porque los criterios críticos dependen de bloqueos reales. La base
se crea sola y se limpia entre pruebas. Jamendo se simula con `respx`.

Necesitas `docker compose up -d postgres` y un `.env` con `POSTGRES_PASSWORD`.

[`modules/`](modules/README.md) repite los módulos de `app/modules/`, y [`seed/`](seed/README.md) prueba la semilla. En la
raíz quedan las pruebas de todo el proyecto:

| Archivo | Para qué sirve |
| --- | --- |
| `conftest.py` | Prepara la base, la app y los usuarios de prueba |
| `boundaries.py` | Detector de importaciones entre módulos |
| `media.py` | MP3, JPG y PNG mínimos, para no guardar binarios en el repositorio |
| `test_boundaries.py` | Comprueba que ningún módulo se salte `public.py` |
| `test_health.py` | Salud y formato de errores |
| `test_pool.py` | Una petición no retiene su conexión mientras otro módulo abre la suya |
| `test_readmes.py` | Toda carpeta tiene README |
| `test_spa.py` | La app sirve la interfaz sin pisar la API |
