import { pool } from '../config/database';

export interface ConfiguracionItem {
  id: number;
  clave: string;
  valor: string | null;
  tipo: string;
  descripcion?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

export const configuracionRepository = {
  async get(clave: string): Promise<string | null> {
    const result = await pool.query<ConfiguracionItem>(
      'SELECT valor FROM configuracion WHERE clave = $1',
      [clave]
    );

    return result.rows[0]?.valor ?? null;
  },

  async set(clave: string, valor: string, tipo?: string) {
    const tipoDetectado =
      tipo ||
      (clave.startsWith('empresa_')
        ? 'empresa'
        : clave.startsWith('facturacion_')
        ? 'facturacion'
        : 'usuario');

    const result = await pool.query<ConfiguracionItem>(
      `
      INSERT INTO configuracion (clave, valor, tipo)
      VALUES ($1, $2, $3)
      ON CONFLICT (clave)
      DO UPDATE SET valor = EXCLUDED.valor, tipo = EXCLUDED.tipo, updated_at = NOW()
      RETURNING *
      `,
      [clave, valor, tipoDetectado]
    );

    return result.rows[0];
  },

  async getAll(tipo?: string): Promise<ConfiguracionItem[]> {
    if (tipo) {
      const result = await pool.query<ConfiguracionItem>(
        'SELECT * FROM configuracion WHERE tipo = $1 ORDER BY clave ASC',
        [tipo]
      );
      return result.rows;
    }

    const result = await pool.query<ConfiguracionItem>(
      'SELECT * FROM configuracion ORDER BY tipo ASC, clave ASC'
    );
    return result.rows;
  },

  async getGrouped() {
    const rows = await this.getAll();

    const grouped = {
      empresa: {} as Record<string, string>,
      facturacion: {} as Record<string, string>,
      usuario: {} as Record<string, string>,
    };

    for (const row of rows) {
      if (row.tipo === 'empresa') grouped.empresa[row.clave] = row.valor ?? '';
      if (row.tipo === 'facturacion') grouped.facturacion[row.clave] = row.valor ?? '';
      if (row.tipo === 'usuario') grouped.usuario[row.clave] = row.valor ?? '';
    }

    return grouped;
  },
};