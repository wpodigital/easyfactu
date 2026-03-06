"use strict";
/**
 * Hash Calculator for VeriFactu
 * Calculates the SHA-256 hash (Huella) for invoice chaining
 * Based on AEAT specifications for VeriFactu
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildCanonicalStringAlta = buildCanonicalStringAlta;
exports.buildCanonicalStringAnulacion = buildCanonicalStringAnulacion;
exports.calculateHuellaAlta = calculateHuellaAlta;
exports.calculateHuellaAnulacion = calculateHuellaAnulacion;
exports.verifyHuella = verifyHuella;
const crypto = __importStar(require("crypto"));
const utils_1 = require("./utils");
/**
 * Build canonical string for RegistroAlta (invoice registration)
 * According to VeriFactu specification
 */
function buildCanonicalStringAlta(registro) {
    const parts = [];
    // IDVersion
    parts.push(registro.IDVersion || '');
    // IDFactura
    parts.push(registro.IDFactura.IDEmisorFactura || '');
    parts.push(registro.IDFactura.NumSerieFactura || '');
    parts.push(registro.IDFactura.FechaExpedicionFactura || '');
    // TipoFactura
    parts.push(registro.TipoFactura || '');
    // CuotaTotal (formatted without trailing zeros)
    parts.push((0, utils_1.formatNumberForVeriFactu)(registro.CuotaTotal));
    // ImporteTotal (formatted without trailing zeros)
    parts.push((0, utils_1.formatNumberForVeriFactu)(registro.ImporteTotal));
    // Huella anterior (if not primer registro)
    if (registro.Encadenamiento.RegistroAnterior) {
        parts.push(registro.Encadenamiento.RegistroAnterior.Huella || '');
    }
    else {
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
function buildCanonicalStringAnulacion(registro) {
    const parts = [];
    // IDVersion
    parts.push(registro.IDVersion || '');
    // IDFactura (anulada)
    parts.push(registro.IDFactura.IDEmisorFacturaAnulada || '');
    parts.push(registro.IDFactura.NumSerieFacturaAnulada || '');
    parts.push(registro.IDFactura.FechaExpedicionFacturaAnulada || '');
    // Huella anterior (if not primer registro)
    if (registro.Encadenamiento.RegistroAnterior) {
        parts.push(registro.Encadenamiento.RegistroAnterior.Huella || '');
    }
    else {
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
function calculateHuellaAlta(registro) {
    const canonicalString = buildCanonicalStringAlta(registro);
    const hash = crypto.createHash('sha256');
    hash.update(canonicalString, 'utf8');
    return hash.digest('hex').toUpperCase();
}
/**
 * Calculate SHA-256 hash (Huella) for RegistroAnulacion
 */
function calculateHuellaAnulacion(registro) {
    const canonicalString = buildCanonicalStringAnulacion(registro);
    const hash = crypto.createHash('sha256');
    hash.update(canonicalString, 'utf8');
    return hash.digest('hex').toUpperCase();
}
/**
 * Verify that the hash matches the canonical string
 */
function verifyHuella(canonicalString, expectedHash) {
    const hash = crypto.createHash('sha256');
    hash.update(canonicalString, 'utf8');
    const calculated = hash.digest('hex').toUpperCase();
    return calculated === expectedHash.toUpperCase();
}
//# sourceMappingURL=hashCalculator.js.map