# Guía de Testing - EasyFactu / Testing Guide

[English](#english) | [Español](#español)

---

## Español

### 🚀 Inicio Rápido

#### 1. Configurar Base de Datos

```bash
# Copiar archivo de configuración
cd scaffold/backend
cp .env.example .env

# Editar .env con tus credenciales de PostgreSQL
nano .env

# Ejecutar setup de base de datos (con datos de prueba)
./scripts/db-setup.sh --seed
```

#### 2. Iniciar el Servidor

```bash
# Instalar dependencias (si no lo has hecho)
npm install

# Modo desarrollo (con auto-reload)
npm run dev

# O compilar y ejecutar
npm run build
npm start
```

El servidor estará disponible en `http://localhost:3000`

#### 3. Verificar que Funciona

```bash
# Health check
curl http://localhost:3000/health

# Debería devolver:
# {"status":"ok","database":"connected","timestamp":"..."}
```

---

### 📋 Ejemplos de Pruebas

#### Crear una Factura

```bash
curl -X POST http://localhost:3000/api/v1/invoices \
  -H "Content-Type: application/json" \
  -d '{
    "idVersion": "1.0",
    "nombreRazonEmisor": "Mi Empresa S.L.",
    "nifEmisor": "B12345678",
    "numSerieFactura": "FAC-001",
    "fechaExpedicionFactura": "2024-02-27",
    "tipoFactura": "F1",
    "cuotaTotal": 21.00,
    "importeTotal": 121.00,
    "descripcionOperacion": "Servicios de consultoría",
    "tipoDesglose": "S",
    "claveRegimen": "01",
    "tipoImpositivo": 21.00,
    "baseImponible": 100.00,
    "cuotaRepercutida": 21.00
  }'
```

#### Obtener una Factura

```bash
# Obtener por ID
curl http://localhost:3000/api/v1/invoices/1

# Listar todas
curl http://localhost:3000/api/v1/invoices

# Listar con paginación
curl "http://localhost:3000/api/v1/invoices?page=1&limit=10"

# Filtrar por emisor
curl "http://localhost:3000/api/v1/invoices?nifEmisor=B12345678"
```

#### Validar una Factura

```bash
curl -X POST http://localhost:3000/api/v1/invoices/1/validate
```

#### Obtener Estado de Validación

```bash
curl http://localhost:3000/api/v1/invoices/1/status
```

#### Obtener XML de una Factura

```bash
curl http://localhost:3000/api/v1/invoices/1/xml
```

#### Anular una Factura

```bash
curl -X DELETE http://localhost:3000/api/v1/invoices/1
```

---

### 🧪 Tests Automáticos

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests específicos
npm test -- xmlBuilder
npm test -- hashCalculator

# Con cobertura
npm test -- --coverage
```

---

### 🔧 Utilidades

#### Resetear Base de Datos

```bash
./scripts/db-reset.sh
# Confirmar con "yes"
```

#### Verificar Conexión a Base de Datos

```bash
# Desde el directorio backend
node -e "
const { testConnection } = require('./dist/config/database');
testConnection().then(() => console.log('OK')).catch(e => console.error(e));
"
```

#### Ver Logs en Tiempo Real

```bash
# Si usas npm run dev, los logs se muestran automáticamente
# Para producción, implementar logging a archivo
```

---

### 📊 Datos de Prueba

El script `seed-data.sql` crea:
- 3 facturas de ejemplo (TEST-001, TEST-002, TEST-003)
- 2 clientes
- Desgloses de impuestos
- 1 sistema informático

Estos datos son perfectos para empezar a probar.

---

### 🐛 Troubleshooting

#### Error: Cannot connect to database

```bash
# Verificar que PostgreSQL está corriendo
sudo systemctl status postgresql

# O en macOS
brew services list | grep postgres

# Verificar credenciales en .env
cat .env
```

#### Error: Table does not exist

```bash
# Ejecutar migraciones
./scripts/db-setup.sh
```

#### Error: Port 3000 already in use

```bash
# Cambiar puerto en src/index.ts o matar proceso
lsof -ti:3000 | xargs kill -9
```

---

## English

### 🚀 Quick Start

#### 1. Setup Database

```bash
# Copy configuration file
cd scaffold/backend
cp .env.example .env

# Edit .env with your PostgreSQL credentials
nano .env

# Run database setup (with test data)
./scripts/db-setup.sh --seed
```

#### 2. Start Server

```bash
# Install dependencies (if you haven't)
npm install

# Development mode (with auto-reload)
npm run dev

# Or build and run
npm run build
npm start
```

Server will be available at `http://localhost:3000`

#### 3. Verify It Works

```bash
# Health check
curl http://localhost:3000/health

# Should return:
# {"status":"ok","database":"connected","timestamp":"..."}
```

---

### 📋 Test Examples

See examples above (they work in both languages)

---

### 🧪 Automated Tests

```bash
# Run all tests
npm test

# Run specific tests
npm test -- xmlBuilder
npm test -- hashCalculator

# With coverage
npm test -- --coverage
```

---

### 🔧 Utilities

#### Reset Database

```bash
./scripts/db-reset.sh
# Confirm with "yes"
```

#### Verify Database Connection

```bash
# From backend directory
node -e "
const { testConnection } = require('./dist/config/database');
testConnection().then(() => console.log('OK')).catch(e => console.error(e));
"
```

---

### 📊 Test Data

The `seed-data.sql` script creates:
- 3 sample invoices (TEST-001, TEST-002, TEST-003)
- 2 customers
- Tax breakdowns
- 1 IT system

This data is perfect to start testing.

---

### 🐛 Troubleshooting

Same as Spanish section above.

---

### 📝 API Documentation

For complete API documentation, see: `scaffold/backend/README.md`

---

### ✅ Testing Checklist

- [ ] Database setup completed
- [ ] Server starts without errors
- [ ] Health check returns OK
- [ ] Can create invoice
- [ ] Can retrieve invoice
- [ ] Can list invoices
- [ ] Can validate invoice
- [ ] Can get invoice XML
- [ ] Can delete invoice
- [ ] Hash calculation works
- [ ] Invoice chaining works

---

### 💡 Tips

1. Always check `npm run dev` logs for errors
2. Use the seeded data for initial testing
3. Check database with `psql` if needed
4. Use Postman or Insomnia for interactive testing
5. Enable CORS if testing from browser

---

### 🔗 Related Files

- API Documentation: `scaffold/backend/README.md`
- Database Setup: `scaffold/backend/DATABASE_SETUP.md`
- Implementation Summary: `PHASE2_DATABASE_INTEGRATION.md`
- Project Status: `ESTADO_PROYECTO.md`
