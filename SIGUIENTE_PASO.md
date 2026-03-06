# 🎯 Siguiente Paso - Aplicar Migración de Compatibilidad

## ✅ Cambios Implementados

Se ha implementado la **Opción C: Migración de Compatibilidad** que:

1. ✅ **Mantiene** el schema VeriFactu completo (compliance con AEAT)
2. ✅ **Agrega** campos de compatibilidad para el código de la API
3. ✅ **Usa** PostgreSQL para mapeo automático

---

## 📋 Qué se Cambió

### 1. Nueva Migración Creada
**Archivo**: `migrations/20260303_add_compatibility_fields.sql`

Esta migración agrega:
- Campos de compatibilidad a la tabla `facturas`
- Índices para mejor performance
- Vista `facturas_api` para compatibilidad
- Verificación automática

### 2. Código Actualizado
- ✅ `facturas.repository.ts` - Usa nombres de campos VeriFactu
- ✅ `index.ts` (API) - Actualizado para campos correctos
- ✅ Interfaces TypeScript corregidas

---

## 🚀 Cómo Aplicar la Solución

### Paso 1: Aplicar la Migración

En PowerShell, ejecuta:

```powershell
cd C:\Users\HP\Dev\GitHub\easyfactu\scaffold\backend

# Opción A: Resetear y recrear la base de datos (RECOMENDADO si es desarrollo)
.\scripts\db-reset.ps1
.\scripts\db-setup.ps1 -Seed

# Opción B: Solo aplicar la nueva migración (si tienes datos que quieres conservar)
# Ejecuta manualmente el SQL:
psql -U postgres -d easyfactu -f ../../migrations/20260303_add_compatibility_fields.sql
```

### Paso 2: Verificar la Migración

```powershell
# Conectar a la base de datos
psql -U postgres -d easyfactu

# Verificar que los nuevos campos existan
\d facturas

# Deberías ver los nuevos campos:
# - xml_content
# - validation_timestamp
# - validation_status
# - validation_csv
# - validation_errors
# - id_factura_anterior

# Salir
\q
```

### Paso 3: Probar la API

```powershell
# Iniciar el servidor (en una terminal)
npm run dev

# Probar los endpoints (en otra terminal)
.\scripts\test-api.ps1
```

---

## ✅ Resultados Esperados

Después de aplicar la migración:

1. ✅ **POST /api/v1/invoices** - Debería crear facturas correctamente
2. ✅ **GET /api/v1/invoices** - Debería listar facturas
3. ✅ **GET /api/v1/invoices/:id** - Debería obtener detalles
4. ✅ Todos los endpoints deberían funcionar sin errores 500

---

## 🔍 Qué Cambió en el Schema

### Campos Agregados (Compatibilidad):

```sql
ALTER TABLE facturas ADD COLUMN xml_content TEXT;
ALTER TABLE facturas ADD COLUMN validation_timestamp TIMESTAMP WITH TIME ZONE;
ALTER TABLE facturas ADD COLUMN validation_status VARCHAR(50);
ALTER TABLE facturas ADD COLUMN validation_csv TEXT;
ALTER TABLE facturas ADD COLUMN validation_errors TEXT;
ALTER TABLE facturas ADD COLUMN id_factura_anterior BIGINT REFERENCES facturas(id);
```

### Campos del Schema VeriFactu (Ya Existentes):

- `id` - Primary key (antes se esperaba `id_factura` erróneamente)
- `nif_emisor_factura` - NIF del emisor
- `num_serie_factura_emisor` - Número de serie
- `fecha_expedicion_factura` - Fecha de expedición
- `tipo_factura` - Tipo (F1-F4, R1-R5)
- `operacion` - A0 (Alta), A1 (Alta previa), AN (Anulación)
- `estado_registro` - Correcta, Incompleta, Error
- `huella` - Hash SHA-256 de la factura
- `fecha_hora_huso_gen_registro` - Timestamp de generación

---

## 📊 Antes vs Después

### ❌ Antes (Errores):
```
Testing: List All Invoices
  [ERROR] Error: (500) Error interno del servidor
  
Testing: Create Invoice
  [ERROR] Error: (400) Solicitud incorrecta
```

**Problema**: El código usaba nombres de campos que no existían en el schema VeriFactu.

### ✅ Después (Debería Funcionar):
```
Testing: List All Invoices
  [OK] Status: 200
  
Testing: Create Invoice
  [OK] Status: 201
```

**Solución**: El código ahora usa los nombres correctos del schema VeriFactu + campos de compatibilidad.

---

## 🎯 Si Tienes Problemas

### Error: "relation 'facturas' does not exist"

```powershell
# La base de datos no existe, créala:
.\scripts\db-setup.ps1 -Seed
```

### Error: "column 'xml_content' does not exist"

```powershell
# La migración no se aplicó, aplícala:
psql -U postgres -d easyfactu -f ../../migrations/20260303_add_compatibility_fields.sql
```

### Error: "column 'id_factura' does not exist"

```powershell
# El código no está actualizado, verifica:
cd C:\Users\HP\Dev\GitHub\easyfactu
git pull origin copilot/create-invoice-management-system
cd scaffold\backend
npm install
npm run build
```

---

## 📝 Resumen

1. **Problema Original**: Mismatch entre schema VeriFactu y código API
2. **Solución Implementada**: Migración de compatibilidad (Opción C)
3. **Próximo Paso**: Aplicar la migración con `db-setup.ps1 -Seed`
4. **Resultado**: API funcionará correctamente con schema VeriFactu compliant

---

## 🆘 Necesitas Ayuda?

Si después de aplicar la migración siguen habiendo errores, comparte:

1. El mensaje de error completo
2. La salida de `.\scripts\db-setup.ps1 -Seed`
3. La salida de `.\scripts\test-api.ps1`

Y podré ayudarte a resolver el problema.

---

**Archivo Creado**: 2026-03-03  
**Próxima Acción**: Ejecutar `.\scripts\db-setup.ps1 -Seed`
