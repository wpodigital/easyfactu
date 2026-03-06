-- Migration: create VeriFactu invoice management tables
-- Based on the AEAT SuministroInformacion.xsd schema

-- Table: facturas (invoices)
-- Main invoice registration table for both alta (create) and anulacion (cancellation)
CREATE TABLE IF NOT EXISTS facturas (
  id BIGSERIAL PRIMARY KEY,
  organization_id UUID NULL,
  
  -- IDVersion and operation type
  id_version VARCHAR(4) NOT NULL DEFAULT '1.0',
  operacion VARCHAR(20) NOT NULL CHECK (operacion IN ('A0', 'A1', 'AN')), -- A0=Alta, A1=Anulacion, AN=Anulacion sin previo
  
  -- IDFactura fields
  id_emisor_factura VARCHAR(30) NOT NULL,
  num_serie_factura VARCHAR(60) NOT NULL,
  fecha_expedicion_factura DATE NOT NULL,
  
  -- For anulacion: fields for the cancelled invoice
  id_emisor_factura_anulada VARCHAR(30) NULL,
  num_serie_factura_anulada VARCHAR(60) NULL,
  fecha_expedicion_factura_anulada DATE NULL,
  
  -- External reference
  ref_externa VARCHAR(60) NULL,
  
  -- Emisor information
  nombre_razon_emisor VARCHAR(120) NOT NULL,
  
  -- Subsanacion and RechazoPrevio flags
  subsanacion VARCHAR(1) NULL, -- S/N
  rechazo_previo VARCHAR(1) NULL, -- S/N
  sin_registro_previo VARCHAR(1) NULL, -- S/N (for anulacion)
  
  -- TipoFactura and related fields (only for alta)
  tipo_factura VARCHAR(2) NULL, -- F1, F2, F3, F4, R1, R2, R3, R4, R5
  tipo_rectificativa VARCHAR(1) NULL, -- S=Sustitucion, I=Diferencia
  fecha_operacion DATE NULL,
  descripcion_operacion TEXT NULL,
  factura_simplificada_art7273 VARCHAR(2) NULL, -- S1, S2, S3
  factura_sin_identificacion_destinatario VARCHAR(1) NULL, -- S/N
  macrodato VARCHAR(1) NULL, -- S/N
  emitida_por_tercero_o_destinatario VARCHAR(1) NULL, -- T=Tercero, D=Destinatario, N=Ninguno
  cupon VARCHAR(1) NULL, -- S/N
  
  -- Totals (only for alta)
  cuota_total NUMERIC(14, 2) NULL,
  importe_total NUMERIC(14, 2) NULL,
  
  -- Encadenamiento
  primer_registro VARCHAR(1) NOT NULL DEFAULT 'N', -- S/N
  huella_anterior VARCHAR(64) NULL, -- If not primer_registro
  id_emisor_factura_anterior VARCHAR(30) NULL,
  num_serie_factura_anterior VARCHAR(60) NULL,
  fecha_expedicion_factura_anterior DATE NULL,
  
  -- Huella (hash) and signature
  tipo_huella VARCHAR(2) NOT NULL DEFAULT '01', -- 01=SHA-256
  huella VARCHAR(64) NOT NULL,
  firma TEXT NULL, -- XML signature
  
  -- Sistema Informatico information stored in separate table (FK)
  sistema_informatico_id BIGINT NULL,
  
  -- FechaHoraHusoGenRegistro
  fecha_hora_huso_gen_registro TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Agreement fields
  num_registro_acuerdo_facturacion VARCHAR(15) NULL,
  id_acuerdo_sistema_informatico VARCHAR(16) NULL,
  
  -- Generador information (for anulacion)
  generado_por VARCHAR(1) NULL, -- T=Tercero, D=Destinatario
  
  -- Validation status
  estado_registro VARCHAR(50) NULL, -- Correcto, AceptadoConErrores, Incorrecto
  codigo_error_registro VARCHAR(10) NULL,
  descripcion_error_registro TEXT NULL,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT uk_factura_identity UNIQUE (id_emisor_factura, num_serie_factura, fecha_expedicion_factura)
);

CREATE INDEX IF NOT EXISTS idx_facturas_org ON facturas(organization_id);
CREATE INDEX IF NOT EXISTS idx_facturas_operacion ON facturas(operacion);
CREATE INDEX IF NOT EXISTS idx_facturas_estado ON facturas(estado_registro);
CREATE INDEX IF NOT EXISTS idx_facturas_fecha ON facturas(fecha_expedicion_factura);
CREATE INDEX IF NOT EXISTS idx_facturas_emisor ON facturas(id_emisor_factura);

