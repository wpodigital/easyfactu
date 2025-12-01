# cURL Examples for AEAT No VERI*FACTU Validation Service

This document provides cURL examples for testing the AEAT No VERI*FACTU validation service.

## Prerequisites

- cURL installed on your system
- A valid client certificate (.p12 or .pem) recognized by AEAT (required for production)
- The XML file to validate saved locally

## Test Environment Endpoint

```
https://prewww1.aeat.es/wlpl/TIKE-CONT/ws/SistemaFacturacion/ValRegistroNoVerifactu
```

## Basic Request (without certificate - will fail authentication)

```bash
curl -X POST \
  -H "Content-Type: application/xml; charset=utf-8" \
  -d @registro_alta_request.xml \
  https://prewww1.aeat.es/wlpl/TIKE-CONT/ws/SistemaFacturacion/ValRegistroNoVerifactu
```

## Request with Client Certificate (PEM format)

```bash
curl -X POST \
  --cert /path/to/client-cert.pem \
  --key /path/to/client-key.pem \
  -H "Content-Type: application/xml; charset=utf-8" \
  -d @registro_alta_request.xml \
  https://prewww1.aeat.es/wlpl/TIKE-CONT/ws/SistemaFacturacion/ValRegistroNoVerifactu
```

## Request with PKCS#12 Certificate (.p12)

```bash
curl -X POST \
  --cert-type P12 \
  --cert /path/to/client-cert.p12:password \
  -H "Content-Type: application/xml; charset=utf-8" \
  -d @registro_alta_request.xml \
  https://prewww1.aeat.es/wlpl/TIKE-CONT/ws/SistemaFacturacion/ValRegistroNoVerifactu
```

## Inline XML Request

```bash
curl -X POST \
  --cert /path/to/client-cert.pem \
  --key /path/to/client-key.pem \
  -H "Content-Type: application/xml; charset=utf-8" \
  -d '<?xml version="1.0" encoding="UTF-8"?>
<sum1:RegistroAlta xmlns:sum1="https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/tike/cont/ws/SuministroInformacion.xsd">
  <sum1:IDVersion>1.0</sum1:IDVersion>
  <sum1:IDFactura>
    <sum1:IDEmisorFactura>89890001K</sum1:IDEmisorFactura>
    <sum1:NumSerieFactura>12345678-G66</sum1:NumSerieFactura>
    <sum1:FechaExpedicionFactura>03-02-2025</sum1:FechaExpedicionFactura>
  </sum1:IDFactura>
  <sum1:RefExterna>EXTERNA</sum1:RefExterna>
  <sum1:NombreRazonEmisor>certificado uno telematicas</sum1:NombreRazonEmisor>
  <sum1:Subsanacion>N</sum1:Subsanacion>
  <sum1:RechazoPrevio>N</sum1:RechazoPrevio>
  <sum1:TipoFactura>F1</sum1:TipoFactura>
  <sum1:DescripcionOperacion>Venta de productos</sum1:DescripcionOperacion>
  <sum1:Destinatarios>
    <sum1:IDDestinatario>
      <sum1:NombreRazon>certificado dos telematicas</sum1:NombreRazon>
      <sum1:NIF>89890002E</sum1:NIF>
    </sum1:IDDestinatario>
  </sum1:Destinatarios>
  <sum1:Desglose>
    <sum1:DetalleDesglose>
      <sum1:ClaveRegimen>01</sum1:ClaveRegimen>
      <sum1:CalificacionOperacion>S1</sum1:CalificacionOperacion>
      <sum1:TipoImpositivo>21</sum1:TipoImpositivo>
      <sum1:BaseImponibleOimporteNoSujeto>100</sum1:BaseImponibleOimporteNoSujeto>
      <sum1:CuotaRepercutida>21</sum1:CuotaRepercutida>
    </sum1:DetalleDesglose>
  </sum1:Desglose>
  <sum1:CuotaTotal>21</sum1:CuotaTotal>
  <sum1:ImporteTotal>121</sum1:ImporteTotal>
  <sum1:Encadenamiento>
    <sum1:PrimerRegistro>S</sum1:PrimerRegistro>
  </sum1:Encadenamiento>
  <sum1:SistemaInformatico>
    <sum1:NombreRazon>CERTIFICADO UNO TELEMATICAS</sum1:NombreRazon>
    <sum1:NIF>89890001K</sum1:NIF>
    <sum1:NombreSistemaInformatico>NombreSistemaInformatico</sum1:NombreSistemaInformatico>
    <sum1:IdSistemaInformatico>77</sum1:IdSistemaInformatico>
    <sum1:Version>1.0.03</sum1:Version>
    <sum1:NumeroInstalacion>383</sum1:NumeroInstalacion>
    <sum1:TipoUsoPosibleSoloVerifactu>S</sum1:TipoUsoPosibleSoloVerifactu>
    <sum1:TipoUsoPosibleMultiOT>N</sum1:TipoUsoPosibleMultiOT>
    <sum1:IndicadorMultiplesOT>N</sum1:IndicadorMultiplesOT>
  </sum1:SistemaInformatico>
  <sum1:FechaHoraHusoGenRegistro>2025-02-03T14:30:00+01:00</sum1:FechaHoraHusoGenRegistro>
  <sum1:TipoHuella>01</sum1:TipoHuella>
  <sum1:Huella>FF954378B64ED331A9B2366AD317D86E9DEC1716B12DD0ACCB172A6DC4C105AA</sum1:Huella>
</sum1:RegistroAlta>' \
  https://prewww1.aeat.es/wlpl/TIKE-CONT/ws/SistemaFacturacion/ValRegistroNoVerifactu
```

