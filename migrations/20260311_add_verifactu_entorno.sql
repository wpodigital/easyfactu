-- Migration: Add verifactu_entorno configuration key
-- Description: Adds the VeriFactu environment toggle (pruebas / produccion)
-- Date: 2026-03-11

INSERT INTO configuracion (clave, valor, tipo, descripcion)
VALUES
  ('verifactu_entorno', 'pruebas', 'facturacion', 'Entorno VeriFactu: pruebas o produccion')
ON CONFLICT (clave) DO NOTHING;
