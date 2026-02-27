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
let pool: Pool | null = null;

/**
 * Get or create the database connection pool
 */
export function getPool(): Pool {
  if (!pool) {
    pool = new Pool(dbConfig);
    
    // Handle pool errors
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
      process.exit(-1);
    });
    
    // Log connection
    console.log(`Database pool created: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
  }
  
  return pool;
}

/**
 * Close the database connection pool
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
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
    // Check if tables exist
    const result = await pool.query(`
      SELECT tablename 
      FROM pg_catalog.pg_tables 
      WHERE schemaname = 'public' AND tablename = 'facturas'
    `);
    
    if (result.rows.length === 0) {
      console.warn('⚠️  Database tables not found. Please run migrations:');
      console.warn('   psql easyfactu < migrations/20251122_create_invoice_declarations_queries.sql');
      console.warn('   psql easyfactu < migrations/20260112_create_verifactu_tables.sql');
    } else {
      console.log('✓ Database tables verified');
    }
  } catch (error) {
    console.error('Error checking database tables:', error);
  }
}
