/**
 * Hash Calculator for VeriFactu
 * Calculates the SHA-256 hash (Huella) for invoice chaining
 * Based on AEAT specifications for VeriFactu
 */

import * as crypto from 'crypto';
import {
  RegistroFacturacionAltaType,
  RegistroFacturacionAnulacionType,
} from './types';
import { formatNumberForVeriFactu } from './utils';

/**
 * Build canonical string for RegistroAlta (invoice registration)
 * According to VeriFactu specification
 */
export function buildCanonicalStringAlta(registro: RegistroFacturacionAltaType): string {
  const parts: string[] = [];
  
  // IDVersion
  parts.push(registro.IDVersion || '');
  
  // IDFactura
  parts.push(registro.IDFactura.IDEmisorFactura || '');
  parts.push(registro.IDFactura.NumSerieFactura || '');
  parts.push(registro.IDFactura.FechaExpedicionFactura || '');
  
  // TipoFactura
  parts.push(registro.TipoFactura || '');
  
  // CuotaTotal (formatted without trailing zeros)
  parts.push(formatNumberForVeriFactu(registro.CuotaTotal));
  
  // ImporteTotal (formatted without trailing zeros)
  parts.push(formatNumberForVeriFactu(registro.ImporteTotal));
  
  // Huella anterior (if not primer registro)
  if (registro.Encadenamiento.RegistroAnterior) {
    parts.push(registro.Encadenamiento.RegistroAnterior.Huella || '');
  } else {
    parts.push(''); // Empty string for primer registro
  }
  
  // FechaHoraHusoGenRegistro
  parts.push(registro.FechaHoraHusoGenRegistro || '');
  
  // Join with empty string (no separator)
  return parts.join('');
}

/**
 * Build canonical string for RegistroAnulacion (invoice cancellation)
 * According to VeriFactu specification
 */
export function buildCanonicalStringAnulacion(registro: RegistroFacturacionAnulacionType): string {
  const parts: string[] = [];
  
  // IDVersion
  parts.push(registro.IDVersion || '');
  
  // IDFactura (anulada)
  parts.push(registro.IDFactura.IDEmisorFacturaAnulada || '');
  parts.push(registro.IDFactura.NumSerieFacturaAnulada || '');
  parts.push(registro.IDFactura.FechaExpedicionFacturaAnulada || '');
  
  // Huella anterior (if not primer registro)
  if (registro.Encadenamiento.RegistroAnterior) {
    parts.push(registro.Encadenamiento.RegistroAnterior.Huella || '');
  } else {
    parts.push(''); // Empty string for primer registro
  }
  
  // FechaHoraHusoGenRegistro
  parts.push(registro.FechaHoraHusoGenRegistro || '');
  
  // Join with empty string (no separator)
  return parts.join('');
}

/**
 * Calculate SHA-256 hash (Huella) for RegistroAlta
 */
export function calculateHuellaAlta(registro: RegistroFacturacionAltaType): string {
  const canonicalString = buildCanonicalStringAlta(registro);
  const hash = crypto.createHash('sha256');
  hash.update(canonicalString, 'utf8');
  return hash.digest('hex').toUpperCase();
}

/**
 * Calculate SHA-256 hash (Huella) for RegistroAnulacion
 */
export function calculateHuellaAnulacion(registro: RegistroFacturacionAnulacionType): string {
  const canonicalString = buildCanonicalStringAnulacion(registro);
  const hash = crypto.createHash('sha256');
  hash.update(canonicalString, 'utf8');
  return hash.digest('hex').toUpperCase();
}

/**
 * Verify that the hash matches the canonical string
 */
export function verifyHuella(canonicalString: string, expectedHash: string): boolean {
  const hash = crypto.createHash('sha256');
  hash.update(canonicalString, 'utf8');
  const calculated = hash.digest('hex').toUpperCase();
  return calculated === expectedHash.toUpperCase();
}
