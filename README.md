# EasyFactu

Backend de firma y auditoría para facturas electrónicas (VeriFactu / AEAT).

---

## ¿Qué hay en este repositorio?

| Carpeta / Archivo | Descripción |
|---|---|
| `scaffold/backend/` | Servidor Express (Node.js + TypeScript) |
| `migrations/` | Scripts SQL para crear las tablas en PostgreSQL |
| `src/backend/aeat/` | Validador y tipos para respuestas AEAT (libxmljs2) |
| `tests/` | Tests automáticos (Jest + ts-jest) |
| `openapi.yaml` | Especificación OpenAPI 3.0 de los endpoints |
| `docs/` | Documentación técnica y esquemas XSD de AEAT |

---

## Requisitos previos

Instala estas herramientas en tu PC antes de continuar:

| Herramienta | Versión mínima | Descarga |
|---|---|---|
| **Node.js** | 20 LTS | https://nodejs.org |
| **npm** | 10+ | Incluido con Node.js |
| **PostgreSQL** | 14+ | https://www.postgresql.org/download/ |
| **Git** | cualquiera | https://git-scm.com |

---

## Paso 1 — Clonar / actualizar el repositorio

Si aún no tienes el repositorio en tu PC:

```bash
git clone https://github.com/wpodigital/easyfactu.git
cd easyfactu
```

Si ya lo tienes clonado, obtén los últimos cambios:

```bash
git fetch origin
git checkout main          # o la rama en la que estés trabajando
git pull
```

---

## Paso 2 — Crear la base de datos en PostgreSQL

Abre una terminal y ejecuta los siguientes comandos **una sola vez**:

```sql
-- Conéctate a PostgreSQL como superusuario
psql -U postgres

-- Dentro del prompt de psql:
CREATE USER easyfactu WITH PASSWORD 'easyfactu';
CREATE DATABASE easyfactu OWNER easyfactu;
\q
```

Luego aplica la migración para crear las tablas:

```bash
psql -U easyfactu -d easyfactu -f migrations/20251122_create_invoice_declarations_queries.sql
```

> **Nota:** si PostgreSQL no está en el PATH en Windows, añade su carpeta `bin` a las variables de entorno,
> por ejemplo `C:\Program Files\PostgreSQL\16\bin`.

---

## Paso 3 — Instalar dependencias del backend

```bash
cd scaffold/backend
npm install
```

---

## Paso 4 — Configurar la conexión a la base de datos (opcional)

Por defecto el servidor se conecta a:

```
postgresql://easyfactu:easyfactu@localhost:5432/easyfactu
```

Si usas credenciales distintas, crea el fichero `scaffold/backend/.env`:

```env
DATABASE_URL=postgresql://TU_USUARIO:TU_PASSWORD@localhost:5432/easyfactu
PORT=3000
```

---

## Paso 5 — Arrancar el servidor en modo desarrollo

```bash
# Dentro de scaffold/backend/
npm run dev
```

Verás en la consola:

```
Scaffold backend running on port 3000
```

---

## Paso 6 — Probar los endpoints

Con el servidor en marcha, usa `curl` o cualquier cliente REST (Insomnia, Postman, etc.).

### Guardar una consulta AEAT

```bash
curl -X POST http://localhost:3000/aeat/queries \
  -H "Content-Type: application/xml" \
  --data-binary @tests/fixtures/aeat_response_valid.xml
```

Respuesta esperada (`201 Created`):

```json
{
  "id": 1,
  "organization_id": null,
  "xml_raw": "...",
  "parsed_count": 2,
  "status": "success",
  "created_at": "2026-03-06T18:00:00.000Z",
  "updated_at": "2026-03-06T18:00:00.000Z"
}
```

### Listar consultas guardadas

```bash
curl http://localhost:3000/aeat/queries
```

### Obtener una consulta por ID

```bash
curl http://localhost:3000/aeat/queries/1
```

---

## Paso 7 — Ejecutar los tests automáticos

Desde la **raíz del repositorio** (no dentro de `scaffold/backend`):

```bash
# Instala las dependencias de test (solo la primera vez)
npm install

# Ejecuta todos los tests
npm test
```

Resultado esperado:

```
PASS  tests/aeat/validator.test.ts
PASS  tests/aeat/parser.test.ts

Test Suites: 2 passed, 2 total
Tests:       5 passed, 5 total
```

---

## Paso 8 — Compilar el backend para producción

```bash
# Dentro de scaffold/backend/
npm run build
```

Los ficheros compilados quedan en `scaffold/backend/dist/`.

Para ejecutar la versión de producción:

```bash
npm start
```

---

## Estructura de carpetas del backend

```
scaffold/backend/
├── src/
│   ├── index.ts                        ← Servidor Express + endpoints
│   ├── db.ts                           ← Pool de conexiones PostgreSQL
│   ├── aeat/
│   │   └── parser.ts                   ← Parseo de XML de respuestas AEAT
│   └── repositories/
│       └── aeat-queries.repository.ts  ← CRUD tabla invoice_declarations_queries
├── tsconfig.json
└── package.json
```

---

## Endpoints disponibles

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/aeat/queries` | Guarda una respuesta XML de AEAT en auditoría |
| `GET` | `/aeat/queries` | Lista las consultas guardadas (paginado) |
| `GET` | `/aeat/queries/:id` | Obtiene una consulta por ID |
| `POST` | `/records` | Stub: crear registro de firma |
| `GET` | `/records/:id/canonicalize` | Stub: canonicalización + hash |
| `GET` | `/records/:id/verify` | Stub: verificar paquete firmado |

Consulta la especificación completa en [`openapi.yaml`](./openapi.yaml).

---

## Variables de entorno

| Variable | Valor por defecto | Descripción |
|---|---|---|
| `DATABASE_URL` | `postgresql://easyfactu:easyfactu@localhost:5432/easyfactu` | Cadena de conexión a PostgreSQL |
| `PORT` | `3000` | Puerto en el que escucha el servidor |
