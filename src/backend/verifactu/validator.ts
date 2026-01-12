/**
 * Validator for VeriFactu
 * Validates XML against XSD schema and parses responses
 */

import * as libxmljs from 'libxmljs2';
import * as fs from 'fs';
import * as path from 'path';
import {
  RespuestaValContenidoFactuSistemaFacturacionType,
  RespuestaRegType,
  EstadoRegistroType,
} from './types';

// Load XSD schemas
const xsdBasePath = path.join(__dirname, '..', '..', '..', 'docs');
let schemaInput: libxmljs.Document | null = null;
let schemaOutput: libxmljs.Document | null = null;

try {
  const xsdInputPath = path.join(xsdBasePath, 'SuministroInformacion.xsd');
  const xsdOutputPath = path.join(xsdBasePath, 'RespuestaValRegistNoVeriFactu.xsd');
  
  if (fs.existsSync(xsdInputPath)) {
    const xsdContent = fs.readFileSync(xsdInputPath, 'utf8');
    schemaInput = libxmljs.parseXml(xsdContent);
  }
  
  if (fs.existsSync(xsdOutputPath)) {
    const xsdContent = fs.readFileSync(xsdOutputPath, 'utf8');
    schemaOutput = libxmljs.parseXml(xsdContent);
  }
} catch (err) {
  console.warn('VeriFactu XSD schemas not loaded:', (err as Error).message);
}

/**
 * Validate XML against input schema (SuministroInformacion.xsd)
 */
export function validateInputXml(xmlString: string): { valid: boolean; errors: string[] } {
  if (!schemaInput) {
    return { valid: false, errors: ['Input XSD schema not loaded'] };
  }
  
  try {
    const xmlDoc = libxmljs.parseXml(xmlString);
    const valid = xmlDoc.validate(schemaInput);
    const errors = (xmlDoc.validationErrors || []).map(e => e.message?.trim() || e.toString());
    return { valid: !!valid, errors };
  } catch (err) {
    return { valid: false, errors: [(err as Error).message] };
  }
}

/**
 * Validate XML against output schema (RespuestaValRegistNoVeriFactu.xsd)
 */
export function validateOutputXml(xmlString: string): { valid: boolean; errors: string[] } {
  if (!schemaOutput) {
    return { valid: false, errors: ['Output XSD schema not loaded'] };
  }
  
  try {
    const xmlDoc = libxmljs.parseXml(xmlString);
    const valid = xmlDoc.validate(schemaOutput);
    const errors = (xmlDoc.validationErrors || []).map(e => e.message?.trim() || e.toString());
    return { valid: !!valid, errors };
  } catch (err) {
    return { valid: false, errors: [(err as Error).message] };
  }
}

/**
 * Parse AEAT response XML
 */
export function parseRespuestaXml(xmlString: string): RespuestaValContenidoFactuSistemaFacturacionType {
  try {
    const xmlDoc = libxmljs.parseXml(xmlString);
    
    // Check for XML format error
    const errorNode = xmlDoc.get('//*[local-name()="DescripcionErrorFormatoXML"]');
    if (errorNode) {
      return {
        DescripcionErrorFormatoXML: errorNode.text().trim(),
      };
    }
    
    // Parse RespuestaValidacion
    const respuestaNode = xmlDoc.get('//*[local-name()="RespuestaValidacion"]');
    if (!respuestaNode) {
      throw new Error('Invalid response format: RespuestaValidacion not found');
    }
    
    const getText = (node: any, name: string): string => {
      const el = node.get(`.//*[local-name()="${name}"]`);
      return el ? el.text().trim() : '';
    };
    
    const idFacturaNode = respuestaNode.get('.//*[local-name()="IDFactura"]');
    if (!idFacturaNode) {
      throw new Error('Invalid response format: IDFactura not found');
    }
    
    const respuesta: RespuestaRegType = {
      IDFactura: {
        IDEmisorFactura: getText(idFacturaNode, 'IDEmisorFactura'),
        NumSerieFactura: getText(idFacturaNode, 'NumSerieFactura'),
        FechaExpedicionFactura: getText(idFacturaNode, 'FechaExpedicionFactura'),
      },
      Operacion: getText(respuestaNode, 'Operacion') as any,
      EstadoRegistro: getText(respuestaNode, 'EstadoRegistro') as EstadoRegistroType,
    };
    
    const refExterna = getText(respuestaNode, 'RefExterna');
    if (refExterna) {
      respuesta.RefExterna = refExterna;
    }
    
    const codigoError = getText(respuestaNode, 'CodigoErrorRegistro');
    if (codigoError) {
      respuesta.CodigoErrorRegistro = codigoError;
    }
    
    const descripcionError = getText(respuestaNode, 'DescripcionErrorRegistro');
    if (descripcionError) {
      respuesta.DescripcionErrorRegistro = descripcionError;
    }
    
    return {
      RespuestaValidacion: respuesta,
    };
  } catch (err) {
    throw new Error(`Failed to parse response XML: ${(err as Error).message}`);
  }
}

/**
 * Check if validation was successful
 */
export function isValidationSuccessful(respuesta: RespuestaValContenidoFactuSistemaFacturacionType): boolean {
  if (respuesta.DescripcionErrorFormatoXML) {
    return false;
  }
  
  if (respuesta.RespuestaValidacion) {
    const estado = respuesta.RespuestaValidacion.EstadoRegistro;
    return estado === 'Correcto' || estado === 'AceptadoConErrores';
  }
  
  return false;
}

/**
 * Get error messages from response
 */
export function getErrorMessages(respuesta: RespuestaValContenidoFactuSistemaFacturacionType): string[] {
  const errors: string[] = [];
  
  if (respuesta.DescripcionErrorFormatoXML) {
    errors.push(`XML Format Error: ${respuesta.DescripcionErrorFormatoXML}`);
  }
  
  if (respuesta.RespuestaValidacion) {
    const val = respuesta.RespuestaValidacion;
    if (val.CodigoErrorRegistro) {
      errors.push(`Error ${val.CodigoErrorRegistro}: ${val.DescripcionErrorRegistro || 'No description'}`);
    }
  }
  
  return errors;
}
