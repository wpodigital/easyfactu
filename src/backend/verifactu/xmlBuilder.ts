/**
 * XML Builder for VeriFactu
 * Generates XML messages for RegistroAlta and RegistroAnulacion
 */

import {
  RegistroFacturacionAltaType,
  RegistroFacturacionAnulacionType,
  PersonaFisicaJuridicaType,
  SistemaInformaticoType,
  DesgloseType,
  DesgloseTipoOperacionType,
  DetalleDesgloseType,
  DetalleNoSujetaType,
  OperacionType,
} from './types';

const NAMESPACE_SF = 'https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/tike/cont/ws/SuministroInformacion.xsd';

/**
 * Format a number for XML, removing trailing zeros after decimal point
 */
function formatNumber(value: number | undefined): string | undefined {
  if (value === undefined || value === null) return undefined;
  // Format with 2 decimal places, then remove trailing zeros
  const formatted = value.toFixed(2);
  return formatted.replace(/\.?0+$/, '');
}

/**
 * Build XML element with optional namespace
 */
function buildElement(name: string, value: string | undefined, indent: number = 0): string {
  if (value === undefined || value === null) return '';
  const spaces = '  '.repeat(indent);
  return `${spaces}<${name}>${escapeXml(value)}</${name}>\n`;
}

/**
 * Escape XML special characters
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Build PersonaFisicaJuridicaType XML
 */
function buildPersona(persona: PersonaFisicaJuridicaType, indent: number = 0): string {
  const spaces = '  '.repeat(indent);
  let xml = '';
  xml += buildElement('NombreRazon', persona.NombreRazon, indent);
  
  if (persona.NIF) {
    xml += buildElement('NIF', persona.NIF, indent);
  } else if (persona.IDOtro) {
    xml += `${spaces}<IDOtro>\n`;
    xml += buildElement('CodigoPais', persona.IDOtro.CodigoPais, indent + 1);
    xml += buildElement('IDType', persona.IDOtro.IDType, indent + 1);
    xml += buildElement('ID', persona.IDOtro.ID, indent + 1);
    xml += `${spaces}</IDOtro>\n`;
  }
  
  return xml;
}

/**
 * Build SistemaInformaticoType XML
 */
function buildSistemaInformatico(sistema: SistemaInformaticoType, indent: number = 0): string {
  const spaces = '  '.repeat(indent);
  let xml = `${spaces}<SistemaInformatico>\n`;
  xml += buildElement('NombreRazon', sistema.NombreRazon, indent + 1);
  
  if (sistema.NIF) {
    xml += buildElement('NIF', sistema.NIF, indent + 1);
  } else if (sistema.IDOtro) {
    xml += `${spaces}  <IDOtro>\n`;
    xml += buildElement('CodigoPais', sistema.IDOtro.CodigoPais, indent + 2);
    xml += buildElement('IDType', sistema.IDOtro.IDType, indent + 2);
    xml += buildElement('ID', sistema.IDOtro.ID, indent + 2);
    xml += `${spaces}  </IDOtro>\n`;
  }
  
  xml += buildElement('NombreSistemaInformatico', sistema.NombreSistemaInformatico, indent + 1);
  xml += buildElement('IdSistemaInformatico', sistema.IdSistemaInformatico, indent + 1);
  xml += buildElement('Version', sistema.Version, indent + 1);
  xml += buildElement('NumeroInstalacion', sistema.NumeroInstalacion, indent + 1);
  xml += buildElement('TipoUsoPosibleSoloVerifactu', sistema.TipoUsoPosibleSoloVerifactu, indent + 1);
  xml += buildElement('TipoUsoPosibleMultiOT', sistema.TipoUsoPosibleMultiOT, indent + 1);
  xml += buildElement('IndicadorMultiplesOT', sistema.IndicadorMultiplesOT, indent + 1);
  xml += `${spaces}</SistemaInformatico>\n`;
  
  return xml;
}

/**
 * Build Desglose (tax breakdown) XML
 */
