/**
 * PDF Service – generates an invoice PDF following the Spanish
 * format required by VeriFactu / AEAT, including the verification QR code.
 *
 * QR URL format (Resolución 1/2024 de la AEAT, Anexo IV):
 *   https://www2.agenciatributaria.gob.es/wlpl/TIKE-CONT/ValidarQR
 *   ?nif=<NIF>&numserie=<SERIE>&fecha=<DD-MM-YYYY>&importe=<IMPORTE>
 *
 * Test endpoint substitutes the hostname for the AEAT pre-production URL.
 */

import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';

export interface EmpresaConfig {
  nif: string;
  nombre: string;
  nombre_comercial?: string;
  direccion?: string;
  codigo_postal?: string;
  ciudad?: string;
  provincia?: string;
  pais?: string;
  telefono?: string;
  email?: string;
  web?: string;
  texto_pie?: string;
}

export interface FacturaData {
  id: number;
  num_serie_factura: string;
  fecha_expedicion_factura: string;
  id_emisor_factura: string;
  nombre_razon_emisor: string;
  tipo_factura: string;
  // PostgreSQL numeric columns are returned as strings by node-postgres,
  // so we accept both string and number here.
  importe_total?: number | string | null;
  cuota_total?: number | string | null;
  huella?: string;
  validation_csv?: string;
}

/**
 * Safely coerces a value to a JS number.
 * PostgreSQL `numeric`/`decimal` columns are returned as strings by node-postgres.
 * Returns 0 for null, undefined, or non-numeric values.
 */
function num(v: number | string | null | undefined): number {
  if (v === null || v === undefined) return 0;
  const n = Number(v);
  return isNaN(n) ? 0 : n;
}

/**
 * Builds the AEAT QR verification URL.
 * entorno: 'pruebas' uses the pre-production hostname; anything else → production.
 */
function buildQrUrl(factura: FacturaData, entorno: string): string {
  const host =
    entorno === 'pruebas'
      ? 'https://prewww2.aeat.es'
      : 'https://www2.agenciatributaria.gob.es';

  // fecha must be DD-MM-YYYY
  const rawFecha = factura.fecha_expedicion_factura;
  let fechaFmt = rawFecha;
  if (/^\d{4}-\d{2}-\d{2}$/.test(rawFecha)) {
    const [y, m, d] = rawFecha.split('-');
    fechaFmt = `${d}-${m}-${y}`;
  }

  const importe = num(factura.importe_total).toFixed(2);

  return (
    `${host}/wlpl/TIKE-CONT/ValidarQR` +
    `?nif=${encodeURIComponent(factura.id_emisor_factura)}` +
    `&numserie=${encodeURIComponent(factura.num_serie_factura)}` +
    `&fecha=${encodeURIComponent(fechaFmt)}` +
    `&importe=${encodeURIComponent(importe)}`
  );
}

/** Formats a number as euros (es-ES locale). */
function eur(value?: number): string {
  if (value === null || value === undefined) return '0,00 €';
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
}

/** Formats YYYY-MM-DD as DD/MM/YYYY. */
function fmtFecha(raw: string): string {
  if (!raw) return '';
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
    const [y, m, d] = raw.split('T')[0].split('-');
    return `${d}/${m}/${y}`;
  }
  return raw;
}

/**
 * Generates an invoice PDF and returns it as a Buffer.
 */
