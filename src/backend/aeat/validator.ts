import fs from 'fs';
import path from 'path';
import { InvoiceDeclarationResult } from './types';
import libxmljs from 'libxmljs2';

const xsdPath = path.join(__dirname, '..', '..', '..', 'docs', 'schema', 'EsquemaConsultaDeclaraciones.xsd');
let schema: libxmljs.Document | null = null;
try {
  const xsdContent = fs.readFileSync(xsdPath, 'utf8');
  schema = libxmljs.parseXml(xsdContent);
} catch (err) {
  // schema may not be available at runtime in all environments; caller should handle errors
  console.warn('AEAT XSD not found or could not be parsed:', (err as Error).message);
}

export function validateXmlAgainstXsd(xmlString: string): { valid: boolean; errors: string[] } {
  if (!schema) return { valid: false, errors: ['XSD schema not loaded'] };
  try {
    const xmlDoc = libxmljs.parseXml(xmlString);
    const valid = xmlDoc.validate(schema);
    const errors = (xmlDoc.validationErrors || []).map((e: { message: string }) => e.message.trim());
    return { valid: !!valid, errors };
  } catch (err) {
    return { valid: false, errors: [(err as Error).message] };
  }
}

export function parseInvoiceDeclarationXml(xmlString: string): InvoiceDeclarationResult[] {
  const xmlDoc = libxmljs.parseXml(xmlString);
  const root = xmlDoc.get('//servicioConsultasDirectas') as libxmljs.Element | null;
  if (!root) return [];
  const results: InvoiceDeclarationResult[] = [];
  const respuestas = (root as libxmljs.Element).find('.//respuestaCorrecta');
  respuestas.forEach((node: libxmljs.Node) => {
    const el = node as libxmljs.Element;
    const getText = (name: string) => {
      const child = el.get(name) as libxmljs.Element | null;
      return child ? child.text().trim() : '';
    };
    const item: InvoiceDeclarationResult = {
      ejercicio: getText('ejercicio'),
      modelo: getText('modelo'),
      periodo: getText('periodo'),
      nif: getText('nif'),
      csv: getText('csv'),
      expediente: getText('expediente'),
      justificante: getText('justificante'),
      fechaYHoraPresentacion: getText('fechaYHoraPresentacion'),
    };
    const justAnterior = getText('just_anterior');
    if (justAnterior) item.just_anterior = justAnterior;
    results.push(item);
  });
  return results;
}
