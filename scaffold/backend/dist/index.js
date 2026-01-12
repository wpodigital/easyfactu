"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.text({ type: "application/xml" }));
const invoices = new Map();
let invoiceCounter = 1;
/**
 * POST /api/v1/invoices
 * Create a new invoice (Alta - Registration)
 */
app.post("/api/v1/invoices", (req, res) => {
    try {
        const xml = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
        const id = `INV-${invoiceCounter++}`;
        const invoice = {
            id,
            xml,
            hash: '', // Would be calculated from the XML
            status: 'pending',
            timestamp: new Date().toISOString(),
            tipo: 'alta',
        };
        invoices.set(id, invoice);
        res.status(201).json({
            id,
            status: invoice.status,
            timestamp: invoice.timestamp,
            message: 'Invoice created successfully. Use POST /api/v1/invoices/:id/validate to submit to AEAT.',
        });
    }
    catch (error) {
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
app.get("/api/v1/invoices/:id", (req, res) => {
    const { id } = req.params;
    const invoice = invoices.get(id);
    if (!invoice) {
        return res.status(404).json({ error: 'Invoice not found' });
    }
    res.json({
        id: invoice.id,
        status: invoice.status,
        tipo: invoice.tipo,
        timestamp: invoice.timestamp,
        hash: invoice.hash,
        refExterna: invoice.refExterna,
    });
});
/**
 * POST /api/v1/invoices/:id/validate
 * Validate invoice with AEAT
 */
app.post("/api/v1/invoices/:id/validate", (req, res) => {
    const { id } = req.params;
    const invoice = invoices.get(id);
    if (!invoice) {
        return res.status(404).json({ error: 'Invoice not found' });
    }
    // Simulate validation process
    invoice.status = 'validated';
    invoices.set(id, invoice);
    res.json({
        id: invoice.id,
        status: invoice.status,
        validationResult: {
            estado: 'Correcto',
            message: 'Invoice validated successfully (simulated)',
        },
        timestamp: new Date().toISOString(),
    });
});
/**
 * GET /api/v1/invoices/:id/status
 * Get validation status
 */
app.get("/api/v1/invoices/:id/status", (req, res) => {
    const { id } = req.params;
    const invoice = invoices.get(id);
    if (!invoice) {
        return res.status(404).json({ error: 'Invoice not found' });
    }
    res.json({
        id: invoice.id,
        status: invoice.status,
        timestamp: invoice.timestamp,
    });
});
/**
 * DELETE /api/v1/invoices/:id
 * Cancel invoice (Anulacion)
 */
app.delete("/api/v1/invoices/:id", (req, res) => {
    const { id } = req.params;
    const invoice = invoices.get(id);
    if (!invoice) {
        return res.status(404).json({ error: 'Invoice not found' });
    }
    if (invoice.status !== 'validated') {
        return res.status(400).json({
            error: 'Cannot cancel',
            message: 'Only validated invoices can be cancelled',
        });
    }
    const anulacionId = `ANU-${invoiceCounter++}`;
    const anulacion = {
        id: anulacionId,
        xml: `<!-- Anulacion of ${id} -->`,
        hash: '',
        status: 'pending',
        timestamp: new Date().toISOString(),
        tipo: 'anulacion',
        refExterna: id,
    };
    invoices.set(anulacionId, anulacion);
    res.json({
        id: anulacionId,
        originalInvoiceId: id,
        status: anulacion.status,
        timestamp: anulacion.timestamp,
        message: 'Cancellation record created. Use POST /api/v1/invoices/:id/validate to submit to AEAT.',
    });
});
/**
 * GET /api/v1/invoices
 * List all invoices
 */
app.get("/api/v1/invoices", (req, res) => {
    const { tipo, status } = req.query;
    let results = Array.from(invoices.values());
    if (tipo) {
        results = results.filter(inv => inv.tipo === tipo);
    }
    if (status) {
        results = results.filter(inv => inv.status === status);
    }
    res.json({
        total: results.length,
        invoices: results.map(inv => ({
            id: inv.id,
            tipo: inv.tipo,
            status: inv.status,
            timestamp: inv.timestamp,
            refExterna: inv.refExterna,
        })),
    });
});
/**
 * POST /api/v1/invoices/:id/xml
 * Get or generate XML for invoice
 */
app.get("/api/v1/invoices/:id/xml", (req, res) => {
    const { id } = req.params;
    const invoice = invoices.get(id);
    if (!invoice) {
        return res.status(404).json({ error: 'Invoice not found' });
    }
    res.type('application/xml');
    res.send(invoice.xml);
});
/**
 * POST /api/v1/invoices/import
 * Import invoice from XML
 */
app.post("/api/v1/invoices/import", (req, res) => {
    try {
        const xml = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
        const id = `IMP-${invoiceCounter++}`;
        const invoice = {
            id,
            xml,
            hash: '',
            status: 'pending',
            timestamp: new Date().toISOString(),
            tipo: xml.includes('RegistroAnulacion') ? 'anulacion' : 'alta',
        };
        invoices.set(id, invoice);
        res.status(201).json({
            id,
            tipo: invoice.tipo,
            status: invoice.status,
            timestamp: invoice.timestamp,
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
app.get("/health", (req, res) => {
    res.json({
        status: 'ok',
        service: 'EasyFactu VeriFactu API',
        version: '0.1.0',
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
app.listen(PORT, () => {
    console.log(`EasyFactu VeriFactu API running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`API endpoints: http://localhost:${PORT}/api/v1/invoices`);
});
//# sourceMappingURL=index.js.map