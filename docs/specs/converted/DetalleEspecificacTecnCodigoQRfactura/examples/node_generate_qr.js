/**
 * Veri-Factu QR Code Generator - Node.js Example
 * 
 * This script demonstrates how to generate a QR code payload and image
 * for a Veri-Factu invoice based on the specification in qr_spec.json.
 * 
 * Usage:
 *   npm install qrcode
 *   node node_generate_qr.js
 * 
 * @version 0.4.7
 * @see ../qr_spec.json for field definitions
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Optional: Install 'qrcode' package for QR image generation
// npm install qrcode
let QRCode;
try {
    QRCode = require('qrcode');
} catch (e) {
    console.log('Note: QRCode package not installed. Only payload will be generated.');
    console.log('Run "npm install qrcode" to enable QR image generation.\n');
}

/**
 * Load the QR specification from the JSON file
 */
function loadSpec() {
    const specPath = path.join(__dirname, '..', 'qr_spec.json');
    const specContent = fs.readFileSync(specPath, 'utf-8');
    return JSON.parse(specContent);
}

/**
 * Normalize a string value according to the specification
 * - Trim whitespace
 * - Apply Unicode NFC normalization
 * @param {string} value - The value to normalize
 * @returns {string} - Normalized value
 */
function normalizeValue(value) {
    if (typeof value !== 'string') {
        return String(value);
    }
    return value.trim().normalize('NFC');
}

/**
 * Format a number with the specified precision
 * @param {number} value - The numeric value
 * @param {number} precision - Decimal places (default: 2)
 * @returns {string} - Formatted number string
 */
function formatAmount(value, precision = 2) {
    return value.toFixed(precision);
}

/**
 * Format a date according to the specification
 * @param {Date|string} date - The date to format
 * @param {string} format - Date format (DD-MM-YYYY or YYYY-MM-DD)
 * @returns {string} - Formatted date string
 */
function formatDate(date, format = 'DD-MM-YYYY') {
    const d = date instanceof Date ? date : new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    
    if (format === 'YYYY-MM-DD') {
        return `${year}-${month}-${day}`;
    }
    return `${day}-${month}-${year}`;
}

/**
 * Compute the SHA-256 hash of the payload
 * @param {string} payload - The payload to hash
 * @param {string} encoding - Output encoding: 'base64', 'base64url', or 'hex'
 * @returns {string} - Encoded hash
 */
function computeHash(payload, encoding = 'base64') {
    const hash = crypto.createHash('sha256').update(payload, 'utf-8');
    
    if (encoding === 'base64url') {
        return hash.digest('base64url');
    } else if (encoding === 'hex') {
        return hash.digest('hex');
    }
    return hash.digest('base64');
}

/**
 * Build the QR code payload from invoice data
 * @param {Object} invoice - Invoice data
 * @param {Object} spec - QR specification
 * @returns {Object} - Payload and hash
 */
function buildPayload(invoice, spec) {
    const separator = spec.encoding.separator || '|';
    const fields = [];
    
    // Build payload from ordered fields
    for (const field of spec.fields) {
        const value = invoice[field.name];
        
        if (field.required && (value === undefined || value === null)) {
            throw new Error(`Required field missing: ${field.name}`);
        }
        
        if (value === undefined || value === null) {
            continue;
        }
        
        let formattedValue;
        
        if (field.type === 'number') {
            formattedValue = formatAmount(value, field.precision || 2);
        } else if (field.format === 'date') {
            formattedValue = formatDate(value, field.date_format || 'DD-MM-YYYY');
        } else if (field.format === 'hash') {
            // Hash is computed later
            continue;
        } else {
            formattedValue = normalizeValue(value);
        }
        
        fields.push(formattedValue);
    }
    
    // Build payload without hash
    const payloadWithoutHash = fields.join(separator);
    
    // Compute hash
    const hashEncoding = spec.hash.encoding || 'base64';
    const hash = computeHash(payloadWithoutHash, hashEncoding);
    
    // Final payload with hash
    const finalPayload = payloadWithoutHash + separator + hash;
    
    return {
        payload: finalPayload,
        payloadWithoutHash,
        hash,
        fields
    };
}

/**
 * Generate QR code image from payload
 * @param {string} payload - QR code payload
 * @param {string} outputPath - Output file path
 * @param {Object} options - QR code options
 */
async function generateQRImage(payload, outputPath, options = {}) {
    if (!QRCode) {
        console.log('QRCode package not installed. Skipping image generation.');
        return null;
    }
    
    const qrOptions = {
        errorCorrectionLevel: options.errorCorrection || 'M',
        type: 'png',
        width: options.width || 200,
        margin: options.quietZone || 4
    };
    
    await QRCode.toFile(outputPath, payload, qrOptions);
    return outputPath;
}

/**
 * Main example function
 */
async function main() {
    console.log('=== Veri-Factu QR Code Generator (Node.js) ===\n');
    
    // Load specification
    let spec;
    try {
        spec = loadSpec();
        console.log(`Loaded specification version: ${spec.version}`);
    } catch (e) {
        console.error('Error loading specification:', e.message);
        console.log('Using default specification...');
        spec = {
            version: '0.4.7',
            encoding: { separator: '|', normalization: 'NFC' },
            hash: { algorithm: 'SHA-256', encoding: 'base64' },
            fields: [
                { position: 1, name: 'nif_emisor', type: 'string', required: true },
                { position: 2, name: 'numero_factura', type: 'string', required: true },
                { position: 3, name: 'fecha_expedicion', type: 'string', format: 'date', date_format: 'DD-MM-YYYY', required: true },
                { position: 4, name: 'importe_total', type: 'number', precision: 2, required: true },
                { position: 5, name: 'huella', format: 'hash', required: true }
            ]
        };
    }
    
    // Sample invoice data
    const invoice = {
        nif_emisor: 'B12345678',
        numero_factura: '2024/001234',
        fecha_expedicion: new Date('2024-12-01'),
        importe_total: 1210.50
    };
    
    console.log('\nInvoice Data:');
    console.log(JSON.stringify(invoice, null, 2));
    
    // Build payload
    const result = buildPayload(invoice, spec);
    
    console.log('\nGenerated Payload:');
    console.log(`  Fields: ${result.fields.join(' | ')}`);
    console.log(`  Hash: ${result.hash}`);
    console.log(`  Full Payload: ${result.payload}`);
    
    // Generate QR image (if qrcode package is installed)
    const outputPath = path.join(__dirname, 'output_qr.png');
    const imagePath = await generateQRImage(result.payload, outputPath, spec.qr_config);
    
    if (imagePath) {
        console.log(`\nQR Code image saved to: ${imagePath}`);
    }
    
    console.log('\n=== Done ===');
    
    return result;
}

// Run if executed directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = {
    loadSpec,
    normalizeValue,
    formatAmount,
    formatDate,
    computeHash,
    buildPayload,
    generateQRImage
};
