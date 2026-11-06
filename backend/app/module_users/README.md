# module_users

Cuentas, roles, solicitudes de Compositor y auditoría.

Expone su interfaz a otros módulos en `public.py`.

## Autenticación

- Access token JWT HS256 de 15 min con `sub`, `role` y `exp`. Refresh token opaco de 30 días, guardado como hash y rotado en
  cada uso.
- En cada petición se consulta en base el rol y estado actuales, así una suspensión aplica de inmediato. En la rama 03 esto
  pasa a una lista de revocación en Redis.
- El primer administrador se crea al arrancar con `ADMIN_EMAIL` y `ADMIN_PASSWORD`.
- Límite de login: 5 fallos en 60 s por correo e IP, en memoria de cada proceso.

## Último administrador

Degradar o suspender bloquea las filas de administradores activos con `SELECT ... FOR UPDATE`, en orden, y revisa dentro de la
transacción que quede al menos uno. El intento rechazado se audita en una transacción aparte, porque la original se revierte.

`public.py`, `admin.py` y `service.py` separan interfaz externa, administración y cuentas.
