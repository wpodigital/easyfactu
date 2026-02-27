# EasyFactu VeriFactu API

Backend API for managing Spanish Tax Authority (AEAT) invoice registrations using the VeriFactu system.

## 🚀 Quick Start

### 1. Setup

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your PostgreSQL credentials
nano .env

# Setup database with test data
npm run db:setup:seed
```

### 2. Run

```bash
# Development mode (with auto-reload)
npm run dev

# Or build and run production
npm run build
npm start
```

### 3. Test

```bash
# Health check
curl http://localhost:3000/health

# Run API tests
npm run test:api

# Or use the Postman collection
# Import: postman_collection.json
```

📖 **See**: [TESTING_GUIDE.md](../../TESTING_GUIDE.md) for detailed testing instructions.

---

## Overview

This API provides endpoints to:
- Create invoice registrations (Alta)
- Cancel invoices (Anulación)
- Validate invoices with AEAT
- Import/export XML
- Track validation status

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Server will start on http://localhost:3000

## Build

```bash
npm run build
npm start
```

## API Endpoints

### Health Check

**GET /health**

Check if the API is running.

Response:
```json
{
  "status": "ok",
  "service": "EasyFactu VeriFactu API",
  "version": "0.1.0",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Create Invoice (Alta)

**POST /api/v1/invoices**

Create a new invoice registration.

Request Body: JSON or XML

Response:
```json
{
  "id": "INV-1",
  "status": "pending",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "message": "Invoice created successfully. Use POST /api/v1/invoices/:id/validate to submit to AEAT."
}
```

### Get Invoice Details

**GET /api/v1/invoices/:id**

Get details of a specific invoice.

Response:
```json
{
  "id": "INV-1",
  "status": "validated",
  "tipo": "alta",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "hash": "ABC123...",
  "refExterna": "REF-001"
}
```

### Validate Invoice with AEAT

**POST /api/v1/invoices/:id/validate**

Submit invoice to AEAT for validation.

Response:
```json
{
  "id": "INV-1",
  "status": "validated",
  "validationResult": {
    "estado": "Correcto",
    "message": "Invoice validated successfully"
  },
  "timestamp": "2024-01-15T10:35:00.000Z"
}
```

### Get Validation Status

**GET /api/v1/invoices/:id/status**

Get current validation status of an invoice.

Response:
```json
{
  "id": "INV-1",
  "status": "validated",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Cancel Invoice (Anulación)

**DELETE /api/v1/invoices/:id**

Create a cancellation record for an invoice.

Response:
```json
{
  "id": "ANU-2",
  "originalInvoiceId": "INV-1",
  "status": "pending",
  "timestamp": "2024-01-15T11:00:00.000Z",
  "message": "Cancellation record created. Use POST /api/v1/invoices/:id/validate to submit to AEAT."
}
```

### List Invoices

**GET /api/v1/invoices**

List all invoices with optional filters.

Query Parameters:
- `tipo`: Filter by type (`alta` or `anulacion`)
- `status`: Filter by status (`pending`, `validated`, `error`)

Response:
```json
{
  "total": 2,
  "invoices": [
    {
      "id": "INV-1",
      "tipo": "alta",
      "status": "validated",
      "timestamp": "2024-01-15T10:30:00.000Z"
    },
    {
      "id": "ANU-2",
      "tipo": "anulacion",
      "status": "pending",
      "timestamp": "2024-01-15T11:00:00.000Z",
      "refExterna": "INV-1"
    }
  ]
}
```

### Get Invoice XML

**GET /api/v1/invoices/:id/xml**

Get the XML representation of an invoice.

Response: XML document

### Import Invoice from XML

**POST /api/v1/invoices/import**

Import an invoice from XML.

Request Body: XML string

Response:
```json
{
  "id": "IMP-3",
  "tipo": "alta",
  "status": "pending",
  "timestamp": "2024-01-15T11:30:00.000Z",
  "message": "Invoice imported successfully"
}
```

## Status Values

- `pending`: Invoice created but not yet validated
- `validated`: Invoice successfully validated by AEAT
- `error`: Validation failed

## Invoice Types (Tipo)

- `alta`: Invoice registration (create)
- `anulacion`: Invoice cancellation

## Error Responses

All endpoints may return error responses:

```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

Common HTTP status codes:
- `400`: Bad Request - Invalid input
- `404`: Not Found - Resource not found
- `500`: Internal Server Error

## Integration with VeriFactu Module

This API uses the VeriFactu module from `src/backend/verifactu` for:
- XML generation
- Hash calculation (Huella) for invoice chaining
- XSD validation
- Response parsing

See the VeriFactu module documentation for more details on the underlying functionality.

## Environment Variables

- `PORT`: Server port (default: 3000)
- `DATABASE_URL`: PostgreSQL connection string (for production use)

## Database Schema

The API can be connected to a PostgreSQL database using the migrations in `/migrations/20260112_create_verifactu_tables.sql`.

## Testing

```bash
npm test
```

## License

See LICENSE file in the repository root.
