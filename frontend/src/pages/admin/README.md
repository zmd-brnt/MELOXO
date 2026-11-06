# Vistas de Administrador

Pantallas bajo `/admin`. Solo las ve el rol Administrador; el permiso real lo revisa el backend en cada ruta.

| Archivo | Ruta | Para qué sirve |
|---|---|---|
| `AdminLayout.tsx` | `/admin/*` | Título y navegación entre secciones |
| `Dashboard.tsx` | `/admin` | Salud del sistema y gráficas, con exportación a CSV y PNG |
| `Users.tsx` | `/admin/users` | Buscar usuarios, cambiar rol, suspender y reactivar |
| `Requests.tsx` | `/admin/requests` | Aprobar o rechazar solicitudes de Compositor; rechazar pide motivo |
| `Catalog.tsx` | `/admin/catalog` | Importar de Jamendo con avance, ocultar y restaurar pistas |
| `Audit.tsx` | `/admin/audit` | Registro de acciones administrativas |
| `Health.tsx` | `/admin/health` | Estado de cada servicio, con ícono y texto |
| `shared.tsx` | | Filtros en la URL, fechas y paginación |

El backend no deja sin administradores al sistema: esa respuesta 409 se muestra como aviso y la fila no cambia.
