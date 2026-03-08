import { useEffect, useState } from 'react';
import { Key, Upload, Trash2, CheckCircle } from 'lucide-react';

type Certificado = {
  id: number;
  nombre: string;
  titular_nif: string;
  issuer: string;
  subject: string;
  serial_number: string;
  fecha_inicio: string;
  fecha_expiracion: string;
  certificado_hash: string;
  tipo: string;
  uso: string;
  activo: boolean;
  estado_validacion: string;
  created_at: string;
};

const API_URL = 'http://localhost:3000/api/v1/certificados';

export default function CertificateUpload() {
  const [certificados, setCertificados] = useState<Certificado[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [nombre, setNombre] = useState('');
  const [titularNif, setTitularNif] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const loadCertificados = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setCertificados(data);
    } catch (error) {
      console.error(error);
      setMessage('Error al cargar certificados');
    }
  };

  useEffect(() => {
    loadCertificados();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setMessage('Selecciona un archivo .p12');
      return;
    }

    if (!titularNif || !password) {
      setMessage('Titular NIF y contraseña son obligatorios');
      return;
    }

    try {
      setLoading(true);
      setMessage('');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('titular_nif', titularNif);
      formData.append('password', password);
      formData.append('nombre', nombre);

      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.details || result.error || 'Error al subir certificado');
      }

      setMessage('Certificado subido correctamente');
      setFile(null);
      setNombre('');
      setTitularNif('');
      setPassword('');
      await loadCertificados();
    } catch (error: any) {
      setMessage(error.message || 'Error al subir certificado');
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/${id}/activar`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('No se pudo activar el certificado');
      }

      setMessage('Certificado activado correctamente');
      await loadCertificados();
    } catch (error: any) {
      setMessage(error.message || 'Error al activar certificado');
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm('¿Seguro que quieres eliminar este certificado?');
    if (!confirmed) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('No se pudo eliminar el certificado');
      }

      setMessage('Certificado eliminado correctamente');
      await loadCertificados();
    } catch (error: any) {
      setMessage(error.message || 'Error al eliminar certificado');
    }
  };

  return (
    <div className="space-y-6">
      {message && (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
          {message}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Key className="w-5 h-5 text-[#6d4c51]" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Subir certificado digital
          </h3>
        </div>

        <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Nombre
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Certificado AEAT"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              NIF titular
            </label>
            <input
              type="text"
              value={titularNif}
              onChange={(e) => setTitularNif(e.target.value)}
              placeholder="B12345678"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Contraseña del certificado
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Archivo .p12
            </label>
            <input
              type="file"
              accept=".p12,.pfx,application/x-pkcs12"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-5 py-3 rounded-lg text-white font-semibold transition disabled:opacity-50"
              style={{ backgroundColor: '#6d4c51' }}
            >
              <Upload className="w-4 h-4 mr-2" />
              {loading ? 'Subiendo...' : 'Subir certificado'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Certificados disponibles
        </h3>

        {certificados.length === 0 ? (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            No hay certificados subidos todavía.
          </p>
        ) : (
          <div className="space-y-4">
            {certificados.map((cert) => (
              <div
                key={cert.id}
                className="rounded-lg border border-gray-200 dark:border-gray-700 p-4"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {cert.nombre}
                      </span>
                      {cert.activo && (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                          Activo
                        </span>
                      )}
                    </div>

                    <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                      <p><strong>Titular:</strong> {cert.titular_nif}</p>
                      <p><strong>Serial:</strong> {cert.serial_number}</p>
                      <p><strong>Válido desde:</strong> {new Date(cert.fecha_inicio).toLocaleDateString()}</p>
                      <p><strong>Expira:</strong> {new Date(cert.fecha_expiracion).toLocaleDateString()}</p>
                      <p><strong>Estado:</strong> {cert.estado_validacion}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!cert.activo && (
                      <button
                        onClick={() => handleActivate(cert.id)}
                        className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium text-green-700 bg-green-100 hover:bg-green-200"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Activar
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(cert.id)}
                      className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}