export async function generateInvoicePdf(
  empresa: EmpresaConfig,
  factura: FacturaData,
  entorno: string = 'pruebas',
): Promise<Buffer> {
  // Build QR PNG buffer
  const qrUrl = buildQrUrl(factura, entorno);
  const qrBase64 = (await QRCode.toDataURL(qrUrl, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 120,
  })).replace(/^data:image\/png;base64,/, '');
  const qrBuffer = Buffer.from(qrBase64, 'base64');

  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const W = doc.page.width - 80; // usable width
    const blue = '#1a5276';
    const darkGray = '#2c3e50';
    const lightGray = '#ecf0f1';

    // ── Header bar ──────────────────────────────────────────────────
    doc.rect(40, 40, W, 4).fill(blue);

    // Company name
    doc.font('Helvetica-Bold').fontSize(16).fillColor(blue)
      .text(empresa.nombre_comercial || empresa.nombre, 40, 55, { width: W - 130 });

    // FACTURA label (top-right)
    doc.font('Helvetica-Bold').fontSize(22).fillColor(blue)
      .text('FACTURA', W - 80, 50, { align: 'right', width: 120 });

    // Divider
    doc.rect(40, 90, W, 1).fill(lightGray);

    // ── Issuer block (left) ─────────────────────────────────────────
    const colRight = 320;
    let y = 100;

    doc.font('Helvetica-Bold').fontSize(9).fillColor(darkGray)
      .text('DATOS DEL EMISOR', 40, y);
    y += 14;

    doc.font('Helvetica').fontSize(9).fillColor('#34495e');
    if (empresa.nif)    { doc.text(`NIF: ${empresa.nif}`, 40, y); y += 12; }
    if (empresa.nombre) { doc.text(empresa.nombre, 40, y); y += 12; }
    if (empresa.direccion) { doc.text(empresa.direccion, 40, y); y += 12; }
    const locLine = [empresa.codigo_postal, empresa.ciudad, empresa.provincia].filter(Boolean).join(', ');
    if (locLine) { doc.text(locLine, 40, y); y += 12; }
    if (empresa.telefono) { doc.text(`Tel: ${empresa.telefono}`, 40, y); y += 12; }
    if (empresa.email) { doc.text(empresa.email, 40, y); y += 12; }

    // ── Invoice details block (right) ───────────────────────────────
    let yr = 100;
    const drawDetail = (label: string, value: string) => {
      doc.font('Helvetica-Bold').fontSize(9).fillColor(darkGray)
        .text(label, colRight, yr, { width: 80 });
      doc.font('Helvetica').fontSize(9).fillColor('#34495e')
        .text(value, colRight + 85, yr, { width: W - colRight - 85 });
      yr += 14;
    };

    drawDetail('Nº Factura:', factura.num_serie_factura);
    drawDetail('Fecha:', fmtFecha(factura.fecha_expedicion_factura));
    drawDetail('Tipo:', factura.tipo_factura);
    if (factura.validation_csv) drawDetail('CSV AEAT:', factura.validation_csv);

    // Environment badge
    const badgeColor = entorno === 'pruebas' ? '#e67e22' : '#27ae60';
    doc.rect(colRight, yr, 90, 14).fill(badgeColor);
    doc.font('Helvetica-Bold').fontSize(8).fillColor('white')
      .text(entorno === 'pruebas' ? 'ENTORNO PRUEBAS' : 'ENTORNO PRODUCCIÓN',
        colRight, yr + 3, { width: 90, align: 'center' });
    yr += 22;

    // ── Separator ──────────────────────────────────────────────────
    const sepY = Math.max(y, yr) + 10;
    doc.rect(40, sepY, W, 1).fill(lightGray);

    // ── Amounts table ──────────────────────────────────────────────
    const tableY = sepY + 14;

    doc.rect(40, tableY, W, 18).fill(blue);
    doc.font('Helvetica-Bold').fontSize(9).fillColor('white');
    const cols = [40, 200, 340, 440];
    ['Concepto', 'Base imponible', 'IVA', 'Total'].forEach((h, i) => {
      doc.text(h, cols[i] + 4, tableY + 5, { width: 120 });
    });

    const baseImponible = num(factura.importe_total) - num(factura.cuota_total);
    const rowY = tableY + 18;
    doc.rect(40, rowY, W, 20).fill('#f8f9fa');
    doc.font('Helvetica').fontSize(9).fillColor(darkGray);
    doc.text('Servicios / Productos', cols[0] + 4, rowY + 6, { width: 150 });
    doc.text(eur(baseImponible), cols[1] + 4, rowY + 6, { width: 120 });
    doc.text(eur(num(factura.cuota_total)), cols[2] + 4, rowY + 6, { width: 80 });
    doc.text(eur(num(factura.importe_total)), cols[3] + 4, rowY + 6, { width: 80 });

    const totalY = rowY + 20;
    doc.rect(40, totalY, W, 22).fill(blue);
    doc.font('Helvetica-Bold').fontSize(11).fillColor('white')
      .text('TOTAL FACTURA', cols[0] + 4, totalY + 6, { width: 350 });
    doc.text(eur(num(factura.importe_total)), cols[3] + 4, totalY + 6, { width: 80 });

    // ── QR code block ──────────────────────────────────────────────
    const qrY = totalY + 36;

    doc.font('Helvetica-Bold').fontSize(8).fillColor(blue)
      .text('Código de verificación AEAT (VeriFactu)', 40, qrY);

    doc.image(qrBuffer, 40, qrY + 12, { width: 90, height: 90 });

    doc.font('Helvetica').fontSize(7.5).fillColor('#555')
      .text(
        'Escanea el código QR con tu dispositivo móvil para verificar esta factura\nen el portal de la Agencia Tributaria.',
        140, qrY + 12, { width: W - 100 },
      );
    doc.font('Helvetica').fontSize(6.5).fillColor('#888')
      .text(qrUrl, 140, qrY + 46, { width: W - 100 });
    if (factura.huella) {
      doc.font('Helvetica').fontSize(6.5).fillColor('#999')
        .text(`Huella VeriFactu: ${factura.huella}`, 140, qrY + 58, { width: W - 100 });
    }

    // ── Footer ─────────────────────────────────────────────────────
    const footerY = doc.page.height - 55;
    doc.rect(40, footerY, W, 1).fill(lightGray);
    const footerText = empresa.texto_pie ||
      'Documento generado electrónicamente. Conforme al RD 1007/2023 (VeriFactu).';
    doc.font('Helvetica').fontSize(7.5).fillColor('#888')
      .text(footerText, 40, footerY + 6, { width: W, align: 'center' });
    if (empresa.web) {
      doc.font('Helvetica').fontSize(7.5).fillColor('#aaa')
        .text(empresa.web, 40, footerY + 18, { width: W, align: 'center' });
    }

    doc.end();
  });
}
