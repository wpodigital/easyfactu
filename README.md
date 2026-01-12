# EasyFactu - VeriFactu Invoice Management System

Sistema de gestión y validación de facturas basado en el servicio web de validación VeriFactu de la AEAT (Agencia Estatal de Administración Tributaria de España).

## Descripción

EasyFactu es un sistema completo para la gestión y registro de facturas ante la AEAT utilizando el sistema VeriFactu. Incluye:

- **Base de datos PostgreSQL** con esquema completo para almacenar facturas, destinatarios, desgloses fiscales, y encadenamiento de registros
- **Módulo VeriFactu** en TypeScript para generación de XML, cálculo de hash SHA-256 (Huella), y validación XSD
- **API REST** para gestionar facturas y comunicarse con AEAT
- **Soporte completo** para altas (A0) y anulaciones (A1/AN) de facturas

## Características

### Base de Datos

- ✅ Tablas para Facturas, Destinatarios, Desgloses, Sistema Informático
- ✅ Soporte para encadenamiento de registros con hash SHA-256
- ✅ Almacenamiento de estados de validación
- ✅ Relaciones completas entre entidades
- ✅ Índices optimizados para consultas

### Módulo VeriFactu (TypeScript)

- ✅ Tipos TypeScript completos basados en XSD de AEAT
- ✅ Generación de XML para RegistroAlta y RegistroAnulacion
- ✅ Cálculo de hash (Huella) para encadenamiento según especificaciones AEAT
- ✅ Validación XML de mensajes de entrada y salida
- ✅ Parseo de respuestas de AEAT
- ✅ Formateo automático de números (eliminación de ceros)
- ✅ **Seguridad mejorada**: Usa `fast-xml-parser` sin vulnerabilidades conocidas

### API Backend

- ✅ Endpoints RESTful para gestión de facturas
- ✅ Creación de registros de alta (invoices)
- ✅ Anulación de facturas
- ✅ Validación con AEAT
- ✅ Importación/exportación de XML
- ✅ Consulta de estados de validación

## Estructura del Proyecto

```
easyfactu/
├── migrations/                          # Migraciones de base de datos
│   ├── 20251122_create_invoice_declarations_queries.sql
│   └── 20260112_create_verifactu_tables.sql
├── src/
│   └── backend/
│       ├── aeat/                        # Módulo existente para consultas AEAT
│       │   ├── types.ts
│       │   └── validator.ts
│       └── verifactu/                   # Nuevo módulo VeriFactu
│           ├── types.ts                 # Tipos TypeScript basados en XSD
│           ├── xmlBuilder.ts            # Generador de XML
│           ├── hashCalculator.ts        # Cálculo de hash SHA-256
│           ├── validator.ts             # Validación XSD y parseo
│           └── index.ts                 # Exportaciones
├── scaffold/
│   └── backend/                         # API REST de ejemplo
│       ├── src/
│       │   └── index.ts                 # Servidor Express con endpoints
│       ├── package.json
│       ├── tsconfig.json
│       └── README.md
├── tests/
│   ├── aeat/                           # Tests del módulo AEAT
│   └── verifactu/                      # Tests del módulo VeriFactu
│       ├── xmlBuilder.test.ts
│       └── hashCalculator.test.ts
├── docs/                               # Documentación y esquemas XSD de AEAT
│   ├── SuministroInformacion.xsd
│   ├── RespuestaValRegistNoVeriFactu.xsd
│   └── ... (otros documentos PDF)
└── openapi.yaml                        # Especificación OpenAPI
```

## Instalación

### Requisitos Previos

- Node.js 20+
- PostgreSQL 14+
- TypeScript 5+

### Configuración de Base de Datos

1. Crear una base de datos PostgreSQL:

```bash
createdb easyfactu
```

2. Ejecutar las migraciones:

```bash
psql easyfactu < migrations/20251122_create_invoice_declarations_queries.sql
psql easyfactu < migrations/20260112_create_verifactu_tables.sql
```

### Instalación del Backend

```bash
cd scaffold/backend
npm install
npm run dev
```

El servidor se iniciará en http://localhost:3000

## Uso

### Módulo VeriFactu

```typescript
import {
  buildRegistroAltaXml,
  calculateHuellaAlta,
  validateInputXml,
  parseRespuestaXml,
  RegistroFacturacionAltaType,
} from './src/backend/verifactu';

// Crear registro de factura
const registro: RegistroFacturacionAltaType = {
  IDVersion: '1.0',
  IDFactura: {
    IDEmisorFactura: 'B12345678',
    NumSerieFactura: 'FAC-2024-001',
    FechaExpedicionFactura: '2024-01-15',
  },
  NombreRazonEmisor: 'Mi Empresa SL',
  TipoFactura: 'F1',
  DescripcionOperacion: 'Venta de productos',
  Desglose: {
    DesgloseTipoOperacion: [{
      TipoOperacion: 'E',
      Sujeta: {
        NoExenta: {
          TipoNoExenta: 'S1',
          DesgloseIVA: [{
            BaseImponible: 100.00,
            TipoImpositivo: 21.00,
            CuotaImpuesto: 21.00,
          }],
        },
      },
    }],
  },
  CuotaTotal: 21.00,
  ImporteTotal: 121.00,
  Encadenamiento: {
    PrimerRegistro: 'S', // Primera factura
  },
  SistemaInformatico: {
    NombreRazon: 'Software Company',
    NIF: 'A87654321',
    NombreSistemaInformatico: 'EasyFactu',
    IdSistemaInformatico: '01',
    Version: '1.0.0',
    NumeroInstalacion: 'INSTALL-001',
    TipoUsoPosibleSoloVerifactu: 'S',
    TipoUsoPosibleMultiOT: 'N',
    IndicadorMultiplesOT: 'N',
  },
  FechaHoraHusoGenRegistro: '2024-01-15T10:30:00+01:00',
  TipoHuella: '01',
  Huella: '', // Se calculará
};

// Calcular hash (Huella)
const huella = calculateHuellaAlta(registro);
registro.Huella = huella;

// Generar XML
const xml = buildRegistroAltaXml(registro);

// Validar XML
const validation = validateInputXml(xml);
if (!validation.valid) {
  console.error('Validation errors:', validation.errors);
}

// Parsear respuesta de AEAT
const respuestaXml = '...'; // XML de respuesta de AEAT
const respuesta = parseRespuestaXml(respuestaXml);
console.log('Estado:', respuesta.RespuestaValidacion?.EstadoRegistro);
```

