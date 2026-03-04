"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_1 = require("./config/database");
const facturas_repository_1 = require("./repositories/facturas.repository");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.text({ type: "application/xml" }));
/**
 * POST /api/v1/invoices
 * Create a new invoice (Alta - Registration)
 */
app.post("/api/v1/invoices", async (req, res) => {
    try {
        const data = req.body;
        // Parse invoice data from request using VeriFactu field names
        const facturaData = {
            id_emisor_factura: data.NIF || data.nif || data.IDEmisorFactura || data.idEmisor || '',
            nombre_razon_emisor: data.NombreRazon || data.nombreRazon || data.nombre || 'Sin nombre',
            num_serie_factura: data.NumeroSerie || data.numeroSerie || data.NumSerieFactura || data.numSerie || '',
            fecha_expedicion_factura: data.FechaExpedicion || data.fecha || data.FechaExpedicionFactura || new Date().toISOString().split('T')[0],
            tipo_factura: data.TipoFactura || data.tipo || 'F1',
            importe_total: parseFloat(data.ImporteTotal || data.importe || 0),
            cuota_total: parseFloat(data.CuotaTotal || data.cuota || 0),
            operacion: data.Operacion || data.operacion || 'A0', // A0 = Alta normal
            estado_registro: 'Correcta', // Initial state
        };
        // Get previous invoice for chaining
        const previousInvoice = await facturas_repository_1.facturasRepository.getLastForChaining(facturaData.id_emisor_factura);
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
        const factura = await facturas_repository_1.facturasRepository.create(facturaData);
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
    }
    catch (error) {
        console.error('Error creating invoice:', error);
        res.status(400).json({
            error: 'Invalid request',
            message: error.message,
        });
    }
});
/**
 * GET /api/v1/invoices/:id
 * Get invoice details
 */
app.get("/api/v1/invoices/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const factura = await facturas_repository_1.facturasRepository.findById(id);
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
    }
    catch (error) {
        res.status(500).json({
            error: 'Internal server error',
            message: error.message,
        });
    }
});
/**
 * POST /api/v1/invoices/:id/validate
 * Validate invoice with AEAT
 * Accepts either numeric ID or series number (e.g., "TEST-001")
 */
app.post("/api/v1/invoices/:id/validate", async (req, res) => {
    try {
        const idParam = req.params.id;
        let factura;
        // Try numeric ID first
        if (!isNaN(parseInt(idParam, 10))) {
            factura = await facturas_repository_1.facturasRepository.findById(parseInt(idParam, 10));
        }
        else {
            // Try to find by series number
            // Format expected: "SERIES-NUMBER" or just "NUMBER"
            const parts = idParam.split('-');
            const series = parts.length > 1 ? parts[0] : '';
            factura = await facturas_repository_1.facturasRepository.findBySeriesAndNumber(series, idParam);
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
        const updated = await facturas_repository_1.facturasRepository.updateValidationStatus(factura.id, validationStatus, csv, undefined);
        res.json({
            id: updated?.id,
            validationResult: {
                estado: validationStatus,
                csv: csv,
                message: 'Invoice validated successfully (simulated)',
            },
            timestamp: updated?.validation_timestamp,
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Validation failed',
            message: error.message,
        });
    }
});
/**
 * GET /api/v1/invoices/:id/status
 * Get validation status
 */
app.get("/api/v1/invoices/:id/status", async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const factura = await facturas_repository_1.facturasRepository.findById(id);
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
    }
    catch (error) {
        res.status(500).json({
            error: 'Internal server error',
            message: error.message,
        });
    }
});
/**
 * DELETE /api/v1/invoices/:id
 * Cancel invoice (Anulacion)
 */
app.delete("/api/v1/invoices/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const factura = await facturas_repository_1.facturasRepository.findById(id);
        if (!factura) {
            return res.status(404).json({ error: 'Invoice not found' });
        }
        if (factura.validation_status !== 'Correcto') {
            return res.status(400).json({
                error: 'Cannot cancel',
                message: 'Only validated invoices can be cancelled',
            });
        }
        const deleted = await facturas_repository_1.facturasRepository.delete(id);
        if (deleted) {
            res.json({
                id,
                status: 'cancelled',
                timestamp: new Date().toISOString(),
                message: 'Invoice cancelled successfully',
            });
        }
        else {
            res.status(500).json({ error: 'Failed to cancel invoice' });
        }
    }
    catch (error) {
        res.status(500).json({
            error: 'Internal server error',
            message: error.message,
        });
    }
});
/**
 * GET /api/v1/invoices
 * List all invoices
 */
