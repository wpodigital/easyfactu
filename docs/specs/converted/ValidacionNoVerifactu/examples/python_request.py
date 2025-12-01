#!/usr/bin/env python3
"""
Example Python script to send a validation request to the AEAT
No VERI*FACTU validation service.

Requirements:
    pip install requests

Usage:
    python python_request.py

Note: Production use requires a valid client certificate (.p12 or .pem) 
recognized by AEAT.
"""

import requests
import xml.etree.ElementTree as ET
from dataclasses import dataclass
from typing import Optional
import ssl

# Configuration
ENDPOINT = "https://prewww1.aeat.es/wlpl/TIKE-CONT/ws/SistemaFacturacion/ValRegistroNoVerifactu"

# Client certificate configuration (required for production)
# Uncomment and configure with your certificate paths
# CERT = ('/path/to/client-cert.pem', '/path/to/client-key.pem')
# CA_BUNDLE = '/path/to/ca-bundle.pem'


def build_registro_alta_xml() -> str:
    """
    Build a sample RegistroAlta XML for validation.
    
    Returns:
        str: XML string for RegistroAlta
    """
    return '''<?xml version="1.0" encoding="UTF-8"?>
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
</sum1:RegistroAlta>'''


def build_registro_anulacion_xml() -> str:
    """
    Build a sample RegistroAnulacion XML for validation.
    
    Returns:
        str: XML string for RegistroAnulacion
    """
    return '''<?xml version="1.0" encoding="UTF-8"?>
<sum1:RegistroAnulacion xmlns:sum1="https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/tike/cont/ws/SuministroInformacion.xsd">
  <sum1:IDVersion>1.0</sum1:IDVersion>
  <sum1:IDFactura>
    <sum1:IDEmisorFacturaAnulada>89890001K</sum1:IDEmisorFacturaAnulada>
    <sum1:NumSerieFacturaAnulada>12345678-G66</sum1:NumSerieFacturaAnulada>
    <sum1:FechaExpedicionFacturaAnulada>03-02-2025</sum1:FechaExpedicionFacturaAnulada>
  </sum1:IDFactura>
  <sum1:RefExterna>EXTERNA</sum1:RefExterna>
  <sum1:SinRegistroPrevio>N</sum1:SinRegistroPrevio>
  <sum1:RechazoPrevio>N</sum1:RechazoPrevio>
  <sum1:Encadenamiento>
    <sum1:RegistroAnterior>
      <sum1:IDEmisorFactura>89890001K</sum1:IDEmisorFactura>
      <sum1:NumSerieFactura>12345677-G33</sum1:NumSerieFactura>
      <sum1:FechaExpedicionFactura>15-04-2024</sum1:FechaExpedicionFactura>
      <sum1:Huella>C9AF4AF1EF5EBBA700350DE3EEF12C2D355C56AC56F13DB2A25E0031BD2B7ED5</sum1:Huella>
    </sum1:RegistroAnterior>
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
  <sum1:Huella>193F36663544CDB85A5D40D1A5EB3CFB8C2E2C3EE860999EA9AB9BD45E624CB1</sum1:Huella>
</sum1:RegistroAnulacion>'''


@dataclass
class ValidationResult:
    """Result of validation request."""
    success: bool
    estado: Optional[str] = None
    codigo_error: Optional[str] = None
    descripcion_error: Optional[str] = None
    error_formato: Optional[str] = None
    raw_response: Optional[str] = None


def send_validation_request(xml_content: str, cert: tuple = None) -> str:
    """
    Send validation request to AEAT.
    
    Args:
        xml_content: XML content to validate
        cert: Optional tuple of (cert_path, key_path) for client certificate
    
    Returns:
        str: Response XML from AEAT
    """
    headers = {
        'Content-Type': 'application/xml; charset=utf-8'
    }
    
    response = requests.post(
        ENDPOINT,
        data=xml_content.encode('utf-8'),
        headers=headers,
        cert=cert,
        verify=True,
        timeout=30
    )
    
    response.raise_for_status()
    return response.text


def parse_response(response_xml: str) -> ValidationResult:
    """
    Parse response XML and extract validation result.
    
    Args:
        response_xml: Response XML from AEAT
    
    Returns:
        ValidationResult: Parsed validation result
    """
    # Define namespaces
    namespaces = {
        'tikR': 'https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/tike/cont/ws/RespuestaValRegistNoVeriFactu.xsd',
        'tik': 'https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/tike/cont/ws/SuministroInformacion.xsd'
    }
    
    try:
        root = ET.fromstring(response_xml)
        
        # Check for format error
        error_formato = root.find('.//tikR:DescripcionErrorFormatoXML', namespaces)
        if error_formato is not None:
            return ValidationResult(
                success=False,
                error_formato=error_formato.text,
                raw_response=response_xml
            )
        
        # Parse validation response
        estado_elem = root.find('.//tikR:EstadoRegistro', namespaces)
        codigo_elem = root.find('.//tikR:CodigoErrorRegistro', namespaces)
        descripcion_elem = root.find('.//tikR:DescripcionErrorRegistro', namespaces)
        
        if estado_elem is not None:
            estado = estado_elem.text
            return ValidationResult(
                success=estado in ('Correcto', 'AceptadoConErrores'),
                estado=estado,
                codigo_error=codigo_elem.text if codigo_elem is not None else None,
                descripcion_error=descripcion_elem.text if descripcion_elem is not None else None,
                raw_response=response_xml
            )
        
        return ValidationResult(
            success=False,
            error_formato="Could not parse response",
            raw_response=response_xml
        )
        
    except ET.ParseError as e:
        return ValidationResult(
            success=False,
            error_formato=f"XML Parse Error: {e}",
            raw_response=response_xml
        )


def main():
    """Main execution."""
    print("=== AEAT No VERI*FACTU Validation Service ===\n")
    print(f"Endpoint: {ENDPOINT}\n")
    
    # Build sample XML
    xml_content = build_registro_alta_xml()
    print("--- Request XML (first 500 chars) ---")
    print(xml_content[:500] + "...\n")
    
    try:
        print("Sending validation request...")
        response = send_validation_request(xml_content)
        
        print("\n--- Response XML ---")
        print(response)
        
        result = parse_response(response)
        
        print("\n--- Parsed Result ---")
        print(f"Success: {result.success}")
        print(f"Estado: {result.estado}")
        if result.codigo_error:
            print(f"Código Error: {result.codigo_error}")
        if result.descripcion_error:
            print(f"Descripción Error: {result.descripcion_error}")
        if result.error_formato:
            print(f"Error Formato: {result.error_formato}")
        
        return result
        
    except requests.exceptions.SSLError as e:
        print(f"\nSSL Error: {e}")
        print("\nNote: This example requires a valid client certificate for AEAT.")
        print("For testing without a certificate, use the web client at:")
        print("https://preportal.aeat.es/PRE-Exteriores/Inicio/_menu_/VERI_FACTU___Sistemas_Informaticos_de_Facturacion/VERI_FACTU___Sistemas_Informaticos_de_Facturacion.html")
        return ValidationResult(success=False, error_formato=str(e))
    except requests.exceptions.RequestException as e:
        print(f"\nRequest Error: {e}")
        return ValidationResult(success=False, error_formato=str(e))


if __name__ == "__main__":
    main()
