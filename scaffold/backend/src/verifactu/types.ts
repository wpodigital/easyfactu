/**
 * TypeScript types for VeriFactu (AEAT Invoice Registration System)
 * Based on SuministroInformacion.xsd and RespuestaValRegistNoVeriFactu.xsd
 */

// Basic types
export type SiNoType = 'S' | 'N';
export type NIFType = string; // Max 30 chars
export type TextMax60Type = string;
export type TextMax120Type = string;
export type ImporteSgn12_2Type = number; // Decimal with up to 12 integer digits and 2 decimal places

// Person or entity identification
export interface IDOtroType {
  CodigoPais: string; // 2 chars
  IDType: string; // 2 chars (02, 03, 04, 05, 06, 07)
  ID: string; // Max 20 chars
}

export interface PersonaFisicaJuridicaType {
  NombreRazon: TextMax120Type;
  NIF?: NIFType;
  IDOtro?: IDOtroType;
}

export interface PersonaFisicaJuridicaESType extends PersonaFisicaJuridicaType {
  NIF: NIFType; // Required for Spanish entities
}

// Invoice identification
export interface IDFacturaExpedidaType {
  IDEmisorFactura: NIFType;
  NumSerieFactura: string; // Max 60 chars
  FechaExpedicionFactura: string; // YYYY-MM-DD format
}

export interface IDFacturaExpedidaBajaType {
  IDEmisorFacturaAnulada: NIFType;
  NumSerieFacturaAnulada: string; // Max 60 chars
  FechaExpedicionFacturaAnulada: string; // YYYY-MM-DD format
}

export interface IDFacturaARType {
  IDEmisorFactura: NIFType;
  NumSerieFactura: string;
  FechaExpedicionFactura: string; // YYYY-MM-DD format
}

// Invoice types
export type ClaveTipoFacturaType = 
  | 'F1' // Invoice (Article 6, 7.2, 7.3 LIVA)
  | 'F2' // Simplified invoice (Article 7.2, 7.3)
  | 'F3' // Invoice replacing simplified invoices
  | 'F4' // Invoice summary
  | 'R1' // Rectified invoice (Article 80.1, 80.2, 80.6 LIVA)
  | 'R2' // Rectified invoice (Art. 80.3)
  | 'R3' // Rectified invoice (Art. 80.4)
  | 'R4' // Rectified invoice (Rest)
  | 'R5'; // Rectified invoice on simplified invoices

export type ClaveTipoRectificativaType = 
  | 'S' // Sustitucion (Substitution)
  | 'I'; // Diferencia (Difference)

export type SimplificadaCualificadaType = 'S1' | 'S2' | 'S3';
export type CompletaSinDestinatarioType = SiNoType;
export type MacrodatoType = SiNoType;
export type TercerosODestinatarioType = 'T' | 'D' | 'N'; // Tercero, Destinatario, Ninguno
export type CuponType = SiNoType;

// Tax breakdown
export interface DesgloseType {
  DesgloseTipoOperacion: DesgloseTipoOperacionType[];
}

export interface DesgloseTipoOperacionType {
  TipoOperacion: TipoOperacionType;
  Sujeta?: DetalleDesgloseType;
  NoSujeta?: DetalleNoSujetaType;
  NoSujetaPorReglas?: DetalleNoSujetaType;
}

export type TipoOperacionType = 
  | 'E' // Entrega (Delivery of goods)
  | 'PS'; // Prestacion de servicios (Provision of services)

export interface DetalleDesgloseType {
  Exenta?: DetalleExentaType;
  NoExenta?: DetalleNoExentaType;
}

export interface DetalleExentaType {
  CausaExencion: CausaExencionType;
  BaseImponible: ImporteSgn12_2Type;
}

export type CausaExencionType = 
  | 'E1' // Art. 20 LIVA
  | 'E2' // Art. 21 LIVA
  | 'E3' // Art. 22 LIVA
  | 'E4' // Art. 23, 24 LIVA
  | 'E5' // Art. 25 LIVA
  | 'E6'; // Other

export interface DetalleNoExentaType {
  TipoNoExenta: TipoNoExentaType;
  DesgloseIVA: DetalleIVAType[];
}

export type TipoNoExentaType = 
  | 'S1' // Subject and not exempt without reverse charge
  | 'S2'; // Subject and not exempt with reverse charge

export interface DetalleIVAType {
  BaseImponible: ImporteSgn12_2Type;
  TipoImpositivo?: number; // Percentage (0.00 to 100.00)
  CuotaImpuesto?: ImporteSgn12_2Type;
  TipoRecargoEquivalencia?: number; // Percentage
  CuotaRecargoEquivalencia?: ImporteSgn12_2Type;
}

