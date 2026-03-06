-- Migration: Create Clientes (Customers) Table
-- Date: 2026-03-04
-- Description: Table for managing customer/client information

-- Create clientes table
CREATE TABLE IF NOT EXISTS clientes (
    id BIGSERIAL PRIMARY KEY,
    
    -- Identificación
    nif VARCHAR(30) NOT NULL UNIQUE,
    nombre_razon_social VARCHAR(120) NOT NULL,
    nombre_comercial VARCHAR(120),
    
    -- Contacto
    email VARCHAR(100),
    telefono VARCHAR(20),
    movil VARCHAR(20),
    fax VARCHAR(20),
    web VARCHAR(200),
    
    -- Dirección
    direccion VARCHAR(200),
    codigo_postal VARCHAR(10),
    ciudad VARCHAR(100),
    provincia VARCHAR(100),
    pais VARCHAR(2) DEFAULT 'ES', -- ISO 3166-1 alpha-2
    
    -- Datos fiscales
    tipo_identificacion VARCHAR(10) DEFAULT 'NIF', -- NIF, CIF, NIE, PASSPORT, etc.
    tipo_cliente VARCHAR(20) DEFAULT 'NACIONAL', -- NACIONAL, INTRACOMUNITARIO, EXTRACOMUNITARIO
    regimen_iva VARCHAR(50) DEFAULT 'GENERAL', -- GENERAL, EXENTO, RECARGO_EQUIVALENCIA, etc.
    
    -- Datos comerciales
    forma_pago VARCHAR(50), -- TRANSFERENCIA, EFECTIVO, TARJETA, etc.
    dias_pago INTEGER DEFAULT 30,
    descuento_comercial DECIMAL(5,2) DEFAULT 0.00,
    limite_credito DECIMAL(12,2),
    
    -- Observaciones
    notas TEXT,
    
    -- Metadata
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

-- Índices para búsquedas rápidas
CREATE INDEX idx_clientes_nif ON clientes(nif);
CREATE INDEX idx_clientes_nombre ON clientes(nombre_razon_social);
CREATE INDEX idx_clientes_activo ON clientes(activo);
CREATE INDEX idx_clientes_tipo_cliente ON clientes(tipo_cliente);

-- Comentarios
COMMENT ON TABLE clientes IS 'Tabla de clientes/customers para facturación';
COMMENT ON COLUMN clientes.nif IS 'NIF/CIF del cliente';
COMMENT ON COLUMN clientes.tipo_identificacion IS 'Tipo de documento: NIF, CIF, NIE, PASSPORT, etc.';
COMMENT ON COLUMN clientes.tipo_cliente IS 'NACIONAL, INTRACOMUNITARIO, EXTRACOMUNITARIO';
COMMENT ON COLUMN clientes.regimen_iva IS 'Régimen IVA del cliente';

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_clientes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_clientes_updated_at
    BEFORE UPDATE ON clientes
    FOR EACH ROW
    EXECUTE FUNCTION update_clientes_updated_at();

-- Datos de ejemplo (opcional)
-- INSERT INTO clientes (nif, nombre_razon_social, email, telefono, direccion, ciudad, provincia)
-- VALUES 
--     ('B12345678', 'Cliente Ejemplo S.L.', 'cliente@ejemplo.com', '912345678', 'Calle Mayor 1', 'Madrid', 'Madrid'),
--     ('12345678A', 'Juan García López', 'juan@email.com', '666777888', 'Av. Principal 23', 'Barcelona', 'Barcelona');
