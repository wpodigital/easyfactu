-- Migration: Create Certificados (Digital Certificates) Table
-- Date: 2026-03-04
-- Description: Table for managing digital certificates (.p12) for AEAT authentication

-- Create certificados table
CREATE TABLE IF NOT EXISTS certificados (
    id BIGSERIAL PRIMARY KEY,
    
    -- Identificación del certificado
    nombre VARCHAR(200) NOT NULL,
    alias VARCHAR(100),
    
    -- Información del titular
    titular_nombre VARCHAR(200),
    titular_nif VARCHAR(30),
    titular_organizacion VARCHAR(200),
    
    -- Información del certificado
    issuer VARCHAR(500), -- Emisor del certificado
    subject VARCHAR(500), -- Sujeto del certificado
    serial_number VARCHAR(100), -- Número de serie
    
    -- Validez
    fecha_inicio DATE,
    fecha_expiracion DATE,
    activo BOOLEAN DEFAULT TRUE,
    
    -- Almacenamiento del certificado
    -- Nota: El certificado se guarda cifrado en la base de datos
    certificado_data BYTEA, -- Contenido del archivo .p12 cifrado
    certificado_hash VARCHAR(64), -- SHA-256 hash del certificado original
    
    -- Configuración
    requiere_password BOOLEAN DEFAULT TRUE,
    tipo VARCHAR(20) DEFAULT 'PKCS12', -- PKCS12 (.p12/.pfx), X509, etc.
    uso VARCHAR(50) DEFAULT 'AEAT', -- AEAT, FIRMA, CIFRADO, etc.
    
    -- Metadata
    archivo_original VARCHAR(255), -- Nombre del archivo original
    tamanio_bytes BIGINT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    uploaded_by VARCHAR(100),
    
    -- Última validación
    ultima_validacion TIMESTAMP WITH TIME ZONE,
    estado_validacion VARCHAR(50), -- VALIDO, EXPIRADO, REVOCADO, ERROR
    
    -- Auditoría
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT check_fecha_validez CHECK (fecha_expiracion > fecha_inicio),
    CONSTRAINT check_estado UNIQUE (titular_nif, activo) WHERE activo = TRUE -- Solo un certificado activo por titular
);

-- Índices
CREATE INDEX idx_certificados_titular_nif ON certificados(titular_nif);
CREATE INDEX idx_certificados_fecha_exp ON certificados(fecha_expiracion);
CREATE INDEX idx_certificados_activo ON certificados(activo);
CREATE INDEX idx_certificados_estado ON certificados(estado_validacion);

-- Comentarios
COMMENT ON TABLE certificados IS 'Certificados digitales .p12 para autenticación con AEAT';
COMMENT ON COLUMN certificados.certificado_data IS 'Contenido del certificado .p12 cifrado (usar pg_crypto)';
COMMENT ON COLUMN certificados.certificado_hash IS 'SHA-256 hash del certificado para verificación de integridad';
COMMENT ON COLUMN certificados.uso IS 'Propósito del certificado: AEAT, FIRMA, CIFRADO';

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_certificados_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_certificados_updated_at
    BEFORE UPDATE ON certificados
    FOR EACH ROW
    EXECUTE FUNCTION update_certificados_updated_at();

-- Función para verificar si un certificado está vigente
CREATE OR REPLACE FUNCTION certificado_vigente(cert_id BIGINT)
RETURNS BOOLEAN AS $$
DECLARE
    es_vigente BOOLEAN;
BEGIN
    SELECT 
        activo = TRUE 
        AND fecha_expiracion > CURRENT_DATE
        AND (estado_validacion IS NULL OR estado_validacion = 'VALIDO')
    INTO es_vigente
    FROM certificados
    WHERE id = cert_id;
    
    RETURN COALESCE(es_vigente, FALSE);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION certificado_vigente IS 'Verifica si un certificado está activo y vigente';
