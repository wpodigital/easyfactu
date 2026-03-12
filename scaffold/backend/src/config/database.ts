/**
 * Database Configuration Module
 * Manages PostgreSQL connection pool and configuration
 */

import { Pool, PoolConfig } from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Database configuration from environment variables
 */
const dbConfig: PoolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'easyfactu',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  max: parseInt(process.env.DB_POOL_MAX || '20', 10),
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '2000', 10),
};

/**
 * Global connection pool instance
 */
let poolInstance: Pool | null = null;

/**
 * Get or create the database connection pool
 */
export function getPool(): Pool {
  if (!poolInstance) {
    poolInstance = new Pool(dbConfig);
    
    // Handle pool errors
    poolInstance.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
      process.exit(-1);
    });
    
    // Log connection
    console.log(`Database pool created: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
  }
  
  return poolInstance;
}

// Export pool for direct use (create it lazily)
export const pool = getPool();

/**
 * Close the database connection pool
 */
export async function closePool(): Promise<void> {
  if (poolInstance) {
    await poolInstance.end();
    poolInstance = null;
    console.log('Database pool closed');
  }
}

/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    const pool = getPool();
    const result = await pool.query('SELECT NOW()');
    console.log('Database connection successful:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

/**
 * Initialize database tables if they don't exist
 * Note: In production, use migrations instead
 */
export async function initializeDatabase(): Promise<void> {
  const pool = getPool();
  
  try {
    // Check if core invoice tables exist
    const result = await pool.query(`
      SELECT tablename 
      FROM pg_catalog.pg_tables 
      WHERE schemaname = 'public' AND tablename = 'facturas'
    `);
    
    if (result.rows.length === 0) {
      console.warn('⚠️  Core database tables not found. Run the full setup script:');
      console.warn('   cd scaffold/backend && npm run db:setup');
      console.warn('Or run all migrations manually:');
      console.warn('   psql easyfactu < migrations/20251122_create_invoice_declarations_queries.sql');
      console.warn('   psql easyfactu < migrations/20260112_create_verifactu_tables.sql');
      console.warn('   psql easyfactu < migrations/20260303_add_compatibility_fields.sql');
      console.warn('   psql easyfactu < migrations/20260304_create_clientes_table.sql');
      console.warn('   psql easyfactu < migrations/20260304_create_certificados_table.sql');
      console.warn('   psql easyfactu < migrations/20260304_create_proveedores_table.sql');
      console.warn('   psql easyfactu < migrations/20260306_create_facturas_recibidas.sql');
      console.warn('   psql easyfactu < migrations/20260308_create_configuracion_table.sql');
      console.warn('   psql easyfactu < migrations/20260309_create_usuarios_table.sql');
      console.warn('   psql easyfactu < migrations/20260311_add_verifactu_entorno.sql');
    } else {
      console.log('✓ Database tables verified');
    }

    // Ensure the configuracion table exists regardless of migration state.
    // This is a safety net so that the configuration API works even when the
    // full migration set has not yet been applied.
    await pool.query(`
      CREATE TABLE IF NOT EXISTS configuracion (
        id BIGSERIAL PRIMARY KEY,
        clave VARCHAR(100) UNIQUE NOT NULL,
        valor TEXT,
        tipo VARCHAR(50) NOT NULL,
        descripcion TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Seed default configuration rows (idempotent – ON CONFLICT DO NOTHING)
    await pool.query(`
      INSERT INTO configuracion (clave, valor, tipo, descripcion) VALUES
        ('empresa_nif',              '',        'empresa',     'NIF o CIF de la empresa'),
        ('empresa_nombre',           '',        'empresa',     'Nombre o razón social'),
        ('empresa_nombre_comercial', '',        'empresa',     'Nombre comercial'),
        ('empresa_direccion',        '',        'empresa',     'Dirección fiscal'),
        ('empresa_codigo_postal',    '',        'empresa',     'Código postal'),
        ('empresa_ciudad',           '',        'empresa',     'Ciudad'),
        ('empresa_provincia',        '',        'empresa',     'Provincia'),
        ('empresa_pais',             'España',  'empresa',     'País'),
        ('empresa_telefono',         '',        'empresa',     'Teléfono'),
        ('empresa_email',            '',        'empresa',     'Email'),
        ('empresa_web',              '',        'empresa',     'Sitio web'),
        ('facturacion_serie_por_defecto',    'A',           'facturacion', 'Serie por defecto'),
        ('facturacion_proximo_numero',       '1',           'facturacion', 'Próximo número de factura'),
        ('facturacion_formato_numero',       'A-{NUMERO}',  'facturacion', 'Formato de numeración'),
        ('facturacion_incluir_iva',          'true',        'facturacion', 'Incluir IVA por defecto'),
        ('facturacion_tipo_iva_por_defecto', '21',          'facturacion', 'Tipo de IVA por defecto'),
        ('facturacion_texto_pie_factura',    '',            'facturacion', 'Texto pie de factura'),
        ('facturacion_mostrar_logo',         'true',        'facturacion', 'Mostrar logo en facturas'),
        ('verifactu_entorno',                'pruebas',     'facturacion', 'Entorno VeriFactu: pruebas o produccion'),
        ('usuario_idioma',                   'es',          'usuario',     'Idioma'),
        ('usuario_tema',                     'light',       'usuario',     'Tema'),
        ('usuario_notificaciones_email',     'true',        'usuario',     'Notificaciones por email'),
        ('usuario_formato_fecha',            'DD/MM/YYYY',  'usuario',     'Formato de fecha'),
        ('usuario_formato_moneda',           'EUR',         'usuario',     'Formato de moneda')
      ON CONFLICT (clave) DO NOTHING
    `);

  } catch (error) {
    console.error('Error initializing database:', error);
  }
}
