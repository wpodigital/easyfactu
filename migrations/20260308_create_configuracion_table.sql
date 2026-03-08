-- Migration: Create configuration table
-- Description: Table for configuration
-- Date: 2026-03-08

CREATE TABLE IF NOT EXISTS configuracion (
  id BIGSERIAL PRIMARY KEY,
  clave VARCHAR(100) UNIQUE NOT NULL,
  valor TEXT,
  tipo VARCHAR(50) NOT NULL,
  descripcion TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO configuracion (clave, valor, tipo, descripcion)
VALUES
  ('empresa_nif', '', 'empresa', 'NIF o CIF de la empresa'),
  ('empresa_nombre', '', 'empresa', 'Nombre o razón social'),
  ('empresa_nombre_comercial', '', 'empresa', 'Nombre comercial'),
  ('empresa_direccion', '', 'empresa', 'Dirección fiscal'),
  ('empresa_codigo_postal', '', 'empresa', 'Código postal'),
  ('empresa_ciudad', '', 'empresa', 'Ciudad'),
  ('empresa_provincia', '', 'empresa', 'Provincia'),
  ('empresa_pais', 'España', 'empresa', 'País'),
  ('empresa_telefono', '', 'empresa', 'Teléfono'),
  ('empresa_email', '', 'empresa', 'Email'),
  ('empresa_web', '', 'empresa', 'Sitio web'),

  ('facturacion_serie_por_defecto', 'A', 'facturacion', 'Serie por defecto'),
  ('facturacion_proximo_numero', '1', 'facturacion', 'Próximo número de factura'),
  ('facturacion_formato_numero', 'A-{NUMERO}', 'facturacion', 'Formato de numeración'),
  ('facturacion_incluir_iva', 'true', 'facturacion', 'Incluir IVA por defecto'),
  ('facturacion_tipo_iva_por_defecto', '21', 'facturacion', 'Tipo de IVA por defecto'),
  ('facturacion_texto_pie_factura', '', 'facturacion', 'Texto pie de factura'),
  ('facturacion_mostrar_logo', 'true', 'facturacion', 'Mostrar logo en facturas'),

  ('usuario_idioma', 'es', 'usuario', 'Idioma'),
  ('usuario_tema', 'light', 'usuario', 'Tema'),
  ('usuario_notificaciones_email', 'true', 'usuario', 'Notificaciones por email'),
  ('usuario_formato_fecha', 'DD/MM/YYYY', 'usuario', 'Formato de fecha'),
  ('usuario_formato_moneda', 'EUR', 'usuario', 'Formato de moneda')
ON CONFLICT (clave) DO NOTHING;