app.get("/api/v1/invoices", async (req, res) => {
    try {
        const { idEmisor, limit = '50', offset = '0' } = req.query;
        let facturas;
        if (idEmisor && typeof idEmisor === 'string') {
            facturas = await facturas_repository_1.facturasRepository.findByIssuer(idEmisor, parseInt(limit, 10));
        }
        else {
            facturas = await facturas_repository_1.facturasRepository.list(parseInt(offset, 10), parseInt(limit, 10));
        }
        const total = await facturas_repository_1.facturasRepository.count();
        res.json({
            total,
            count: facturas.length,
            invoices: facturas.map(f => ({
                id: f.id,
                idEmisor: f.id_emisor_factura,
                numSerie: f.num_serie_factura,
                fecha: f.fecha_expedicion_factura,
                tipoFactura: f.tipo_factura,
                status: f.estado_registro,
                validationStatus: f.validation_status,
                timestamp: f.created_at,
            })),
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Internal server error',
            message: error.message,
        });
    }
});
/**
 * GET /api/v1/invoices/:id/xml
 * Get XML for invoice
 */
app.get("/api/v1/invoices/:id/xml", async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const factura = await facturas_repository_1.facturasRepository.findById(id);
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
    }
    catch (error) {
        res.status(500).json({
            error: 'Internal server error',
            message: error.message,
        });
    }
});
/**
 * POST /api/v1/invoices/import
 * Import invoice from XML
 */
app.post("/api/v1/invoices/import", async (req, res) => {
    try {
        const xml = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
        // TODO: Parse XML and extract invoice data
        // For now, create a placeholder
        const facturaData = {
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
        const factura = await facturas_repository_1.facturasRepository.create(facturaData);
        res.status(201).json({
            id: factura.id,
            status: factura.estado_registro,
            timestamp: factura.created_at,
            message: 'Invoice imported successfully',
        });
    }
    catch (error) {
        res.status(400).json({
            error: 'Invalid XML',
            message: error.message,
        });
    }
});
// Health check endpoint
app.get("/health", async (req, res) => {
    const dbStatus = await (0, database_1.testConnection)();
    res.json({
        status: dbStatus ? 'ok' : 'degraded',
        service: 'EasyFactu VeriFactu API',
        version: '0.2.0',
        database: dbStatus ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString(),
    });
});
// Legacy endpoints (for backwards compatibility)
app.post("/records", (req, res) => {
    res.status(301).json({
        message: 'This endpoint has moved',
        newEndpoint: 'POST /api/v1/invoices',
    });
});
app.get("/records/:id/canonicalize", (req, res) => {
    res.status(301).json({
        message: 'This endpoint has moved',
        newEndpoint: 'GET /api/v1/invoices/:id/xml',
    });
});
app.get("/records/:id/verify", (req, res) => {
    res.status(301).json({
        message: 'This endpoint has moved',
        newEndpoint: 'POST /api/v1/invoices/:id/validate',
    });
});
const PORT = process.env.PORT || 3000;
// Initialize database and start server
async function startServer() {
    try {
        console.log('Starting EasyFactu VeriFactu API...');
        // Test database connection
        const dbConnected = await (0, database_1.testConnection)();
        if (!dbConnected) {
            console.warn('⚠️  Database connection failed. Running in degraded mode.');
            console.warn('   Please check your database configuration in .env file');
            console.warn('   Create a .env file based on .env.example');
        }
        // Initialize database (check tables exist)
        if (dbConnected) {
            await (0, database_1.initializeDatabase)();
        }
        // Start Express server
        app.listen(PORT, () => {
            console.log(`\n✓ EasyFactu VeriFactu API running on port ${PORT}`);
            console.log(`  Health check: http://localhost:${PORT}/health`);
            console.log(`  API endpoints: http://localhost:${PORT}/api/v1/invoices`);
            console.log(`  Database: ${dbConnected ? '✓ Connected' : '✗ Not connected'}\n`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}
// Handle graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received: closing HTTP server');
    await (0, database_1.closePool)();
    process.exit(0);
});
process.on('SIGINT', async () => {
    console.log('SIGINT signal received: closing HTTP server');
    await (0, database_1.closePool)();
    process.exit(0);
});
startServer();
//# sourceMappingURL=index.js.map