export interface InvoiceDeclarationResult {
  ejercicio: string; // YYYY
  modelo: string; // 3 chars
  periodo: string; // 2 chars
  nif: string; // 9 chars
  csv: string; // 16 chars
  expediente: string; // up to 25 chars
  justificante: string; // 13 chars
  just_anterior?: string;
  fechaYHoraPresentacion: string; // ISO date-time string
}
