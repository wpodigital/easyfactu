#!/usr/bin/env python3
"""
Veri-Factu QR Code Generator - Python Example

This script demonstrates how to generate a QR code payload and image
for a Veri-Factu invoice based on the specification in qr_spec.json.

Usage:
    pip install qrcode[pil]
    python python_generate_qr.py

Version: 0.4.7
See: ../qr_spec.json for field definitions
"""

import hashlib
import base64
import json
import unicodedata
from datetime import date, datetime
from pathlib import Path
from typing import Any, Union

# Optional: Install 'qrcode' and 'pillow' for QR image generation
# pip install qrcode[pil]
try:
    import qrcode
    HAS_QRCODE = True
except ImportError:
    HAS_QRCODE = False
    print("Note: qrcode package not installed. Only payload will be generated.")
    print("Run 'pip install qrcode[pil]' to enable QR image generation.\n")


def load_spec() -> dict:
    """Load the QR specification from the JSON file."""
    spec_path = Path(__file__).parent.parent / 'qr_spec.json'
    with open(spec_path, 'r', encoding='utf-8') as f:
        return json.load(f)


def normalize_value(value: Any) -> str:
    """
    Normalize a string value according to the specification.
    - Trim whitespace
    - Apply Unicode NFC normalization
    
    Args:
        value: The value to normalize
        
    Returns:
        Normalized string value
    """
    if not isinstance(value, str):
        return str(value)
    return unicodedata.normalize('NFC', value.strip())


def format_amount(value: float, precision: int = 2) -> str:
    """
    Format a number with the specified precision.
    
    Args:
        value: The numeric value
        precision: Decimal places (default: 2)
        
    Returns:
        Formatted number string
    """
    return f"{value:.{precision}f}"


def format_date(value: Union[date, datetime, str], fmt: str = 'DD-MM-YYYY') -> str:
    """
    Format a date according to the specification.
    
    Args:
        value: The date to format (accepts ISO format YYYY-MM-DD or date objects)
        fmt: Output date format ('DD-MM-YYYY' or 'YYYY-MM-DD')
        
    Returns:
        Formatted date string
    """
    if isinstance(value, str):
        # Try ISO format first (YYYY-MM-DD), then DD-MM-YYYY
        try:
            value = datetime.strptime(value, '%Y-%m-%d').date()
        except ValueError:
            try:
                value = datetime.strptime(value, '%d-%m-%Y').date()
            except ValueError:
                # Fallback to fromisoformat for other ISO formats
                value = datetime.fromisoformat(value).date()
    elif isinstance(value, datetime):
        value = value.date()
    
    if fmt == 'YYYY-MM-DD':
        return value.strftime('%Y-%m-%d')
    return value.strftime('%d-%m-%Y')


def compute_hash(payload: str, encoding: str = 'base64') -> str:
    """
    Compute the SHA-256 hash of the payload.
    
    Args:
        payload: The payload to hash
        encoding: Output encoding ('base64', 'base64url', or 'hex')
        
    Returns:
        Encoded hash string
    """
    hash_bytes = hashlib.sha256(payload.encode('utf-8')).digest()
    
    if encoding == 'base64url':
        return base64.urlsafe_b64encode(hash_bytes).decode('ascii')
    elif encoding == 'hex':
        return hash_bytes.hex()
    return base64.b64encode(hash_bytes).decode('ascii')


def build_payload(invoice: dict, spec: dict) -> dict:
    """
    Build the QR code payload from invoice data.
    
    Args:
        invoice: Invoice data dictionary
        spec: QR specification dictionary
        
    Returns:
        Dictionary containing payload, hash, and fields
    """
    separator = spec.get('encoding', {}).get('separator', '|')
    fields = []
    
    # Build payload from ordered fields
    for field in spec.get('fields', []):
        name = field['name']
        value = invoice.get(name)
        
        # Skip computed fields (like hash) - they are computed later
        if field.get('computed', False):
            continue
        
        if field.get('required', False) and value is None:
            raise ValueError(f"Required field missing: {name}")
        
        if value is None:
            continue
        
        # Skip hash field - computed later
        if field.get('format') == 'hash':
            continue
        
        # Format value based on type
        if field.get('type') == 'number':
            formatted = format_amount(value, field.get('precision', 2))
        elif field.get('format') == 'date':
            formatted = format_date(value, field.get('date_format', 'DD-MM-YYYY'))
        else:
            formatted = normalize_value(value)
        
        fields.append(formatted)
    
    # Build payload without hash
    payload_without_hash = separator.join(fields)
    
    # Compute hash
    hash_encoding = spec.get('hash', {}).get('encoding', 'base64')
    hash_value = compute_hash(payload_without_hash, hash_encoding)
    
    # Final payload with hash
    final_payload = f"{payload_without_hash}{separator}{hash_value}"
    
    return {
        'payload': final_payload,
        'payload_without_hash': payload_without_hash,
        'hash': hash_value,
        'fields': fields
    }


