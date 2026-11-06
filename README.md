# MELOXO

Tu Casetera de Confianza. MELOXO es un servicio de streaming musical que gira alrededor del casete compartido: hasta 12
pistas en dos lados, armado entre amigos, con dedicatorias y repartido por enlace. No hay feed ni recomendaciones: la
música se descubre porque alguien te la regala.

Es el proyecto de la materia de Sistemas Distribuidos del equipo FLDSMDFR: Christian Franco Ramírez, Miriam Amisadai
López Hernández, Erick Nava Santiago y Brent Armando Pérez Paitán.

Esta rama, `01-monolito`, entrega el producto completo en un solo proceso, como monolito modular. Es el punto de partida:
las ramas siguientes lo van separando en servicios.

## Con qué está hecho

| Parte | Tecnologías |
| --- | --- |
| Backend | Python 3.12, FastAPI, SQLAlchemy, Alembic |
| Base de datos | PostgreSQL 16 |
| Interfaz | React 18, TypeScript, Vite, TanStack Query, Chart.js |
| Música | Catálogo de Jamendo y pistas que suben los Compositores |
| Pruebas | pytest, Vitest, Playwright, axe, Locust |
| Despliegue | Docker y Docker Compose |

Todo corre en dos contenedores. El proceso de FastAPI atiende la API, sirve la interfaz ya compilada y entrega el audio:

```text
Navegador ──► app :8080 (FastAPI) ──► postgres :5432
                 │
                 ├── /api/*    seis módulos
                 ├── /*        interfaz de React
                 └── audio     archivo local, o proxy hacia Jamendo
```

## Levantarlo

Necesitas Docker con Compose.

```bash
cp .env.example .env                                # completa los valores
docker compose up --build -d                        # app en http://localhost:8080
docker compose exec app python -m seed all          # opcional: catálogo y actividad de demo
```

Para `POSTGRES_PASSWORD` y `JWT_SECRET` sirve cualquier cadena larga; `openssl rand -hex 32` te da una. Usa esa misma
clave de PostgreSQL en lugar de `CAMBIA_ESTO` dentro de `DATABASE_URL`.

La semilla tarda cerca de un minuto y necesita `JAMENDO_CLIENT_ID`. Al terminar imprime las cuentas de demo
(`oyente00@`, `compositor00@` y `admin00@demo.meloxo.dev`) y su contraseña. Con `seed clear` se borra lo simulado.
Más detalle en [`backend/seed/`](backend/seed/).

Con la app arriba, la documentación interactiva de la API está en <http://localhost:8080/api/docs>. Para apagar todo usa
`docker compose down`, y agrega `-v` si además quieres borrar la base y los archivos subidos.

## Variables

Estas van en `.env`:

| Variable | Para qué sirve |
| --- | --- |
| `POSTGRES_PASSWORD` | Clave de PostgreSQL |
| `DATABASE_URL` | Conexión desde fuera de Docker, para pruebas y migraciones |
| `JWT_SECRET` | Firma de las sesiones |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Primer administrador, creado al arrancar |
| `DEMO_PASSWORD` | Clave de las cuentas de demo. Vacía: se genera una al azar |
| `JAMENDO_CLIENT_ID` | Llave de Jamendo. Va solo en `.env`, nunca en archivos versionados |
| `JAMENDO_AUDIO_MODE` | `proxy` (por defecto) o `redirect` |

Estas otras tienen un valor por defecto y casi nunca hay que tocarlas. Se definen en
[`backend/app/core/config.py`](backend/app/core/config.py):

