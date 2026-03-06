# Guía de Implementación: Proveedores y Facturas Emitidas

**Fecha**: 2026-03-04  
**Objetivo**: Implementar CRUD completo para Proveedores y Facturas Emitidas

---

## 📋 Resumen

Esta guía contiene el código completo para implementar:
1. **Proveedores** - CRUD completo (similar a Clientes)
2. **Facturas Emitidas** - Gestión completa de facturas

---

## 🚀 Pasos de Implementación

### Paso 1: Backend - Proveedores Repository

**Archivo**: `scaffold/backend/src/repositories/proveedores.repository.ts`

```typescript
import { Pool, PoolClient } from 'pg';
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

export interface UpdateProveedorParams extends Partial<CreateProveedorParams> {}

export class ProveedoresRepository {
  private pool: Pool;

  constructor(poolInstance: Pool = pool) {
    this.pool = poolInstance;
  }

  async create(params: CreateProveedorParams): Promise<ProveedorDB> {
    const query = `
      INSERT INTO proveedores (
        nif, nombre_razon_social, nombre_comercial, email, telefono, movil, fax, web,
        direccion, codigo_postal, ciudad, provincia, pais,
        tipo_identificacion, tipo_proveedor, regimen_iva,
        forma_pago, dias_pago, descuento_comercial
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING *
    `;

    const values = [
      params.nif,
      params.nombre_razon_social,
      params.nombre_comercial || null,
      params.email || null,
      params.telefono || null,
      params.movil || null,
      params.fax || null,
      params.web || null,
      params.direccion || null,
      params.codigo_postal || null,
      params.ciudad || null,
      params.provincia || null,
      params.pais || 'España',
      params.tipo_identificacion || null,
      params.tipo_proveedor || null,
      params.regimen_iva || null,
      params.forma_pago || null,
      params.dias_pago || 30,
      params.descuento_comercial || 0
    ];

    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async findById(id: number): Promise<ProveedorDB | null> {
    const query = 'SELECT * FROM proveedores WHERE id = $1';
    const result = await this.pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async findByNif(nif: string): Promise<ProveedorDB | null> {
    const query = 'SELECT * FROM proveedores WHERE nif = $1';
    const result = await this.pool.query(query, [nif]);
    return result.rows[0] || null;
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    activo?: boolean;
  } = {}): Promise<{ proveedores: ProveedorDB[]; total: number }> {
    const page = params.page || 1;
    const limit = params.limit || 50;
    const offset = (page - 1) * limit;

    let whereConditions: string[] = [];
    let queryParams: any[] = [];
    let paramIndex = 1;

    if (params.activo !== undefined) {
      whereConditions.push(`activo = $${paramIndex}`);
      queryParams.push(params.activo);
      paramIndex++;
    }

    if (params.search) {
      whereConditions.push(`(
        nombre_razon_social ILIKE $${paramIndex} OR
        nombre_comercial ILIKE $${paramIndex} OR
        nif ILIKE $${paramIndex} OR
        email ILIKE $${paramIndex}
      )`);
      queryParams.push(`%${params.search}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // Count query
    const countQuery = `SELECT COUNT(*) FROM proveedores ${whereClause}`;
    const countResult = await this.pool.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].count);

    // Data query
    const dataQuery = `
      SELECT * FROM proveedores
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    queryParams.push(limit, offset);

    const dataResult = await this.pool.query(dataQuery, queryParams);

    return {
      proveedores: dataResult.rows,
      total
    };
  }

  async update(id: number, params: UpdateProveedorParams): Promise<ProveedorDB | null> {
    const setStatements: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        setStatements.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    if (setStatements.length === 0) {
      return this.findById(id);
    }

    values.push(id);

    const query = `
      UPDATE proveedores
      SET ${setStatements.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.pool.query(query, values);
    return result.rows[0] || null;
  }

  async delete(id: number): Promise<boolean> {
    // Soft delete
    const query = 'UPDATE proveedores SET activo = false WHERE id = $1';
    const result = await this.pool.query(query, [id]);
    return result.rowCount! > 0;
  }

  async hardDelete(id: number): Promise<boolean> {
    const query = 'DELETE FROM proveedores WHERE id = $1';
    const result = await this.pool.query(query, [id]);
    return result.rowCount! > 0;
  }

  async count(activo?: boolean): Promise<number> {
    let query = 'SELECT COUNT(*) FROM proveedores';
    const params: any[] = [];

    if (activo !== undefined) {
      query += ' WHERE activo = $1';
      params.push(activo);
    }

    const result = await this.pool.query(query, params);
    return parseInt(result.rows[0].count);
  }
}

