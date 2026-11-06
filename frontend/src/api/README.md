# Cliente HTTP

`api<T>(path, opts)` añade el token, renueva con el refresh token ante un `401` y reintenta una sola vez. Varias peticiones
vencidas comparten una renovación. Los errores salen como `ApiError(status, code, message)`.

El token de acceso vive solo en memoria. El refresh token se guarda en `localStorage` para sobrevivir a una recarga.
