// Client Repository - Data Access Layer for Clientes
import { Pool, PoolClient } from 'pg';

export interface Cliente {
  id: number;
  nif: string;
  nombre_razon_social: string;
  nombre_comercial?: string;
  email?: string;
  telefono?: string;
  movil?: string;
  fax?: string;
  web?: string;
  direccion?: string;
  codigo_postal?: string;
  ciudad?: string;
  provincia?: string;
  pais?: string;
  tipo_identificacion?: string;
  tipo_cliente?: string;
  regimen_iva?: string;
  forma_pago?: string;
  dias_pago?: number;
  descuento_comercial?: number;
  limite_credito?: number;
  notas?: string;
  activo?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateClienteParams {
  nif: string;
  nombre_razon_social: string;
  nombre_comercial?: string;
  email?: string;
  telefono?: string;
  movil?: string;
  direccion?: string;
  codigo_postal?: string;
  ciudad?: string;
  provincia?: string;
  pais?: string;
  tipo_identificacion?: string;
  tipo_cliente?: string;
  regimen_iva?: string;
  forma_pago?: string;
  dias_pago?: number;
  descuento_comercial?: number;
  limite_credito?: number;
  notas?: string;
}

export interface UpdateClienteParams extends Partial<CreateClienteParams> {
  activo?: boolean;
}

export class ClientesRepository {
  constructor(private pool: Pool) {}

  async create(params: CreateClienteParams): Promise<Cliente> {
    const query = `
      INSERT INTO clientes (
        nif, nombre_razon_social, nombre_comercial, email, telefono, movil,
        direccion, codigo_postal, ciudad, provincia, pais,
        tipo_identificacion, tipo_cliente, regimen_iva,
        forma_pago, dias_pago, descuento_comercial, limite_credito, notas
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING *
    `;

    const values = [
      params.nif,
      params.nombre_razon_social,
      params.nombre_comercial,
      params.email,
      params.telefono,
      params.movil,
      params.direccion,
      params.codigo_postal,
      params.ciudad,
      params.provincia,
      params.pais || 'ES',
      params.tipo_identificacion || 'NIF',
      params.tipo_cliente || 'NACIONAL',
      params.regimen_iva || 'GENERAL',
      params.forma_pago,
      params.dias_pago || 30,
      params.descuento_comercial || 0,
      params.limite_credito,
      params.notas,
    ];

    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async findById(id: number): Promise<Cliente | null> {
    const query = 'SELECT * FROM clientes WHERE id = $1';
    const result = await this.pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async findByNif(nif: string): Promise<Cliente | null> {
    const query = 'SELECT * FROM clientes WHERE nif = $1';
    const result = await this.pool.query(query, [nif]);
    return result.rows[0] || null;
  }

  async list(params: {
    page?: number;
    limit?: number;
    search?: string;
    activo?: boolean;
    tipo_cliente?: string;
  } = {}): Promise<{ clientes: Cliente[]; total: number }> {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const offset = (page - 1) * limit;

    let whereConditions: string[] = [];
    let queryParams: any[] = [];
    let paramIndex = 1;

    if (params.activo !== undefined) {
      whereConditions.push(`activo = $${paramIndex++}`);
      queryParams.push(params.activo);
    }

    if (params.tipo_cliente) {
      whereConditions.push(`tipo_cliente = $${paramIndex++}`);
      queryParams.push(params.tipo_cliente);
    }

    if (params.search) {
      whereConditions.push(
        `(nombre_razon_social ILIKE $${paramIndex} OR nif ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`
      );
      queryParams.push(`%${params.search}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Count total
    const countQuery = `SELECT COUNT(*) FROM clientes ${whereClause}`;
    const countResult = await this.pool.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].count);

    // Get paginated results
    const dataQuery = `
      SELECT * FROM clientes
      ${whereClause}
      ORDER BY nombre_razon_social ASC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    const dataResult = await this.pool.query(dataQuery, [...queryParams, limit, offset]);

    return {
      clientes: dataResult.rows,
      total,
    };
  }

  async update(id: number, params: UpdateClienteParams): Promise<Cliente | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    const allowedFields = [
      'nombre_razon_social', 'nombre_comercial', 'email', 'telefono', 'movil', 'fax', 'web',
      'direccion', 'codigo_postal', 'ciudad', 'provincia', 'pais',
      'tipo_identificacion', 'tipo_cliente', 'regimen_iva',
      'forma_pago', 'dias_pago', 'descuento_comercial', 'limite_credito',
      'notas', 'activo', 'nif'
    ];

    for (const field of allowedFields) {
      if (params[field as keyof UpdateClienteParams] !== undefined) {
        updates.push(`${field} = $${paramIndex++}`);
        values.push(params[field as keyof UpdateClienteParams]);
      }
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    values.push(id);

    const query = `
      UPDATE clientes
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.pool.query(query, values);
    return result.rows[0] || null;
  }

  async delete(id: number): Promise<boolean> {
    // Soft delete - set activo = false
    const query = 'UPDATE clientes SET activo = false WHERE id = $1';
    const result = await this.pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  async hardDelete(id: number): Promise<boolean> {
    // Hard delete - actually remove from database
    const query = 'DELETE FROM clientes WHERE id = $1';
    const result = await this.pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  async count(): Promise<number> {
    const query = 'SELECT COUNT(*) FROM clientes WHERE activo = true';
    const result = await this.pool.query(query);
    return parseInt(result.rows[0].count);
  }
}
