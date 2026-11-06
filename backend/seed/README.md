# Semilla de demo

Llena una instalación con catálogo real de Jamendo y actividad simulada. Es un comando aparte: la app nunca lo corre al
arrancar.

```bash
docker compose exec app python -m seed all
```

| Comando | Qué hace |
|---|---|
| `all` | `catalog` y después `activity` |
| `catalog` | Importa unas 2,000 pistas de Jamendo. Si ya se hizo, no pide nada |
| `activity` | Borra lo simulado y lo crea de nuevo: cuentas, pistas locales, casetes, playlists y 90 días de reproducciones |
| `clear` | Borra todo lo simulado y los tonos generados. Las pistas de Jamendo y los usuarios reales se quedan |

Las cuentas son `oyente00@demo.meloxo.dev`, `compositor00@demo.meloxo.dev` y `admin00@demo.meloxo.dev`. Su clave es
`DEMO_PASSWORD` de `.env`; si está vacía, se genera una al azar y se imprime al terminar.

## Reglas

- Todo lo simulado lleva `is_demo`. Las pistas de Jamendo son reales y no se marcan.
- Cada módulo escribe lo suyo en su `demo.py`, expuesto por `public.py`. Aquí no se importan modelos de otros módulos.
- La latencia no se simula: la gráfica muestra peticiones reales, así que se llena al usar la app.
- El audio de las pistas locales son tonos de `ffmpeg`, generados en `MEDIA_DIR/demo`. No se versionan.

| Archivo | Para qué sirve |
|---|---|
| `__init__.py` | Tamaños y orden de los pasos |
| `__main__.py` | Línea de comandos |
| `catalog.py` | Importación de Jamendo |
| `users.py` | Cuentas ficticias |
| `activity.py` | Pistas locales, casetes, playlists y reproducciones |
| `audio.py` | Tonos con `ffmpeg` |
