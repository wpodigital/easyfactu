import { Pool } from "pg";
import bcrypt from "bcryptjs";
import { pool } from "../config/database";

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  activo: boolean;
  ultimo_acceso: string | null;
  created_at: string;
}

export interface CreateUsuarioParams {
  nombre: string;
  email: string;
  password: string;
  rol?: string;
}

export interface UpdateUsuarioParams {
  nombre?: string;
  email?: string;
  password?: string;
  rol?: string;
  activo?: boolean;
}

const SALT_ROUNDS = 12;

class UsuariosRepository {
  private pool: Pool;

  constructor(poolInstance: Pool) {
    this.pool = poolInstance;
  }

  async findAll(): Promise<Usuario[]> {
    const result = await this.pool.query(
      `SELECT id, nombre, email, rol, activo, ultimo_acceso, created_at
       FROM usuarios ORDER BY created_at ASC`
    );
    return result.rows;
  }

  async findByEmail(email: string): Promise<(Usuario & { password_hash: string }) | null> {
    const result = await this.pool.query(
      `SELECT id, nombre, email, password_hash, rol, activo, ultimo_acceso, created_at
       FROM usuarios WHERE email = $1`,
      [email.toLowerCase().trim()]
    );
    return result.rows[0] || null;
  }

  async findById(id: number): Promise<Usuario | null> {
    const result = await this.pool.query(
      `SELECT id, nombre, email, rol, activo, ultimo_acceso, created_at
       FROM usuarios WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async create(params: CreateUsuarioParams): Promise<Usuario> {
    const passwordHash = await bcrypt.hash(params.password, SALT_ROUNDS);
    const result = await this.pool.query(
      `INSERT INTO usuarios (nombre, email, password_hash, rol)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nombre, email, rol, activo, ultimo_acceso, created_at`,
      [
        params.nombre.trim(),
        params.email.toLowerCase().trim(),
        passwordHash,
        params.rol || "admin",
      ]
    );
    return result.rows[0];
  }

  async update(id: number, params: UpdateUsuarioParams): Promise<Usuario | null> {
    const sets: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (params.nombre !== undefined) { sets.push(`nombre = $${idx++}`); values.push(params.nombre.trim()); }
    if (params.email !== undefined)  { sets.push(`email = $${idx++}`);  values.push(params.email.toLowerCase().trim()); }
    if (params.rol !== undefined)    { sets.push(`rol = $${idx++}`);    values.push(params.rol); }
    if (params.activo !== undefined) { sets.push(`activo = $${idx++}`); values.push(params.activo); }
    if (params.password !== undefined) {
      const hash = await bcrypt.hash(params.password, SALT_ROUNDS);
      sets.push(`password_hash = $${idx++}`);
      values.push(hash);
    }

    if (sets.length === 0) return this.findById(id);

    values.push(id);
    const result = await this.pool.query(
      `UPDATE usuarios SET ${sets.join(", ")} WHERE id = $${idx}
       RETURNING id, nombre, email, rol, activo, ultimo_acceso, created_at`,
      values
    );
    return result.rows[0] || null;
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.pool.query(
      `DELETE FROM usuarios WHERE id = $1`,
      [id]
    );
    return (result.rowCount ?? 0) > 0;
  }

  async updateLastAccess(id: number): Promise<void> {
    await this.pool.query(
      `UPDATE usuarios SET ultimo_acceso = NOW() WHERE id = $1`,
      [id]
    );
  }

  async countAll(): Promise<number> {
    const result = await this.pool.query(`SELECT COUNT(*) FROM usuarios`);
    return parseInt(result.rows[0].count, 10);
  }

  async verifyPassword(plainPassword: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hash);
  }
}

export const usuariosRepository = new UsuariosRepository(pool);
