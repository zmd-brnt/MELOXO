# demo

Escenarios reproducibles del PRD y prueba de carga. Cada escenario corre contra `http://localhost:8080`,
imprime `PASA` o `FALLA` y sale con error si falla.

## Antes de empezar

Hace falta el stack arriba y con semilla, y un `.env` con `ADMIN_EMAIL` y `ADMIN_PASSWORD`:

```bash
docker compose up -d --build
docker compose exec app python -m seed all
```

## Escenarios

Solo usan la biblioteca estándar de Python:

```bash
for f in demo/escenario_*.py; do python3 "$f" || break; done
```

| Archivo | Qué comprueba |
| --- | --- |
| `escenario_3_jamendo_caido.py` | Con Jamendo cortado, las pistas locales y los metadatos guardados siguen; el audio de Jamendo da `503 jamendo_unavailable` |
| `escenario_4_idempotencia.py` | 100 envíos del mismo `playback_id`: una reproducción y `duplicates_discarded` +99 |
| `escenario_5_casete_lleno.py` | Dos miembros agregan a la vez la pista 12: una `201` y una `409 tape_full`, en 5 rondas |
| `escenario_6_ultimo_admin.py` | Degradar al único administrador activo da `409`, no cambia nada y queda auditado |
| `escenario_7_permisos.py` | Un Compositor recibe `403` en pistas ajenas y en `/api/admin/*` |
| `escenario_8_doble_publicacion.py` | Dos réplicas con pistas vencidas: un evento `track_published` y un aviso por pista |

`common.py` reúne las ayudas. `docker-compose.demo.yml`, en la raíz, es el overlay de los escenarios 3 y 8.

### Lo que hay que saber

- **Los escenarios 3 y 8 recrean el contenedor `app`.** Lo devuelven a su estado normal en el 8080 aunque fallen.
  No los corras mientras alguien usa la app.
- **Cortar Jamendo son dos cosas.** `JAMENDO_API_URL` solo cubre la API. El audio sale directo a
  `prod-1.storage.jamendo.com`, por eso el overlay también apunta ese host a una dirección que no responde.
- **El escenario 6 suspende a los demás administradores** para quedar como único activo, y los reactiva al terminar.
- **El escenario 8 vence las pistas con SQL**, con la app apagada, porque la API rechaza fechas pasadas. Así las dos
  réplicas las encuentran al arrancar. Comprueba el resultado, pero no garantiza que ambas consultaran en el mismo
  instante.
- **Quedan usuarios en la base.** Las cuentas `*@escenarios.meloxo.dev` no tienen `is_demo`, y `seed clear` no las
  borra. Las pistas que crean los escenarios sí se eliminan al terminar.

## Prueba de carga

Locust no es dependencia del proyecto. Instálalo en un entorno aparte:

```bash
python3 -m venv /tmp/locust && /tmp/locust/bin/pip install locust
/tmp/locust/bin/locust -f demo/locustfile.py --headless -u 50 -r 10 -t 2m --host http://localhost:8080 --only-summary
```

Cada cliente se registra, arma una lista de 20 pistas y luego busca, abre su lista y escucha. Solo reproduce pistas
locales: Jamendo queda fuera de la carga. El primer byte es el tiempo hasta recibir los encabezados de la respuesta
de audio.

### Resultado

Corrida del 2026-11-06, 50 clientes durante 2 minutos, 5522 peticiones, 0 fallos.

| Medida | p50 | p95 | Objetivo p95 |
| --- | --- | --- | --- |
| Primer byte de audio | 13 ms | 48 ms | < 500 ms |
| `GET /api/songs` | 42 ms | 98 ms | < 300 ms |
| `GET /api/playlists/{id}` | 30 ms | 87 ms | < 200 ms |

Máquina: laptop Intel i7-1165G7, 8 hilos, 15 GB de RAM, Linux. Locust, la app (un proceso de uvicorn) y PostgreSQL
corrieron en la misma máquina, así que el resultado no incluye la latencia de una red real.

Los peores casos (p99 de 300 a 570 ms, máximo de 1.1 s) coinciden con el arranque, cuando los 50 clientes se registran
a la vez. El registro es lento a propósito por el costo de argon2: p95 de 2.8 s en esa fase.
