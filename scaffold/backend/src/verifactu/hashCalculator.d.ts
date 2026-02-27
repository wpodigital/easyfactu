/**
 * Hash Calculator for VeriFactu
 * Calculates the SHA-256 hash (Huella) for invoice chaining
 * Based on AEAT specifications for VeriFactu
 */
import { RegistroFacturacionAltaType, RegistroFacturacionAnulacionType } from './types';
/**
 * Build canonical string for RegistroAlta (invoice registration)
 * According to VeriFactu specification
 */
export declare function buildCanonicalStringAlta(registro: RegistroFacturacionAltaType): string;
/**
 * Build canonical string for RegistroAnulacion (invoice cancellation)
 * According to VeriFactu specification
 */
export declare function buildCanonicalStringAnulacion(registro: RegistroFacturacionAnulacionType): string;
/**
 * Calculate SHA-256 hash (Huella) for RegistroAlta
 */
export declare function calculateHuellaAlta(registro: RegistroFacturacionAltaType): string;
/**
 * Calculate SHA-256 hash (Huella) for RegistroAnulacion
 */
export declare function calculateHuellaAnulacion(registro: RegistroFacturacionAnulacionType): string;
/**
 * Verify that the hash matches the canonical string
 */
export declare function verifyHuella(canonicalString: string, expectedHash: string): boolean;
//# sourceMappingURL=hashCalculator.d.ts.map