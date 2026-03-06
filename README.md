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

> ⚠️ **Importante:** los pasos 2a y 2b se ejecutan en **sitios diferentes**.
> Fíjate bien en el indicador del prompt antes de escribir cada comando.

### 2a — Dentro de PowerShell (o CMD): conectarte a PostgreSQL

```powershell
# Esto lo escribes en PowerShell. El prompt muestra algo como:
# PS C:\Users\HP\Dev\GitHub\easyfactu>

psql -U postgres
```

Te pedirá la contraseña del usuario `postgres`. Al entrar, el prompt
cambia a `postgres=#` — **ahora estás dentro de psql**, no en PowerShell.

### 2b — Dentro del prompt de psql (`postgres=#`): crear usuario y base de datos

```sql
-- El prompt muestra:  postgres=#
CREATE USER easyfactu WITH PASSWORD 'easyfactu';
CREATE DATABASE easyfactu OWNER easyfactu;
\c easyfactu
GRANT ALL ON SCHEMA public TO easyfactu;
\q
```

- `\c easyfactu` cambia la conexión activa a la base de datos recién creada.
- `GRANT ALL ON SCHEMA public TO easyfactu` es necesario en **PostgreSQL 15 y superior**: a partir de esa versión el esquema `public` ya no concede el permiso `CREATE` a todos los usuarios automáticamente. Sin este paso verás el error `permiso denegado al esquema public` al aplicar las migraciones.

El comando `\q` te devuelve a PowerShell (el prompt vuelve a mostrar `PS C:\...>`).

### 2c — De vuelta en PowerShell: aplicar la migración

```powershell
# Esto lo escribes en PowerShell, NO dentro de psql.
# El prompt muestra:  PS C:\Users\HP\Dev\GitHub\easyfactu>

psql -U easyfactu -d easyfactu -f migrations/20251122_create_invoice_declarations_queries.sql
```

Deberías ver:

```
CREATE TABLE
CREATE INDEX
CREATE INDEX
```

> **Error frecuente en Windows:** si ejecutas el comando `psql -f` estando
> dentro del prompt de psql (`postgres=#`), psql lo interpreta como un comando
> SQL desconocido y no hace nada. **Siempre ejecuta `psql -f` desde PowerShell.**

> **PostgreSQL no está en el PATH:** si PowerShell dice *«psql no se reconoce»*,
> añade la carpeta `bin` de PostgreSQL a las variables de entorno del sistema,
> por ejemplo `C:\Program Files\PostgreSQL\16\bin`, o usa la ruta completa:
> ```powershell
> & "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U easyfactu -d easyfactu -f migrations/20251122_create_invoice_declarations_queries.sql
> ```

> **Advertencia de código de página en Windows** (`El código de página de la
> consola (850) difiere…`): es solo un aviso informativo, no afecta al
> funcionamiento. Puedes ignorarlo.

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
