// Example Node.js script to generate QR content and image for invoice QR
// Requires: npm install qrcode
const crypto = require('crypto');
const QRCode = require('qrcode');

function normalizeField(value) {
  if (value === null || value === undefined) return '';
  // Trim and NFC normalize
  return String(value).trim();
}

function buildCleartext(fields) {
  // Order: version|emitter_nif|invoice_number|issue_date|total_amount|currency
  const parts = [
    normalizeField(fields.version),
    normalizeField(fields.emitter_nif),
    normalizeField(fields.invoice_number),
    normalizeField(fields.issue_date),
    normalizeField(fields.total_amount),
    normalizeField(fields.currency)
  ];
  return parts.join('|');
}

function calcHash(cleartext) {
  const h = crypto.createHash('sha256').update(cleartext, 'utf8').digest('base64');
  return h; // base64 representation
}

async function generateQr(fields, outputFile) {
  const cleartext = buildCleartext(fields);
  const hash = calcHash(cleartext);
  const payload = `${fields.version}|${fields.emitter_nif}|${fields.invoice_number}|${fields.issue_date}|${fields.total_amount}|${fields.currency}|${hash}`;
  console.log('QR payload:', payload);
  await QRCode.toFile(outputFile, payload, { type: 'png', width: 300 });
  console.log('Saved QR to', outputFile);
}

// Example usage
const example = {
  version: '0.4.7',
  emitter_nif: 'B12345678',
  invoice_number: 'FAC-2025-0001',
  issue_date: '2025-11-30',
  total_amount: '1234.56',
  currency: 'EUR'
};
generateQr(example, 'invoice_qr.png').catch(console.error);