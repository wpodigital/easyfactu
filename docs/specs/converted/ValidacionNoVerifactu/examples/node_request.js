/**
 * Example Node.js script to send a validation request to the AEAT
 * No VERI*FACTU validation service.
 * 
 * Requirements:
 * - Node.js 14+
 * - npm install axios
 * - A valid client certificate (.p12 or .pem) recognized by AEAT
 * 
 * Usage:
 *   node node_request.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  // Test environment endpoint
  endpoint: 'https://prewww1.aeat.es/wlpl/TIKE-CONT/ws/SistemaFacturacion/ValRegistroNoVerifactu',
  
  // Client certificate configuration (required for production)
  // Uncomment and configure with your certificate paths
  // cert: fs.readFileSync('/path/to/client-cert.pem'),
  // key: fs.readFileSync('/path/to/client-key.pem'),
  // ca: fs.readFileSync('/path/to/ca-cert.pem'),
  // passphrase: 'your-cert-passphrase'
};

/**
 * Sample RegistroAlta XML for validation
 */
function buildRegistroAltaXML() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<sum1:RegistroAlta xmlns:sum1="https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/tike/cont/ws/SuministroInformacion.xsd">
  <sum1:IDVersion>1.0</sum1:IDVersion>
  <sum1:IDFactura>
    <sum1:IDEmisorFactura>89890001K</sum1:IDEmisorFactura>
    <sum1:NumSerieFactura>12345678-G66</sum1:NumSerieFactura>
    <sum1:FechaExpedicionFactura>03-02-2025</sum1:FechaExpedicionFactura>
  </sum1:IDFactura>
  <sum1:RefExterna>EXTERNA</sum1:RefExterna>
  <sum1:NombreRazonEmisor>certificado uno telematicas</sum1:NombreRazonEmisor>
  <sum1:Subsanacion>N</sum1:Subsanacion>
  <sum1:RechazoPrevio>N</sum1:RechazoPrevio>
  <sum1:TipoFactura>F1</sum1:TipoFactura>
  <sum1:DescripcionOperacion>Venta de productos</sum1:DescripcionOperacion>
  <sum1:Destinatarios>
    <sum1:IDDestinatario>
      <sum1:NombreRazon>certificado dos telematicas</sum1:NombreRazon>
      <sum1:NIF>89890002E</sum1:NIF>
    </sum1:IDDestinatario>
  </sum1:Destinatarios>
  <sum1:Desglose>
    <sum1:DetalleDesglose>
      <sum1:ClaveRegimen>01</sum1:ClaveRegimen>
      <sum1:CalificacionOperacion>S1</sum1:CalificacionOperacion>
      <sum1:TipoImpositivo>21</sum1:TipoImpositivo>
      <sum1:BaseImponibleOimporteNoSujeto>100</sum1:BaseImponibleOimporteNoSujeto>
      <sum1:CuotaRepercutida>21</sum1:CuotaRepercutida>
    </sum1:DetalleDesglose>
  </sum1:Desglose>
  <sum1:CuotaTotal>21</sum1:CuotaTotal>
  <sum1:ImporteTotal>121</sum1:ImporteTotal>
  <sum1:Encadenamiento>
    <sum1:PrimerRegistro>S</sum1:PrimerRegistro>
  </sum1:Encadenamiento>
  <sum1:SistemaInformatico>
    <sum1:NombreRazon>CERTIFICADO UNO TELEMATICAS</sum1:NombreRazon>
    <sum1:NIF>89890001K</sum1:NIF>
    <sum1:NombreSistemaInformatico>NombreSistemaInformatico</sum1:NombreSistemaInformatico>
    <sum1:IdSistemaInformatico>77</sum1:IdSistemaInformatico>
    <sum1:Version>1.0.03</sum1:Version>
    <sum1:NumeroInstalacion>383</sum1:NumeroInstalacion>
    <sum1:TipoUsoPosibleSoloVerifactu>S</sum1:TipoUsoPosibleSoloVerifactu>
    <sum1:TipoUsoPosibleMultiOT>N</sum1:TipoUsoPosibleMultiOT>
    <sum1:IndicadorMultiplesOT>N</sum1:IndicadorMultiplesOT>
  </sum1:SistemaInformatico>
  <sum1:FechaHoraHusoGenRegistro>2025-02-03T14:30:00+01:00</sum1:FechaHoraHusoGenRegistro>
  <sum1:TipoHuella>01</sum1:TipoHuella>
  <sum1:Huella>FF954378B64ED331A9B2366AD317D86E9DEC1716B12DD0ACCB172A6DC4C105AA</sum1:Huella>
