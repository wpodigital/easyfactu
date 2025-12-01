# Images - ValidacionNoVerifactu

This folder contains diagrams and images extracted from the PDF document.

## Note

The PDF document `Descripcion_ServicioWeb_ValidacionNoVerifactu.pdf` (v0.2) contains primarily text content with embedded diagrams showing the response structure.

### Response Structure Diagram (Page 11)

The response structure diagram shows the XML hierarchy for `RespuestaValContenidoFactuSistemaFacturacion`:

```
RespuestaValContenidoFactuSistemaFacturacion
├── RespuestaValidacion
│   ├── IDFactura
│   │   ├── IDEmisorFactura
│   │   ├── NumSerieFactura
│   │   └── FechaExpedicionFactura
│   ├── Operacion
│   │   ├── TipoOperacion (Alta/Anulacion)
│   │   ├── Subsanacion (S/N)
│   │   ├── RechazoPrevio (S/N)
│   │   └── SinRegistroPrevio (S/N) [for Anulacion only]
│   ├── RefExterna
│   ├── EstadoRegistro (Correcto/AceptadoConErrores/Incorrecto)
│   ├── CodigoErrorRegistro [optional]
│   └── DescripcionErrorRegistro [optional]
└── DescripcionErrorFormatoXML [for XML format errors only]
```

### Page Images

Full page captures are available for reference:
- `response_structure_diagram.png` - Page 11 with response structure
- `error_response_diagram.png` - Page 12 with error response examples

## Source

All images derived from: `docs/Descripcion_ServicioWeb_ValidacionNoVerifactu.pdf` (v0.2)
