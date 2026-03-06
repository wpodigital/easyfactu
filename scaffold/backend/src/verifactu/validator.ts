/**
 * Validator for VeriFactu
 * Validates XML and parses responses
 * 
 * Note: XSD validation has been simplified due to security vulnerabilities in libxmljs2.
 * For production use, consider implementing server-side XSD validation or using a secure alternative.
 */

import { XMLParser, XMLValidator } from 'fast-xml-parser';
import * as fs from 'fs';
import * as path from 'path';
import {
  RespuestaValContenidoFactuSistemaFacturacionType,
  RespuestaRegType,
  EstadoRegistroType,
} from './types';

// XSD schemas are available for reference but not actively validated due to security concerns
const xsdBasePath = path.join(__dirname, '..', '..', '..', 'docs');
const xsdInputPath = path.join(xsdBasePath, 'SuministroInformacion.xsd');
const xsdOutputPath = path.join(xsdBasePath, 'RespuestaValRegistNoVeriFactu.xsd');

// Check if XSD files exist
const hasInputXsd = fs.existsSync(xsdInputPath);
const hasOutputXsd = fs.existsSync(xsdOutputPath);

if (!hasInputXsd || !hasOutputXsd) {
  console.warn('VeriFactu XSD schemas not found. XML structure validation will be basic.');
}

/**
 * Validate XML structure (basic validation without XSD)
 * For production use, implement proper XSD validation with a secure library
 */
export function validateInputXml(xmlString: string): { valid: boolean; errors: string[] } {
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

/**
 * Validate XML structure (basic validation without XSD)
 * For production use, implement proper XSD validation with a secure library
 */
export function validateOutputXml(xmlString: string): { valid: boolean; errors: string[] } {
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

/**
 * Parse AEAT response XML
 */
export function parseRespuestaXml(xmlString: string): RespuestaValContenidoFactuSistemaFacturacionType {
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
    
    // Navigate the parsed structure
    const root = result['RespuestaValContenidoFactuSistemaFacturacion'] || 
                 result['sfR:RespuestaValContenidoFactuSistemaFacturacion'] ||
                 result;
    
    // Check for XML format error
    if (root.DescripcionErrorFormatoXML) {
      return {
        DescripcionErrorFormatoXML: root.DescripcionErrorFormatoXML,
      };
    }
    
    // Parse RespuestaValidacion
    const respuestaNode = root.RespuestaValidacion;
    if (!respuestaNode) {
      throw new Error('Invalid response format: RespuestaValidacion not found');
    }
    
    const idFactura = respuestaNode.IDFactura || {};
    
    const respuesta: RespuestaRegType = {
      IDFactura: {
        IDEmisorFactura: idFactura.IDEmisorFactura || '',
        NumSerieFactura: idFactura.NumSerieFactura || '',
        FechaExpedicionFactura: idFactura.FechaExpedicionFactura || '',
      },
      Operacion: respuestaNode.Operacion || '',
      EstadoRegistro: respuestaNode.EstadoRegistro as EstadoRegistroType,
    };
    
    if (respuestaNode.RefExterna) {
      respuesta.RefExterna = respuestaNode.RefExterna;
    }
    
    if (respuestaNode.CodigoErrorRegistro) {
      respuesta.CodigoErrorRegistro = respuestaNode.CodigoErrorRegistro;
    }
    
    if (respuestaNode.DescripcionErrorRegistro) {
      respuesta.DescripcionErrorRegistro = respuestaNode.DescripcionErrorRegistro;
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
