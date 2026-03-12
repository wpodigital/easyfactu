-- Migration: Create usuarios table for authentication
-- Date: 2026-03-09

CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  email VARCHAR(200) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  rol VARCHAR(20) NOT NULL DEFAULT 'admin' CHECK (rol IN ('admin', 'usuario', 'viewer')),
  activo BOOLEAN NOT NULL DEFAULT true,
  ultimo_acceso TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);

-- Trigger to update updated_at automatically
CREATE OR REPLACE FUNCTION update_usuarios_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_usuarios_updated_at ON usuarios;
CREATE TRIGGER trg_usuarios_updated_at
  BEFORE UPDATE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION update_usuarios_updated_at();

-- Add 'viewer' to existing constraint if table already exists without it
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'usuarios'
      AND constraint_name = 'usuarios_rol_check'
  ) THEN
    ALTER TABLE usuarios DROP CONSTRAINT usuarios_rol_check;
    ALTER TABLE usuarios ADD CONSTRAINT usuarios_rol_check
      CHECK (rol IN ('admin', 'usuario', 'viewer'));
  END IF;
END;
$$;
