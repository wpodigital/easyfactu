-- Migration: create invoice_declarations_queries
CREATE TABLE IF NOT EXISTS invoice_declarations_queries (
  id BIGSERIAL PRIMARY KEY,
  organization_id UUID NULL,
  xml_raw TEXT NOT NULL,
  parsed_count INTEGER DEFAULT 0,
  status VARCHAR(32) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invoice_declarations_queries_org ON invoice_declarations_queries(organization_id);
CREATE INDEX IF NOT EXISTS idx_invoice_declarations_queries_status ON invoice_declarations_queries(status);
