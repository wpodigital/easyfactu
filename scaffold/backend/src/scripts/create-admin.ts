/**
 * create-admin.ts
 *
 * One-time script to create the first administrator user.
 * Run with: npm run db:create-admin
 *
 * Optional arguments (positional):
 *   npm run db:create-admin -- "Your Name" admin@example.com YourPassword123
 *
 * Defaults:
 *   nombre:   Administrador
 *   email:    admin@easyfactu.es
 *   password: Admin1234!
 *
 * Note: This script automatically creates the 'usuarios' table if it does not
 * exist yet, so you do not need to run migrations manually before using it.
 */

import * as dotenv from "dotenv";
dotenv.config();

import { pool } from "../config/database";
import { usuariosRepository } from "../repositories/usuarios.repository";

/**
 * Ensures the usuarios table (and its supporting trigger) exist.
 * Safe to call multiple times – all statements use IF NOT EXISTS.
 */
async function ensureUsuariosTable(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id            SERIAL PRIMARY KEY,
      nombre        VARCHAR(200)  NOT NULL,
      email         VARCHAR(200)  UNIQUE NOT NULL,
      password_hash VARCHAR(255)  NOT NULL,
      rol           VARCHAR(20)   NOT NULL DEFAULT 'admin'
                      CHECK (rol IN ('admin', 'usuario', 'viewer')),
      activo        BOOLEAN       NOT NULL DEFAULT true,
      ultimo_acceso TIMESTAMPTZ,
      created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
      updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email)`
  );

  await pool.query(`
    CREATE OR REPLACE FUNCTION update_usuarios_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql
  `);

  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_trigger
        WHERE tgname = 'trg_usuarios_updated_at'
      ) THEN
        CREATE TRIGGER trg_usuarios_updated_at
          BEFORE UPDATE ON usuarios
          FOR EACH ROW EXECUTE FUNCTION update_usuarios_updated_at();
      END IF;
    END;
    $$
  `);
}

async function createAdmin() {
  const nombre = process.argv[2] || "Administrador";
  const email = process.argv[3] || "admin@easyfactu.es";
  const password = process.argv[4] || "Admin1234!";

  if (password.length < 8) {
    console.error("❌ La contraseña debe tener al menos 8 caracteres.");
    process.exit(1);
  }

  try {
    // Auto-create the schema so the script works even before running migrations.
    await ensureUsuariosTable();

    const total = await usuariosRepository.countAll();

    if (total > 0) {
      console.error(
        "❌ Ya existe un usuario registrado. El registro inicial ya fue completado.\n" +
          "   Si necesitas añadir más usuarios hazlo desde la aplicación\n" +
          "   (Configuración → Usuarios → Nuevo usuario)."
      );
      process.exit(1);
    }

    const user = await usuariosRepository.create({ nombre, email, password, rol: "admin" });

    console.log("");
    console.log("✅ Usuario administrador creado exitosamente");
    console.log("   ──────────────────────────────────────────");
    console.log(`   Nombre:     ${user.nombre}`);
    console.log(`   Email:      ${user.email}`);
    console.log(`   Contraseña: ${password}`);
    console.log("");
    console.log("   Ahora puedes iniciar sesión en la aplicación con estas credenciales.");
    console.log("");
    process.exit(0);
  } catch (error: any) {
    if (error.code === "23505") {
      console.error(`❌ El email '${email}' ya está registrado.`);
    } else {
      console.error("❌ Error al crear el usuario:", error.message);
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createAdmin();
