import {
  buildRegistroAltaXml,
  buildRegistroAnulacionXml,
  RegistroFacturacionAltaType,
  RegistroFacturacionAnulacionType,
} from '../../src/backend/verifactu';

describe('VeriFactu XML Builder', () => {
  describe('buildRegistroAltaXml', () => {
    it('should generate valid XML for a simple invoice', () => {
      const registro: RegistroFacturacionAltaType = {
        IDVersion: '1.0',
        IDFactura: {
          IDEmisorFactura: 'B12345678',
          NumSerieFactura: 'FAC-2024-001',
          FechaExpedicionFactura: '2024-01-15',
        },
        NombreRazonEmisor: 'Test Company SL',
        TipoFactura: 'F1',
        DescripcionOperacion: 'Sale of goods',
        Desglose: {
          DesgloseTipoOperacion: [
            {
              TipoOperacion: 'E',
              Sujeta: {
                NoExenta: {
                  TipoNoExenta: 'S1',
                  DesgloseIVA: [
                    {
                      BaseImponible: 100.00,
                      TipoImpositivo: 21.00,
                      CuotaImpuesto: 21.00,
                    },
                  ],
                },
              },
            },
          ],
        },
        CuotaTotal: 21.00,
        ImporteTotal: 121.00,
        Encadenamiento: {
          PrimerRegistro: 'S',
        },
        SistemaInformatico: {
          NombreRazon: 'Software Company',
          NIF: 'A87654321',
          NombreSistemaInformatico: 'EasyFactu',
          IdSistemaInformatico: '01',
          Version: '1.0.0',
          NumeroInstalacion: 'INSTALL-001',
          TipoUsoPosibleSoloVerifactu: 'S',
          TipoUsoPosibleMultiOT: 'N',
          IndicadorMultiplesOT: 'N',
        },
        FechaHoraHusoGenRegistro: '2024-01-15T10:30:00+01:00',
        TipoHuella: '01',
        Huella: 'ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890',
      };

      const xml = buildRegistroAltaXml(registro);

      // Check XML structure
      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(xml).toContain('<sf:RegistroAlta');
      expect(xml).toContain('<IDVersion>1.0</IDVersion>');
      expect(xml).toContain('<IDEmisorFactura>B12345678</IDEmisorFactura>');
      expect(xml).toContain('<NumSerieFactura>FAC-2024-001</NumSerieFactura>');
      expect(xml).toContain('<FechaExpedicionFactura>2024-01-15</FechaExpedicionFactura>');
      expect(xml).toContain('<TipoFactura>F1</TipoFactura>');
      expect(xml).toContain('<BaseImponible>100</BaseImponible>');
      expect(xml).toContain('<TipoImpositivo>21</TipoImpositivo>');
      expect(xml).toContain('<CuotaImpuesto>21</CuotaImpuesto>');
      expect(xml).toContain('<CuotaTotal>21</CuotaTotal>');
      expect(xml).toContain('<ImporteTotal>121</ImporteTotal>');
      expect(xml).toContain('<PrimerRegistro>S</PrimerRegistro>');
      expect(xml).toContain('</sf:RegistroAlta>');
    });

    it('should handle decimal values correctly (remove trailing zeros)', () => {
      const registro: RegistroFacturacionAltaType = {
        IDVersion: '1.0',
        IDFactura: {
          IDEmisorFactura: 'B12345678',
          NumSerieFactura: 'FAC-2024-002',
          FechaExpedicionFactura: '2024-01-16',
        },
        NombreRazonEmisor: 'Test Company SL',
        TipoFactura: 'F1',
        DescripcionOperacion: 'Sale of goods',
        Desglose: {
          DesgloseTipoOperacion: [
            {
              TipoOperacion: 'E',
              Sujeta: {
                NoExenta: {
                  TipoNoExenta: 'S1',
                  DesgloseIVA: [
                    {
                      BaseImponible: 150.50,
                      TipoImpositivo: 21.00,
                      CuotaImpuesto: 31.61,
                    },
                  ],
                },
              },
            },
          ],
        },
        CuotaTotal: 31.61,
        ImporteTotal: 182.11,
        Encadenamiento: {
          PrimerRegistro: 'S',
        },
        SistemaInformatico: {
          NombreRazon: 'Software Company',
          NIF: 'A87654321',
          NombreSistemaInformatico: 'EasyFactu',
          IdSistemaInformatico: '01',
          Version: '1.0.0',
          NumeroInstalacion: 'INSTALL-001',
          TipoUsoPosibleSoloVerifactu: 'S',
          TipoUsoPosibleMultiOT: 'N',
          IndicadorMultiplesOT: 'N',
        },
        FechaHoraHusoGenRegistro: '2024-01-16T10:30:00+01:00',
        TipoHuella: '01',
        Huella: 'ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890',
      };

      const xml = buildRegistroAltaXml(registro);

      // Check that trailing zeros are removed
      expect(xml).toContain('<BaseImponible>150.5</BaseImponible>');
      expect(xml).toContain('<TipoImpositivo>21</TipoImpositivo>'); // 21.00 -> 21
      expect(xml).toContain('<CuotaTotal>31.61</CuotaTotal>');
    });

    it('should include Destinatarios when provided', () => {
      const registro: RegistroFacturacionAltaType = {
        IDVersion: '1.0',
        IDFactura: {
          IDEmisorFactura: 'B12345678',
          NumSerieFactura: 'FAC-2024-003',
          FechaExpedicionFactura: '2024-01-17',
        },
        NombreRazonEmisor: 'Test Company SL',
        TipoFactura: 'F1',
        DescripcionOperacion: 'Sale of goods',
        Destinatarios: {
          IDDestinatario: [
            {
              NombreRazon: 'Customer Company SL',
              NIF: 'C11111111',
            },
          ],
        },
        Desglose: {
          DesgloseTipoOperacion: [
            {
              TipoOperacion: 'E',
              Sujeta: {
                NoExenta: {
                  TipoNoExenta: 'S1',
                  DesgloseIVA: [
                    {
                      BaseImponible: 100.00,
                      TipoImpositivo: 21.00,
                      CuotaImpuesto: 21.00,
                    },
                  ],
                },
              },
            },
          ],
        },
        CuotaTotal: 21.00,
        ImporteTotal: 121.00,
        Encadenamiento: {
          PrimerRegistro: 'S',
        },
        SistemaInformatico: {
          NombreRazon: 'Software Company',
          NIF: 'A87654321',
          NombreSistemaInformatico: 'EasyFactu',
          IdSistemaInformatico: '01',
          Version: '1.0.0',
          NumeroInstalacion: 'INSTALL-001',
          TipoUsoPosibleSoloVerifactu: 'S',
          TipoUsoPosibleMultiOT: 'N',
          IndicadorMultiplesOT: 'N',
        },
        FechaHoraHusoGenRegistro: '2024-01-17T10:30:00+01:00',
        TipoHuella: '01',
        Huella: 'ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890',
      };

      const xml = buildRegistroAltaXml(registro);

      expect(xml).toContain('<Destinatarios>');
      expect(xml).toContain('<IDDestinatario>');
      expect(xml).toContain('<NombreRazon>Customer Company SL</NombreRazon>');
      expect(xml).toContain('<NIF>C11111111</NIF>');
    });
  });

  describe('buildRegistroAnulacionXml', () => {
    it('should generate valid XML for invoice cancellation', () => {
      const registro: RegistroFacturacionAnulacionType = {
        IDVersion: '1.0',
        IDFactura: {
          IDEmisorFacturaAnulada: 'B12345678',
          NumSerieFacturaAnulada: 'FAC-2024-001',
          FechaExpedicionFacturaAnulada: '2024-01-15',
        },
        Encadenamiento: {
          RegistroAnterior: {
            IDEmisorFactura: 'B12345678',
            NumSerieFactura: 'FAC-2024-001',
            FechaExpedicionFactura: '2024-01-15',
            Huella: 'PREVIOUS_HASH_1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF',
          },
        },
        SistemaInformatico: {
          NombreRazon: 'Software Company',
          NIF: 'A87654321',
          NombreSistemaInformatico: 'EasyFactu',
          IdSistemaInformatico: '01',
          Version: '1.0.0',
          NumeroInstalacion: 'INSTALL-001',
          TipoUsoPosibleSoloVerifactu: 'S',
          TipoUsoPosibleMultiOT: 'N',
          IndicadorMultiplesOT: 'N',
        },
        FechaHoraHusoGenRegistro: '2024-01-20T10:30:00+01:00',
        TipoHuella: '01',
        Huella: 'ANULACION_HASH_1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF',
      };

      const xml = buildRegistroAnulacionXml(registro);

      // Check XML structure
      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(xml).toContain('<sf:RegistroAnulacion');
      expect(xml).toContain('<IDVersion>1.0</IDVersion>');
      expect(xml).toContain('<IDEmisorFacturaAnulada>B12345678</IDEmisorFacturaAnulada>');
      expect(xml).toContain('<NumSerieFacturaAnulada>FAC-2024-001</NumSerieFacturaAnulada>');
      expect(xml).toContain('<FechaExpedicionFacturaAnulada>2024-01-15</FechaExpedicionFacturaAnulada>');
      expect(xml).toContain('<RegistroAnterior>');
      expect(xml).toContain('<Huella>PREVIOUS_HASH_1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF</Huella>');
      expect(xml).toContain('</sf:RegistroAnulacion>');
    });
  });
});
