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
 */

import * as dotenv from "dotenv";
dotenv.config();

import { pool } from "../config/database";
import { usuariosRepository } from "../repositories/usuarios.repository";

async function createAdmin() {
  const nombre = process.argv[2] || "Administrador";
  const email = process.argv[3] || "admin@easyfactu.es";
  const password = process.argv[4] || "Admin1234!";

  if (password.length < 8) {
    console.error("❌ La contraseña debe tener al menos 8 caracteres.");
    process.exit(1);
  }

  try {
    const total = await usuariosRepository.countAll();

    if (total > 0) {
      console.error(
        "❌ Ya existe un usuario registrado. El registro inicial ya fue completado.\n" +
          "   Si necesitas añadir más usuarios hazlo desde la aplicación."
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
