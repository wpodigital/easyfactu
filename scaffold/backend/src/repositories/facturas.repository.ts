/**
 * Facturas Repository
 * Data Access Layer for invoice operations
 */

import { Pool } from 'pg';
import { getPool } from '../config/database';

/**
 * Database model for Factura
 * Maps to VeriFactu schema with compatibility fields
 */
export interface FacturaDB {
  // Primary key (VeriFactu schema uses 'id', not 'id_factura')
  id?: number;
  
  // VeriFactu required fields
  nif_emisor_factura: string;  // NIF del emisor
  num_serie_factura_emisor: string;  // Número de serie de la factura
  fecha_expedicion_factura: string;  // Fecha de expedición (YYYY-MM-DD)
  tipo_factura: string;  // F1, F2, F3, F4, R1-R5
  cuota_total?: number;  // Cuota total de la factura
  importe_total?: number;  // Importe total de la factura
  huella?: string;  // Hash/Huella de la factura
  fecha_hora_huso_gen_registro?: Date;  // Timestamp de generación
  operacion: string;  // A0, A1, AN (Alta normal, Alta registro previo, Anulación)
  tipo_comunicacion?: string;  // A0, A1, etc.
  estado_registro?: string;  // Estado: Correcta, Incompleta, Error
  codigo_seguro_verificacion?: string;  // CSV de AEAT
  qr?: string;  // Código QR
  
  // Compatibility fields (added by migration 20260303)
  xml_content?: string;
  validation_timestamp?: Date;
  validation_status?: string;
  validation_csv?: string;
  validation_errors?: string;
  id_factura_anterior?: number;  // Reference to previous invoice
  
  // Timestamps
  created_at?: Date;
  updated_at?: Date;
}

/**
 * Insert parameters for creating a factura
 * Uses VeriFactu field names
 */
export interface CreateFacturaParams {
  nif_emisor_factura: string;
  num_serie_factura_emisor: string;
  fecha_expedicion_factura: string;
  tipo_factura: string;
  cuota_total?: number;
  importe_total?: number;
  huella?: string;
  fecha_hora_huso_gen_registro?: Date;
  operacion: string;  // A0, A1, AN
  tipo_comunicacion?: string;
  estado_registro?: string;
  codigo_seguro_verificacion?: string;
  qr?: string;
  xml_content?: string;
  id_factura_anterior?: number;
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
   * Uses VeriFactu schema field names
   */
  async create(params: CreateFacturaParams): Promise<FacturaDB> {
    const query = `
      INSERT INTO facturas (
        nif_emisor_factura,
        num_serie_factura_emisor,
        fecha_expedicion_factura,
        tipo_factura,
        importe_total,
        cuota_total,
        huella,
        fecha_hora_huso_gen_registro,
        operacion,
        tipo_comunicacion,
        estado_registro,
        codigo_seguro_verificacion,
        qr,
        id_factura_anterior,
        xml_content
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `;

    const values = [
      params.nif_emisor_factura,
      params.num_serie_factura_emisor,
      params.fecha_expedicion_factura,
      params.tipo_factura,
      params.importe_total,
      params.cuota_total,
      params.huella,
      params.fecha_hora_huso_gen_registro || new Date(),
      params.operacion || 'A0',  // Default: Alta normal
      params.tipo_comunicacion || 'A0',
      params.estado_registro || 'Correcta',
      params.codigo_seguro_verificacion,
      params.qr,
      params.id_factura_anterior,
      params.xml_content,
    ];

    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Find factura by ID
   */
  async findById(id: number): Promise<FacturaDB | null> {
    const query = 'SELECT * FROM facturas WHERE id = $1';
    const result = await this.pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Find factura by series and number
   */
  async findBySeriesAndNumber(
    nifEmisor: string,
    numSerie: string
  ): Promise<FacturaDB | null> {
    const query = `
      SELECT * FROM facturas 
      WHERE nif_emisor_factura = $1 AND num_serie_factura_emisor = $2
      ORDER BY id DESC
      LIMIT 1
    `;
    const result = await this.pool.query(query, [nifEmisor, numSerie]);
    return result.rows[0] || null;
  }

  /**
   * Get all facturas for an issuer
   */
  async findByIssuer(nifEmisor: string, limit: number = 100): Promise<FacturaDB[]> {
    const query = `
      SELECT * FROM facturas 
      WHERE nif_emisor_factura = $1
      ORDER BY fecha_expedicion_factura DESC, id DESC
      LIMIT $2
    `;
    const result = await this.pool.query(query, [nifEmisor, limit]);
    return result.rows;
  }

  /**
   * Get the last factura for chaining
   */
  async getLastForChaining(nifEmisor: string): Promise<FacturaDB | null> {
    const query = `
      SELECT * FROM facturas 
      WHERE nif_emisor_factura = $1 AND huella IS NOT NULL
      ORDER BY fecha_hora_huso_gen_registro DESC, id DESC
      LIMIT 1
    `;
    const result = await this.pool.query(query, [nifEmisor]);
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
      WHERE id = $1
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
        fecha_hora_huso_gen_registro = $3,
        updated_at = NOW()
      WHERE id = $1
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
      SET estado_registro = 'Anulada', updated_at = NOW()
      WHERE id = $1
      RETURNING id
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
      ORDER BY fecha_expedicion_factura DESC, id DESC
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
