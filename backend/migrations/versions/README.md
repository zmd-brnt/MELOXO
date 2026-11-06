# Versiones

Archivos de migración, en orden. No edites uno ya aplicado en otra máquina: crea uno nuevo.

El nombre es un número de cuatro dígitos y el tema, como `0009_tapes.py`. El número no sale solo: hay que pasarlo con
`--rev-id`, como se ve en el [README del backend](../../README.md).

| Migraciones | Módulo |
| --- | --- |
| `0000` | Punto de partida, sin cambios |
| `0001` y `0002` | `modules/users` |
| `0003` a `0005` y `0011` | `modules/catalog` |
| `0006` | `modules/playlists` |
| `0007` | `modules/playback` |
| `0008` y `0009` | `modules/social` |
| `0010` | `modules/analytics` |
