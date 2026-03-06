import { parseStringPromise } from "xml2js";

export interface AeatInvoiceDeclarationResult {
  ejercicio: string;
  modelo: string;
  periodo: string;
  nif: string;
  csv: string;
  expediente: string;
  justificante: string;
  fechaYHoraPresentacion: string;
  just_anterior?: string;
}

function getText(node: Record<string, string[]>, key: string): string {
  const val = node[key];
  return Array.isArray(val) && val.length > 0 ? String(val[0]).trim() : "";
}

export async function parseAeatXml(
  xmlString: string
): Promise<AeatInvoiceDeclarationResult[]> {
  let parsed: Record<string, unknown>;
  try {
    parsed = await parseStringPromise(xmlString, { explicitArray: true });
  } catch {
    return [];
  }
  const root = parsed?.servicioConsultasDirectas as
    | Record<string, Record<string, string[]>[]>
    | undefined;
  if (!root) return [];

  const respuestas: Record<string, string[]>[] = root.respuestaCorrecta ?? [];
  return respuestas.map((node) => {
    const item: AeatInvoiceDeclarationResult = {
      ejercicio: getText(node, "ejercicio"),
      modelo: getText(node, "modelo"),
      periodo: getText(node, "periodo"),
      nif: getText(node, "nif"),
      csv: getText(node, "csv"),
      expediente: getText(node, "expediente"),
      justificante: getText(node, "justificante"),
      fechaYHoraPresentacion: getText(node, "fechaYHoraPresentacion"),
    };
    const justAnterior = getText(node, "just_anterior");
    if (justAnterior) item.just_anterior = justAnterior;
    return item;
  });
}
