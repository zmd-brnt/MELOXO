# Marca MELOXO

Guía de uso del logo y de la identidad visual. Pensada para quien trabaja en el proyecto, no solo para diseño.

## El logo

**Idea:** un casete hecho de papel rasgado: mitad cinta, mitad nota dedicada. La unidad central de MELOXO es el
casete compartido, y las dedicatorias son lo que lo hace personal. La X chueca de la palabra lleva el desorden ochentero.

| Versión | Archivo | Cuándo usarla |
|---|---|---|
| Horizontal (principal) | `svg/meloxo-horizontal-color-dark.svg` | Encabezados y barra lateral de la app |
| Apilada | `svg/meloxo-stacked-color-dark.svg` | Pantallas de acceso y espacios cuadrados |
| Símbolo | `svg/meloxo-symbol-color-dark.svg` | Avatar, ícono, espacios reducidos |
| Símbolo pequeño | `svg/meloxo-symbol-small.svg` | Por debajo de 32 px: dibujo simplificado |
| Solo palabra | `svg/meloxo-wordmark-color-dark.svg` | Cuando el símbolo ya está cerca |

## Espacio libre

Deja alrededor del logo un margen igual al **diámetro de un agujero del símbolo**. El margen escala con el logo.

## Tamaño mínimo

| Versión | Pantalla | Impresión |
|---|---|---|
| Horizontal | 96 px de ancho | 25 mm de ancho |
| Símbolo | 32 px | 8 mm |
| Símbolo pequeño | 16 px | 5 mm |

## Color

| Nombre | HEX | RGB | CMYK aproximado | Rol |
|---|---|---|---|---|
| Tinta | `#141317` | 20, 19, 23 | 13, 17, 0, 91 | Fondo principal |
| Papel | `#F4F1EA` | 244, 241, 234 | 0, 1, 4, 4 | Texto sobre tinta, notas |
| Rosa | `#FF3D8B` | 255, 61, 139 | 0, 76, 45, 0 | Color de marca, acción principal |
| Amarillo | `#FFD233` | 255, 210, 51 | 0, 18, 80, 0 | Cinta adhesiva, avance, filtros activos |
| Turquesa | `#00D1BE` | 0, 209, 190 | 100, 0, 9, 18 | Estados activos |
| Cobalto | `#4A5CFF` | 74, 92, 255 | 71, 64, 0, 0 | Solo en casetes y portadas |

Los valores CMYK son una conversión matemática, no una prueba de imprenta. No se definieron equivalentes Pantone.

**Combinaciones aprobadas**

| Logo | Fondo | Contraste |
|---|---|---|
| Rosa y papel (`-color-dark`) | Tinta | 5.5:1 en el símbolo |
| Papel (`-reversed`) | Tinta | 16.4:1 |
| Tinta (sin sufijo) | Papel o blanco | 16.4:1 |
| Rosa y tinta (`-color-light`) | Papel | 3.0:1 en el símbolo: solo para usos decorativos o grandes |

Sobre fondo claro, prefiere la versión en tinta.

## Tipografía

- **Títulos:** Unbounded, peso 800. Licencia SIL Open Font.
- **Dedicatorias y etiquetas de casete:** Caveat, peso 600. Licencia SIL Open Font.
- **Texto e interfaz:** fuente del sistema (`-apple-system, "Segoe UI", Roboto, sans-serif`).

La palabra MELOXO del logo está dibujada a medida. No la escribas con una fuente: usa los archivos.

## Qué no hacer

No estirar ni deformar. No rotar el logo: lo chueco ya está dentro del dibujo. No usar colores fuera de la paleta. No
añadir sombras, contornos ni degradados. No separar ni reacomodar las partes. No ponerlo sobre fondos cargados sin
un contenedor liso.

## Carpetas

| Carpeta | Contenido |
|---|---|
| [`svg/`](svg/README.md) | Archivos maestros vectoriales |
| [`png/`](png/README.md) | Exportaciones listas para documentos |
| [`web/`](web/README.md) | Favicon, íconos y manifiesto para la app |
| [`presentation/`](presentation/README.md) | Presentación de la marca con ejemplos de uso |

## Licencia

La licencia MIT del repositorio cubre el código, no esta carpeta. El nombre, el logo y estos archivos no se pueden
reutilizar sin permiso del equipo.

## Pendientes

- No se hizo búsqueda de registro de marca. Hacerla antes de usar el nombre o el logo fuera del ámbito universitario.
- Pantone y prueba de color impresa, si algún día se imprime.
