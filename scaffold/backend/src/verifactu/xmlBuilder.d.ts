/**
 * XML Builder for VeriFactu
 * Generates XML messages for RegistroAlta and RegistroAnulacion
 */
import { RegistroFacturacionAltaType, RegistroFacturacionAnulacionType } from './types';
/**
 * Build RegistroAlta (invoice registration) XML
 */
export declare function buildRegistroAltaXml(registro: RegistroFacturacionAltaType): string;
/**
 * Build RegistroAnulacion (invoice cancellation) XML
 */
export declare function buildRegistroAnulacionXml(registro: RegistroFacturacionAnulacionType): string;
//# sourceMappingURL=xmlBuilder.d.ts.map