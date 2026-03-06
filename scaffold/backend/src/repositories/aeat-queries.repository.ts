import pool from "../db";

export interface AeatQuery {
  id: number;
  organization_id: string | null;
  xml_raw: string;
  parsed_count: number;
  status: "success" | "error" | "pending";
  created_at: Date;
  updated_at: Date;
}

export async function createAeatQuery(
  xmlRaw: string,
  parsedCount: number,
  status: AeatQuery["status"],
  organizationId?: string
): Promise<AeatQuery> {
  const result = await pool.query<AeatQuery>(
    `INSERT INTO invoice_declarations_queries
       (xml_raw, parsed_count, status, organization_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [xmlRaw, parsedCount, status, organizationId ?? null]
  );
  return result.rows[0];
}

export async function listAeatQueries(limit = 50, offset = 0): Promise<AeatQuery[]> {
  const result = await pool.query<AeatQuery>(
    `SELECT * FROM invoice_declarations_queries
     ORDER BY created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return result.rows;
}

export async function getAeatQueryById(id: number): Promise<AeatQuery | null> {
  const result = await pool.query<AeatQuery>(
    `SELECT * FROM invoice_declarations_queries WHERE id = $1`,
    [id]
  );
  return result.rows[0] ?? null;
}