function buildDesglose(desglose: DesgloseType, indent: number = 0): string {
  const spaces = '  '.repeat(indent);
  let xml = `${spaces}<Desglose>\n`;
  
  for (const tipoOp of desglose.DesgloseTipoOperacion) {
    xml += `${spaces}  <DesgloseTipoOperacion>\n`;
    xml += buildElement('TipoOperacion', tipoOp.TipoOperacion, indent + 2);
    
    if (tipoOp.Sujeta) {
      xml += `${spaces}    <Sujeta>\n`;
      if (tipoOp.Sujeta.Exenta) {
        xml += `${spaces}      <Exenta>\n`;
        xml += buildElement('CausaExencion', tipoOp.Sujeta.Exenta.CausaExencion, indent + 4);
        xml += buildElement('BaseImponible', formatNumber(tipoOp.Sujeta.Exenta.BaseImponible), indent + 4);
        xml += `${spaces}      </Exenta>\n`;
      }
      if (tipoOp.Sujeta.NoExenta) {
        xml += `${spaces}      <NoExenta>\n`;
        xml += buildElement('TipoNoExenta', tipoOp.Sujeta.NoExenta.TipoNoExenta, indent + 4);
        for (const iva of tipoOp.Sujeta.NoExenta.DesgloseIVA) {
          xml += `${spaces}        <DesgloseIVA>\n`;
          xml += buildElement('BaseImponible', formatNumber(iva.BaseImponible), indent + 5);
          if (iva.TipoImpositivo !== undefined) {
            xml += buildElement('TipoImpositivo', formatNumber(iva.TipoImpositivo), indent + 5);
          }
          if (iva.CuotaImpuesto !== undefined) {
            xml += buildElement('CuotaImpuesto', formatNumber(iva.CuotaImpuesto), indent + 5);
          }
          if (iva.TipoRecargoEquivalencia !== undefined) {
            xml += buildElement('TipoRecargoEquivalencia', formatNumber(iva.TipoRecargoEquivalencia), indent + 5);
          }
          if (iva.CuotaRecargoEquivalencia !== undefined) {
            xml += buildElement('CuotaRecargoEquivalencia', formatNumber(iva.CuotaRecargoEquivalencia), indent + 5);
          }
          xml += `${spaces}        </DesgloseIVA>\n`;
        }
        xml += `${spaces}      </NoExenta>\n`;
      }
      xml += `${spaces}    </Sujeta>\n`;
    }
    
    if (tipoOp.NoSujeta) {
      xml += `${spaces}    <NoSujeta>\n`;
      xml += buildElement('TipoNoSujeta', tipoOp.NoSujeta.TipoNoSujeta, indent + 3);
      xml += buildElement('Importe', formatNumber(tipoOp.NoSujeta.Importe), indent + 3);
      xml += `${spaces}    </NoSujeta>\n`;
    }
    
    if (tipoOp.NoSujetaPorReglas) {
      xml += `${spaces}    <NoSujetaPorReglas>\n`;
      xml += buildElement('TipoNoSujeta', tipoOp.NoSujetaPorReglas.TipoNoSujeta, indent + 3);
      xml += buildElement('Importe', formatNumber(tipoOp.NoSujetaPorReglas.Importe), indent + 3);
      xml += `${spaces}    </NoSujetaPorReglas>\n`;
    }
    
    xml += `${spaces}  </DesgloseTipoOperacion>\n`;
  }
  
  xml += `${spaces}</Desglose>\n`;
  return xml;
}

/**
 * Build RegistroAlta (invoice registration) XML
 */