### API REST

Ver documentación completa en [scaffold/backend/README.md](scaffold/backend/README.md)

#### Crear Factura

```bash
curl -X POST http://localhost:3000/api/v1/invoices \
  -H "Content-Type: application/json" \
  -d '{
    "idEmisor": "B12345678",
    "numSerie": "FAC-2024-001",
    "fecha": "2024-01-15"
  }'
```

#### Validar con AEAT

```bash
curl -X POST http://localhost:3000/api/v1/invoices/INV-1/validate
```

#### Anular Factura

```bash
curl -X DELETE http://localhost:3000/api/v1/invoices/INV-1
```

## Esquema de Base de Datos

### Tabla: facturas

Tabla principal que almacena tanto registros de alta como de anulación.

Campos principales:
- `id`: ID interno
- `operacion`: 'A0' (Alta), 'A1' (Anulación), 'AN' (Anulación sin previo)
- `id_emisor_factura`, `num_serie_factura`, `fecha_expedicion_factura`: Identificación de la factura
- `tipo_factura`: F1, F2, F3, F4, R1-R5
- `cuota_total`, `importe_total`: Totales
- `huella`: Hash SHA-256 para encadenamiento
- `huella_anterior`: Hash del registro anterior en la cadena
- `estado_registro`: Correcto, AceptadoConErrores, Incorrecto

### Tabla: destinatarios

Almacena los destinatarios de cada factura.

### Tabla: desgloses

Almacena el desglose fiscal (IVA) de cada factura.

### Tabla: sistema_informatico

Información del sistema informático que genera las facturas.

### Otras tablas

- `facturas_rectificadas`: Referencias a facturas rectificadas
- `facturas_sustituidas`: Referencias a facturas sustituidas
- `terceros`: Terceros que expiden facturas
- `generadores`: Generadores de anulaciones

## Testing

```bash
# Ejecutar todos los tests
npm test

# Tests del módulo VeriFactu
npm test tests/verifactu
```

Los tests incluyen:
- Generación de XML para alta y anulación
- Cálculo de hash (Huella) SHA-256
- Formateo de números (eliminación de ceros)
- Validación de estructuras

## Especificaciones AEAT

El sistema está basado en las siguientes especificaciones de AEAT:

- **SuministroInformacion.xsd**: Esquema XSD de entrada
- **RespuestaValRegistNoVeriFactu.xsd**: Esquema XSD de respuesta
- **Descripción del Servicio Web de Validación No VeriFactu** (PDF en `docs/`)
- **Especificaciones técnicas de huella y hash** (PDF en `docs/`)

URLs de validación:
- Producción: `https://www1.agenciatributaria.gob.es`
- Pruebas: `https://prewww1.aeat.es`

## Tipos de Factura Soportados

- **F1**: Factura (art. 6, 7.2, 7.3 LIVA)
- **F2**: Factura simplificada (art. 7.2, 7.3)
- **F3**: Factura que sustituye facturas simplificadas
- **F4**: Asiento resumen de facturas
- **R1-R5**: Facturas rectificativas

## Estado de Validación

- **Correcto**: Factura validada correctamente
- **AceptadoConErrores**: Factura aceptada con advertencias
- **Incorrecto**: Factura rechazada

## Contribuir

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear un Pull Request

## Licencia

Ver archivo LICENSE en la raíz del repositorio.

## Soporte

Para preguntas y soporte, crear un issue en el repositorio.

## Referencias

- [AEAT - Agencia Tributaria](https://www.agenciatributaria.es/)
- [VeriFactu - Sistema de verificación de facturas](https://sede.agenciatributaria.gob.es/)
- Documentación técnica en el directorio `docs/`

## Seguridad

Este proyecto toma la seguridad en serio. Hemos implementado las siguientes medidas:

- ✅ **Dependencias seguras**: Usa `fast-xml-parser` sin vulnerabilidades conocidas
- ✅ **Sin dependencias nativas**: Reduce la superficie de ataque
- ✅ **Validación de entrada**: Validación XML de sintaxis
- ✅ **Hash seguro**: SHA-256 para encadenamiento de facturas
- ⚠️ **XSD Validation**: Actualmente implementa validación básica de sintaxis XML. Para producción, considere implementar validación XSD completa usando herramientas externas

### Reporte de Vulnerabilidades

Si descubre una vulnerabilidad de seguridad, por favor:
1. **NO** abra un issue público
2. Envíe un reporte privado a través de GitHub Security Advisories
3. O contacte directamente a los mantenedores

Para más detalles, consulte [SECURITY.md](SECURITY.md).

### Auditorías de Seguridad

```bash
# Verificar dependencias
npm audit

# Actualizar dependencias de seguridad
npm audit fix
```

