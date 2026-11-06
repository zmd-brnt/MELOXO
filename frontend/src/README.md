# src

Código de la interfaz en React y TypeScript. Cada carpeta tiene su README.

- `main.tsx` y `App.tsx`: arranque y rutas.
- `api/`: cliente HTTP y tipos. `auth/`: sesión y rutas por rol.
- `pages/`: una vista por ruta. `components/`: piezas compartidas.
- `player/`: reproductor. `charts/`: gráficas.
- `styles/`: colores y estilos. `assets/`: logos. Las fuentes se instalan con Fontsource y se cargan en `main.tsx`.
- `test-setup.ts` y `test-utils.tsx`: base de las pruebas con Vitest.

Las pruebas viven junto a lo que prueban, como `queue.test.ts` al lado de `queue.ts`.