-- Table: destinatarios (recipients)
-- IDDestinatario records for each invoice
CREATE TABLE IF NOT EXISTS destinatarios (
  id BIGSERIAL PRIMARY KEY,
  factura_id BIGINT NOT NULL REFERENCES facturas(id) ON DELETE CASCADE,
  
  -- PersonaFisicaJuridicaType
  nombre_razon VARCHAR(120) NOT NULL,
  
  -- Choice: NIF or IDOtro
  nif VARCHAR(30) NULL,
  id_otro_codigo_pais VARCHAR(2) NULL,
  id_otro_id_type VARCHAR(2) NULL,
  id_otro_id VARCHAR(20) NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_destinatarios_factura ON destinatarios(factura_id);
CREATE INDEX IF NOT EXISTS idx_destinatarios_nif ON destinatarios(nif);

-- Table: desgloses (tax breakdowns)
-- Desglose information for each invoice
CREATE TABLE IF NOT EXISTS desgloses (
  id BIGSERIAL PRIMARY KEY,
  factura_id BIGINT NOT NULL REFERENCES facturas(id) ON DELETE CASCADE,
  
  -- DesgloseTipoOperacion
  tipo_operacion VARCHAR(2) NOT NULL, -- E=Entrega, PS=Prestacion servicios, etc.
  
  -- Sujeta/NoSujeta/NoSujetaPorReglas
  sujeto_a_iva VARCHAR(1) NOT NULL, -- S/N/R (R=NoSujetaPorReglas)
  
  -- If sujeta:
  exenta VARCHAR(1) NULL, -- S/N
  causa_exencion VARCHAR(2) NULL, -- E1, E2, E3, E4, E5, E6
  
  -- Base imponible and tax
  base_imponible NUMERIC(14, 2) NOT NULL,
  tipo_impositivo NUMERIC(5, 2) NULL, -- Percentage
  cuota NUMERIC(14, 2) NULL,
  
  -- Tipo de no sujeta (if not sujeta)
  tipo_no_sujeta VARCHAR(2) NULL, -- RL=Regimen, OT=Otras
  
  -- Recargo de equivalencia
  tipo_recargo_equivalencia NUMERIC(5, 2) NULL,
  cuota_recargo_equivalencia NUMERIC(14, 2) NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_desgloses_factura ON desgloses(factura_id);

-- Table: facturas_rectificadas (rectified invoices references)
-- Stores references to rectified invoices (for TipoRectificativa)
CREATE TABLE IF NOT EXISTS facturas_rectificadas (
  id BIGSERIAL PRIMARY KEY,
  factura_id BIGINT NOT NULL REFERENCES facturas(id) ON DELETE CASCADE,
  
  id_emisor_factura_rectificada VARCHAR(30) NOT NULL,
  num_serie_factura_rectificada VARCHAR(60) NOT NULL,
  fecha_expedicion_factura_rectificada DATE NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_facturas_rectificadas_factura ON facturas_rectificadas(factura_id);

-- Table: facturas_sustituidas (substituted invoices references)
-- Stores references to substituted invoices
CREATE TABLE IF NOT EXISTS facturas_sustituidas (
  id BIGSERIAL PRIMARY KEY,
  factura_id BIGINT NOT NULL REFERENCES facturas(id) ON DELETE CASCADE,
  
  id_emisor_factura_sustituida VARCHAR(30) NOT NULL,
  num_serie_factura_sustituida VARCHAR(60) NOT NULL,
  fecha_expedicion_factura_sustituida DATE NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_facturas_sustituidas_factura ON facturas_sustituidas(factura_id);

-- Table: terceros (third parties)
-- Tercero information when EmitidaPorTerceroODestinatario is set
CREATE TABLE IF NOT EXISTS terceros (
  id BIGSERIAL PRIMARY KEY,
  factura_id BIGINT NOT NULL REFERENCES facturas(id) ON DELETE CASCADE,
  
  nombre_razon VARCHAR(120) NOT NULL,
  
  -- Choice: NIF or IDOtro
  nif VARCHAR(30) NULL,
  id_otro_codigo_pais VARCHAR(2) NULL,
  id_otro_id_type VARCHAR(2) NULL,
  id_otro_id VARCHAR(20) NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_terceros_factura ON terceros(factura_id);

-- Table: generadores (generators)
-- Generador information for anulacion records
CREATE TABLE IF NOT EXISTS generadores (
  id BIGSERIAL PRIMARY KEY,
  factura_id BIGINT NOT NULL REFERENCES facturas(id) ON DELETE CASCADE,
  
  nombre_razon VARCHAR(120) NOT NULL,
  
  -- Choice: NIF or IDOtro
  nif VARCHAR(30) NULL,
  id_otro_codigo_pais VARCHAR(2) NULL,
  id_otro_id_type VARCHAR(2) NULL,
  id_otro_id VARCHAR(20) NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_generadores_factura ON generadores(factura_id);

-- Table: sistema_informatico (IT system information)
-- SistemaInformaticoType - stores the IT system that generated the invoice
CREATE TABLE IF NOT EXISTS sistema_informatico (
  id BIGSERIAL PRIMARY KEY,
  organization_id UUID NULL,
  
  -- NombreRazon and identification
  nombre_razon VARCHAR(120) NOT NULL,
  nif VARCHAR(30) NULL,
  id_otro_codigo_pais VARCHAR(2) NULL,
  id_otro_id_type VARCHAR(2) NULL,
  id_otro_id VARCHAR(20) NULL,
  
  -- Sistema informatico details
  nombre_sistema_informatico VARCHAR(30) NOT NULL,
  id_sistema_informatico VARCHAR(2) NOT NULL,
  version VARCHAR(50) NOT NULL,
  numero_instalacion VARCHAR(100) NOT NULL,
  
  -- Usage types
  tipo_uso_posible_solo_verifactu VARCHAR(1) NOT NULL, -- S/N
  tipo_uso_posible_multi_ot VARCHAR(1) NOT NULL, -- S/N
  indicador_multiples_ot VARCHAR(1) NOT NULL, -- S/N
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT uk_sistema_informatico UNIQUE (id_sistema_informatico, numero_instalacion)
);

CREATE INDEX IF NOT EXISTS idx_sistema_informatico_org ON sistema_informatico(organization_id);

-- Add foreign key from facturas to sistema_informatico
ALTER TABLE facturas 
  ADD CONSTRAINT fk_facturas_sistema_informatico 
  FOREIGN KEY (sistema_informatico_id) 
  REFERENCES sistema_informatico(id);
