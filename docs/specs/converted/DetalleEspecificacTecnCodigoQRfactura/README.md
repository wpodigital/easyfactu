# DetalleEspecificacTecnCodigoQRfactura — Resumen convertido

Fuente: docs/DetalleEspecificacTecnCodigoQRfactura.pdf (v0.4.7)

Resumen rápido:
- Documento: Especificación técnica del Código QR de la factura (v0.4.7).
- Objetivo: definir los campos, normalización, orden, codificación y cálculo de la huella/hash que se incorpora al QR.
- Salida generada por este proceso: este README, un JSON machine-readable con los campos, un JSON Schema, ejemplos de código (Node.js, Python, Java), un CSV con la tabla de campos y una carpeta de imágenes (placeholder).

Pasos resumidos (implementación):
1. Recopilar campos: versión, NIF emisor, NIF receptor (si aplica), número de factura, fecha, base imponible, cuota IVA, total factura, moneda, y campo de huella/hash.
2. Normalizar cada campo: trim, NFC normalization (Unicode), punto decimal con "." para importes, formato de fecha ISO 8601 (YYYY-MM-DD).
3. Concatenar en el orden especificado con separador "|" (pipe) sin espacios adicionales.
4. Calcular huella con SHA-256 sobre la cadena concatenada (UTF-8).
5. Representar la huella en Base64 (o hex) según la especificación; aquí usamos Base64 URL-safe en los ejemplos.
6. Construir el contenido final del QR: prefijo (p.ej. "VFQR1"), campos concatenados + huella; o bien un JSON comprimido y base64.
7. Generar la imagen QR (liberías: qrcode, qrcode-generator, ZXing).

Nota: El PDF contiene diagramas y ejemplos; las imágenes se colocan en images/ cuando se extraigan.

Revisión requerida: validar que el orden de campos y el formato de la huella coinciden exactamente con el PDF original (ejemplos numéricos).