</sum1:RegistroAlta>`;
}

/**
 * Send validation request to AEAT
 * @param {string} xmlContent - XML content to validate
 * @returns {Promise<string>} - Response XML
 */
async function sendValidationRequest(xmlContent) {
  return new Promise((resolve, reject) => {
    const url = new URL(config.endpoint);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Content-Length': Buffer.byteLength(xmlContent, 'utf8')
      },
      // Uncomment for production with client certificate
      // cert: config.cert,
      // key: config.key,
      // ca: config.ca,
      // passphrase: config.passphrase,
      rejectUnauthorized: true
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`Response Status: ${res.statusCode}`);
        console.log('Response Headers:', res.headers);
        resolve(data);
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(xmlContent);
    req.end();
  });
}

/**
 * Parse response and extract validation result
 * @param {string} responseXml - Response XML from AEAT
 */
function parseResponse(responseXml) {
  console.log('\n--- Response XML ---');
  console.log(responseXml);
  
  // Simple regex-based parsing (for production, use a proper XML parser)
  const estadoMatch = responseXml.match(/<tikR:EstadoRegistro>(.*?)<\/tikR:EstadoRegistro>/);
  const codigoMatch = responseXml.match(/<tikR:CodigoErrorRegistro>(.*?)<\/tikR:CodigoErrorRegistro>/);
  const descripcionMatch = responseXml.match(/<tikR:DescripcionErrorRegistro>(.*?)<\/tikR:DescripcionErrorRegistro>/s);
  const errorFormatoMatch = responseXml.match(/<tikR:DescripcionErrorFormatoXML>(.*?)<\/tikR:DescripcionErrorFormatoXML>/);
  
  console.log('\n--- Parsed Result ---');
  
  if (errorFormatoMatch) {
    console.log('ERROR DE FORMATO XML:', errorFormatoMatch[1]);
    return { success: false, error: errorFormatoMatch[1] };
  }
  
  if (estadoMatch) {
    const estado = estadoMatch[1];
    console.log('Estado:', estado);
    
    if (codigoMatch) {
      console.log('Código Error:', codigoMatch[1]);
    }
    if (descripcionMatch) {
      console.log('Descripción Error:', descripcionMatch[1]);
    }
    
    return {
      success: estado === 'Correcto' || estado === 'AceptadoConErrores',
      estado,
      codigoError: codigoMatch ? codigoMatch[1] : null,
      descripcionError: descripcionMatch ? descripcionMatch[1] : null
    };
  }
  
  return { success: false, error: 'Could not parse response' };
}

/**
 * Main execution
 */
async function main() {
  console.log('=== AEAT No VERI*FACTU Validation Service ===\n');
  console.log('Endpoint:', config.endpoint);
  console.log('\n--- Request XML ---');
  
  const xmlContent = buildRegistroAltaXML();
  console.log(xmlContent.substring(0, 500) + '...\n');
  
  try {
    console.log('Sending validation request...');
    const response = await sendValidationRequest(xmlContent);
    const result = parseResponse(response);
    
    console.log('\n--- Final Result ---');
    console.log('Success:', result.success);
    
    return result;
  } catch (error) {
    console.error('Error sending request:', error.message);
    console.log('\nNote: This example requires a valid client certificate for AEAT.');
    console.log('For testing without a certificate, use the web client at:');
    console.log('https://preportal.aeat.es/PRE-Exteriores/Inicio/_menu_/VERI_FACTU___Sistemas_Informaticos_de_Facturacion/VERI_FACTU___Sistemas_Informaticos_de_Facturacion.html');
    return { success: false, error: error.message };
  }
}

// Export for testing
module.exports = { buildRegistroAltaXML, sendValidationRequest, parseResponse };

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}
