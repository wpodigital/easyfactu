/**
 * Validator for VeriFactu
 * Validates XML and parses responses
 *
 * Note: XSD validation has been simplified due to security vulnerabilities in libxmljs2.
 * For production use, consider implementing server-side XSD validation or using a secure alternative.
 */
import { RespuestaValContenidoFactuSistemaFacturacionType } from './types';
/**
 * Validate XML structure (basic validation without XSD)
 * For production use, implement proper XSD validation with a secure library
 */
export declare function validateInputXml(xmlString: string): {
    valid: boolean;
    errors: string[];
};
/**
 * Validate XML structure (basic validation without XSD)
 * For production use, implement proper XSD validation with a secure library
 */
export declare function validateOutputXml(xmlString: string): {
    valid: boolean;
    errors: string[];
};
/**
 * Parse AEAT response XML
 */
export declare function parseRespuestaXml(xmlString: string): RespuestaValContenidoFactuSistemaFacturacionType;
/**
 * Check if validation was successful
 */
export declare function isValidationSuccessful(respuesta: RespuestaValContenidoFactuSistemaFacturacionType): boolean;
/**
 * Get error messages from response
 */
export declare function getErrorMessages(respuesta: RespuestaValContenidoFactuSistemaFacturacionType): string[];
//# sourceMappingURL=validator.d.ts.map