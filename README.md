# DeliveryCore / eNrTa (EnRuta Pro)

Plataforma web full-stack para optimizacion de rutas logísticas con enfoque operativo:
mapa en tiempo real, control por conductor, sugerencias, sandbox de pruebas y base de datos editable.

## 1. Caracteristicas clave

- Mapa operativo en tiempo real (Leaflet + OpenStreetMap).
- Vista comercial opcional con Google Maps Embed.
- Rutas multiconductor por color.
- Panel de paradas dividido por conductor con detalle expandible.
- Panel Controlador con ubicacion por conductor y sugerencias individuales.
- Asistente por texto natural para proponer rutas.
- Sandbox para pruebas con datos reales (simple, texto o JSON).
- Persistencia local en JSON (`data/logistics-db.json`).
- Notificaciones operativas a usuarios/conductores.
- Modo offline con snapshot guardado.
- Integracion opcional de optimizador Python (FastAPI).

## 2. Stack

- Frontend: HTML + CSS + JavaScript.
- Backend principal: Node.js (`http` nativo).
- Optimizador avanzado: Python + FastAPI (`python_service`).
- Base de datos: JSON persistente local.
- Integraciones opcionales: OpenAI API, Google Maps API.

## 3. Requisitos

- Node.js 18+ (recomendado 20+).
- npm.
- Python 3.10+ (solo si usaras optimizador Python).

## 4. Ejecutar en local

```bash
npm install
npm run start
```

Abrir:
- `http://localhost:3000`

## 5. Variables de entorno

Crear archivo `.env` (opcional):

```bash
OPENAI_API_KEY=tu_clave_openai
OPENAI_MODEL=gpt-4.1-mini

GOOGLE_MAPS_API_KEY=tu_clave_directions
GOOGLE_MAPS_JS_API_KEY=tu_clave_embed_publica

PYTHON_OPTIMIZER_URL=http://127.0.0.1:8001
PYTHON_OPTIMIZER_TIMEOUT_MS=4500
PYTHON_OPTIMIZER_TOKEN=secreto_opcional
```

Notas:
- Sin `OPENAI_API_KEY`, la app usa sugerencias locales.
- Sin Google API keys, la app sigue operativa con ruta local.
- Si Python no esta activo, el backend usa optimizador JS de respaldo.

## 6. Activar optimizador Python (opcional)

```bash
npm run python:venv
npm run python:install
npm run python:dev
```

En otra terminal:

```bash
npm run dev
```

## 7. Flujo recomendado de uso

1. Carga pedidos en `Datos`.
2. Verifica conductores activos.
3. Optimiza ruta en `Rutas`.
4. Monitorea en `Operacion`.
5. Gestiona instrucciones en `Controlador`.
6. Guarda snapshot offline.

### Modo esencial y complejidad separada

- Pestaña `Ajustes` permite activar `Modo esencial` (solo lo importante).
- Desde `Ajustes` puedes decidir si mostrar u ocultar secciones complejas (`Datos`, `Sandbox`, `Asistente`).
- Las instrucciones se concentran en `Ajustes` para mantener pantallas operativas mas limpias.

### Sandbox en modo separado

Para abrir solo el laboratorio de pruebas en una vista aparte:

- `http://localhost:3000/?tab=sandbox&mode=sandbox`

## 8. Endpoints principales

- `GET /api/bootstrap`
- `POST /api/optimize-route`
- `POST /api/google-route`
- `POST /api/db-route`
- `POST /api/test-run`
- `POST /api/sandbox-assistant`
- `POST /api/route-assistant`
- `POST /api/controller/suggestion`
- `GET /api/db/export`
- `POST /api/db/import`
- `POST /api/db/reset`

## 8.1 Editor de mapa por calles (Sandbox)

En `Sandbox > Editor simple de mapa`, ahora puedes agregar nodos escribiendo:
- Calle/direccion.
- Comuna/ciudad.

La app geocodifica automaticamente (OpenStreetMap Nominatim) y crea el punto sin usar latitud/longitud manual.

## 9. Base de datos

- Ruta: `data/logistics-db.json`
- Se puede administrar desde UI (`Datos`) o via import/export JSON.

## 10. Capacitacion incluida

Se incluye guia de capacitacion lista para equipo operativo:

- [CAPACITACION.md](./CAPACITACION.md)

## 11. Subir a GitHub (paso a paso)

Si aun no tienes repo remoto:

```bash
git init
git add .
git commit -m "feat: deliverycore enRuta pro ready for presentation"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git push -u origin main
```

Si ya tienes repo remoto:

```bash
git add .
git commit -m "feat: mejora profunda UX/UI + controlador + docs"
git push
```

## 12. Scripts disponibles

- `npm run start`: iniciar servidor.
- `npm run dev`: iniciar servidor modo desarrollo.
- `npm run python:install`: instalar dependencias Python.
- `npm run python:dev`: iniciar FastAPI en `:8001`.
- `npm run python:start`: iniciar FastAPI modo normal.
