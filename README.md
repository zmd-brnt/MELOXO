# MELOXO

Tu Casetera de Confianza. Streaming musical donde la unidad central es el casete compartido.

Esta rama, `01-Monolito`, entrega el producto completo en un solo proceso. La guía completa se termina al cerrar la rama.

## Desarrollo

```bash
cp .env.example .env            # completa los valores
docker compose up -d postgres
cd backend
python3 -m venv .venv && .venv/bin/pip install -e '.[dev]'
.venv/bin/pytest
```

La documentación del proyecto está en [`docs/`](docs/).