| Variable | Por defecto | Para qué sirve |
| --- | --- | --- |
| `TAPE_MAX_TRACKS` | `12` | Pistas por casete |
| `TAPE_MAX_MEMBERS` | `8` | Miembros por casete |
| `COMPOSER_MAX_TRACKS` | `20` | Pistas por Compositor |
| `UPLOAD_MAX_MP3_MB` | `15` | Peso máximo del MP3 |
| `UPLOAD_MAX_COVER_MB` | `2` | Peso máximo de la portada |
| `UPLOAD_MAX_MINUTES` | `10` | Duración máxima de una pista |
| `JAMENDO_API_URL` | `https://api.jamendo.com/v3.0` | API de Jamendo. El escenario 3 la cambia para simular la caída |
| `MEDIA_DIR` | `/media` | Dónde se guardan audio y portadas |
| `STATIC_DIR` | vacía | Interfaz compilada. El `Dockerfile` la fija en `/app/static` |
| `DISABLE_SCHEDULER` | `false` | Apaga las tareas periódicas. Lo usan las pruebas |

## Estructura del repositorio

```text
MELOXO/
├── backend/
│   ├── app/
│   │   ├── core/            # lo que comparten todos los módulos
│   │   ├── modules/         # los seis módulos del negocio
│   │   └── main.py          # crea la app y arranca las tareas periódicas
│   ├── migrations/          # esquema de la base, con Alembic
│   ├── seed/                # datos de demo
│   └── tests/               # misma forma que app/
├── frontend/
│   ├── e2e/                 # pruebas de navegador
│   ├── public/              # íconos y manifiesto
│   └── src/                 # código de la interfaz
├── demo/                    # escenarios del PRD y prueba de carga
├── docs/
│   ├── prd.md               # requisitos del producto
│   ├── specs/               # diseños aprobados
│   ├── plans/               # planes de implementación
│   ├── decisions/           # lo que se decidió sobre la marcha
│   ├── design/              # maqueta de la interfaz
│   └── brand/               # logo y guía de marca
├── compose.yaml             # los dos contenedores
├── compose.demo.yaml        # overlay de los escenarios 3 y 8
├── Dockerfile               # compila la interfaz y arma la imagen
└── .env.example             # plantilla de variables
```

