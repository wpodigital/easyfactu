import { pool } from '../config/database';
import crypto from 'crypto';
import forge from 'node-forge';

export interface CertificadoDB {
  id: number;
  nombre: string;
  titular_nif: string;
  issuer: string;
  subject: string;
  serial_number: string;
  fecha_inicio: Date;
  fecha_expiracion: Date;
  certificado_data: Buffer;
  certificado_hash: string;
  tipo: string;
  uso: string;
  activo: boolean;
  estado_validacion: string;
  created_at: Date;
  updated_at: Date;
}

export interface CertificadoInfo {
  issuer: string;
  subject: string;
  serialNumber: string;
  validFrom: Date;
  validTo: Date;
  publicKey: string;
}

export const certificadosRepository = {
  /**
   * Create a new certificate from .p12 file
   */
  async create(
    p12Buffer: Buffer,
    password: string,
    titularNif: string,
    nombre?: string
  ): Promise<CertificadoDB> {
    try {
      // Parse .p12 file with node-forge
      const p12Der = forge.util.binary.raw.decode(p12Buffer);
      const p12Asn1 = forge.asn1.fromDer(p12Der);
      const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password);

      // Extract certificate and private key
      const bags = p12.getBags({ bagType: forge.pki.oids.certBag });
      const certBag = bags[forge.pki.oids.certBag]?.[0];
      
      if (!certBag || !certBag.cert) {
        throw new Error('No certificate found in .p12 file');
      }

      const cert = certBag.cert;

      // Extract certificate information
      const issuer = cert.issuer.attributes
        .map((attr: any) => `${attr.shortName}=${attr.value}`)
        .join(', ');
      
      const subject = cert.subject.attributes
        .map((attr: any) => `${attr.shortName}=${attr.value}`)
        .join(', ');

      const serialNumber = cert.serialNumber;
      const validFrom = cert.validity.notBefore;
      const validTo = cert.validity.notAfter;

      // Calculate SHA-256 hash of the certificate
      const hash = crypto.createHash('sha256').update(p12Buffer).digest('hex');

      // Deactivate all other certificates for this titular
      await pool.query(
        'UPDATE certificados SET activo = false WHERE titular_nif = $1',
        [titularNif]
      );

      // Insert new certificate
      const result = await pool.query<CertificadoDB>(
        `INSERT INTO certificados (
          nombre, titular_nif, issuer, subject, serial_number,
          fecha_inicio, fecha_expiracion,
          certificado_data, certificado_hash,
          tipo, uso, activo, estado_validacion
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *`,
        [
          nombre || `Certificado ${titularNif}`,
          titularNif,
          issuer,
          subject,
          serialNumber,
          validFrom,
          validTo,
          p12Buffer,
          hash,
          'PKCS12',
          'AEAT',
          true, // Mark as active by default
          'VALID'
        ]
      );

      return result.rows[0];
    } catch (error: any) {
      if (error.message.includes('password')) {
        throw new Error('Invalid certificate password');
      }
      throw error;
    }
  },

  /**
   * Get all certificates for a titular
   */
  async findByTitular(titularNif: string): Promise<CertificadoDB[]> {
    const result = await pool.query<CertificadoDB>(
      `SELECT 
        id, nombre, titular_nif, issuer, subject, serial_number,
        fecha_inicio, fecha_expiracion,
        certificado_hash, tipo, uso, activo, estado_validacion,
        created_at, updated_at
      FROM certificados 
      WHERE titular_nif = $1
      ORDER BY created_at DESC`,
      [titularNif]
    );
    return result.rows;
  },

  /**
   * Get certificate by ID (without raw data)
   */
  async findById(id: number): Promise<CertificadoDB | null> {
    const result = await pool.query<CertificadoDB>(
      `SELECT 
        id, nombre, titular_nif, issuer, subject, serial_number,
        fecha_inicio, fecha_expiracion,
        certificado_hash, tipo, uso, activo, estado_validacion,
        created_at, updated_at
      FROM certificados 
      WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Get certificate by ID with raw data (for signing)
   */
  async findByIdWithData(id: number): Promise<CertificadoDB | null> {
    const result = await pool.query<CertificadoDB>(
      'SELECT * FROM certificados WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Get active certificate for a titular
   */
  async findActive(titularNif: string): Promise<CertificadoDB | null> {
    const result = await pool.query<CertificadoDB>(
      `SELECT 
        id, nombre, titular_nif, issuer, subject, serial_number,
        fecha_inicio, fecha_expiracion,
        certificado_hash, tipo, uso, activo, estado_validacion,
        created_at, updated_at
      FROM certificados 
      WHERE titular_nif = $1 AND activo = true
      LIMIT 1`,
      [titularNif]
    );
    return result.rows[0] || null;
  },

  /**
   * Get active certificate with raw data (for signing)
   */
  async findActiveWithData(titularNif: string): Promise<CertificadoDB | null> {
    const result = await pool.query<CertificadoDB>(
      'SELECT * FROM certificados WHERE titular_nif = $1 AND activo = true LIMIT 1',
      [titularNif]
    );
    return result.rows[0] || null;
  },

  /**
   * Activate a certificate (deactivates all others for same titular)
   */
  async activate(id: number): Promise<CertificadoDB | null> {
    const cert = await this.findById(id);
    if (!cert) return null;

    // Deactivate all certificates for this titular
    await pool.query(
      'UPDATE certificados SET activo = false WHERE titular_nif = $1',
      [cert.titular_nif]
    );

    // Activate this certificate
    const result = await pool.query<CertificadoDB>(
      `UPDATE certificados 
      SET activo = true, updated_at = NOW() 
      WHERE id = $1 
      RETURNING *`,
      [id]
    );

    return result.rows[0] || null;
  },

  /**
   * Delete a certificate
   */
  async delete(id: number): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM certificados WHERE id = $1',
      [id]
    );
    return (result.rowCount ?? 0) > 0;
  },

  /**
   * Check if certificate is expired
   */
  async isExpired(id: number): Promise<boolean> {
    const cert = await this.findById(id);
    if (!cert) return true;
    return new Date() > new Date(cert.fecha_expiracion);
  },

  /**
   * Get days until expiration
   */
  async getDaysUntilExpiration(id: number): Promise<number | null> {
    const cert = await this.findById(id);
    if (!cert) return null;

    const now = new Date();
    const expiration = new Date(cert.fecha_expiracion);
    const diff = expiration.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    return days;
  },

  /**
   * List all certificates
   */
  async findAll(): Promise<CertificadoDB[]> {
    const result = await pool.query<CertificadoDB>(
      `SELECT 
        id, nombre, titular_nif, issuer, subject, serial_number,
        fecha_inicio, fecha_expiracion,
        certificado_hash, tipo, uso, activo, estado_validacion,
        created_at, updated_at
      FROM certificados 
      ORDER BY created_at DESC`
    );
    return result.rows;
  }
};