export function buildRegistroAltaXml(registro: RegistroFacturacionAltaType): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += `<sf:RegistroAlta xmlns:sf="${NAMESPACE_SF}">\n`;
  
  xml += buildElement('IDVersion', registro.IDVersion, 1);
  
  // IDFactura
  xml += '  <IDFactura>\n';
  xml += buildElement('IDEmisorFactura', registro.IDFactura.IDEmisorFactura, 2);
  xml += buildElement('NumSerieFactura', registro.IDFactura.NumSerieFactura, 2);
  xml += buildElement('FechaExpedicionFactura', registro.IDFactura.FechaExpedicionFactura, 2);
  xml += '  </IDFactura>\n';
  
  if (registro.RefExterna) {
    xml += buildElement('RefExterna', registro.RefExterna, 1);
  }
  
  xml += buildElement('NombreRazonEmisor', registro.NombreRazonEmisor, 1);
  
  if (registro.Subsanacion) {
    xml += buildElement('Subsanacion', registro.Subsanacion, 1);
  }
  if (registro.RechazoPrevio) {
    xml += buildElement('RechazoPrevio', registro.RechazoPrevio, 1);
  }
  
  xml += buildElement('TipoFactura', registro.TipoFactura, 1);
  
  if (registro.TipoRectificativa) {
    xml += buildElement('TipoRectificativa', registro.TipoRectificativa, 1);
  }
  
  if (registro.FacturasRectificadas && registro.FacturasRectificadas.IDFacturaRectificada.length > 0) {
    xml += '  <FacturasRectificadas>\n';
    for (const factura of registro.FacturasRectificadas.IDFacturaRectificada) {
      xml += '    <IDFacturaRectificada>\n';
      xml += buildElement('IDEmisorFactura', factura.IDEmisorFactura, 3);
      xml += buildElement('NumSerieFactura', factura.NumSerieFactura, 3);
      xml += buildElement('FechaExpedicionFactura', factura.FechaExpedicionFactura, 3);
      xml += '    </IDFacturaRectificada>\n';
    }
    xml += '  </FacturasRectificadas>\n';
  }
  
  if (registro.FacturasSustituidas && registro.FacturasSustituidas.IDFacturaSustituida.length > 0) {
    xml += '  <FacturasSustituidas>\n';
    for (const factura of registro.FacturasSustituidas.IDFacturaSustituida) {
      xml += '    <IDFacturaSustituida>\n';
      xml += buildElement('IDEmisorFactura', factura.IDEmisorFactura, 3);
      xml += buildElement('NumSerieFactura', factura.NumSerieFactura, 3);
      xml += buildElement('FechaExpedicionFactura', factura.FechaExpedicionFactura, 3);
      xml += '    </IDFacturaSustituida>\n';
    }
    xml += '  </FacturasSustituidas>\n';
  }
  
  if (registro.ImporteRectificacion) {
    xml += '  <ImporteRectificacion>\n';
    if (registro.ImporteRectificacion.BaseRectificada !== undefined) {
      xml += buildElement('BaseRectificada', formatNumber(registro.ImporteRectificacion.BaseRectificada), 2);
    }
    if (registro.ImporteRectificacion.CuotaRectificada !== undefined) {
      xml += buildElement('CuotaRectificada', formatNumber(registro.ImporteRectificacion.CuotaRectificada), 2);
    }
    if (registro.ImporteRectificacion.CuotaRecargoRectificado !== undefined) {
      xml += buildElement('CuotaRecargoRectificado', formatNumber(registro.ImporteRectificacion.CuotaRecargoRectificado), 2);
    }
    xml += '  </ImporteRectificacion>\n';
  }
  
  if (registro.FechaOperacion) {
    xml += buildElement('FechaOperacion', registro.FechaOperacion, 1);
  }
  
  xml += buildElement('DescripcionOperacion', registro.DescripcionOperacion, 1);
  
  if (registro.FacturaSimplificadaArt7273) {
    xml += buildElement('FacturaSimplificadaArt7273', registro.FacturaSimplificadaArt7273, 1);
  }
  if (registro.FacturaSinIdentifDestinatarioArt61d) {
    xml += buildElement('FacturaSinIdentifDestinatarioArt61d', registro.FacturaSinIdentifDestinatarioArt61d, 1);
  }
  if (registro.Macrodato) {
    xml += buildElement('Macrodato', registro.Macrodato, 1);
  }
  if (registro.EmitidaPorTerceroODestinatario) {
    xml += buildElement('EmitidaPorTerceroODestinatario', registro.EmitidaPorTerceroODestinatario, 1);
  }
  
  if (registro.Tercero) {
    xml += '  <Tercero>\n';
    xml += buildPersona(registro.Tercero, 2);
    xml += '  </Tercero>\n';
  }
  
  if (registro.Destinatarios && registro.Destinatarios.IDDestinatario.length > 0) {
    xml += '  <Destinatarios>\n';
    for (const dest of registro.Destinatarios.IDDestinatario) {
      xml += '    <IDDestinatario>\n';
      xml += buildPersona(dest, 3);
      xml += '    </IDDestinatario>\n';
    }
    xml += '  </Destinatarios>\n';
  }
  
  if (registro.Cupon) {
    xml += buildElement('Cupon', registro.Cupon, 1);
  }
  
  xml += buildDesglose(registro.Desglose, 1);
  
  xml += buildElement('CuotaTotal', formatNumber(registro.CuotaTotal), 1);
  xml += buildElement('ImporteTotal', formatNumber(registro.ImporteTotal), 1);
  
  // Encadenamiento
  xml += '  <Encadenamiento>\n';
  if (registro.Encadenamiento.PrimerRegistro) {
    xml += buildElement('PrimerRegistro', registro.Encadenamiento.PrimerRegistro, 2);
  } else if (registro.Encadenamiento.RegistroAnterior) {
    xml += '    <RegistroAnterior>\n';
    xml += buildElement('IDEmisorFactura', registro.Encadenamiento.RegistroAnterior.IDEmisorFactura, 3);
    xml += buildElement('NumSerieFactura', registro.Encadenamiento.RegistroAnterior.NumSerieFactura, 3);
    xml += buildElement('FechaExpedicionFactura', registro.Encadenamiento.RegistroAnterior.FechaExpedicionFactura, 3);
    xml += buildElement('Huella', registro.Encadenamiento.RegistroAnterior.Huella, 3);
    xml += '    </RegistroAnterior>\n';
  }
  xml += '  </Encadenamiento>\n';
  
  xml += buildSistemaInformatico(registro.SistemaInformatico, 1);
  
  xml += buildElement('FechaHoraHusoGenRegistro', registro.FechaHoraHusoGenRegistro, 1);
  
  if (registro.NumRegistroAcuerdoFacturacion) {
    xml += buildElement('NumRegistroAcuerdoFacturacion', registro.NumRegistroAcuerdoFacturacion, 1);
  }
  if (registro.IdAcuerdoSistemaInformatico) {
    xml += buildElement('IdAcuerdoSistemaInformatico', registro.IdAcuerdoSistemaInformatico, 1);
  }
  
  xml += buildElement('TipoHuella', registro.TipoHuella, 1);
  xml += buildElement('Huella', registro.Huella, 1);
  
  xml += '</sf:RegistroAlta>\n';
  
  return xml;
}