export const proveedoresRepository = new ProveedoresRepository();
```

---

### Paso 2: Backend - Añadir Endpoints API

**Archivo**: `scaffold/backend/src/index.ts`

Añadir estos endpoints después de los endpoints de clientes:

```typescript
// ============================================
// PROVEEDORES ENDPOINTS
// ============================================

// Get all proveedores
app.get('/api/v1/proveedores', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const search = req.query.search as string;
    const activo = req.query.activo === 'false' ? false : undefined;

    const { proveedores, total } = await proveedoresRepository.findAll({
      page,
      limit,
      search,
      activo
    });

    res.json({
      proveedores,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching proveedores:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get proveedor by ID
app.get('/api/v1/proveedores/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const proveedor = await proveedoresRepository.findById(id);

    if (!proveedor) {
      return res.status(404).json({ error: 'Proveedor not found' });
    }

    res.json(proveedor);
  } catch (error) {
    console.error('Error fetching proveedor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get proveedor by NIF
app.get('/api/v1/proveedores/nif/:nif', async (req: Request, res: Response) => {
  try {
    const { nif } = req.params;
    const proveedor = await proveedoresRepository.findByNif(nif);

    if (!proveedor) {
      return res.status(404).json({ error: 'Proveedor not found' });
    }

    res.json(proveedor);
  } catch (error) {
    console.error('Error fetching proveedor by NIF:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create proveedor
app.post('/api/v1/proveedores', async (req: Request, res: Response) => {
  try {
    const proveedorData = req.body;

    // Validation
    if (!proveedorData.nif || !proveedorData.nombre_razon_social) {
      return res.status(400).json({ error: 'NIF and nombre_razon_social are required' });
    }

    // Check for duplicate NIF
    const existing = await proveedoresRepository.findByNif(proveedorData.nif);
    if (existing) {
      return res.status(409).json({ error: 'Proveedor with this NIF already exists' });
    }

    const proveedor = await proveedoresRepository.create(proveedorData);
    res.status(201).json(proveedor);
  } catch (error) {
    console.error('Error creating proveedor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update proveedor
app.put('/api/v1/proveedores/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const proveedor = await proveedoresRepository.update(id, req.body);

    if (!proveedor) {
      return res.status(404).json({ error: 'Proveedor not found' });
    }

    res.json(proveedor);
  } catch (error) {
    console.error('Error updating proveedor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete proveedor (soft delete)
app.delete('/api/v1/proveedores/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const success = await proveedoresRepository.delete(id);

    if (!success) {
      return res.status(404).json({ error: 'Proveedor not found' });
    }

    res.json({ message: 'Proveedor deleted successfully' });
  } catch (error) {
    console.error('Error deleting proveedor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get proveedores stats
app.get('/api/v1/proveedores/stats', async (req: Request, res: Response) => {
  try {
    const total = await proveedoresRepository.count();
    const activos = await proveedoresRepository.count(true);

    res.json({
      total,
      activos,
      inactivos: total - activos
    });
  } catch (error) {
    console.error('Error fetching proveedores stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

También añadir el import al principio del archivo:

```typescript
import { proveedoresRepository } from './repositories/proveedores.repository';
```

---

## 📝 Próximos Pasos

1. Copia el código del repository a `scaffold/backend/src/repositories/proveedores.repository.ts`
2. Añade los endpoints al archivo `scaffold/backend/src/index.ts`
3. Ejecuta `.\scripts\db-setup.ps1` para crear la tabla
4. Reinicia el backend
5. Prueba los endpoints con Postman o test-api.ps1

En el siguiente commit te enviaré el código del frontend (Proveedores.tsx y FacturasEmitidas.tsx).

---

**Estado**: Backend Proveedores completo ✅  
**Siguiente**: Frontend Proveedores.tsx + FacturasEmitidas.tsx
