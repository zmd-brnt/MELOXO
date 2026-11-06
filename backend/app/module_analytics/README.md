# module_analytics

Agregados para gráficas, latencia y salud.

Expone su interfaz a otros módulos en `public.py`.

## Agregados

Cada 2 s, `refresh_aggregates` lee eventos nuevos con `events_since` y los suma en `agg_plays_hourly` y `agg_user_plays`. Un
bloqueo asesor evita que dos procesos procesen lo mismo.

- **Eventos recientes:** espera 1 s antes de sumar un evento. `seq` se asigna al insertar, no al confirmar, y sin esa espera
  el cursor podría saltarse un evento que se confirmó tarde.
- **Género:** cada reproducción cuenta solo en el primer género de la pista, para no sumarla dos veces.
- **Horas:** se guardan en UTC. `plays` y `heatmap` reciben `tz` con la zona del navegador.

## Latencia

`LatencyMiddleware` mide hasta el primer byte y agrupa por módulo. El streaming tiene su propio grupo. Los minutos cerrados
se vuelcan a `request_metrics` cada 30 s, y un error es solo una respuesta 5xx.

## Privacidad

El Compositor ve agregados sin identidades. Cada oyente ve solo sus datos con `scope=me`.

## CSV

`GET /api/admin/reports/{name}.csv` exporta las gráficas de administración. Los valores que empiezan con `=`, `+`, `-` o `@`
llevan un apóstrofo para que una hoja de cálculo no los ejecute como fórmula.
