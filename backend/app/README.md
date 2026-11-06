# Aplicación

`main.py` crea la app. `core/` tiene lo compartido. Cada `module_*` es dueño de sus tablas.

**Regla de frontera:** un módulo solo importa de otro a través de `public.py`, y `public.py` trabaja con tipos simples y
abre su propia sesión. `tests/test_boundaries.py` hace fallar la suite si se rompe la regla. En la rama 02, esas funciones
públicas se vuelven llamadas HTTP.
