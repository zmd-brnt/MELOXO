# Cliente HTTP

| Archivo | Para qué sirve |
|---|---|
| `client.ts` | Peticiones a la API, sesión, descargas y subidas |
| `queries.ts` | Consultas de TanStack Query que usan varias pantallas |
| `types.ts` | Tipos de lo que devuelve la API |

`api<T>(path, opts)` añade el token, renueva con el refresh token ante un `401` y reintenta una sola vez. Varias peticiones
vencidas comparten una renovación. Los errores salen como `ApiError(status, code, message)`.

`upload()` usa `XMLHttpRequest` porque `fetch` no informa el avance de una subida.

El token de acceso vive solo en memoria. El refresh token se guarda en `localStorage` para sobrevivir a una recarga.
