import express, { Request, Response } from "express";
import { parseAeatXml } from "./aeat/parser";
import {
  createAeatQuery,
  listAeatQueries,
  getAeatQueryById,
} from "./repositories/aeat-queries.repository";

const app = express();
app.use(express.json());
app.use(express.text({ type: "application/xml" }));

app.post("/records", (req: Request, res: Response) => {
  // Stub: create record
  res.status(201).json({ id: "stub-record-id" });
});

app.get("/records/:id/canonicalize", (req: Request, res: Response) => {
  // Stub: return canonical + hash
  res.json({ canonical: "", sha256: "" });
});

app.get("/records/:id/verify", (req: Request, res: Response) => {
  // Stub: verify signed package
  res.json({ valid: true, errors: [] });
});

// ── AEAT Audit endpoints ────────────────────────────────────────────────────

/**
 * POST /aeat/queries
 * Accept a raw AEAT XML response, parse it, and persist an audit record.
 * Body: raw XML (Content-Type: application/xml)
 * Returns the created audit record with the number of declarations parsed.
 */
app.post("/aeat/queries", async (req: Request, res: Response) => {
  if (typeof req.body !== "string" || req.body.trim() === "") {
    res.status(400).json({ error: "Request body must be non-empty XML text (Content-Type: application/xml)" });
    return;
  }
  const xmlRaw: string = req.body;

  let parsedCount = 0;
  let status: "success" | "error" = "error";

  try {
    const declarations = await parseAeatXml(xmlRaw);
    parsedCount = declarations.length;
    status = "success";
  } catch {
    // status remains "error", parsedCount remains 0
  }

  const organizationId = req.headers["x-organization-id"] as string | undefined;

  try {
    const record = await createAeatQuery(xmlRaw, parsedCount, status, organizationId);
    res.status(201).json(record);
  } catch (err) {
    res.status(503).json({ error: "Database unavailable", detail: (err as Error).message });
  }
});

/**
 * GET /aeat/queries
 * List stored AEAT audit records (paginated).
 * Query params: limit (default 50), offset (default 0)
 */
app.get("/aeat/queries", async (req: Request, res: Response) => {
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  const offset = Number(req.query.offset) || 0;

  try {
    const rows = await listAeatQueries(limit, offset);
    res.json(rows);
  } catch (err) {
    res.status(503).json({ error: "Database unavailable", detail: (err as Error).message });
  }
});

/**
 * GET /aeat/queries/:id
 * Retrieve a single AEAT audit record by ID.
 */
app.get("/aeat/queries/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  try {
    const row = await getAeatQueryById(id);
    if (!row) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(row);
  } catch (err) {
    res.status(503).json({ error: "Database unavailable", detail: (err as Error).message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Scaffold backend running on port ${PORT}`));
