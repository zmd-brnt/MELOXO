# Reproductor

Un solo `<audio>` montado fuera del enrutador, así la música no se corta al navegar.

| Archivo | Qué hace |
|---|---|
| `PlayerProvider.tsx` | Estado y `usePlayer()` |
| `queue.ts` | Cola, aleatorio y repetir; funciones puras |
| `usePlaybackReporter.ts` | Cuenta lo escuchado de verdad y envía los eventos |
| `recovery.ts` | Decide qué hacer cuando falla el audio |
| `PlayerBar.tsx`, `NowPanel.tsx`, `Reels.tsx` | Controles, panel "Sonando" y carretes |

## Eventos

A los 10 s reales se envía `POST /api/playbacks`; adelantar no cuenta. Al pausar y al terminar se envía el progreso.

Si el envío falla, el evento se guarda en `localStorage` y se reintenta con espera creciente. El `playback_id` hace seguro el
reenvío. Un fallo aquí nunca interrumpe el audio.

## Errores de audio

El elemento `<audio>` no dice por qué falló. `recoverStream` pide un ticket nuevo y prueba un byte:

| Resultado | Acción |
|---|---|
| El byte llega | Retoma en la misma posición (ticket vencido) |
| `503` | Avisa que Jamendo no responde y pasa a la siguiente |
| Sin red | Se detiene, para no saltarse toda la cola |

## Crédito

`Credit` en `NowPanel.tsx` muestra artista, Jamendo y licencia con enlace. La licencia de Jamendo lo exige: no lo quites.
