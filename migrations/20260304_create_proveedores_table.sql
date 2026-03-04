-- Migration: Create proveedores table
-- Description: Table for managing suppliers/providers
-- Date: 2026-03-04

CREATE TABLE IF NOT EXISTS proveedores (
    id BIGSERIAL PRIMARY KEY,
    
    -- Identification
    nif VARCHAR(20) UNIQUE NOT NULL,
    nombre_razon_social VARCHAR(255) NOT NULL,
    nombre_comercial VARCHAR(255),
    
    -- Contact Information
    email VARCHAR(255),
    telefono VARCHAR(20),
    movil VARCHAR(20),
    fax VARCHAR(20),
    web VARCHAR(255),
    
    -- Address
    direccion VARCHAR(255),
    codigo_postal VARCHAR(10),
    ciudad VARCHAR(100),
    provincia VARCHAR(100),
    pais VARCHAR(100) DEFAULT 'España',
    
    -- Tax Information
    tipo_identificacion VARCHAR(50),  -- NIF, CIF, NIE, etc.
    tipo_proveedor VARCHAR(50),       -- Nacional, Intracomunitario, Extranjero
    regimen_iva VARCHAR(50),          -- General, Recargo, Exento
    
    -- Commercial Terms
    forma_pago VARCHAR(50),           -- Transferencia, Cheque, Efectivo
    dias_pago INTEGER DEFAULT 30,
    descuento_comercial DECIMAL(5,2) DEFAULT 0.00,
    
    -- Status
    activo BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_proveedores_nif ON proveedores(nif);
CREATE INDEX idx_proveedores_nombre ON proveedores(nombre_razon_social);
CREATE INDEX idx_proveedores_activo ON proveedores(activo);
CREATE INDEX idx_proveedores_created_at ON proveedores(created_at DESC);

-- Update timestamp trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_proveedores_updated_at ON proveedores;
CREATE TRIGGER update_proveedores_updated_at
    BEFORE UPDATE ON proveedores
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE proveedores IS 'Tabla de proveedores/suppliers para el sistema de facturación';
COMMENT ON COLUMN proveedores.nif IS 'NIF/CIF del proveedor (único)';
COMMENT ON COLUMN proveedores.nombre_razon_social IS 'Razón social del proveedor (requerido)';
COMMENT ON COLUMN proveedores.tipo_proveedor IS 'Tipo: Nacional, Intracomunitario, Extranjero';
COMMENT ON COLUMN proveedores.activo IS 'Indica si el proveedor está activo (soft delete)';