export interface DetalleNoSujetaType {
  TipoNoSujeta: TipoNoSujetaEnumType;
  Importe: ImporteSgn12_2Type;
}

export type TipoNoSujetaEnumType = 
  | 'RL' // Reverse charge rules
  | 'OT'; // Other

// Rectification details
export interface DesgloseRectificacionType {
  BaseRectificada?: ImporteSgn12_2Type;
  CuotaRectificada?: ImporteSgn12_2Type;
  CuotaRecargoRectificado?: ImporteSgn12_2Type;
}

// Chaining
export type PrimerRegistroCadenaType = 'S';

export interface EncadenamientoFacturaAnteriorType {
  IDEmisorFactura: NIFType;
  NumSerieFactura: string; // Max 60 chars
  FechaExpedicionFactura: string; // YYYY-MM-DD format
  Huella: string; // Max 64 chars (hash)
}

// IT System
export interface SistemaInformaticoType {
  NombreRazon: TextMax120Type;
  NIF?: NIFType;
  IDOtro?: IDOtroType;
  NombreSistemaInformatico: string; // Max 30 chars
  IdSistemaInformatico: string; // Max 2 chars
  Version: string; // Max 50 chars
  NumeroInstalacion: string; // Max 100 chars
  TipoUsoPosibleSoloVerifactu: SiNoType;
  TipoUsoPosibleMultiOT: SiNoType;
  IndicadorMultiplesOT: SiNoType;
}

// Hash type
export type TipoHuellaType = '01'; // 01 = SHA-256

// Subsanacion and rechazo previo
export type SubsanacionType = SiNoType;
export type RechazoPrevioType = SiNoType;
export type RechazoPrevioAnulacionType = SiNoType;
export type SinRegistroPrevioType = SiNoType;

// Generador
export type GeneradoPorType = 'T' | 'D'; // Tercero or Destinatario

// Operation type
export type OperacionType = 'A0' | 'A1' | 'AN'; // A0=Alta, A1=Anulacion, AN=Anulacion sin previo

// Version
export type VersionType = string; // e.g., "1.0"

// Main registration types

/**
 * RegistroFacturacionAltaType - Invoice Registration (Create/Alta)
 */
export interface RegistroFacturacionAltaType {
  IDVersion: VersionType;
  IDFactura: IDFacturaExpedidaType;
  RefExterna?: TextMax60Type;
  NombreRazonEmisor: TextMax120Type;
  Subsanacion?: SubsanacionType;
  RechazoPrevio?: RechazoPrevioType;
  TipoFactura: ClaveTipoFacturaType;
  TipoRectificativa?: ClaveTipoRectificativaType;
  FacturasRectificadas?: {
    IDFacturaRectificada: IDFacturaARType[];
  };
  FacturasSustituidas?: {
    IDFacturaSustituida: IDFacturaARType[];
  };
  ImporteRectificacion?: DesgloseRectificacionType;
  FechaOperacion?: string; // YYYY-MM-DD format
  DescripcionOperacion: string; // Max 500 chars
  FacturaSimplificadaArt7273?: SimplificadaCualificadaType;
  FacturaSinIdentifDestinatarioArt61d?: CompletaSinDestinatarioType;
  Macrodato?: MacrodatoType;
  EmitidaPorTerceroODestinatario?: TercerosODestinatarioType;
  Tercero?: PersonaFisicaJuridicaType;
  Destinatarios?: {
    IDDestinatario: PersonaFisicaJuridicaType[];
  };
  Cupon?: CuponType;
  Desglose: DesgloseType;
  CuotaTotal: ImporteSgn12_2Type;
  ImporteTotal: ImporteSgn12_2Type;
  Encadenamiento: {
    PrimerRegistro?: PrimerRegistroCadenaType;
    RegistroAnterior?: EncadenamientoFacturaAnteriorType;
  };
  SistemaInformatico: SistemaInformaticoType;
  FechaHoraHusoGenRegistro: string; // ISO 8601 datetime with timezone
  NumRegistroAcuerdoFacturacion?: string; // Max 15 chars
  IdAcuerdoSistemaInformatico?: string; // Max 16 chars
  TipoHuella: TipoHuellaType;
  Huella: string; // Max 64 chars (SHA-256 hash)
  Signature?: any; // XML Signature (optional)
}

/**
 * RegistroFacturacionAnulacionType - Invoice Cancellation (Anulacion)
 */
