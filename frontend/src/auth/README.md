# Sesión

| Archivo | Para qué sirve |
|---|---|
| `AuthContext.tsx` | `useAuth()` da el usuario actual, `login`, `register` y `logout` |
| `RequireAuth.tsx` | Sin sesión manda a entrar, y guarda a qué ruta volver para que una invitación no se pierda |
| `RequireRole.tsx` | Saca de las rutas de otro rol |

Esto solo ordena la interfaz: el permiso real lo revisa el backend en cada ruta.
