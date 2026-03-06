import fs from 'fs';
import path from 'path';
import { InvoiceDeclarationResult } from './types';
import { XMLParser, XMLValidator } from 'fast-xml-parser';

const xsdPath = path.join(__dirname, '..', '..', '..', 'docs', 'schema', 'EsquemaConsultaDeclaraciones.xsd');
const hasSchema = fs.existsSync(xsdPath);

if (!hasSchema) {
  console.warn('AEAT XSD not found:', xsdPath);
}

export function validateXmlAgainstXsd(xmlString: string): { valid: boolean; errors: string[] } {
  try {
    // Basic XML syntax validation
    const validationResult = XMLValidator.validate(xmlString, {
      allowBooleanAttributes: true,
    });
    
    if (validationResult === true) {
      return { valid: true, errors: [] };
    } else {
      return { 
        valid: false, 
        errors: [validationResult.err?.msg || 'XML validation error']
      };
    }
  } catch (err) {
    return { valid: false, errors: [(err as Error).message] };
  }
}

export function parseInvoiceDeclarationXml(xmlString: string): InvoiceDeclarationResult[] {
  try {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      textNodeName: '#text',
      parseTagValue: true,
      parseAttributeValue: true,
      trimValues: true,
    });
    
    const result = parser.parse(xmlString);
    const root = result.servicioConsultasDirectas;
    
    if (!root) return [];
    
    const results: InvoiceDeclarationResult[] = [];
    const respuestas = Array.isArray(root.respuestaCorrecta) 
      ? root.respuestaCorrecta 
      : root.respuestaCorrecta ? [root.respuestaCorrecta] : [];
    
    respuestas.forEach((node: any) => {
      const item: InvoiceDeclarationResult = {
        ejercicio: node.ejercicio?.toString() || '',
        modelo: node.modelo?.toString() || '',
        periodo: node.periodo?.toString() || '',
        nif: node.nif?.toString() || '',
        csv: node.csv?.toString() || '',
        expediente: node.expediente?.toString() || '',
        justificante: node.justificante?.toString() || '',
        fechaYHoraPresentacion: node.fechaYHoraPresentacion?.toString() || '',
      };
      if (node.just_anterior) {
        item.just_anterior = node.just_anterior.toString();
      }
      results.push(item);
    });
    
    return results;
  } catch (err) {
    console.error('Error parsing XML:', err);
    return [];
  }
}
