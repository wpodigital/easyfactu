/**
 * Facturas Repository
 * Data Access Layer for invoice operations
 */

import { Pool } from 'pg';
import { getPool } from '../config/database';

/**
 * Database model for Factura
 */
export interface FacturaDB {
  id_factura?: number;
  id_version: string;
  id_emisor_factura: string;
  num_serie_factura: string;
  fecha_expedicion_factura: string;
  nombre_razon_emisor: string;
  tipo_factura: string;
  descripcion_operacion: string;
  importe_total?: number;
  base_imponible_aimporte_total?: number;
  cuota_total?: number;
  huella?: string;
  fecha_hora_huella_sig?: Date;
  id_factura_anterior?: number;
  created_at?: Date;
  updated_at?: Date;
  status?: string;
  xml_content?: string;
  validation_timestamp?: Date;
  validation_status?: string;
  validation_csv?: string;
  validation_errors?: string;
}

/**
 * Insert parameters for creating a factura
 */
export interface CreateFacturaParams {
  id_version: string;
  id_emisor_factura: string;
  num_serie_factura: string;
  fecha_expedicion_factura: string;
  nombre_razon_emisor: string;
  tipo_factura: string;
  descripcion_operacion: string;
  importe_total?: number;
  base_imponible_aimporte_total?: number;
  cuota_total?: number;
  huella?: string;
  fecha_hora_huella_sig?: Date;
  id_factura_anterior?: number;
  xml_content?: string;
}

/**
 * Repository class for Facturas table
 */
export class FacturasRepository {
  private pool: Pool;

  constructor(pool?: Pool) {
    this.pool = pool || getPool();
  }

  /**
   * Create a new factura
   */
  async create(params: CreateFacturaParams): Promise<FacturaDB> {
    const query = `
      INSERT INTO facturas (
        id_version,
        id_emisor_factura,
        num_serie_factura,
        fecha_expedicion_factura,
        nombre_razon_emisor,
        tipo_factura,
        descripcion_operacion,
        importe_total,
        base_imponible_aimporte_total,
        cuota_total,
        huella,
        fecha_hora_huella_sig,
        id_factura_anterior,
        xml_content,
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `;

    const values = [
      params.id_version,
      params.id_emisor_factura,
      params.num_serie_factura,
      params.fecha_expedicion_factura,
      params.nombre_razon_emisor,
      params.tipo_factura,
      params.descripcion_operacion,
      params.importe_total,
      params.base_imponible_aimporte_total,
      params.cuota_total,
      params.huella,
      params.fecha_hora_huella_sig,
      params.id_factura_anterior,
      params.xml_content,
      'pending', // Initial status
    ];

    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Find factura by ID
   */
  async findById(id: number): Promise<FacturaDB | null> {
    const query = 'SELECT * FROM facturas WHERE id_factura = $1';
    const result = await this.pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Find factura by series and number
   */
  async findBySeriesAndNumber(
    idEmisor: string,
    numSerie: string
  ): Promise<FacturaDB | null> {
    const query = `
      SELECT * FROM facturas 
      WHERE id_emisor_factura = $1 AND num_serie_factura = $2
      ORDER BY id_factura DESC
      LIMIT 1
    `;
    const result = await this.pool.query(query, [idEmisor, numSerie]);
    return result.rows[0] || null;
  }

  /**
   * Get all facturas for an issuer
   */
  async findByIssuer(idEmisor: string, limit: number = 100): Promise<FacturaDB[]> {
    const query = `
      SELECT * FROM facturas 
      WHERE id_emisor_factura = $1
      ORDER BY fecha_expedicion_factura DESC, id_factura DESC
      LIMIT $2
    `;
    const result = await this.pool.query(query, [idEmisor, limit]);
    return result.rows;
  }

  /**
   * Get the last factura for chaining
   */
  async getLastForChaining(idEmisor: string): Promise<FacturaDB | null> {
    const query = `
      SELECT * FROM facturas 
      WHERE id_emisor_factura = $1 AND huella IS NOT NULL
      ORDER BY fecha_hora_huella_sig DESC, id_factura DESC
      LIMIT 1
    `;
    const result = await this.pool.query(query, [idEmisor]);
    return result.rows[0] || null;
  }

  /**
   * Update factura validation status
   */
  async updateValidationStatus(
    id: number,
    status: string,
    csv?: string,
    errors?: string
  ): Promise<FacturaDB | null> {
    const query = `
      UPDATE facturas 
      SET 
        validation_status = $2,
        validation_csv = $3,
        validation_errors = $4,
        validation_timestamp = NOW(),
        updated_at = NOW()
      WHERE id_factura = $1
      RETURNING *
    `;
    const result = await this.pool.query(query, [id, status, csv, errors]);
    return result.rows[0] || null;
  }

  /**
   * Update factura hash (huella)
   */
  async updateHash(
    id: number,
    huella: string,
    fechaHora: Date
  ): Promise<FacturaDB | null> {
    const query = `
      UPDATE facturas 
      SET 
        huella = $2,
        fecha_hora_huella_sig = $3,
        updated_at = NOW()
      WHERE id_factura = $1
      RETURNING *
    `;
    const result = await this.pool.query(query, [id, huella, fechaHora]);
    return result.rows[0] || null;
  }

  /**
   * Delete factura (soft delete by updating status)
   */
  async delete(id: number): Promise<boolean> {
    const query = `
      UPDATE facturas 
      SET status = 'cancelled', updated_at = NOW()
      WHERE id_factura = $1
      RETURNING id_factura
    `;
    const result = await this.pool.query(query, [id]);
    return result.rows.length > 0;
  }

  /**
   * List all facturas with pagination
   */
  async list(offset: number = 0, limit: number = 50): Promise<FacturaDB[]> {
    const query = `
      SELECT * FROM facturas 
      ORDER BY fecha_expedicion_factura DESC, id_factura DESC
      OFFSET $1 LIMIT $2
    `;
    const result = await this.pool.query(query, [offset, limit]);
    return result.rows;
  }

  /**
   * Count total facturas
   */
  async count(): Promise<number> {
    const query = 'SELECT COUNT(*) as count FROM facturas';
    const result = await this.pool.query(query);
    return parseInt(result.rows[0].count, 10);
  }
}

/**
 * Export a singleton instance
 */
export const facturasRepository = new FacturasRepository();