## Verbose Output

Add `-v` flag for detailed connection information:

```bash
curl -v -X POST \
  --cert /path/to/client-cert.pem \
  --key /path/to/client-key.pem \
  -H "Content-Type: application/xml; charset=utf-8" \
  -d @registro_alta_request.xml \
  https://prewww1.aeat.es/wlpl/TIKE-CONT/ws/SistemaFacturacion/ValRegistroNoVerifactu
```

## Save Response to File

```bash
curl -X POST \
  --cert /path/to/client-cert.pem \
  --key /path/to/client-key.pem \
  -H "Content-Type: application/xml; charset=utf-8" \
  -d @registro_alta_request.xml \
  -o response.xml \
  https://prewww1.aeat.es/wlpl/TIKE-CONT/ws/SistemaFacturacion/ValRegistroNoVerifactu
```

## Expected Response Examples

### Successful Validation (Correcto)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<tikR:RespuestaValContenidoFactuSistemaFacturacion
xmlns:tikR="https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/tike/cont/ws/RespuestaValRegistNoVeriFactu.xsd"
xmlns:tik="https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/tike/cont/ws/SuministroInformacion.xsd">
  <tikR:RespuestaValidacion>
    <tikR:IDFactura>
      <tik:IDEmisorFactura>89890001k</tik:IDEmisorFactura>
      <tik:NumSerieFactura>12345678-G33</tik:NumSerieFactura>
      <tik:FechaExpedicionFactura>03-02-2025</tik:FechaExpedicionFactura>
    </tikR:IDFactura>
    <tikR:Operacion>
      <tik:TipoOperacion>Alta</tik:TipoOperacion>
      <tik:Subsanacion>N</tik:Subsanacion>
      <tik:RechazoPrevio>N</tik:RechazoPrevio>
    </tikR:Operacion>
    <tikR:RefExterna>EXTERNA</tikR:RefExterna>
    <tikR:EstadoRegistro>Correcto</tikR:EstadoRegistro>
  </tikR:RespuestaValidacion>
</tikR:RespuestaValContenidoFactuSistemaFacturacion>
```

### XML Format Error

```xml
<tikR:RespuestaValContenidoFactuSistemaFacturacion
xmlns:tikR="https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/tike/cont/ws/RespuestaValRegistNoVeriFactu.xsd"
xmlns:tik="https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/tike/cont/ws/SuministroInformacion.xsd">
  <tikR:DescripcionErrorFormatoXML>Código[4102]. El XML no cumple el esquema. Falta informar campo obligatorio.: IDVersion</tikR:DescripcionErrorFormatoXML>
</tikR:RespuestaValContenidoFactuSistemaFacturacion>
```

## Troubleshooting

### SSL/TLS Certificate Issues

If you encounter SSL errors, you may need to specify the CA bundle:

```bash
curl -X POST \
  --cacert /path/to/ca-bundle.crt \
  --cert /path/to/client-cert.pem \
  --key /path/to/client-key.pem \
  -H "Content-Type: application/xml; charset=utf-8" \
  -d @registro_alta_request.xml \
  https://prewww1.aeat.es/wlpl/TIKE-CONT/ws/SistemaFacturacion/ValRegistroNoVerifactu
```

### Check Certificate Validity

```bash
openssl x509 -in /path/to/client-cert.pem -text -noout
```

### Convert PKCS#12 to PEM

```bash
# Extract certificate
openssl pkcs12 -in certificate.p12 -clcerts -nokeys -out cert.pem

# Extract private key
openssl pkcs12 -in certificate.p12 -nocerts -nodes -out key.pem
```

## Web Client Alternative

For testing without a certificate, use the AEAT web client:

[https://preportal.aeat.es/PRE-Exteriores/Inicio/_menu_/VERI_FACTU___Sistemas_Informaticos_de_Facturacion/VERI_FACTU___Sistemas_Informaticos_de_Facturacion.html](https://preportal.aeat.es/PRE-Exteriores/Inicio/_menu_/VERI_FACTU___Sistemas_Informaticos_de_Facturacion/VERI_FACTU___Sistemas_Informaticos_de_Facturacion.html)
