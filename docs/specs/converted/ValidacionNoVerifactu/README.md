# Servicio de Validación de Registros No Verificables (No VERI*FACTU)

**Versión:** 0.2  
**Fuente:** `docs/Descripcion_ServicioWeb_ValidacionNoVerifactu.pdf`

## Resumen

Este documento describe el servicio web de la AEAT para validar registros de facturación **no verificables** (No VERI*FACTU) según el Real Decreto 1007/2023 y la Orden Ministerial HAC/1177/2024.

El servicio permite validar:
- Registros de Alta (`RegistroAlta`)
- Registros de Anulación (`RegistroAnulacion`)

**Importante:** Aunque los XML «No VERI*FACTU» deben estar firmados, este servicio **no valida la firma** del registro de facturación.

## Endpoint de Validación

| Entorno | URL |
|---------|-----|
| **Pruebas** | `https://prewww1.aeat.es/wlpl/TIKE-CONT/ws/SistemaFacturacion/ValRegistroNoVerifactu` |
| **Cliente de pruebas** | `https://preportal.aeat.es/PRE-Exteriores/Inicio/_menu_/VERI_FACTU___Sistemas_Informaticos_de_Facturacion/VERI_FACTU___Sistemas_Informaticos_de_Facturacion.html` |

## Estados de Respuesta

| Estado | Descripción |
|--------|-------------|
| `Correcto` | Registro aceptado - supera validaciones sintácticas y de negocio |
| `AceptadoConErrores` | Registro aceptado con errores admisibles |
| `Incorrecto` | Registro rechazado - errores no admisibles |

## Tipos de Errores

- **Errores No Admisibles:** Provocan el rechazo del registro. Corresponden a errores sintácticos y de negocio.
- **Errores Admisibles:** No provocan el rechazo. El registro será admitido por la AEAT.

## Requisitos Técnicos

- **Protocolo:** HTTPS
- **Formato de mensajes:** XML (UTF-8)
- **Autenticación:** Certificado electrónico de cliente reconocido por la AEAT
- **Firma:** Los XML deben estar firmados (aunque este servicio no valida la firma)

## Esquemas

| Esquema | Descripción | URL |
|---------|-------------|-----|
| `SuministroInformacion.xsd` | Esquema de entrada | [Link](https://prewww2.aeat.es/static_files/common/internet/dep/aplicaciones/es/aeat/tikeV1.0/cont/ws/SuministroInformacion.xsd) |
| `RespuestaValRegistNoVeriFactu.xsd` | Esquema de respuesta | [Link](https://prewww2.aeat.es/static_files/common/internet/dep/aplicaciones/es/aeat/tikeV1.0/cont/ws/RespuestaValRegistNoVeriFactu.xsd) |

## Pasos de Integración

1. **Obtener certificado electrónico** reconocido por la AEAT
2. **Generar registro de facturación** conforme al esquema `SuministroInformacion.xsd`
3. **Firmar el XML** (XMLDSig/XAdES) - aunque el servicio no valida la firma
4. **Enviar petición HTTPS POST** al endpoint con el XML como cuerpo
5. **Procesar respuesta** según el esquema `RespuestaValRegistNoVeriFactu.xsd`
6. **Gestionar errores** según código y descripción devueltos

## Estructura de Archivos

```
ValidacionNoVerifactu/
├── README.md                    # Este archivo
├── spec.json                    # Especificación machine-readable de endpoints
├── schema.json                  # JSON Schema para validación de payloads
├── examples/
│   ├── node_request.js          # Ejemplo en Node.js
│   ├── python_request.py        # Ejemplo en Python
│   └── curl.md                  # Ejemplo con cURL
├── tables/
│   └── fields.csv               # Tabla de campos/parámetros
├── samples/
│   ├── registro_alta_request.xml
│   ├── registro_alta_response_correcto.xml
│   ├── registro_alta_response_aceptado_con_errores.xml
│   ├── registro_alta_response_incorrecto.xml
│   ├── registro_anulacion_request.xml
│   ├── registro_anulacion_response_correcto.xml
│   ├── registro_anulacion_response_aceptado_con_errores.xml
│   ├── registro_anulacion_response_incorrecto.xml
│   └── error_formato_xml.xml
├── results/
│   └── validation_results.md    # Resultados de validación automática
└── images/
    └── (diagramas extraídos del PDF)
```

## Referencias Cruzadas

- Ejemplos de registro XML firmados: [`docs/specs/converted/EspecTecGenerFirmaElectRfact/examples/samples/ejemploRegistro.xml`](../EspecTecGenerFirmaElectRfact/examples/samples/ejemploRegistro.xml)
- Esquema XSD en repositorio: [`docs/RespuestaValRegistNoVeriFactu.xsd`](../../../RespuestaValRegistNoVeriFactu.xsd)
- Esquema de suministro: [`docs/SuministroInformacion.xsd`](../../../SuministroInformacion.xsd)

## Validación Local

Para reproducir las validaciones localmente:

```bash
# Validar XML well-formedness
xmllint --noout samples/*.xml

# Validar XML contra esquema XSD (requiere descargar esquemas)
xmllint --noout --schema ../../../SuministroInformacion.xsd samples/registro_alta_request.xml

# Validar JSON contra schema.json
python3 -c "
import json
from jsonschema import validate
with open('schema.json') as s, open('payload.json') as p:
    validate(json.load(p), json.load(s))
"

# Verificar firma XML (si se dispone de certificados)
xmlsec1 --verify --trusted-pem cert.pem samples/signed_registro.xml
```

## Notas de Verificación

- Ver resultados de validación automática: [`results/validation_results.md`](results/validation_results.md)
- Los ejemplos XML extraídos del PDF han sido validados para well-formedness
- La verificación de firmas XMLDSig/XAdES requiere certificados no incluidos

## Control de Versiones del Documento

| Versión | Cambios |
|---------|---------|
| 0.1 | Creación del documento |
| 0.2 | Versión actual |