def generate_qr_image(payload: str, output_path: Path | str, options: dict = None) -> Path | None:
    """
    Generate QR code image from payload.
    
    Args:
        payload: QR code payload
        output_path: Output file path
        options: QR code options
        
    Returns:
        Output path if successful, None otherwise
    """
    if not HAS_QRCODE:
        print("QRCode package not installed. Skipping image generation.")
        return None
    
    options = options or {}
    output_path = Path(output_path)
    
    # Map error correction level
    error_levels = {'L': qrcode.constants.ERROR_CORRECT_L,
                   'M': qrcode.constants.ERROR_CORRECT_M,
                   'Q': qrcode.constants.ERROR_CORRECT_Q,
                   'H': qrcode.constants.ERROR_CORRECT_H}
    error_level = error_levels.get(options.get('error_correction', 'M'),
                                   qrcode.constants.ERROR_CORRECT_M)
    
    # Create QR code
    qr = qrcode.QRCode(
        version=None,  # Auto-size
        error_correction=error_level,
        box_size=options.get('module_size', 4),
        border=options.get('quiet_zone', 4)
    )
    
    qr.add_data(payload)
    qr.make(fit=True)
    
    # Generate image
    img = qr.make_image(fill_color="black", back_color="white")
    img.save(output_path)
    
    return output_path


def main():
    """Main example function."""
    print("=== Veri-Factu QR Code Generator (Python) ===\n")
    
    # Load specification
    try:
        spec = load_spec()
        print(f"Loaded specification version: {spec.get('version', 'unknown')}")
    except FileNotFoundError:
        print("Warning: Specification file not found. Using defaults...")
        spec = {
            'version': '0.4.7',
            'encoding': {'separator': '|', 'normalization': 'NFC'},
            'hash': {'algorithm': 'SHA-256', 'encoding': 'base64'},
            'fields': [
                {'position': 1, 'name': 'nif_emisor', 'type': 'string', 'required': True},
                {'position': 2, 'name': 'numero_factura', 'type': 'string', 'required': True},
                {'position': 3, 'name': 'fecha_expedicion', 'type': 'string', 'format': 'date',
                 'date_format': 'DD-MM-YYYY', 'required': True},
                {'position': 4, 'name': 'importe_total', 'type': 'number', 'precision': 2, 'required': True},
                {'position': 5, 'name': 'huella', 'format': 'hash', 'required': True}
            ]
        }
    
    # Sample invoice data
    invoice = {
        'nif_emisor': 'B12345678',
        'numero_factura': '2024/001234',
        'fecha_expedicion': date(2024, 12, 1),
        'importe_total': 1210.50
    }
    
    print("\nInvoice Data:")
    print(json.dumps({k: str(v) for k, v in invoice.items()}, indent=2))
    
    # Build payload
    result = build_payload(invoice, spec)
    
    print("\nGenerated Payload:")
    print(f"  Fields: {' | '.join(result['fields'])}")
    print(f"  Hash: {result['hash']}")
    print(f"  Full Payload: {result['payload']}")
    
    # Generate QR image
    output_path = Path(__file__).parent / 'output_qr.png'
    qr_config = spec.get('qr_config', {})
    image_path = generate_qr_image(result['payload'], output_path, qr_config)
    
    if image_path:
        print(f"\nQR Code image saved to: {image_path}")
    
    print("\n=== Done ===")
    
    return result


if __name__ == '__main__':
    main()
