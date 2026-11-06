# MELOXO

Tu Casetera de Confianza. Streaming musical donde la unidad central es el casete compartido: hasta 12 pistas en dos
lados, armado entre amigos y compartido por enlace, con dedicatorias.

Esta rama, `01-Monolito`, entrega el producto completo en un solo proceso: un monolito modular con FastAPI, React y
PostgreSQL. Es el punto de partida de la migración a servicios.

## Levantarlo

Necesitas Docker con Compose.

```bash
cp .env.example .env                                # completa los valores
docker compose up --build -d                        # app en http://localhost:8080
docker compose exec app python -m seed all          # opcional: catálogo y actividad de demo
```

La semilla tarda cerca de un minuto y necesita `JAMENDO_CLIENT_ID`. Al terminar imprime las cuentas de demo
(`oyente00@`, `compositor00@` y `admin00@demo.meloxo.dev`) y su contraseña. Con `seed clear` se borra lo simulado.
Más detalle en [`backend/seed/`](backend/seed/).

## Variables

| Variable | Para qué sirve |
| --- | --- |
| `POSTGRES_PASSWORD` | Clave de PostgreSQL |
| `DATABASE_URL` | Conexión desde fuera de Docker, para pruebas y migraciones |
| `JWT_SECRET` | Firma de las sesiones |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Primer administrador, creado al arrancar |
| `DEMO_PASSWORD` | Clave de las cuentas de demo. Vacía: se genera una al azar |
| `JAMENDO_CLIENT_ID` | Llave de Jamendo. Va solo en `.env`, nunca en archivos versionados |
| `JAMENDO_AUDIO_MODE` | `proxy` (por defecto) o `redirect` |

## Módulos

Cada módulo es dueño de sus tablas, no hay llaves foráneas entre módulos y solo se hablan por su `public.py`.
`backend/tests/test_boundaries.py` lo comprueba.

| Módulo | Responsabilidad |
| --- | --- |
| `module_users` | Cuentas, roles, solicitudes de Compositor y auditoría |
| `module_playlists` | Playlists y sus pistas |
| `module_catalog` | Canciones, artistas, álbumes, importación, subidas y streaming |
| `module_playback` | Eventos de reproducción, contadores e historial |
| `module_social` | Favoritas, seguidos, casetes, invitaciones y avisos |
| `module_analytics` | Agregados para gráficas, latencia y salud |

## Pruebas

Las pruebas de backend leen `POSTGRES_PASSWORD` de `.env`, así que hace falta ese archivo.

```bash
docker compose up -d postgres
cd backend && python3 -m venv .venv && .venv/bin/pip install -e '.[dev]' && .venv/bin/pytest   # PostgreSQL real
cd frontend && npm install && npm test                                                         # Vitest
cd frontend && npx playwright test                                # navegador, con el stack y la semilla arriba
for f in demo/escenario_*.py; do python3 "$f" || break; done      # escenarios del PRD
```

La prueba de carga se explica en [`demo/`](demo/).

## Estado de los criterios

Verificado el 2026-11-06 desde cero, con `docker compose down -v`, reconstrucción y semilla: 408 pruebas de backend,
127 de frontend, 15 de navegador y los escenarios 3 a 8 en verde. Las mediciones son de `docker compose` local, sin red
real de por medio.

| Criterio | Estado | Evidencia |
| --- | --- | --- |
| F1.1 Registro y login con JWT | Cumple | `test_auth.py` |
| F1.2 Lista ligada al usuario del token | Cumple | `test_playlists.py` |
| F1.3 Reagregar es idempotente | Cumple | `test_playlists.py` |
| F1.4 `GET /api/playlists/{id}` p95 < 200 ms | Cumple | 66 ms con 50 clientes |
| F1.5 Lista degradada | Cumple | `test_playlists.py`. Solo se activa si falla la interfaz de catálogo |
| F1.6 Lista ajena privada da `403` | Cumple | `test_playlists.py` |
| F2.1 Búsqueda con filtros | Cumple | `test_songs.py` |
| F2.2 `Range` y `206`, local y Jamendo | Cumple | `test_streaming.py` y 3 pistas contra Jamendo real |
| F2.3 Primer byte p95 < 500 ms, búsqueda p95 < 300 ms | Cumple | 39 ms y 71 ms, solo pistas locales |
| F2.4 Failover de réplicas | Rama 03 | Hay una sola instancia |
| F2.5 Jamendo caído | Cumple | Escenario 3 |
| F3.1 Evento a los 10 s | Cumple | `usePlaybackReporter.test.ts` |
| F3.2 `playback_id` idempotente | Cumple | Escenario 4 |
| F3.3 Métricas caídas sin cortar el audio | Parcial | El navegador reintenta. La cola real llega en la rama 04 |
| F3.4 Evento visible en ≤ 5 s | Cumple | 1.1 s y 2.8 s en dos mediciones |
| F4.1 Límites de casete | Cumple | `test_tapes.py` |
| F4.2 Enlaces de invitación | Cumple | `test_invites.py` |
| F4.3 Reclamar dos veces es idempotente | Cumple | `test_invites.py` |
| F4.4 Dedicatorias | Cumple | `test_tapes.py` |
| F4.5 Carrera por la pista 12 | Cumple | Escenario 5 |
| F4.6 Permisos de miembro y creador | Cumple | `test_tapes.py`, `test_invites.py` |
| F4.7 Sala de escucha (opcional) | Fuera | Decisión del equipo, sin rama asignada |
| F5.1 Solicitud de Compositor | Cumple | `test_composer_requests.py` |
| F5.2 Subida validada por contenido | Cumple | `test_composer.py`. La portada se comprueba solo por sus primeros bytes |
| F5.3 Estados de pista | Cumple | `test_composer.py` |
| F5.4 Publicación programada y avisos | Cumple | `test_publishing.py`, escenario 8. La tarea corre cada 30 s |
| F5.5 Pistas ajenas dan `403` | Cumple | Escenario 7 |
| F5.6 Ocultar con motivo | Cumple | `test_publishing.py` |
| F6.1 Último administrador | Cumple | Escenario 6 |
| F6.2 Importación con `job_id` | Cumple | `test_import.py` |
| F6.3 Bitácora paginada y filtrable | Cumple | `test_admin.py` |
| F6.4 `/api/admin/*` da `403` | Cumple | `test_admin.py`, escenario 7 |
| F7.1 Vista por rol | Cumple | Pruebas de `frontend/src/pages` y Playwright |
| F7.2 Gráficas en < 2 s | Cumple | Las 12 rutas de métricas tardan menos de 90 ms, sin carga |
| F7.3 Aviso si no hay métricas | Cumple | `ChartCard.test.tsx` |
| F7.4 Exportar a CSV y PNG | Cumple | `export.test.ts` |

De los escenarios del PRD, el 1 y el 2 necesitan servicios separados y quedan para las ramas siguientes. El 9 es la
prueba de carga. En el escenario 8, el resultado se comprueba con dos réplicas reales, pero la concurrencia exacta la
fijan las pruebas de `test_publishing.py`.

## Lo que sigue

- `02-separacion`: servicios en Docker sobre una red interna.
- `03-gateway-balanceo`: gateway, JWT y roles en el borde, réplicas de catálogo. Trae F2.4.
- `04-resiliencia-concurrencia`: tiempos de espera, reintentos, circuit breaker y Redis Streams. Trae la cola de F3.3.

La documentación del proyecto está en [`docs/`](docs/).