/**
 * Build RegistroAnulacion (invoice cancellation) XML
 */
export function buildRegistroAnulacionXml(registro: RegistroFacturacionAnulacionType): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += `<sf:RegistroAnulacion xmlns:sf="${NAMESPACE_SF}">\n`;
  
  xml += buildElement('IDVersion', registro.IDVersion, 1);
  
  // IDFactura (for anulacion, uses IDFacturaExpedidaBajaType)
  xml += '  <IDFactura>\n';
  xml += buildElement('IDEmisorFacturaAnulada', registro.IDFactura.IDEmisorFacturaAnulada, 2);
  xml += buildElement('NumSerieFacturaAnulada', registro.IDFactura.NumSerieFacturaAnulada, 2);
  xml += buildElement('FechaExpedicionFacturaAnulada', registro.IDFactura.FechaExpedicionFacturaAnulada, 2);
  xml += '  </IDFactura>\n';
  
  if (registro.RefExterna) {
    xml += buildElement('RefExterna', registro.RefExterna, 1);
  }
  
  if (registro.SinRegistroPrevio) {
    xml += buildElement('SinRegistroPrevio', registro.SinRegistroPrevio, 1);
  }
  if (registro.RechazoPrevio) {
    xml += buildElement('RechazoPrevio', registro.RechazoPrevio, 1);
  }
  
  if (registro.GeneradoPor) {
    xml += buildElement('GeneradoPor', registro.GeneradoPor, 1);
  }
  
  if (registro.Generador) {
    xml += '  <Generador>\n';
    xml += buildPersona(registro.Generador, 2);
    xml += '  </Generador>\n';
  }
  
  // Encadenamiento
  xml += '  <Encadenamiento>\n';
  if (registro.Encadenamiento.PrimerRegistro) {
    xml += buildElement('PrimerRegistro', registro.Encadenamiento.PrimerRegistro, 2);
  } else if (registro.Encadenamiento.RegistroAnterior) {
    xml += '    <RegistroAnterior>\n';
    xml += buildElement('IDEmisorFactura', registro.Encadenamiento.RegistroAnterior.IDEmisorFactura, 3);
    xml += buildElement('NumSerieFactura', registro.Encadenamiento.RegistroAnterior.NumSerieFactura, 3);
    xml += buildElement('FechaExpedicionFactura', registro.Encadenamiento.RegistroAnterior.FechaExpedicionFactura, 3);
    xml += buildElement('Huella', registro.Encadenamiento.RegistroAnterior.Huella, 3);
    xml += '    </RegistroAnterior>\n';
  }
  xml += '  </Encadenamiento>\n';
  
  xml += buildSistemaInformatico(registro.SistemaInformatico, 1);
  
  xml += buildElement('FechaHoraHusoGenRegistro', registro.FechaHoraHusoGenRegistro, 1);
  
  xml += buildElement('TipoHuella', registro.TipoHuella, 1);
  xml += buildElement('Huella', registro.Huella, 1);
  
  xml += '</sf:RegistroAnulacion>\n';
  
  return xml;
}
