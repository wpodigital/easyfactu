# Database Setup Guide / Guía de Configuración de Base de Datos

## English

### Prerequisites

1. PostgreSQL 12+ installed
2. `psql` command-line tool available

### Step 1: Create Database

```bash
# Login as postgres user
sudo -u postgres psql

# Create database
CREATE DATABASE easyfactu;

# Create user (optional)
CREATE USER easyfactu_user WITH PASSWORD 'your_password_here';
GRANT ALL PRIVILEGES ON DATABASE easyfactu TO easyfactu_user;

# Exit
\q
```

### Step 2: Run Migrations

From the project root directory:

```bash
# Run migrations in order
psql easyfactu < migrations/20251122_create_invoice_declarations_queries.sql
psql easyfactu < migrations/20260112_create_verifactu_tables.sql
```

Or if using a specific user:

```bash
psql -U easyfactu_user -d easyfactu < migrations/20251122_create_invoice_declarations_queries.sql
psql -U easyfactu_user -d easyfactu < migrations/20260112_create_verifactu_tables.sql
```

### Step 3: Configure Environment

Copy the example environment file:

```bash
cd scaffold/backend
cp .env.example .env
```

Edit `.env` and set your database credentials:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=easyfactu
DB_USER=easyfactu_user
DB_PASSWORD=your_password_here
```

### Step 4: Test Connection

```bash
npm run dev
```

You should see:

```
Database connection successful: { now: 2026-02-27T... }
✓ Database tables verified
✓ EasyFactu VeriFactu API running on port 3000
```

### Step 5: Verify API

Test the health endpoint:

```bash
curl http://localhost:3000/health
```

Expected response:

```json
{
  "status": "ok",
  "service": "EasyFactu VeriFactu API",
  "version": "0.2.0",
  "database": "connected",
  "timestamp": "2026-02-27T..."
}
```

---

## Español

### Requisitos Previos

1. PostgreSQL 12+ instalado
2. Herramienta de línea de comandos `psql` disponible

### Paso 1: Crear Base de Datos

```bash
# Iniciar sesión como usuario postgres
sudo -u postgres psql

# Crear base de datos
CREATE DATABASE easyfactu;

# Crear usuario (opcional)
CREATE USER easyfactu_user WITH PASSWORD 'tu_contraseña_aqui';
GRANT ALL PRIVILEGES ON DATABASE easyfactu TO easyfactu_user;

# Salir
\q
```

### Paso 2: Ejecutar Migraciones

Desde el directorio raíz del proyecto:

```bash
# Ejecutar migraciones en orden
psql easyfactu < migrations/20251122_create_invoice_declarations_queries.sql
psql easyfactu < migrations/20260112_create_verifactu_tables.sql
```

O si usa un usuario específico:

```bash
psql -U easyfactu_user -d easyfactu < migrations/20251122_create_invoice_declarations_queries.sql
psql -U easyfactu_user -d easyfactu < migrations/20260112_create_verifactu_tables.sql
```

### Paso 3: Configurar Variables de Entorno

Copiar el archivo de ejemplo:

```bash
cd scaffold/backend
cp .env.example .env
```

Editar `.env` y establecer las credenciales de la base de datos:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=easyfactu
DB_USER=easyfactu_user
DB_PASSWORD=tu_contraseña_aqui
```

### Paso 4: Probar Conexión

```bash
npm run dev
```

Debería ver:

```
Database connection successful: { now: 2026-02-27T... }
✓ Database tables verified
✓ EasyFactu VeriFactu API running on port 3000
```

### Paso 5: Verificar API

Probar el endpoint de salud:

```bash
curl http://localhost:3000/health
```

Respuesta esperada:

```json
{
  "status": "ok",
  "service": "EasyFactu VeriFactu API",
  "version": "0.2.0",
  "database": "connected",
  "timestamp": "2026-02-27T..."
}
```

---

## Troubleshooting / Solución de Problemas

### Connection Refused / Conexión Rechazada

- Check if PostgreSQL is running: `sudo systemctl status postgresql`
- Check pg_hba.conf allows local connections
- Verify port 5432 is open

### Tables Not Found / Tablas No Encontradas

- Make sure migrations were run successfully
- Check you're connecting to the correct database
- Verify schema is `public`

### Authentication Failed / Fallo de Autenticación

- Verify credentials in `.env` file
- Check user has correct permissions
- Try connecting with `psql` directly to test credentials

---

## API Usage Examples / Ejemplos de Uso de API

### Create Invoice / Crear Factura

```bash
curl -X POST http://localhost:3000/api/v1/invoices \
  -H "Content-Type: application/json" \
  -d '{
    "idEmisor": "B12345678",
    "numSerie": "FAC-2024-001",
    "fecha": "2024-01-15",
    "nombre": "Mi Empresa SL",
    "tipo": "F1",
    "descripcion": "Venta de productos",
    "importe": 121.00,
    "base": 100.00,
    "cuota": 21.00
  }'
```

### Get Invoice / Obtener Factura

```bash
curl http://localhost:3000/api/v1/invoices/1
```

### List Invoices / Listar Facturas

```bash
curl http://localhost:3000/api/v1/invoices
```

### Validate Invoice / Validar Factura

```bash
curl -X POST http://localhost:3000/api/v1/invoices/1/validate
```
