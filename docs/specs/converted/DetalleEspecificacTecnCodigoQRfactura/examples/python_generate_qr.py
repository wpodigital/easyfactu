# Example Python script to generate QR content and image for invoice QR
# Requires: pip install qrcode[pil]
import hashlib
import base64
import qrcode

def normalize_field(value):
    if value is None:
        return ''
    return str(value).strip()

def build_cleartext(fields):
    parts = [
        normalize_field(fields.get('version')) ,
        normalize_field(fields.get('emitter_nif')),
        normalize_field(fields.get('invoice_number')),
        normalize_field(fields.get('issue_date')),
        normalize_field(fields.get('total_amount')),
        normalize_field(fields.get('currency'))
    ]
    return '|'.join(parts)

def calc_hash(cleartext):
    h = hashlib.sha256(cleartext.encode('utf-8')).digest()
    return base64.b64encode(h).decode('ascii')

def generate_qr(fields, output_file):
    cleartext = build_cleartext(fields)
    h = calc_hash(cleartext)
    payload = f"{fields['version']}|{fields['emitter_nif']}|{fields['invoice_number']}|{fields['issue_date']}|{fields['total_amount']}|{fields['currency']}|{h}"
    print('QR payload:', payload)
    img = qrcode.make(payload)
    img.save(output_file)

if __name__ == '__main__':
    example = {
        'version': '0.4.7',
        'emitter_nif': 'B12345678',
        'invoice_number': 'FAC-2025-0001',
        'issue_date': '2025-11-30',
        'total_amount': '1234.56',
        'currency': 'EUR'
    }
    generate_qr(example, 'invoice_qr.png')