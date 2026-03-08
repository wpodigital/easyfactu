import { pool } from '../config/database';

export interface FacturaRecibida {
  id: number;
  numero_factura: string;
  proveedor_id: number;
  fecha_factura: string;
  fecha_vencimiento?: string;
  base_imponible: number;
  iva_total: number;
  importe_total: number;
  estado: string;
  fecha_pago?: string;
  notas?: string;
  created_at?: Date;
}

export const facturasRecibidasRepository = {

  async create(data: any) {
    const query = `
      INSERT INTO facturas_recibidas (
        numero_factura,
        proveedor_id,
        fecha_factura,
        fecha_vencimiento,
        base_imponible,
        iva_total,
        importe_total,
        estado,
        notas
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *
    `;

    const values = [
      data.numero_factura,
      data.proveedor_id,
      data.fecha_factura,
      data.fecha_vencimiento,
      data.base_imponible,
      data.iva_total,
      data.importe_total,
      data.estado || 'pendiente',
      data.notas
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async findAll() {
    const query = `
      SELECT fr.*, p.nombre_razon_social as proveedor_nombre
      FROM facturas_recibidas fr
      LEFT JOIN proveedores p ON fr.proveedor_id = p.id
      ORDER BY fr.fecha_factura DESC
    `;

    const result = await pool.query(query);
    return result.rows;
  },

  async findById(id: number) {
    const result = await pool.query(
      'SELECT * FROM facturas_recibidas WHERE id = $1',
      [id]
    );

    return result.rows[0];
  },

  async markAsPaid(id: number, fechaPago: Date) {
    const query = `
      UPDATE facturas_recibidas
      SET estado = 'pagada',
          fecha_pago = $1
      WHERE id = $2
      RETURNING *
    `;

    const result = await pool.query(query, [fechaPago, id]);
    return result.rows[0];
  },

  async delete(id: number) {
    const result = await pool.query(
      'DELETE FROM facturas_recibidas WHERE id = $1',
      [id]
    );

    return result.rowCount ? result.rowCount > 0 : false;
  }
};