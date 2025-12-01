# DetalleEspecificacTecnCodigoQRfactura Converted Spec (v0.4.7)

This directory contains the converted artifacts from the PDF specification of the invoice QR code (DetalleEspecificacTecnCodigoQRfactura v0.4.7).

## Purpose

These files provide a machine-readable specification of the Veri-Factu invoice QR code format, including:

- **qr_spec.json**: Machine-readable field definitions
- **qr_schema.json**: JSON Schema for validating QR payloads
- **examples/**: Runnable code examples in Node.js, Python, and Java
- **tables/fields.csv**: CSV table of all QR code fields
- **images/**: Placeholder for diagrams extracted from the original PDF

## Contents

| File | Description |
|------|-------------|
| `README.md` | This file - summary and implementation steps |
| `qr_spec.json` | Machine-readable field definitions and ordering |
| `qr_schema.json` | JSON Schema for validating QR code payloads |
| `examples/node_generate_qr.js` | Node.js example for generating QR payload and image |
| `examples/python_generate_qr.py` | Python example for generating QR payload and image |
| `examples/java_generate_qr.java` | Java example for generating QR payload and image |
| `tables/fields.csv` | CSV table of all fields with types and constraints |
| `images/README.md` | Placeholder for extracted images |

## Implementation Steps

1. **Parse the QR Spec**: Load `qr_spec.json` to obtain the ordered list of fields and their definitions.

2. **Construct the Payload**: Concatenate field values in the specified order using the configured separator.
   - Apply normalization rules (trim whitespace, Unicode NFC normalization)
   - Format dates as specified (typically YYYY-MM-DD or DD-MM-YYYY)
   - Use the separator character (e.g., `|` or `;`) between fields

3. **Compute the Hash**: 
   - Apply the hash algorithm (SHA-256 recommended)
   - Encode the result as specified (Base64, Base64 URL-safe, or hex)

4. **Generate the QR Code**: 
   - Use a QR code library to encode the final payload
   - Set appropriate error correction level (L, M, Q, or H)
   - Configure size and module settings as needed

5. **Validate**: Use `qr_schema.json` to validate your payload structure before generation.

## Field Order

The QR code payload must include fields in the exact order specified in `qr_spec.json`. Key fields include:

1. Issuer NIF (VAT number)
2. Invoice number
3. Invoice date
4. Total amount
5. Hash/Signature

Refer to `tables/fields.csv` for the complete ordered list.

## Notes

- **Normalization**: All string fields should be trimmed and NFC-normalized
- **Date Format**: Confirm the exact format required (DD-MM-YYYY vs YYYY-MM-DD)
- **Hash Algorithm**: SHA-256 is recommended; confirm encoding (Base64 vs hex)
- **Separator**: The separator character between fields must be confirmed

## Review Required

Before using these artifacts in production:

1. Confirm the exact order of fields in the QR payload
2. Verify normalization rules (trim, Unicode NFC, date format)
3. Confirm the separator character used in concatenation
4. Validate hash algorithm and encoding (SHA-256, Base64 vs Base64 URL-safe vs hex)
5. Extract and add images/diagrams from the original PDF
6. Test examples against numeric samples from the PDF

## Source

Original specification: `docs/DetalleEspecificacTecnCodigoQRfactura.pdf`
