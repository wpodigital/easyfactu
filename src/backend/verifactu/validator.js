"use strict";
/**
 * Validator for VeriFactu
 * Validates XML and parses responses
 *
 * Note: XSD validation has been simplified due to security vulnerabilities in libxmljs2.
 * For production use, consider implementing server-side XSD validation or using a secure alternative.
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
exports.validateInputXml = validateInputXml;
exports.validateOutputXml = validateOutputXml;
exports.parseRespuestaXml = parseRespuestaXml;
exports.isValidationSuccessful = isValidationSuccessful;
exports.getErrorMessages = getErrorMessages;
const fast_xml_parser_1 = require("fast-xml-parser");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
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
function validateInputXml(xmlString) {
    try {
        // Basic XML syntax validation
        const validationResult = fast_xml_parser_1.XMLValidator.validate(xmlString, {
            allowBooleanAttributes: true,
        });
        if (validationResult === true) {
            return { valid: true, errors: [] };
        }
        else {
            return {
                valid: false,
                errors: [validationResult.err?.msg || 'XML validation error']
            };
        }
    }
    catch (err) {
        return { valid: false, errors: [err.message] };
    }
}
/**
 * Validate XML structure (basic validation without XSD)
 * For production use, implement proper XSD validation with a secure library
 */
function validateOutputXml(xmlString) {
    try {
        // Basic XML syntax validation
        const validationResult = fast_xml_parser_1.XMLValidator.validate(xmlString, {
            allowBooleanAttributes: true,
        });
        if (validationResult === true) {
            return { valid: true, errors: [] };
        }
        else {
            return {
                valid: false,
                errors: [validationResult.err?.msg || 'XML validation error']
            };
        }
    }
    catch (err) {
        return { valid: false, errors: [err.message] };
    }
}
/**
 * Parse AEAT response XML
 */
function parseRespuestaXml(xmlString) {
    try {
        const parser = new fast_xml_parser_1.XMLParser({
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
        const respuesta = {
            IDFactura: {
                IDEmisorFactura: idFactura.IDEmisorFactura || '',
                NumSerieFactura: idFactura.NumSerieFactura || '',
                FechaExpedicionFactura: idFactura.FechaExpedicionFactura || '',
            },
            Operacion: respuestaNode.Operacion || '',
            EstadoRegistro: respuestaNode.EstadoRegistro,
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
    }
    catch (err) {
        throw new Error(`Failed to parse response XML: ${err.message}`);
    }
}
/**
 * Check if validation was successful
 */
function isValidationSuccessful(respuesta) {
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
function getErrorMessages(respuesta) {
    const errors = [];
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
//# sourceMappingURL=validator.js.map