-- Seed data for EasyFactu testing
-- Sample invoices and data for development and testing

-- Clear existing data (for re-running)
TRUNCATE TABLE facturas CASCADE;
TRUNCATE TABLE sistema_informatico CASCADE;

-- Insert Sistema Informatico data
INSERT INTO sistema_informatico (
    nombre_razon,
    nif,
    id_otro,
    nombre_sistema,
    id_sistema,
    version,
    numero_instalacion,
    tipo_uso_sistema,
    tipo_identificacion
) VALUES (
    'EasyFactu S.L.',
    'B12345678',
    NULL,
    'EasyFactu',
    'EASYFACTU2024',
    '1.0',
    '001',
    'T', -- Tercero
    'N'  -- NIF
);

-- Insert sample invoices (using VeriFactu schema field names)
INSERT INTO facturas (
    id_version,
    nif_emisor_factura,
    num_serie_factura_emisor,
    fecha_expedicion_factura,
    tipo_factura,
    cuota_total,
    importe_total,
    descripcion_operacion,
    operacion,
    tipo_comunicacion,
    estado_registro,
    created_at,
    updated_at
) VALUES 
(
    '1.0',
    'B87654321',
    'TEST-001',
    '2024-01-15',
    'F1', -- Factura (Art. 6, 7.2 y 7.3 Rgto Facturación)
    21.00,
    121.00,
    'Servicios de consultoría',
    'A0', -- Alta normal
    'A0', -- Comunicación normal
    'Correcta',
    NOW(),
    NOW()
),
(
    '1.0',
    'B87654321',
    'TEST-002',
    '2024-01-16',
    'F1',
    42.00,
    242.00,
    'Venta de productos',
    'A0',
    'A0',
    'Correcta',
    NOW(),
    NOW()
),
(
    '1.0',
    'B87654321',
    'TEST-003',
    '2024-01-17',
    'F2', -- Factura Simplificada (Art. 7.2 y 7.3 Rgto Facturación)
    10.50,
    60.50,
    'Venta en mostrador',
    'A0',
    'A0',
    'Correcta',
    NOW(),
    NOW()
);

-- Sample destinatarios
INSERT INTO destinatarios (
    factura_id,
    nombre_razon,
    nif,
    id_otro,
    tipo_identificacion,
    codigo_pais
) VALUES
(
    (SELECT id FROM facturas WHERE num_serie_factura_emisor = 'TEST-001'),
    'Cliente Ejemplo S.A.',
    'B11111111',
    NULL,
    'N',
    'ES'
),
(
    (SELECT id FROM facturas WHERE num_serie_factura_emisor = 'TEST-002'),
    'Cliente Internacional Ltd.',
    NULL,
    'GB123456789',
    'O',
    'GB'
);

-- Sample desgloses (tax breakdowns)
INSERT INTO desgloses (
    factura_id,
    clave_regimen,
    tipo_impositivo,
    base_imponible,
    cuota_repercutida
) VALUES
(
    (SELECT id FROM facturas WHERE num_serie_factura_emisor = 'TEST-001'),
    '01',
    21.00,
    100.00,
    21.00
),
(
    (SELECT id FROM facturas WHERE num_serie_factura_emisor = 'TEST-002'),
    '01',
    21.00,
    200.00,
    42.00
),
(
    (SELECT id FROM facturas WHERE num_serie_factura_emisor = 'TEST-003'),
    '01',
    21.00,
    50.00,
    10.50
);

-- Display summary
SELECT 
    COUNT(*) as total_facturas,
    SUM(importe_total) as importe_total,
    SUM(cuota_total) as cuota_total
FROM facturas;

SELECT 
    num_serie_factura_emisor,
    fecha_expedicion_factura,
    tipo_factura,
    importe_total,
    estado_registro
FROM facturas
ORDER BY fecha_expedicion_factura;

-- Success message
\echo 'Seed data inserted successfully!'
\echo 'Total invoices: 3'
\echo 'Ready for testing!'
