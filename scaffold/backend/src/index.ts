import express, { Request, Response } from "express";

const app = express();
app.use(express.json());
app.use(express.text({ type: "application/xml" }));

// In-memory storage for demo purposes
interface InvoiceRecord {
  id: string;
  xml: string;
  hash: string;
  status: 'pending' | 'validated' | 'error';
  timestamp: string;
  tipo: 'alta' | 'anulacion';
  refExterna?: string;
}

const invoices: Map<string, InvoiceRecord> = new Map();
let invoiceCounter = 1;

/**
 * POST /api/v1/invoices
 * Create a new invoice (Alta - Registration)
 */
app.post("/api/v1/invoices", (req: Request, res: Response) => {
  try {
    const xml = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    const id = `INV-${invoiceCounter++}`;
    
    const invoice: InvoiceRecord = {
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
  } catch (error) {
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
app.get("/api/v1/invoices/:id", (req: Request, res: Response) => {
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
app.post("/api/v1/invoices/:id/validate", (req: Request, res: Response) => {
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
app.get("/api/v1/invoices/:id/status", (req: Request, res: Response) => {
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
app.delete("/api/v1/invoices/:id", (req: Request, res: Response) => {
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
  const anulacion: InvoiceRecord = {
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
app.get("/api/v1/invoices", (req: Request, res: Response) => {
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
app.get("/api/v1/invoices/:id/xml", (req: Request, res: Response) => {
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
app.post("/api/v1/invoices/import", (req: Request, res: Response) => {
  try {
    const xml = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    const id = `IMP-${invoiceCounter++}`;
    
    const invoice: InvoiceRecord = {
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
  } catch (error) {
    res.status(400).json({
      error: 'Invalid XML',
      message: (error as Error).message,
    });
  }
});

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'EasyFactu VeriFactu API',
    version: '0.1.0',
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`EasyFactu VeriFactu API running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API endpoints: http://localhost:${PORT}/api/v1/invoices`);
});