export interface RegistroFacturacionAnulacionType {
  IDVersion: VersionType;
  IDFactura: IDFacturaExpedidaBajaType;
  RefExterna?: TextMax60Type;
  SinRegistroPrevio?: SinRegistroPrevioType;
  RechazoPrevio?: RechazoPrevioAnulacionType;
  GeneradoPor?: GeneradoPorType;
  Generador?: PersonaFisicaJuridicaType;
  Encadenamiento: {
    PrimerRegistro?: PrimerRegistroCadenaType;
    RegistroAnterior?: EncadenamientoFacturaAnteriorType;
  };
  SistemaInformatico: SistemaInformaticoType;
  FechaHoraHusoGenRegistro: string; // ISO 8601 datetime with timezone
  TipoHuella: TipoHuellaType;
  Huella: string; // Max 64 chars (SHA-256 hash)
  Signature?: any; // XML Signature (optional)
}

// Response types

/**
 * Response validation status
 */
export type EstadoRegistroType = 
  | 'Correcto' // Correct
  | 'AceptadoConErrores' // Accepted with errors
  | 'Incorrecto'; // Incorrect

export type EstadoEnvioType = 
  | 'Correcto' // Correct
  | 'ParcialmenteCorrecto' // Partially correct
  | 'Incorrecto'; // Incorrect

export type ErrorDetalleType = string; // Max 10 chars error code

/**
 * Response to a registration
 */
export interface RespuestaRegType {
  IDFactura: IDFacturaExpedidaType;
  Operacion: OperacionType;
  RefExterna?: TextMax60Type;
  EstadoRegistro: EstadoRegistroType;
  CodigoErrorRegistro?: ErrorDetalleType;
  DescripcionErrorRegistro?: string; // Max 1500 chars
}

/**
 * Main response structure
 */
export interface RespuestaValContenidoFactuSistemaFacturacionType {
  DescripcionErrorFormatoXML?: string; // Max 1500 chars
  RespuestaValidacion?: RespuestaRegType;
}

// Database model types

export interface FacturaDB {
  id: number;
  organization_id?: string;
  id_version: string;
  operacion: OperacionType;
  id_emisor_factura: string;
  num_serie_factura: string;
  fecha_expedicion_factura: string;
  id_emisor_factura_anulada?: string;
  num_serie_factura_anulada?: string;
  fecha_expedicion_factura_anulada?: string;
  ref_externa?: string;
  nombre_razon_emisor: string;
  subsanacion?: SiNoType;
  rechazo_previo?: SiNoType;
  sin_registro_previo?: SiNoType;
  tipo_factura?: ClaveTipoFacturaType;
  tipo_rectificativa?: ClaveTipoRectificativaType;
  fecha_operacion?: string;
  descripcion_operacion?: string;
  factura_simplificada_art7273?: SimplificadaCualificadaType;
  factura_sin_identificacion_destinatario?: SiNoType;
  macrodato?: SiNoType;
  emitida_por_tercero_o_destinatario?: TercerosODestinatarioType;
  cupon?: SiNoType;
  cuota_total?: number;
  importe_total?: number;
  primer_registro: SiNoType;
  huella_anterior?: string;
  id_emisor_factura_anterior?: string;
  num_serie_factura_anterior?: string;
  fecha_expedicion_factura_anterior?: string;
  tipo_huella: TipoHuellaType;
  huella: string;
  firma?: string;
  sistema_informatico_id?: number;
  fecha_hora_huso_gen_registro: string;
  num_registro_acuerdo_facturacion?: string;
  id_acuerdo_sistema_informatico?: string;
  generado_por?: GeneradoPorType;
  estado_registro?: EstadoRegistroType;
  codigo_error_registro?: string;
  descripcion_error_registro?: string;
  created_at: string;
  updated_at: string;
}

export interface DestinatarioDB {
  id: number;
  factura_id: number;
  nombre_razon: string;
  nif?: string;
  id_otro_codigo_pais?: string;
  id_otro_id_type?: string;
  id_otro_id?: string;
  created_at: string;
}

export interface DesgloseDB {
  id: number;
  factura_id: number;
  tipo_operacion: TipoOperacionType;
  sujeto_a_iva: 'S' | 'N' | 'R';
  exenta?: SiNoType;
  causa_exencion?: CausaExencionType;
  base_imponible: number;
  tipo_impositivo?: number;
  cuota?: number;
  tipo_no_sujeta?: TipoNoSujetaEnumType;
  tipo_recargo_equivalencia?: number;
  cuota_recargo_equivalencia?: number;
  created_at: string;
}

export interface SistemaInformaticoDB {
  id: number;
  organization_id?: string;
  nombre_razon: string;
  nif?: string;
  id_otro_codigo_pais?: string;
  id_otro_id_type?: string;
  id_otro_id?: string;
  nombre_sistema_informatico: string;
  id_sistema_informatico: string;
  version: string;
  numero_instalacion: string;
  tipo_uso_posible_solo_verifactu: SiNoType;
  tipo_uso_posible_multi_ot: SiNoType;
  indicador_multiples_ot: SiNoType;
  created_at: string;
  updated_at: string;
}
