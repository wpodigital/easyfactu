-- Migration: Add Compatibility Fields to VeriFactu Schema
-- Date: 2026-03-03
-- Purpose: Maintain VeriFactu schema compliance while adding fields needed by API code
-- Strategy: Add non-intrusive compatibility fields and use PostgreSQL features for mapping

-- ============================================================================
-- PART 1: Add Compatibility Fields to facturas table
-- ============================================================================

-- Add fields expected by API but not in VeriFactu schema
ALTER TABLE facturas 
  ADD COLUMN IF NOT EXISTS xml_content TEXT,
  ADD COLUMN IF NOT EXISTS validation_timestamp TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS validation_status VARCHAR(50),
  ADD COLUMN IF NOT EXISTS validation_csv TEXT,
  ADD COLUMN IF NOT EXISTS validation_errors TEXT,
  ADD COLUMN IF NOT EXISTS id_factura_anterior BIGINT REFERENCES facturas(id);

-- Add index for id_factura_anterior for invoice chaining queries
CREATE INDEX IF NOT EXISTS idx_facturas_id_anterior 
  ON facturas(id_factura_anterior) 
  WHERE id_factura_anterior IS NOT NULL;

-- Add index for validation queries
CREATE INDEX IF NOT EXISTS idx_facturas_validation_status 
  ON facturas(validation_status) 
  WHERE validation_status IS NOT NULL;

-- ============================================================================
-- PART 2: Add Comments for Documentation
-- ============================================================================

COMMENT ON COLUMN facturas.xml_content IS 
  'Compatibility field: Stores generated VeriFactu XML message';

COMMENT ON COLUMN facturas.validation_timestamp IS 
  'Compatibility field: Timestamp of last AEAT validation attempt';

COMMENT ON COLUMN facturas.validation_status IS 
  'Compatibility field: Result of AEAT validation (Correcto, AceptadoConErrores, Incorrecto)';

COMMENT ON COLUMN facturas.validation_csv IS 
  'Compatibility field: CSV code from AEAT validation response';

COMMENT ON COLUMN facturas.validation_errors IS 
  'Compatibility field: JSON array of validation errors from AEAT';

COMMENT ON COLUMN facturas.id_factura_anterior IS 
  'Compatibility field: Reference to previous invoice in chain (maps to RegistroAnterior in XML)';

-- ============================================================================
-- PART 3: Create Helper Function for Field Mapping
-- ============================================================================

-- Function to get status using compatibility mapping
CREATE OR REPLACE FUNCTION get_factura_status(factura_row facturas)
RETURNS VARCHAR(50) AS $$
BEGIN
  -- Map estado_registro to status for compatibility
  -- VeriFactu uses: 'Correcta', 'Incompleta', 'Error'
  -- API expects: 'Correcta', 'Validada', 'Error', etc.
  RETURN COALESCE(factura_row.validation_status, factura_row.estado_registro::VARCHAR);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- PART 4: Update Existing Data (Safe Defaults)
-- ============================================================================

-- Set default estado_registro for existing rows if NULL
UPDATE facturas 
SET estado_registro = 'Correcta' 
WHERE estado_registro IS NULL;

-- ============================================================================
-- PART 5: Create View for API Compatibility (Optional)
-- ============================================================================

-- Create a view that provides field name aliases for maximum compatibility
CREATE OR REPLACE VIEW facturas_api AS
SELECT 
  id,
  id AS id_factura,  -- Alias for compatibility
  nif_emisor_factura,
  num_serie_factura_emisor,
  fecha_expedicion_factura,
  tipo_factura,
  cuota_total,
  importe_total,
  huella,
  fecha_hora_huso_gen_registro,
  fecha_hora_huso_gen_registro AS fecha_hora_huella_sig,  -- Alias
  operacion,
  tipo_comunicacion,
  estado_registro,
  estado_registro::VARCHAR AS status,  -- Alias
  codigo_seguro_verificacion,
  qr,
  xml_content,
  validation_timestamp,
  validation_status,
  validation_csv,
  validation_errors,
  id_factura_anterior,
  created_at,
  updated_at
FROM facturas;

COMMENT ON VIEW facturas_api IS 
  'Compatibility view: Provides field name aliases for API code compatibility with VeriFactu schema';

-- ============================================================================
-- PART 6: Grant Permissions
-- ============================================================================

-- Grant access to the view
GRANT SELECT, INSERT, UPDATE, DELETE ON facturas_api TO PUBLIC;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify new columns exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'facturas' AND column_name = 'xml_content'
  ) THEN
    RAISE EXCEPTION 'Migration failed: xml_content column not created';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'facturas' AND column_name = 'validation_timestamp'
  ) THEN
    RAISE EXCEPTION 'Migration failed: validation_timestamp column not created';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'facturas' AND column_name = 'id_factura_anterior'
  ) THEN
    RAISE EXCEPTION 'Migration failed: id_factura_anterior column not created';
  END IF;
  
  RAISE NOTICE 'Migration 20260303_add_compatibility_fields.sql completed successfully';
END $$;
