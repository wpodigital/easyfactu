import express, { Request, Response, NextFunction } from "express";
import { testConnection, initializeDatabase, closePool } from "./config/database";
import { facturasRepository, CreateFacturaParams } from "./repositories/facturas.repository";
import { ClientesRepository, CreateClienteParams, UpdateClienteParams } from "./repositories/clientes.repository";
import { proveedoresRepository, CreateProveedorParams } from "./repositories/proveedores.repository";
import { facturasRecibidasRepository } from "./repositories/facturas_recibidas.repository";
import { configuracionRepository } from "./repositories/configuracion.repository";
import { certificadosRepository } from "./repositories/certificados.repository";
import { usuariosRepository } from "./repositories/usuarios.repository";
import multer from "multer";
import { pool } from "./config/database";
import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";

const clientesRepository = new ClientesRepository(pool);

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Disk storage for factura attachments
const facturasArchivosStorage = multer.diskStorage({
  destination: (req: Request, _file: any, cb: (error: Error | null, destination: string) => void) => {
    const facturaId = (req.params as Record<string, string>).id || "unknown";
    const dir = path.join(__dirname, "..", "uploads", "facturas-recibidas", facturaId);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req: Request, file: any, cb: (error: Error | null, filename: string) => void) => {
    const timestamp = Date.now();
    const safeName = (file.originalname as string).replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${timestamp}_${safeName}`);
  },
});
const uploadArchivos = multer({
  storage: facturasArchivosStorage,
  fileFilter: (_req: Request, file: any, cb: multer.FileFilterCallback) => {
    if ((file.mimetype as string) === "application/pdf" || (file.originalname as string).toLowerCase().endsWith(".pdf")) {
      cb(null, true);
    } else {
      cb(new Error("Solo se permiten archivos PDF"));
    }
  },
  limits: { fileSize: 20 * 1024 * 1024, files: 10 }, // 20 MB per file, max 10 files
});

app.use(express.json());
app.use(express.text({ type: "application/xml" }));

// ─────────────────────────────────────────────
// JWT helpers
// ─────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET || "easyfactu_dev_secret_change_in_production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "8h";

interface JwtPayload {
  userId: number;
  email: string;
  rol: string;
}

// Extend Express Request to carry the authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * JWT authentication middleware – protects all /api/v1/ routes
 * except /api/v1/auth/* which are public.
 */
function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "No autenticado. Inicia sesión." });
    return;
  }
  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Token inválido o expirado. Inicia sesión de nuevo." });
  }
}

// ─────────────────────────────────────────────
// Auth endpoints (public – no JWT required)
// ─────────────────────────────────────────────

/** Rate limiter for auth endpoints: max 10 attempts per 15 minutes per IP */
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiados intentos. Espera 15 minutos antes de volver a intentarlo." },
});

/**
 * POST /api/v1/auth/login
 * Authenticates a user and returns a JWT token.
 */
app.post("/api/v1/auth/login", authRateLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) {
      return res.status(400).json({ error: "Email y contraseña son obligatorios." });
    }
    const user = await usuariosRepository.findByEmail(email);
    if (!user || !user.activo) {
      return res.status(401).json({ error: "Credenciales incorrectas." });
    }
    const valid = await usuariosRepository.verifyPassword(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: "Credenciales incorrectas." });
    }
    await usuariosRepository.updateLastAccess(user.id);
    const payload: JwtPayload = { userId: user.id, email: user.email, rol: user.rol };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
    res.json({
      token,
      user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol },
    });
  } catch (error: any) {
    console.error("Error in login:", error);
    res.status(500).json({ error: "Error interno del servidor.", details: error.message });
  }
});

/**
 * POST /api/v1/auth/register
 * Creates the first admin user. Disabled once a user already exists.
 */
app.post("/api/v1/auth/register", authRateLimiter, async (req: Request, res: Response) => {
  try {
    const total = await usuariosRepository.countAll();
    if (total > 0) {
      return res.status(403).json({ error: "El registro inicial ya se realizó. Contacta con el administrador." });
    }
    const { nombre, email, password } = req.body as { nombre?: string; email?: string; password?: string };
    if (!nombre || !email || !password) {
      return res.status(400).json({ error: "nombre, email y contraseña son obligatorios." });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: "La contraseña debe tener al menos 8 caracteres." });
    }
    const user = await usuariosRepository.create({ nombre, email, password, rol: "admin" });
    const payload: JwtPayload = { userId: user.id, email: user.email, rol: user.rol };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
    res.status(201).json({
      token,
      user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol },
    });
  } catch (error: any) {
    console.error("Error in register:", error);
    if (error.code === "23505") {
      return res.status(409).json({ error: "Este email ya está registrado." });
    }
    res.status(500).json({ error: "Error interno del servidor.", details: error.message });
  }
});

/**
 * GET /api/v1/auth/needs-setup
 * Returns whether the initial admin registration is still pending.
 * Public endpoint — no authentication required.
 */
app.get("/api/v1/auth/needs-setup", async (_req: Request, res: Response) => {
  try {
    const total = await usuariosRepository.countAll();
    res.json({ needsSetup: total === 0 });
  } catch (error: any) {
    res.status(500).json({ error: "Error interno del servidor.", details: error.message });
  }
});

/**
 * GET /api/v1/auth/me
 * Returns the current authenticated user's info.
 */
app.get("/api/v1/auth/me", authRateLimiter, requireAuth, async (req: Request, res: Response) => {
  try {
    const user = await usuariosRepository.findById(req.user!.userId);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado." });
    res.json({ user });
  } catch (error: any) {
    res.status(500).json({ error: "Error interno del servidor.", details: error.message });
  }
});

// ─────────────────────────────────────────────
// Protect all remaining /api/v1/ routes with JWT
// ─────────────────────────────────────────────
app.use("/api/v1/", requireAuth);

/**
 * POST /api/v1/invoices
 * Create a new invoice (Alta - Registration)
 */
app.post("/api/v1/invoices", async (req: Request, res: Response) => {
  try {
    const data = req.body;
    
    // Parse invoice data from request using VeriFactu field names
    const facturaData: CreateFacturaParams = {
      id_emisor_factura: data.NIF || data.nif || data.IDEmisorFactura || data.idEmisor || '',
      nombre_razon_emisor: data.NombreRazon || data.nombreRazon || data.nombre || 'Sin nombre',
      num_serie_factura: data.NumeroSerie || data.numeroSerie || data.NumSerieFactura || data.numSerie || '',
      fecha_expedicion_factura: data.FechaExpedicion || data.fecha || data.FechaExpedicionFactura || new Date().toISOString().split('T')[0],
      tipo_factura: data.TipoFactura || data.tipo || 'F1',
      importe_total: parseFloat(data.ImporteTotal || data.importe || 0),
      cuota_total: parseFloat(data.CuotaTotal || data.cuota || 0),
      operacion: data.Operacion || data.operacion || 'A0',  // A0 = Alta normal
      estado_registro: 'Correcta',  // Initial state
    };
    
    // Get previous invoice for chaining
    const previousInvoice = await facturasRepository.getLastForChaining(
      facturaData.id_emisor_factura
    );
    
    if (previousInvoice) {
      facturaData.id_factura_anterior = previousInvoice.id;
    }
    
    // Store XML if provided
    if (typeof req.body === 'string' && req.body.includes('<?xml')) {
      facturaData.xml_content = req.body;
    }
    
    // For hash calculation, we'll do it in a separate step
    // For now, just create a placeholder
    const fechaHoraHuella = new Date();
    facturaData.huella = `HASH-${Date.now()}`;
    facturaData.fecha_hora_huso_gen_registro = fechaHoraHuella;
    
    // Insert into database
    const factura = await facturasRepository.create(facturaData);
    
    res.status(201).json({
      id: factura.id,
      nif: factura.id_emisor_factura,
      numSerie: factura.num_serie_factura,
      fecha: factura.fecha_expedicion_factura,
      status: factura.estado_registro,
      huella: factura.huella,
      timestamp: factura.created_at,
      message: 'Invoice created successfully. Use POST /api/v1/invoices/:id/validate to submit to AEAT.',
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(400).json({
      error: 'Invalid request',
      message: (error as Error).message,
    });
  }
});

/**
 * GET /api/v1/invoices/:id
 * Get invoice details
 */
app.get("/api/v1/invoices/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const factura = await facturasRepository.findById(id);
    
    if (!factura) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    res.json({
      id: factura.id,
      nif: factura.id_emisor_factura,
      numSerie: factura.num_serie_factura,
      fecha: factura.fecha_expedicion_factura,
      tipoFactura: factura.tipo_factura,
      importeTotal: factura.importe_total,
      cuotaTotal: factura.cuota_total,
      huella: factura.huella,
      operacion: factura.operacion,
      estadoRegistro: factura.estado_registro,
      validationStatus: factura.validation_status,
      validationCSV: factura.validation_csv,
      timestamp: factura.created_at,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: (error as Error).message,
    });
  }
});

/**
 * POST /api/v1/invoices/:id/validate
 * Validate invoice with AEAT
 * Accepts either numeric ID or series number (e.g., "TEST-001")
 */
app.post("/api/v1/invoices/:id/validate", async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id;
    let factura;
    
    // Try numeric ID first
    if (!isNaN(parseInt(idParam, 10))) {
      factura = await facturasRepository.findById(parseInt(idParam, 10));
    } else {
      // Try to find by series number
      // Format expected: "SERIES-NUMBER" or just "NUMBER"
      const parts = idParam.split('-');
      const series = parts.length > 1 ? parts[0] : '';
      factura = await facturasRepository.findBySeriesAndNumber(series, idParam);
    }
    
    if (!factura) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    // Simulate validation process (replace with real AEAT integration)
    const validationStatus = 'Correcto';
    const csv = `CSV-${Date.now()}`;
    
    if (!factura.id) {
      throw new Error('Invoice ID is required');
    }
    
    const updated = await facturasRepository.updateValidationStatus(
      factura.id,
      validationStatus,
      csv,
      undefined
    );
    
    res.json({
      id: updated?.id,
      validationResult: {
        estado: validationStatus,
        csv: csv,
        message: 'Invoice validated successfully (simulated)',
      },
      timestamp: updated?.validation_timestamp,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Validation failed',
      message: (error as Error).message,
    });
  }
});

/**
 * GET /api/v1/invoices/:id/status
 * Get validation status
 */
app.get("/api/v1/invoices/:id/status", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const factura = await facturasRepository.findById(id);
    
    if (!factura) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    res.json({
      id: factura.id,
      status: factura.estado_registro,
      validationStatus: factura.validation_status,
      validationCSV: factura.validation_csv,
      validationTimestamp: factura.validation_timestamp,
      timestamp: factura.created_at,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: (error as Error).message,
    });
  }
});

/**
 * DELETE /api/v1/invoices/:id
 * Cancel invoice (Anulacion)
 */
app.delete("/api/v1/invoices/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const factura = await facturasRepository.findById(id);
    
    if (!factura) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    const deleted = await facturasRepository.delete(id);
    
    if (deleted) {
      res.json({
        id,
        status: 'cancelled',
        timestamp: new Date().toISOString(),
        message: 'Invoice cancelled successfully',
      });
    } else {
      res.status(500).json({ error: 'Failed to cancel invoice' });
    }
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: (error as Error).message,
    });
  }
});

/**
 * GET /api/v1/invoices/stats
 * Get invoice statistics
 */
app.get("/api/v1/invoices/stats", async (req: Request, res: Response) => {
  try {
    const rows = await facturasRepository.rawQuery<{
      total: string;
      anuladas: string;
      validadas: string;
      pendientes: string;
      importe_total: string;
    }>(`
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE estado_registro = 'Anulada') AS anuladas,
        COUNT(*) FILTER (WHERE validation_status = 'Correcto' AND estado_registro != 'Anulada') AS validadas,
        COUNT(*) FILTER (WHERE (validation_status IS NULL OR validation_status != 'Correcto') AND estado_registro != 'Anulada') AS pendientes,
        COALESCE(SUM(importe_total) FILTER (WHERE estado_registro != 'Anulada'), 0) AS importe_total
      FROM facturas
    `);
    const row = rows[0];
    res.json({
      total: parseInt(row.total, 10),
      validadas: parseInt(row.validadas, 10),
      pendientes: parseInt(row.pendientes, 10),
      anuladas: parseInt(row.anuladas, 10),
      importeTotal: parseFloat(row.importe_total),
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: (error as Error).message,
    });
  }
});

/**
 * GET /api/v1/invoices
 * List all invoices
 */
app.get("/api/v1/invoices", async (req: Request, res: Response) => {
  try {
    const { idEmisor, limit = '50', offset = '0' } = req.query;
    
    let facturas;
    if (idEmisor && typeof idEmisor === 'string') {
      facturas = await facturasRepository.findByIssuer(
        idEmisor,
        parseInt(limit as string, 10)
      );
    } else {
      facturas = await facturasRepository.list(
        parseInt(offset as string, 10),
        parseInt(limit as string, 10)
      );
    }
    
    const total = await facturasRepository.count();
    
    res.json({
      total,
      count: facturas.length,
      invoices: facturas.map(f => ({
        id: f.id,
        idEmisor: f.id_emisor_factura,
        nombreEmisor: f.nombre_razon_emisor,
        numSerie: f.num_serie_factura,
        fecha: f.fecha_expedicion_factura,
        tipoFactura: f.tipo_factura,
        importeTotal: f.importe_total,
        cuotaTotal: f.cuota_total,
        status: f.estado_registro,
        validationStatus: f.validation_status,
        validationCSV: f.validation_csv,
        timestamp: f.created_at,
      })),
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: (error as Error).message,
    });
  }
});

/**
 * GET /api/v1/invoices/:id/xml
 * Get XML for invoice
 */
app.get("/api/v1/invoices/:id/xml", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const factura = await facturasRepository.findById(id);
    
    if (!factura) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    if (!factura.xml_content) {
      return res.status(200).json({ 
        message: 'XML content not yet generated',
        hint: 'XML is generated after invoice validation with AEAT',
        invoice: {
          id: factura.id,
          numSerie: factura.num_serie_factura,
          status: factura.estado_registro
        }
      });
    }
    
    res.type('application/xml');
    res.send(factura.xml_content);
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: (error as Error).message,
    });
  }
});

/**
 * POST /api/v1/invoices/import
 * Import invoice from XML
 */
app.post("/api/v1/invoices/import", async (req: Request, res: Response) => {
  try {
    const xml = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    
    // TODO: Parse XML and extract invoice data
    // For now, create a placeholder
    const facturaData: CreateFacturaParams = {
      id_emisor_factura: 'IMPORTED',
      nombre_razon_emisor: 'Imported Invoice',
      num_serie_factura: `IMP-${Date.now()}`,
      fecha_expedicion_factura: new Date().toISOString().split('T')[0],
      tipo_factura: 'F1',
      operacion: 'A0',
      xml_content: xml,
      importe_total: 0,
      cuota_total: 0,
    };
    
    const factura = await facturasRepository.create(facturaData);
    
    res.status(201).json({
      id: factura.id,
      status: factura.estado_registro,
      timestamp: factura.created_at,
      message: 'Invoice imported successfully',
    });
  } catch (error) {
    res.status(400).json({
      error: 'Invalid XML',
      message: (error as Error).message,
    });
  }
});

// ===================================================================
// Renta / Resumen Fiscal Endpoints
// ===================================================================

/**
 * GET /api/v1/renta/resumen
 * Aggregated fiscal summary from emitted and received invoices
 */
app.get("/api/v1/renta/resumen", async (req: Request, res: Response) => {
  try {
    const year = req.query.year ? parseInt(req.query.year as string, 10) : new Date().getFullYear();

    type EmitidasRow = {
      total_facturas: string;
      ingresos_brutos: string;
      iva_repercutido: string;
      base_imponible_emitidas: string;
      t1_base: string; t2_base: string; t3_base: string; t4_base: string;
      t1_iva: string; t2_iva: string; t3_iva: string; t4_iva: string;
    };
    type RecibidasRow = {
      total_facturas: string;
      gastos_brutos: string;
      iva_soportado: string;
      base_imponible_recibidas: string;
      facturas_vencidas: string;
    };

    // Emitted invoices aggregation (income)
    const emitidasRows = await facturasRepository.rawQuery<EmitidasRow>(`
      SELECT
        COUNT(*) FILTER (WHERE estado_registro != 'Anulada') AS total_facturas,
        COALESCE(SUM(importe_total) FILTER (WHERE estado_registro != 'Anulada'), 0) AS ingresos_brutos,
        COALESCE(SUM(cuota_total) FILTER (WHERE estado_registro != 'Anulada'), 0) AS iva_repercutido,
        COALESCE(SUM(importe_total - COALESCE(cuota_total, 0)) FILTER (WHERE estado_registro != 'Anulada'), 0) AS base_imponible_emitidas,
        COALESCE(SUM(importe_total - COALESCE(cuota_total, 0)) FILTER (WHERE estado_registro != 'Anulada' AND EXTRACT(QUARTER FROM fecha_expedicion_factura) = 1 AND EXTRACT(YEAR FROM fecha_expedicion_factura) = $1), 0) AS t1_base,
        COALESCE(SUM(importe_total - COALESCE(cuota_total, 0)) FILTER (WHERE estado_registro != 'Anulada' AND EXTRACT(QUARTER FROM fecha_expedicion_factura) = 2 AND EXTRACT(YEAR FROM fecha_expedicion_factura) = $1), 0) AS t2_base,
        COALESCE(SUM(importe_total - COALESCE(cuota_total, 0)) FILTER (WHERE estado_registro != 'Anulada' AND EXTRACT(QUARTER FROM fecha_expedicion_factura) = 3 AND EXTRACT(YEAR FROM fecha_expedicion_factura) = $1), 0) AS t3_base,
        COALESCE(SUM(importe_total - COALESCE(cuota_total, 0)) FILTER (WHERE estado_registro != 'Anulada' AND EXTRACT(QUARTER FROM fecha_expedicion_factura) = 4 AND EXTRACT(YEAR FROM fecha_expedicion_factura) = $1), 0) AS t4_base,
        COALESCE(SUM(cuota_total) FILTER (WHERE estado_registro != 'Anulada' AND EXTRACT(QUARTER FROM fecha_expedicion_factura) = 1 AND EXTRACT(YEAR FROM fecha_expedicion_factura) = $1), 0) AS t1_iva,
        COALESCE(SUM(cuota_total) FILTER (WHERE estado_registro != 'Anulada' AND EXTRACT(QUARTER FROM fecha_expedicion_factura) = 2 AND EXTRACT(YEAR FROM fecha_expedicion_factura) = $1), 0) AS t2_iva,
        COALESCE(SUM(cuota_total) FILTER (WHERE estado_registro != 'Anulada' AND EXTRACT(QUARTER FROM fecha_expedicion_factura) = 3 AND EXTRACT(YEAR FROM fecha_expedicion_factura) = $1), 0) AS t3_iva,
        COALESCE(SUM(cuota_total) FILTER (WHERE estado_registro != 'Anulada' AND EXTRACT(QUARTER FROM fecha_expedicion_factura) = 4 AND EXTRACT(YEAR FROM fecha_expedicion_factura) = $1), 0) AS t4_iva
      FROM facturas
      WHERE EXTRACT(YEAR FROM fecha_expedicion_factura) = $1
    `, [year]);

    // Received invoices aggregation (expenses)
    const recibidasRows = await facturasRepository.rawQuery<RecibidasRow>(`
      SELECT
        COUNT(*) AS total_facturas,
        COALESCE(SUM(importe_total), 0) AS gastos_brutos,
        COALESCE(SUM(iva_total), 0) AS iva_soportado,
        COALESCE(SUM(base_imponible), 0) AS base_imponible_recibidas,
        COUNT(*) FILTER (WHERE estado = 'pendiente' AND fecha_vencimiento < NOW()) AS facturas_vencidas
      FROM facturas_recibidas
      WHERE EXTRACT(YEAR FROM fecha_factura) = $1
    `, [year]);

    const e = emitidasRows[0];
    const r = recibidasRows[0];

    const ingresosBrutos = parseFloat(e.ingresos_brutos);
    const gastosBrutos = parseFloat(r.gastos_brutos);
    const ivaRepercutido = parseFloat(e.iva_repercutido);
    const ivaSoportado = parseFloat(r.iva_soportado);
    const baseEmitidas = parseFloat(e.base_imponible_emitidas);
    const baseRecibidas = parseFloat(r.base_imponible_recibidas);

    const resultado = baseEmitidas - baseRecibidas;
    const ivaLiquidar = ivaRepercutido - ivaSoportado;
    // Estimated IRPF at 15% for freelancers (simplified)
    const irpfEstimado = Math.max(0, resultado * 0.15);

    res.json({
      year,
      resumen: {
        ingresosBrutos,
        gastosBrutos,
        resultado,
        ivaRepercutido,
        ivaSoportado,
        ivaLiquidar,
        irpfEstimado,
      },
      facturas: {
        emitidas: parseInt(e.total_facturas, 10),
        recibidas: parseInt(r.total_facturas, 10),
        vencidas: parseInt(r.facturas_vencidas, 10),
      },
      trimestres: [
        { trimestre: 1, label: `T1 ${year}`, ingresos: parseFloat(e.t1_base), iva: parseFloat(e.t1_iva) },
        { trimestre: 2, label: `T2 ${year}`, ingresos: parseFloat(e.t2_base), iva: parseFloat(e.t2_iva) },
        { trimestre: 3, label: `T3 ${year}`, ingresos: parseFloat(e.t3_base), iva: parseFloat(e.t3_iva) },
        { trimestre: 4, label: `T4 ${year}`, ingresos: parseFloat(e.t4_base), iva: parseFloat(e.t4_iva) },
      ],
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: (error as Error).message,
    });
  }
});

// Health check endpoint
app.get("/health", async (req: Request, res: Response) => {
  const dbStatus = await testConnection();
  
  res.json({
    status: dbStatus ? 'ok' : 'degraded',
    service: 'EasyFactu VeriFactu API',
    version: '0.2.0',
    database: dbStatus ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// Legacy endpoints (for backwards compatibility)
app.post("/records", (req: Request, res: Response) => {
  res.status(301).json({
    message: 'This endpoint has moved',
    newEndpoint: 'POST /api/v1/invoices',
  });
});

app.get("/records/:id/canonicalize", (req: Request, res: Response) => {
  res.status(301).json({
    message: 'This endpoint has moved',
    newEndpoint: 'GET /api/v1/invoices/:id/xml',
  });
});

app.get("/records/:id/verify", (req: Request, res: Response) => {
  res.status(301).json({
    message: 'This endpoint has moved',
    newEndpoint: 'POST /api/v1/invoices/:id/validate',
  });
});

// ============================================================================
// CLIENTES ENDPOINTS
// ============================================================================

/**
 * GET /api/v1/clientes
 * List all clients with pagination and search
 */
app.get("/api/v1/clientes", async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const activo = req.query.activo === 'true' ? true : req.query.activo === 'false' ? false : undefined;
    const tipo_cliente = req.query.tipo_cliente as string;

    const result = await clientesRepository.list({
      page,
      limit,
      search,
      activo,
      tipo_cliente,
    });

    res.json({
      clientes: result.clientes,
      total: result.total,
      page,
      limit,
      pages: Math.ceil(result.total / limit),
    });
  } catch (error: any) {
    console.error('Error listing clientes:', error);
    res.status(500).json({ error: 'Error al listar clientes', details: error.message });
  }
});

/**
 * GET /api/v1/clientes/:id
 * Get a specific client by ID
 */
app.get("/api/v1/clientes/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const cliente = await clientesRepository.findById(id);
    
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.json(cliente);
  } catch (error: any) {
    console.error('Error getting cliente:', error);
    res.status(500).json({ error: 'Error al obtener cliente', details: error.message });
  }
});

/**
 * GET /api/v1/clientes/nif/:nif
 * Get a client by NIF
 */
app.get("/api/v1/clientes/nif/:nif", async (req: Request, res: Response) => {
  try {
    const nif = req.params.nif;
    const cliente = await clientesRepository.findByNif(nif);
    
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.json(cliente);
  } catch (error: any) {
    console.error('Error getting cliente by NIF:', error);
    res.status(500).json({ error: 'Error al obtener cliente', details: error.message });
  }
});

/**
 * POST /api/v1/clientes
 * Create a new client
 */
app.post("/api/v1/clientes", async (req: Request, res: Response) => {
  try {
    const clienteData: CreateClienteParams = req.body;

    // Validation
    if (!clienteData.nif || !clienteData.nombre_razon_social) {
      return res.status(400).json({ 
        error: 'Datos incompletos. NIF y nombre son obligatorios' 
      });
    }

    // Check if NIF already exists
    const existing = await clientesRepository.findByNif(clienteData.nif);
    if (existing) {
      return res.status(409).json({ error: 'Ya existe un cliente con ese NIF' });
    }

    const cliente = await clientesRepository.create(clienteData);
    res.status(201).json(cliente);
  } catch (error: any) {
    console.error('Error creating cliente:', error);
    res.status(500).json({ error: 'Error al crear cliente', details: error.message });
  }
});

/**
 * PUT /api/v1/clientes/:id
 * Update an existing client
 */
app.put("/api/v1/clientes/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const updateData: UpdateClienteParams = req.body;
    const cliente = await clientesRepository.update(id, updateData);
    
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.json(cliente);
  } catch (error: any) {
    console.error('Error updating cliente:', error);
    res.status(500).json({ error: 'Error al actualizar cliente', details: error.message });
  }
});

/**
 * DELETE /api/v1/clientes/:id
 * Soft delete a client (set activo = false)
 */
app.delete("/api/v1/clientes/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const success = await clientesRepository.delete(id);
    
    if (!success) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.json({ message: 'Cliente eliminado correctamente' });
  } catch (error: any) {
    console.error('Error deleting cliente:', error);
    res.status(500).json({ error: 'Error al eliminar cliente', details: error.message });
  }
});

/**
 * GET /api/v1/clientes/stats
 * Get client statistics
 */
app.get("/api/v1/clientes/stats", async (req: Request, res: Response) => {
  try {
    const total = await clientesRepository.count();
    res.json({ total });
  } catch (error: any) {
    console.error('Error getting cliente stats:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas', details: error.message });
  }
});

// ===================================================================
// Proveedores Endpoints
// ===================================================================

/**
 * GET /api/v1/proveedores
 * List all proveedores with optional search and pagination
 */
app.get("/api/v1/proveedores", async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const search = req.query.search as string;

    const result = await proveedoresRepository.findAll({
      page,
      limit,
      search,
      activo: true
    });

    res.json({
      total: result.total,
      count: result.proveedores.length,
      proveedores: result.proveedores
    });
  } catch (error: any) {
    console.error('Error listing proveedores:', error);
    res.status(500).json({ error: 'Error al listar proveedores', details: error.message });
  }
});

/**
 * GET /api/v1/proveedores/:id
 * Get specific proveedor by ID
 */
app.get("/api/v1/proveedores/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid proveedor ID' });
    }

    const proveedor = await proveedoresRepository.findById(id);
    if (!proveedor) {
      return res.status(404).json({ error: 'Proveedor not found' });
    }

    res.json(proveedor);
  } catch (error: any) {
    console.error('Error getting proveedor:', error);
    res.status(500).json({ error: 'Error al obtener proveedor', details: error.message });
  }
});

/**
 * GET /api/v1/proveedores/nif/:nif
 * Get specific proveedor by NIF
 */
app.get("/api/v1/proveedores/nif/:nif", async (req: Request, res: Response) => {
  try {
    const nif = req.params.nif;
    const proveedor = await proveedoresRepository.findByNif(nif);
    
    if (!proveedor) {
      return res.status(404).json({ error: 'Proveedor not found' });
    }

    res.json(proveedor);
  } catch (error: any) {
    console.error('Error getting proveedor by NIF:', error);
    res.status(500).json({ error: 'Error al obtener proveedor', details: error.message });
  }
});

/**
 * POST /api/v1/proveedores
 * Create a new proveedor
 */
app.post("/api/v1/proveedores", async (req: Request, res: Response) => {
  try {
    const proveedorData: CreateProveedorParams = req.body;

    // Validate required fields
    if (!proveedorData.nif || !proveedorData.nombre_razon_social) {
      return res.status(400).json({ error: 'NIF and nombre_razon_social are required' });
    }

    // Check if NIF already exists
    const existing = await proveedoresRepository.findByNif(proveedorData.nif);
    if (existing) {
      return res.status(409).json({ error: 'Proveedor with this NIF already exists' });
    }

    const proveedor = await proveedoresRepository.create(proveedorData);
    res.status(201).json(proveedor);
  } catch (error: any) {
    console.error('Error creating proveedor:', error);
    res.status(500).json({ error: 'Error al crear proveedor', details: error.message });
  }
});

/**
 * PUT /api/v1/proveedores/:id
 * Update an existing proveedor
 */
app.put("/api/v1/proveedores/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid proveedor ID' });
    }

    const updateData: Partial<CreateProveedorParams> = req.body;
    const proveedor = await proveedoresRepository.update(id, updateData);

    if (!proveedor) {
      return res.status(404).json({ error: 'Proveedor not found' });
    }

    res.json(proveedor);
  } catch (error: any) {
    console.error('Error updating proveedor:', error);
    res.status(500).json({ error: 'Error al actualizar proveedor', details: error.message });
  }
});

/**
 * DELETE /api/v1/proveedores/:id
 * Soft delete a proveedor
 */
app.delete("/api/v1/proveedores/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid proveedor ID' });
    }

    const success = await proveedoresRepository.delete(id);
    if (!success) {
      return res.status(404).json({ error: 'Proveedor not found' });
    }

    res.json({ message: 'Proveedor deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting proveedor:', error);
    res.status(500).json({ error: 'Error al eliminar proveedor', details: error.message });
  }
});

/**
 * GET /api/v1/proveedores/stats
 * Get proveedores statistics
 */
app.get("/api/v1/proveedores/stats", async (req: Request, res: Response) => {
  try {
    const count = await proveedoresRepository.count();
    res.json({ total: count });
  } catch (error: any) {
    console.error('Error getting proveedores stats:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas', details: error.message });
  }
});

const PORT = process.env.PORT || 3000;

// Initialize database and start server
async function startServer() {
  try {
    console.log('Starting EasyFactu VeriFactu API...');
    
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.warn('⚠️  Database connection failed. Running in degraded mode.');
      console.warn('   Please check your database configuration in .env file');
      console.warn('   Create a .env file based on .env.example');
    }
    
    // Initialize database (check tables exist)
    if (dbConnected) {
      await initializeDatabase();
    }
    
    // Start Express server
    app.listen(PORT, () => {
      console.log(`\n✓ EasyFactu VeriFactu API running on port ${PORT}`);
      console.log(`  Health check: http://localhost:${PORT}/health`);
      console.log(`  API endpoints: http://localhost:${PORT}/api/v1/invoices`);
      console.log(`  Database: ${dbConnected ? '✓ Connected' : '✗ Not connected'}\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await closePool();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  await closePool();
  process.exit(0);
});

// ===================================================================
// Facturas Recibidas Endpoints
// ===================================================================

// Listar facturas recibidas
app.get("/api/v1/facturas-recibidas", async (req: Request, res: Response) => {
  try {
    const facturas = await facturasRecibidasRepository.findAll();
    res.json(facturas);
  } catch (error: any) {
    res.status(500).json({
      error: "Error al obtener facturas recibidas",
      details: error.message
    });
  }
});

// Crear factura recibida
app.post("/api/v1/facturas-recibidas", async (req: Request, res: Response) => {
  try {
    const factura = await facturasRecibidasRepository.create(req.body);
    res.status(201).json(factura);
  } catch (error: any) {
    res.status(500).json({
      error: "Error al crear factura recibida",
      details: error.message
    });
  }
});

// Marcar como pagada
// Obtener factura por ID
app.get("/api/v1/facturas-recibidas/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const factura = await facturasRecibidasRepository.findById(id);
    if (!factura) {
      return res.status(404).json({ error: "Factura no encontrada" });
    }
    res.json(factura);
  } catch (error: any) {
    res.status(500).json({
      error: "Error al obtener factura recibida",
      details: error.message
    });
  }
});

// Actualizar factura recibida
app.put("/api/v1/facturas-recibidas/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const factura = await facturasRecibidasRepository.update(id, req.body);
    if (!factura) {
      return res.status(404).json({ error: "Factura no encontrada" });
    }
    res.json(factura);
  } catch (error: any) {
    res.status(500).json({
      error: "Error al actualizar factura recibida",
      details: error.message
    });
  }
});

// Marcar como pagada
app.post("/api/v1/facturas-recibidas/:id/pagar", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    const factura = await facturasRecibidasRepository.markAsPaid(
      id,
      new Date()
    );

    res.json(factura);
  } catch (error: any) {
    res.status(500).json({
      error: "Error al marcar factura como pagada",
      details: error.message
    });
  }
});

// Eliminar factura
app.delete("/api/v1/facturas-recibidas/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await facturasRecibidasRepository.delete(id);

    res.json({ message: "Factura eliminada" });
  } catch (error: any) {
    res.status(500).json({
      error: "Error al eliminar factura",
      details: error.message
    });
  }
});

// Subir archivos adjuntos a una factura recibida
app.post(
  "/api/v1/facturas-recibidas/:id/archivos",
  (req: Request, res: Response, next: express.NextFunction) => {
    uploadArchivos.array("archivos", 10)(req, res, (err: unknown) => {
      if (err) {
        const msg = err instanceof Error ? err.message : "Error al subir archivo";
        return res.status(400).json({ error: msg });
      }
      next();
    });
  },
  async (req: Request, res: Response) => {
    try {
      const files = (req as any).files as Array<{originalname: string; filename: string; size: number}> ?? [];
      if (files.length === 0) {
        return res.status(400).json({ error: "No se enviaron archivos" });
      }
      const result = files.map((f) => ({
        nombre: f.originalname,
        filename: f.filename,
        size: f.size,
        url: `/api/v1/facturas-recibidas/${req.params.id}/archivos/${f.filename}`,
      }));
      res.status(201).json(result);
    } catch (error: any) {
      res.status(500).json({ error: "Error al subir archivos", details: error.message });
    }
  }
);

// Listar archivos adjuntos de una factura recibida
app.get("/api/v1/facturas-recibidas/:id/archivos", (req: Request, res: Response) => {
  try {
    const dir = path.join(__dirname, "..", "uploads", "facturas-recibidas", req.params.id);
    if (!fs.existsSync(dir)) {
      return res.json([]);
    }
    const files = fs.readdirSync(dir).map((filename) => {
      const stat = fs.statSync(path.join(dir, filename));
      // Strip the timestamp prefix to recover the original name (replace only the leading timestamp and first underscore)
      const nombre = filename.replace(/^\d+_/, "");
      return {
        nombre,
        filename,
        size: stat.size,
        url: `/api/v1/facturas-recibidas/${req.params.id}/archivos/${filename}`,
      };
    });
    res.json(files);
  } catch (error: any) {
    res.status(500).json({ error: "Error al listar archivos", details: error.message });
  }
});

// Descargar / servir un archivo adjunto
app.get("/api/v1/facturas-recibidas/:id/archivos/:filename", (req: Request, res: Response) => {
  const rawFilename = req.params.filename;
  // Prevent path traversal: only allow safe filenames (no slashes or dots leading to parent dirs)
  if (!rawFilename || /[/\\]/.test(rawFilename) || rawFilename.startsWith("..")) {
    return res.status(400).json({ error: "Nombre de archivo inválido" });
  }
  const filePath = path.join(
    __dirname, "..", "uploads", "facturas-recibidas",
    req.params.id, rawFilename
  );
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Archivo no encontrado" });
  }
  res.setHeader("Content-Disposition", `inline; filename="${rawFilename}"`);
  res.sendFile(path.resolve(filePath));
});

// Eliminar un archivo adjunto
app.delete("/api/v1/facturas-recibidas/:id/archivos/:filename", (req: Request, res: Response) => {
  const rawFilename = req.params.filename;
  // Prevent path traversal
  if (!rawFilename || /[/\\]/.test(rawFilename) || rawFilename.startsWith("..")) {
    return res.status(400).json({ error: "Nombre de archivo inválido" });
  }
  const filePath = path.join(
    __dirname, "..", "uploads", "facturas-recibidas",
    req.params.id, rawFilename
  );
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Archivo no encontrado" });
  }
  try {
    fs.unlinkSync(filePath);
    res.json({ message: "Archivo eliminado" });
  } catch (error: any) {
    res.status(500).json({ error: "Error al eliminar archivo", details: error.message });
  }
});

// ===================================================================
// Configuración Endpoints
// ===================================================================

/**
 * GET /api/v1/configuracion
 * Obtener toda la configuración, opcionalmente filtrada por tipo
 */
app.get("/api/v1/configuracion", async (req: Request, res: Response) => {
  try {
    const tipo = req.query.tipo as string | undefined;

    if (tipo) {
      const config = await configuracionRepository.getAll(tipo);
      return res.json(config);
    }

    const grouped = await configuracionRepository.getGrouped();
    res.json(grouped);
  } catch (error: any) {
    console.error("Error getting configuracion:", error);
    res.status(500).json({
      error: "Error al obtener configuración",
      details: error.message,
    });
  }
});

/**
 * PUT /api/v1/configuracion
 * Actualizar múltiples claves de configuración
 */
app.put("/api/v1/configuracion", async (req: Request, res: Response) => {
  try {
    const configuraciones = req.body;

    if (!configuraciones || typeof configuraciones !== "object") {
      return res.status(400).json({
        error: "Body inválido. Debe ser un objeto clave-valor",
      });
    }

    const updates = Object.entries(configuraciones).map(([clave, valor]) =>
      configuracionRepository.set(clave, String(valor ?? ""))
    );

    const result = await Promise.all(updates);

    res.json({
      success: true,
      updated: result.length,
      configuraciones: result,
    });
  } catch (error: any) {
    console.error("Error updating configuracion:", error);
    res.status(500).json({
      error: "Error al actualizar configuración",
      details: error.message,
    });
  }
});

// ===================================================================
// Certificados Endpoints
// ===================================================================

/**
 * GET /api/v1/certificados
 * Lista todos los certificados
 */
app.get("/api/v1/certificados", async (req: Request, res: Response) => {
  try {
    const certificados = await certificadosRepository.findAll();
    res.json(certificados);
  } catch (error: any) {
    console.error("Error listing certificados:", error);
    res.status(500).json({
      error: "Error al listar certificados",
      details: error.message,
    });
  }
});

/**
 * GET /api/v1/certificados/:id
 * Obtiene un certificado por ID
 */
app.get("/api/v1/certificados/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const certificado = await certificadosRepository.findById(id);

    if (!certificado) {
      return res.status(404).json({ error: "Certificado no encontrado" });
    }

    res.json(certificado);
  } catch (error: any) {
    console.error("Error getting certificado:", error);
    res.status(500).json({
      error: "Error al obtener certificado",
      details: error.message,
    });
  }
});

/**
 * POST /api/v1/certificados
 * Sube un certificado .p12
 */
app.post(
  "/api/v1/certificados",
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      const file = req.file;
      const { password, titular_nif, nombre } = req.body;

      if (!file) {
        return res.status(400).json({ error: "Archivo no enviado" });
      }

      if (!password || !titular_nif) {
        return res.status(400).json({
          error: "password y titular_nif son obligatorios",
        });
      }

      const certificado = await certificadosRepository.create(
        file.buffer,
        password,
        titular_nif,
        nombre
      );

      res.status(201).json(certificado);
    } catch (error: any) {
      console.error("Error creating certificado:", error);
      res.status(500).json({
        error: "Error al subir certificado",
        details: error.message,
      });
    }
  }
);

/**
 * POST /api/v1/certificados/:id/activar
 * Activa un certificado
 */
app.post("/api/v1/certificados/:id/activar", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const certificado = await certificadosRepository.activate(id);

    if (!certificado) {
      return res.status(404).json({ error: "Certificado no encontrado" });
    }

    res.json(certificado);
  } catch (error: any) {
    console.error("Error activating certificado:", error);
    res.status(500).json({
      error: "Error al activar certificado",
      details: error.message,
    });
  }
});

/**
 * DELETE /api/v1/certificados/:id
 * Elimina un certificado
 */
app.delete("/api/v1/certificados/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const success = await certificadosRepository.delete(id);

    if (!success) {
      return res.status(404).json({ error: "Certificado no encontrado" });
    }

    res.json({ message: "Certificado eliminado correctamente" });
  } catch (error: any) {
    console.error("Error deleting certificado:", error);
    res.status(500).json({
      error: "Error al eliminar certificado",
      details: error.message,
    });
  }
});

startServer();
