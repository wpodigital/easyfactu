# Instrucciones Siguientes

## Cambios Aplicados ✅

Se han corregido:
1. ✅ **seed-data.sql** - Ahora usa nombres de campos VeriFactu correctos
2. ✅ **test-api.ps1** - Ahora usa IDs numéricos (1, 2, 3) en lugar de strings

## Qué Debes Hacer Ahora

### Paso 1: Re-aplicar la migración y seed
```powershell
cd C:\Users\HP\Dev\GitHub\easyfactu\scaffold\backend
.\scripts\db-setup.ps1 -Seed
```

**Nota**: El script borrará las tablas existentes y las recreará con los datos correctos.

### Paso 2: Reiniciar el servidor
Si el servidor está corriendo, deténlo (Ctrl+C) y vuelve a iniciarlo:
```powershell
npm run dev
```

### Paso 3: Ejecutar los tests
En otra terminal PowerShell:
```powershell
cd C:\Users\HP\Dev\GitHub\easyfactu\scaffold\backend
.\scripts\test-api.ps1
```

## Resultado Esperado

Deberías ver:
```
Testing: Health Check
  [OK] Status: 200

Testing: List All Invoices
  [OK] Status: 200
  Response: {"total":3,"count":3,"invoices":[...]}

Testing: List Invoices (Paginated)
  [OK] Status: 200

Testing: Create Invoice
  [OK] Status: 201

Testing: Get Invoice by ID
  [OK] Status: 200

Testing: Get Invoice Status
  [OK] Status: 200

Testing: Get Invoice XML
  [OK] Status: 200

================================================
  Test Summary
================================================

[OK] Tests Passed: 7
[ERROR] Tests Failed: 0

Success Rate: 100%
```

## Si Todavía Hay Errores

Revisa los logs del servidor (la terminal donde corre `npm run dev`) para ver errores específicos.

Los errores más comunes:
- **400 Bad Request**: Verifica el JSON del body en el test
- **500 Internal Server Error**: Revisa los logs del servidor, probablemente un error de SQL
- **404 Not Found**: La factura con id=1 no existe (vuelve a correr db-setup.ps1 -Seed)

## Verificar que hay datos

Puedes verificar que los datos se cargaron correctamente con:
```powershell
psql -U postgres -d easyfactu -c "SELECT id, num_serie_factura_emisor, importe_total, estado_registro FROM facturas;"
```

Deberías ver 3 facturas: TEST-001, TEST-002, TEST-003.