Cada carpeta tiene su README, y `backend/tests/test_readmes.py` falla si falta alguno. Las reglas de nombres y por qué
están así se explican en [`docs/`](docs/README.md#cómo-se-nombran-las-cosas).

## Módulos

Cada módulo es dueño de sus tablas, no hay llaves foráneas entre módulos y solo se hablan por su `public.py`.
`backend/tests/test_boundaries.py` lo comprueba.

| Módulo | Responsabilidad |
| --- | --- |
| [`modules/users`](backend/app/modules/users/) | Cuentas, roles, solicitudes de Compositor y auditoría |
| [`modules/playlists`](backend/app/modules/playlists/) | Playlists y sus pistas |
| [`modules/catalog`](backend/app/modules/catalog/) | Canciones, artistas, álbumes, importación, subidas y streaming |
| [`modules/playback`](backend/app/modules/playback/) | Eventos de reproducción, contadores e historial |
| [`modules/social`](backend/app/modules/social/) | Favoritas, seguidos, casetes, invitaciones y avisos |
| [`modules/analytics`](backend/app/modules/analytics/) | Agregados para gráficas, latencia y salud |

## Pruebas

Las pruebas de backend leen `POSTGRES_PASSWORD` de `.env`, así que hace falta ese archivo. Todos los comandos se corren
desde la raíz del repositorio.

```bash
docker compose up -d postgres
(cd backend && python3 -m venv .venv && .venv/bin/pip install -e '.[dev]' && .venv/bin/pytest)   # PostgreSQL real
(cd frontend && npm install && npm test)                                                         # Vitest
(cd frontend && npx playwright install chromium && npm run e2e)    # navegador, con el stack arriba
for f in demo/scenario_*.py; do python3 "$f" || break; done        # escenarios del PRD, con stack y semilla
```

La prueba de carga se explica en [`demo/`](demo/).

## Estado de los criterios

Verificado el 2026-11-06 sobre una imagen reconstruida: 410 pruebas de backend, 127 de frontend, 15 de navegador y los
escenarios 3 a 8 en verde. Las mediciones de carga son de la corrida de ese mismo día desde cero, con
`docker compose down -v`, reconstrucción y semilla, en `docker compose` local y sin red real de por medio.

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

## Documentación

- [`docs/prd.md`](docs/prd.md): qué se construye y por qué. Es la referencia de todas las ramas.
- [`docs/specs/`](docs/specs/): el diseño de esta rama.
- [`docs/decisions/`](docs/decisions/): lo que se decidió sobre la marcha y lo que quedó pendiente.
- [`docs/brand/`](docs/brand/): logo, colores y tipografía.

## Glosario

### Del producto

| Término | Qué significa aquí |
| --- | --- |
| Administrador | Rol que modera el catálogo, aprueba Compositores y ve la salud del sistema |
| Aviso | Notificación de que un artista que sigues publicó algo. Se calcula al leer, no se guarda |
| Bitácora | Registro de las acciones administrativas, en la tabla `audit_log` |
| Casete | La unidad central de MELOXO: hasta 12 pistas en dos lados, armado por hasta 8 personas |
| Compositor | Oyente aprobado para subir y publicar su propia música |
| Dedicatoria | Nota personal que acompaña a una pista dentro de un casete |
| Estados de pista | `draft` (borrador), `scheduled` (programada), `published` (publicada) y `hidden` (oculta) |
| Inclusión | Cada vez que una pista entra a un casete o playlist. El Compositor solo ve el conteo, nunca quién fue |
| Invitación | Enlace para unirse a un casete. Es la única forma de entrar: no se buscan personas |
| Lado A y Lado B | Las dos mitades de un casete. Son solo posición: la primera mitad de las pistas es el Lado A |
| Lanzamiento | Publicación de una pista, inmediata o programada |
| Oyente | Rol base de quien se registra: escucha, guarda música y arma casetes |
| Pista | Una canción del catálogo. Su fuente es `local` si la subió un Compositor o `jamendo` si se importó |
| Plaza | Lugar de un miembro en un casete. Hay 8 |
| Retención | Qué tanto de una pista escucha la gente antes de dejarla |
| Semilla | Comando que llena la app con catálogo real y actividad simulada para la demo |

### Arquitectura y sistemas distribuidos

| Término | Qué significa |
| --- | --- |
| 2PC | Confirmación en dos fases entre varios sistemas. El PRD la descarta para no frenar la reproducción |
| Agregado | Dato ya resumido, como reproducciones por hora, para que una gráfica no recorra todos los eventos |
| API Gateway | Punto de entrada único que valida y reparte las peticiones. Llega en la rama 03 |
| Backoff | Esperar cada vez más entre reintentos, para no saturar a quien ya está fallando |
| Balanceo de carga | Repartir peticiones entre réplicas. El PRD plantea round-robin: una a cada una, por turnos |
| CAP | Teorema: con la red partida hay que elegir entre consistencia y disponibilidad. MELOXO elige disponibilidad (AP) |
| Circuit breaker | Deja de llamar por un rato a un servicio que falla, para que el error no se propague. Llega en la rama 04 |
| Consistencia eventual | Un dato tarda un poco en verse igual en todos lados. Aplica a contadores y gráficas |
| Consistencia fuerte | El dato siempre es exacto. Aplica a roles, cupo del casete y `playback_id` |
| Degradación elegante | Si algo falla, se responde con lo que se tiene y con `degraded: true`, en vez de un error |
| Failover | Pasar el trabajo a una réplica sana cuando otra cae. Llega en la rama 03 |
| Frontera de módulo | Regla de que un módulo solo entra a otro por su `public.py` |
| Idempotencia | Repetir una operación da el mismo resultado que hacerla una vez |
| Interfaz pública | El archivo `public.py` de cada módulo. En la rama 02, esas funciones se vuelven llamadas HTTP |
| Módulo | Parte del monolito dueña de un tema y de sus tablas |
| Monolito modular | Una sola aplicación desplegada, dividida por dentro en módulos con fronteras claras |
| Monorepo | Un solo repositorio para backend, interfaz y documentación |
| Proxy | Intermediario. El backend pide el audio a Jamendo y lo pasa al navegador sin guardarlo |
| Punto único de falla | Pieza que, si cae, tira todo el sistema. Es el problema que motiva separar en servicios |
| Réplica | Otra copia del mismo servicio corriendo a la vez |
| Revocación | Invalidar un acceso antes de que venza. Hoy se revisa en la base; en la rama 03 pasa a Redis |
| Servicio | Programa independiente con su propia responsabilidad y sus datos. Es en lo que se convierten los módulos |
| Timeout | Tiempo máximo que se espera una respuesta antes de darla por fallida |

### Datos y concurrencia

| Término | Qué significa |
| --- | --- |
| Bloqueo asesor | Candado de PostgreSQL que define la aplicación. Evita que dos procesos actualicen los agregados a la vez |
| Caché | Copia guardada de un dato para no pedirlo otra vez. `metadata_cache` guarda los datos de una pista |
| Condición de carrera | Error que aparece cuando dos operaciones simultáneas se pisan, como dos personas agregando la pista 12 |
| Cursor | Marca de hasta dónde se han leído los eventos |
| `FOR UPDATE` | Cláusula de SQL que bloquea las filas leídas hasta terminar la transacción |
| JSONB | Tipo de PostgreSQL para guardar JSON de forma consultable |
| Llave foránea | Restricción que liga una tabla con otra. Entre módulos no se usan |
| Migración | Cambio versionado del esquema de la base |
| `ON CONFLICT` | Cláusula de SQL que decide qué hacer si un registro ya existe. Da la idempotencia de `playback_id` |
| ORM | Capa que permite trabajar las tablas como clases de Python |
| Pool de conexiones | Conjunto de conexiones a la base que las peticiones reutilizan |
| `SKIP LOCKED` | Junto con `FOR UPDATE`, salta las filas ya bloqueadas: dos réplicas no publican la misma pista |
| Transacción | Grupo de cambios que se aplica completo o no se aplica |
| Upsert | Insertar un registro, o actualizarlo si ya existe |
| UTC | Hora universal. Las horas se guardan así y se convierten a la zona del navegador |
| UUID | Identificador aleatorio prácticamente irrepetible |

### Web y seguridad

| Término | Qué significa |
| --- | --- |
| Access token | Token de corta duración, 15 minutos aquí, que acompaña cada petición |
| API | Conjunto de rutas con las que la interfaz habla con el backend |
| Argon2 | Algoritmo para guardar contraseñas de forma segura |
| ASGI | Estándar con el que un servidor de Python atiende aplicaciones asíncronas |
| CSV | Archivo de texto con datos en columnas. Los reportes se exportan así |
| Endpoint | Una ruta concreta de la API, como `GET /api/songs` |
| Hash | Huella irreversible de un dato. Así se guardan contraseñas, refresh tokens y tokens de invitación |
| HS256 | Algoritmo con el que se firman los JWT |
| JWT | Token firmado que dice quién eres y qué rol tienes |
| `localStorage` | Almacenamiento del navegador. Aquí viven el refresh token y los eventos pendientes |
| Manifiesto web | Archivo que describe la app para poder instalarla en un dispositivo |
| Middleware | Código que corre en cada petición. `LatencyMiddleware` mide tiempos |
| Multipart | Formato de petición para subir archivos |
| OpenAPI | Descripción estándar de una API. FastAPI la genera y la muestra en `/api/docs` |
| `Range` | Encabezado HTTP para pedir solo un tramo de un archivo. Permite adelantar una canción |
| Refresh token | Token de larga duración, 30 días aquí, que sirve para pedir un access token nuevo |
| Rol | Lo que puede hacer una cuenta: `listener`, `composer` o `admin` |
| SPA | Aplicación de una sola página: navegar no recarga, por eso la música no se corta |
| Ticket de streaming | JWT de 1 hora ligado a una pista. Existe porque `<audio>` no puede enviar encabezados |
| XSS | Ataque que inyecta código en una página para robar datos |

Los códigos de respuesta que más aparecen en este proyecto:

| Código | Significado |
| --- | --- |
| `200`, `201` | Todo bien, y todo bien con algo creado |
| `206` | Contenido parcial: la respuesta a una petición con `Range` |
| `401` | Falta una sesión válida |
| `403` | Hay sesión, pero sin permiso |
| `404` | No existe |
| `409` | Conflicto con el estado actual, como un casete lleno |
| `410` | Ya no está disponible, como un enlace revocado |
| `422` | Los datos enviados no son válidos |
| `503` | Un servicio del que depende la respuesta no está disponible, como Jamendo |

### Medición y pruebas

| Término | Qué significa |
| --- | --- |
| Accesibilidad | Que la app se pueda usar con teclado, lector de pantalla y buen contraste |
| Escenario | Script de `demo/` que reproduce una situación del PRD y dice `PASA` o `FALLA` |
| Fixture | Dato o preparación que una prueba reutiliza |
| Latencia | Tiempo que tarda una respuesta |
| Overlay | Archivo de Compose que se suma a otro para cambiar algunos valores |
| p50, p95, p99 | Percentiles: p95 de 66 ms quiere decir que el 95 % de las peticiones tardó eso o menos |
| PRD | Documento de requisitos del producto |
| Primer byte | Tiempo hasta que empieza a llegar la respuesta. Es lo que se siente al dar play |
| Prueba de carga | Muchos clientes simulados a la vez, para medir cómo responde el sistema |
| Prueba de navegador (e2e) | Prueba que usa la app de punta a punta, como lo haría una persona |
| Simulación (mock) | Reemplazar algo externo durante una prueba, como la API de Jamendo |

### Tecnologías

| Tecnología | Para qué se usa aquí |
| --- | --- |
| Alembic | Migraciones de la base de datos |
| AnyIO | Lee archivos y calcula hashes de contraseñas sin frenar el servidor |
| argon2-cffi | Hash de contraseñas con Argon2 |
| asyncpg | Conexión asíncrona a PostgreSQL |
| axe | Revisión automática de accesibilidad, con `@axe-core/playwright` |
| Caveat, Unbounded | Tipografías de dedicatorias y títulos, instaladas con Fontsource |
| Chart.js | Gráficas. `chartjs-chart-matrix` agrega el mapa de calor |
| Docker | Empaqueta la app y sus dependencias en contenedores |
| Docker Compose | Levanta varios contenedores con un solo comando |
| FastAPI | Framework del backend |
| ffmpeg | Genera los tonos de audio de la semilla |
| Git | Control de versiones, con una rama por etapa del proyecto |
| HTTPX | Llamadas HTTP desde Python, sobre todo a Jamendo |
| Jamendo | Plataforma de música con licencias libres. De ahí sale el catálogo |
| jsdom | Simula un navegador para las pruebas de Vitest |
| Locust | Prueba de carga |
| mutagen | Lee los datos de un MP3 para validarlo |
| Nginx | Servidor web que el PRD contempla para el gateway. No se usa en esta rama |
| Node.js, npm | Compilan la interfaz e instalan sus dependencias |
| Playwright | Pruebas de navegador |
| PostgreSQL | Base de datos |
| Pydantic | Valida datos de entrada y variables de entorno, con `pydantic-settings` |
| PyJWT | Crea y verifica los JWT |
| pytest | Pruebas de backend. `pytest-asyncio` agrega las pruebas asíncronas |
| Python | Lenguaje del backend |
| python-multipart | Lee las subidas de archivos en FastAPI |
| React | Biblioteca de la interfaz |
| React Router | Rutas de la interfaz |
| Redis | Almacén en memoria para eventos y revocación. Llega en las ramas 03 y 04 |
| Redis Streams | La cola de eventos de Redis. Llega en la rama 04 |
| respx | Simula las respuestas de Jamendo en las pruebas |
| SQLAlchemy | ORM del backend |
| TanStack Query | Pide datos a la API y los mantiene en caché en la interfaz |
| Testing Library | Pruebas de componentes de React como los usaría una persona |
| TypeScript | JavaScript con tipos. Lenguaje de la interfaz |
| Uvicorn | Servidor que corre FastAPI |
| Vite | Servidor de desarrollo y compilador de la interfaz |
| Vitest | Pruebas de la interfaz |
