-- Migration: Create facturas recibidas table
-- Description: Table for managing invoice received
-- Date: 2026-03-08

CREATE TABLE IF NOT EXISTS facturas_recibidas (
  id BIGSERIAL PRIMARY KEY,
  numero_factura VARCHAR(100) NOT NULL,
  proveedor_id BIGINT REFERENCES proveedores(id),
  fecha_factura DATE NOT NULL,
  fecha_vencimiento DATE,
  base_imponible DECIMAL(10,2),
  iva_total DECIMAL(10,2),
  importe_total DECIMAL(10,2),
  estado VARCHAR(50) DEFAULT 'pendiente',
  fecha_pago DATE,
  notas TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);