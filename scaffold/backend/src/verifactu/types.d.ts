/**
 * TypeScript types for VeriFactu (AEAT Invoice Registration System)
 * Based on SuministroInformacion.xsd and RespuestaValRegistNoVeriFactu.xsd
 */
export type SiNoType = 'S' | 'N';
export type NIFType = string;
export type TextMax60Type = string;
export type TextMax120Type = string;
export type ImporteSgn12_2Type = number;
export interface IDOtroType {
    CodigoPais: string;
    IDType: string;
    ID: string;
}
export interface PersonaFisicaJuridicaType {
    NombreRazon: TextMax120Type;
    NIF?: NIFType;
    IDOtro?: IDOtroType;
}
export interface PersonaFisicaJuridicaESType extends PersonaFisicaJuridicaType {
    NIF: NIFType;
}
export interface IDFacturaExpedidaType {
    IDEmisorFactura: NIFType;
    NumSerieFactura: string;
    FechaExpedicionFactura: string;
}
export interface IDFacturaExpedidaBajaType {
    IDEmisorFacturaAnulada: NIFType;
    NumSerieFacturaAnulada: string;
    FechaExpedicionFacturaAnulada: string;
}
export interface IDFacturaARType {
    IDEmisorFactura: NIFType;
    NumSerieFactura: string;
    FechaExpedicionFactura: string;
}
export type ClaveTipoFacturaType = 'F1' | 'F2' | 'F3' | 'F4' | 'R1' | 'R2' | 'R3' | 'R4' | 'R5';
export type ClaveTipoRectificativaType = 'S' | 'I';
export type SimplificadaCualificadaType = 'S1' | 'S2' | 'S3';
export type CompletaSinDestinatarioType = SiNoType;
export type MacrodatoType = SiNoType;
export type TercerosODestinatarioType = 'T' | 'D' | 'N';
export type CuponType = SiNoType;
export interface DesgloseType {
    DesgloseTipoOperacion: DesgloseTipoOperacionType[];
}
export interface DesgloseTipoOperacionType {
    TipoOperacion: TipoOperacionType;
    Sujeta?: DetalleDesgloseType;
    NoSujeta?: DetalleNoSujetaType;
    NoSujetaPorReglas?: DetalleNoSujetaType;
}
export type TipoOperacionType = 'E' | 'PS';
export interface DetalleDesgloseType {
    Exenta?: DetalleExentaType;
    NoExenta?: DetalleNoExentaType;
}
export interface DetalleExentaType {
    CausaExencion: CausaExencionType;
    BaseImponible: ImporteSgn12_2Type;
}
export type CausaExencionType = 'E1' | 'E2' | 'E3' | 'E4' | 'E5' | 'E6';
export interface DetalleNoExentaType {
    TipoNoExenta: TipoNoExentaType;
    DesgloseIVA: DetalleIVAType[];
}
export type TipoNoExentaType = 'S1' | 'S2';
export interface DetalleIVAType {
    BaseImponible: ImporteSgn12_2Type;
    TipoImpositivo?: number;
    CuotaImpuesto?: ImporteSgn12_2Type;
    TipoRecargoEquivalencia?: number;
    CuotaRecargoEquivalencia?: ImporteSgn12_2Type;
}
export interface DetalleNoSujetaType {
    TipoNoSujeta: TipoNoSujetaEnumType;
    Importe: ImporteSgn12_2Type;
}
export type TipoNoSujetaEnumType = 'RL' | 'OT';
export interface DesgloseRectificacionType {
    BaseRectificada?: ImporteSgn12_2Type;
    CuotaRectificada?: ImporteSgn12_2Type;
    CuotaRecargoRectificado?: ImporteSgn12_2Type;
}
export type PrimerRegistroCadenaType = 'S';
export interface EncadenamientoFacturaAnteriorType {
    IDEmisorFactura: NIFType;
    NumSerieFactura: string;
    FechaExpedicionFactura: string;
    Huella: string;
}
export interface SistemaInformaticoType {
    NombreRazon: TextMax120Type;
    NIF?: NIFType;
    IDOtro?: IDOtroType;
    NombreSistemaInformatico: string;
    IdSistemaInformatico: string;
    Version: string;
    NumeroInstalacion: string;
    TipoUsoPosibleSoloVerifactu: SiNoType;
    TipoUsoPosibleMultiOT: SiNoType;
    IndicadorMultiplesOT: SiNoType;
}
export type TipoHuellaType = '01';
export type SubsanacionType = SiNoType;
export type RechazoPrevioType = SiNoType;
export type RechazoPrevioAnulacionType = SiNoType;
export type SinRegistroPrevioType = SiNoType;
export type GeneradoPorType = 'T' | 'D';
export type OperacionType = 'A0' | 'A1' | 'AN';
export type VersionType = string;
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
    FechaOperacion?: string;
    DescripcionOperacion: string;
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
    FechaHoraHusoGenRegistro: string;
    NumRegistroAcuerdoFacturacion?: string;
    IdAcuerdoSistemaInformatico?: string;
    TipoHuella: TipoHuellaType;
    Huella: string;
    Signature?: any;
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
    FechaHoraHusoGenRegistro: string;
    TipoHuella: TipoHuellaType;
    Huella: string;
    Signature?: any;
}
/**
 * Response validation status
 */
export type EstadoRegistroType = 'Correcto' | 'AceptadoConErrores' | 'Incorrecto';
export type EstadoEnvioType = 'Correcto' | 'ParcialmenteCorrecto' | 'Incorrecto';
export type ErrorDetalleType = string;
/**
 * Response to a registration
 */
export interface RespuestaRegType {
    IDFactura: IDFacturaExpedidaType;
    Operacion: OperacionType;
    RefExterna?: TextMax60Type;
    EstadoRegistro: EstadoRegistroType;
    CodigoErrorRegistro?: ErrorDetalleType;
    DescripcionErrorRegistro?: string;
}
/**
 * Main response structure
 */
export interface RespuestaValContenidoFactuSistemaFacturacionType {
    DescripcionErrorFormatoXML?: string;
    RespuestaValidacion?: RespuestaRegType;
}
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
//# sourceMappingURL=types.d.ts.map