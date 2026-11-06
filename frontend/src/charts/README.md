# Gráficas

Base común de las estadísticas: Chart.js con los colores y estilos de MELOXO.

| Archivo | Para qué sirve |
|---|---|
| `index.ts` | Registra Chart.js, fija la paleta `SERIES` y los estilos de barras y líneas |
| `ChartCanvas.tsx` | Crea y destruye la gráfica sobre un `<canvas>` |
| `ChartCard.tsx` | Tarjeta que carga datos y muestra gráfica, tabla, vacío o error |
| `definitions.ts` | Gráficas concretas, columnas de sus tablas y ayudas como `fillDays` |
| `export.ts` | Guarda un reporte como CSV (desde el backend) o PNG (desde la gráfica) |

## Reglas

- Una gráfica que falla muestra "Datos no disponibles por ahora" y el resto de la página sigue (F7.3).
- Toda gráfica ofrece una tabla con los mismos datos.
- Los colores de `SERIES` van siempre en ese orden y son cuatro como máximo. Son tonos derivados de la marca: los
  puros quedan fuera de la banda de luminosidad sobre el panel oscuro.
- Una sola serie no lleva leyenda; dos o más, siempre.
