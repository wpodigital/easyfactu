import { pool } from '../config/database';

export interface ProveedorDB {
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
  tipo_proveedor?: string;
  regimen_iva?: string;
  forma_pago?: string;
  dias_pago?: number;
  descuento_comercial?: number;
  activo: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateProveedorParams {
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
  tipo_proveedor?: string;
  regimen_iva?: string;
  forma_pago?: string;
  dias_pago?: number;
  descuento_comercial?: number;
}

export const proveedoresRepository = {
  async create(params: CreateProveedorParams): Promise<ProveedorDB> {
    const query = `
      INSERT INTO proveedores (
        nif, nombre_razon_social, nombre_comercial, email, telefono, movil, fax, web,
        direccion, codigo_postal, ciudad, provincia, pais,
        tipo_identificacion, tipo_proveedor, regimen_iva, forma_pago, dias_pago, descuento_comercial
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING *
    `;

    const values = [
      params.nif,
      params.nombre_razon_social,
      params.nombre_comercial,
      params.email,
      params.telefono,
      params.movil,
      params.fax,
      params.web,
      params.direccion,
      params.codigo_postal,
      params.ciudad,
      params.provincia,
      params.pais || 'España',
      params.tipo_identificacion,
      params.tipo_proveedor,
      params.regimen_iva,
      params.forma_pago,
      params.dias_pago,
      params.descuento_comercial
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async findById(id: number): Promise<ProveedorDB | null> {
    const query = 'SELECT * FROM proveedores WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  },

  async findByNif(nif: string): Promise<ProveedorDB | null> {
    const query = 'SELECT * FROM proveedores WHERE nif = $1';
    const result = await pool.query(query, [nif]);
    return result.rows[0] || null;
  },

  async findAll(options?: {
    page?: number;
    limit?: number;
    search?: string;
    activo?: boolean;
  }): Promise<{ proveedores: ProveedorDB[]; total: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 50;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const values: any[] = [];
    let paramIndex = 1;

    if (options?.activo !== undefined) {
      whereClause += ` AND activo = $${paramIndex}`;
      values.push(options.activo);
      paramIndex++;
    }

    if (options?.search) {
      whereClause += ` AND (
        nombre_razon_social ILIKE $${paramIndex} OR
        nombre_comercial ILIKE $${paramIndex} OR
        nif ILIKE $${paramIndex} OR
        email ILIKE $${paramIndex}
      )`;
      values.push(`%${options.search}%`);
      paramIndex++;
    }

    const countQuery = `SELECT COUNT(*) FROM proveedores ${whereClause}`;
    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].count);

    const query = `
      SELECT * FROM proveedores
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    values.push(limit, offset);
    const result = await pool.query(query, values);

    return {
      proveedores: result.rows,
      total
    };
  },

  async update(id: number, params: Partial<CreateProveedorParams>): Promise<ProveedorDB | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE proveedores
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  },

  async delete(id: number): Promise<boolean> {
    const query = 'UPDATE proveedores SET activo = false, updated_at = NOW() WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount ? result.rowCount > 0 : false;
  },

  async hardDelete(id: number): Promise<boolean> {
    const query = 'DELETE FROM proveedores WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount ? result.rowCount > 0 : false;
  },

  async count(): Promise<number> {
    const query = 'SELECT COUNT(*) FROM proveedores WHERE activo = true';
    const result = await pool.query(query);
    return parseInt(result.rows[0].count);
  }
};
