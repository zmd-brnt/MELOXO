# Demo

Escenarios reproducibles del [PRD](../docs/prd.md) y prueba de carga. Cada escenario corre contra
`http://localhost:8080`, imprime `PASA` o `FALLA` y sale con error si falla.

El número de cada archivo es el del escenario en la sección 14 del PRD. El 1 y el 2 necesitan servicios separados, así
que llegan en las ramas siguientes. El 9 es la prueba de carga de `locustfile.py`.

## Antes de empezar

Hace falta el stack arriba y con semilla, y un `.env` con `ADMIN_EMAIL` y `ADMIN_PASSWORD`:

```bash
docker compose up -d --build
docker compose exec app python -m seed all
```

## Escenarios

Solo usan la biblioteca estándar de Python:

```bash
for f in demo/scenario_*.py; do python3 "$f" || break; done
```

| Archivo | Qué comprueba |
| --- | --- |
| `scenario_3_jamendo_down.py` | Con Jamendo cortado, las pistas locales y los metadatos guardados siguen; el audio de Jamendo da `503 jamendo_unavailable` |
| `scenario_4_idempotency.py` | 100 envíos del mismo `playback_id`: una reproducción y `duplicates_discarded` +99 |
| `scenario_5_tape_full.py` | Dos miembros agregan a la vez la pista 12: una `201` y una `409 tape_full`, en 5 rondas |
| `scenario_6_last_admin.py` | Degradar al único administrador activo da `409`, no cambia nada y queda auditado |
| `scenario_7_permissions.py` | Un Compositor recibe `403` en pistas ajenas y en `/api/admin/*` |
| `scenario_8_double_publish.py` | Dos réplicas con pistas vencidas: un evento `track_published` y un aviso por pista |

`common.py` reúne lo que comparten los escenarios: el cliente de la API, las cuentas de prueba y el arranque del overlay.
`compose.demo.yaml`, en la raíz, es ese overlay, y lo usan los escenarios 3 y 8.

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

Cada cliente se registra, arma una lista de 20 pistas y luego busca, abre su lista y descarga pistas completas. Solo
reproduce pistas locales. El primer byte es el tiempo hasta recibir los encabezados de la respuesta de audio.

### Resultado

Corrida del 2026-11-06 sobre un stack recién reconstruido: 50 clientes durante 2 minutos, 5576 peticiones, 0 fallos.

| Medida | p50 | p95 | Objetivo p95 |
| --- | --- | --- | --- |
| Primer byte de audio | 12 ms | 39 ms | < 500 ms |
| `GET /api/songs` | 36 ms | 71 ms | < 300 ms |
| `GET /api/playlists/{id}` | 27 ms | 66 ms | < 200 ms |

Máquina: laptop Intel i7-1165G7, 8 hilos, 15 GB de RAM, Linux. Locust, la app (un proceso de uvicorn) y PostgreSQL
corrieron en la misma máquina, así que el resultado no incluye la latencia de una red real. Jamendo quedó fuera de la
carga.

Hay dos límites que conviene decir al presentar esto:

- Los clientes descargan cada pista a toda velocidad y luego esperan de 1 a 3 s. No hay 50 conexiones de audio abiertas
  todo el tiempo, y el ritmo total fue de 47 peticiones por segundo. Las pistas de la semilla pesan unos 480 KB.
- La preparación ocupa cerca de los primeros 45 s: los clientes se registran y agregan 20 pistas sin pausa, y las
  peticiones de esa fase son más lentas. Las cifras de arriba la incluyen, porque Locust acumula los percentiles, y por
  eso esta corrida no separa los p99 (240 a 390 ms) por fase.
