import {
  calculateHuellaAlta,
  calculateHuellaAnulacion,
  buildCanonicalStringAlta,
  buildCanonicalStringAnulacion,
  RegistroFacturacionAltaType,
  RegistroFacturacionAnulacionType,
} from '../../src/backend/verifactu';

describe('VeriFactu Hash Calculator', () => {
  describe('buildCanonicalStringAlta', () => {
    it('should build correct canonical string for invoice registration', () => {
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
        Huella: '',
      };

      const canonical = buildCanonicalStringAlta(registro);

      // Expected format: IDVersion + IDEmisorFactura + NumSerieFactura + FechaExpedicionFactura + 
      //                  TipoFactura + CuotaTotal + ImporteTotal + HuellaAnterior + FechaHoraHusoGenRegistro
      expect(canonical).toBe('1.0B12345678FAC-2024-0012024-01-15F12112120242024-01-15T10:30:00+01:00');
      
      // Numbers should have trailing zeros removed
      expect(canonical).toContain('21121'); // 21 + 121, not 21.00 + 121.00
    });

    it('should handle chained invoice with previous hash', () => {
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
          RegistroAnterior: {
            IDEmisorFactura: 'B12345678',
            NumSerieFactura: 'FAC-2024-001',
            FechaExpedicionFactura: '2024-01-15',
            Huella: 'ABCD1234',
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
        FechaHoraHusoGenRegistro: '2024-01-16T10:30:00+01:00',
        TipoHuella: '01',
        Huella: '',
      };

      const canonical = buildCanonicalStringAlta(registro);

      // Should include previous hash
      expect(canonical).toContain('ABCD1234');
      expect(canonical).toBe('1.0B12345678FAC-2024-0022024-01-16F121121ABCD12342024-01-16T10:30:00+01:00');
    });
  });

  describe('calculateHuellaAlta', () => {
    it('should calculate SHA-256 hash correctly', () => {
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
        Huella: '',
      };

      const hash = calculateHuellaAlta(registro);

      // Hash should be 64 characters (SHA-256 in hex)
      expect(hash).toHaveLength(64);
      expect(hash).toMatch(/^[A-F0-9]+$/); // Uppercase hex
    });

    it('should generate different hashes for different invoices', () => {
      const registro1: RegistroFacturacionAltaType = {
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
                  DesgloseIVA: [{ BaseImponible: 100.00, TipoImpositivo: 21.00, CuotaImpuesto: 21.00 }],
                },
              },
            },
          ],
        },
        CuotaTotal: 21.00,
        ImporteTotal: 121.00,
        Encadenamiento: { PrimerRegistro: 'S' },
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
        Huella: '',
      };

      const registro2 = { ...registro1, IDFactura: { ...registro1.IDFactura, NumSerieFactura: 'FAC-2024-002' } };

      const hash1 = calculateHuellaAlta(registro1);
      const hash2 = calculateHuellaAlta(registro2);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('buildCanonicalStringAnulacion', () => {
    it('should build correct canonical string for invoice cancellation', () => {
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
            Huella: 'PREV_HASH',
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
        Huella: '',
      };

      const canonical = buildCanonicalStringAnulacion(registro);

      // Expected format: IDVersion + IDEmisorFacturaAnulada + NumSerieFacturaAnulada + 
      //                  FechaExpedicionFacturaAnulada + HuellaAnterior + FechaHoraHusoGenRegistro
      expect(canonical).toBe('1.0B12345678FAC-2024-0012024-01-15PREV_HASH2024-01-20T10:30:00+01:00');
    });
  });

  describe('calculateHuellaAnulacion', () => {
    it('should calculate SHA-256 hash correctly for cancellation', () => {
      const registro: RegistroFacturacionAnulacionType = {
        IDVersion: '1.0',
        IDFactura: {
          IDEmisorFacturaAnulada: 'B12345678',
          NumSerieFacturaAnulada: 'FAC-2024-001',
          FechaExpedicionFacturaAnulada: '2024-01-15',
        },
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
        FechaHoraHusoGenRegistro: '2024-01-20T10:30:00+01:00',
        TipoHuella: '01',
        Huella: '',
      };

      const hash = calculateHuellaAnulacion(registro);

      // Hash should be 64 characters (SHA-256 in hex)
      expect(hash).toHaveLength(64);
      expect(hash).toMatch(/^[A-F0-9]+$/); // Uppercase hex
    });
  });
});
