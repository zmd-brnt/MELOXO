# Migraciones

Migraciones de Alembic. Las pruebas aplican estas mismas migraciones, así que un esquema roto hace fallar la suite.

`env.py` conecta Alembic con los modelos, `script.py.mako` es la plantilla de los archivos nuevos y
[`versions/`](versions/README.md) guarda las migraciones.
