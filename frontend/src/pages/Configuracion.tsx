import { useEffect, useState } from 'react';
import { Building, FileText, Settings, Save, Key } from 'lucide-react';
import CertificateUpload from '../components/CertificateUpload';

type TabId = 'empresa' | 'facturacion' | 'certificados' | 'preferencias';

type EmpresaConfig = {
  empresa_nif: string;
  empresa_nombre: string;
  empresa_nombre_comercial: string;
  empresa_direccion: string;
  empresa_codigo_postal: string;
  empresa_ciudad: string;
  empresa_provincia: string;
  empresa_pais: string;
  empresa_telefono: string;
  empresa_email: string;
  empresa_web: string;
};

type FacturacionConfig = {
  facturacion_serie_por_defecto: string;
  facturacion_proximo_numero: string;
  facturacion_formato_numero: string;
  facturacion_incluir_iva: string;
  facturacion_tipo_iva_por_defecto: string;
  facturacion_texto_pie_factura: string;
  facturacion_mostrar_logo: string;
};

type PreferenciasConfig = {
  usuario_idioma: string;
  usuario_tema: string;
  usuario_notificaciones_email: string;
  usuario_formato_fecha: string;
  usuario_formato_moneda: string;
};

const API_URL = 'http://localhost:3000/api/v1/configuracion';

const Configuracion = () => {
  const [activeTab, setActiveTab] = useState<TabId>('empresa');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [empresa, setEmpresa] = useState<EmpresaConfig>({
    empresa_nif: '',
    empresa_nombre: '',
    empresa_nombre_comercial: '',
    empresa_direccion: '',
    empresa_codigo_postal: '',
    empresa_ciudad: '',
    empresa_provincia: '',
    empresa_pais: 'España',
    empresa_telefono: '',
    empresa_email: '',
    empresa_web: '',
  });

  const [facturacion, setFacturacion] = useState<FacturacionConfig>({
    facturacion_serie_por_defecto: 'A',
    facturacion_proximo_numero: '1',
    facturacion_formato_numero: 'A-{NUMERO}',
    facturacion_incluir_iva: 'true',
    facturacion_tipo_iva_por_defecto: '21',
    facturacion_texto_pie_factura: '',
    facturacion_mostrar_logo: 'true',
  });

  const [preferencias, setPreferencias] = useState<PreferenciasConfig>({
    usuario_idioma: 'es',
    usuario_tema: 'light',
    usuario_notificaciones_email: 'true',
    usuario_formato_fecha: 'DD/MM/YYYY',
    usuario_formato_moneda: 'EUR',
  });

  const loadConfiguracion = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      const data = await response.json();

      if (data.empresa) {
        setEmpresa((prev) => ({ ...prev, ...data.empresa }));
      }

      if (data.facturacion) {
        setFacturacion((prev) => ({ ...prev, ...data.facturacion }));
      }

      if (data.usuario) {
        setPreferencias((prev) => ({ ...prev, ...data.usuario }));
      }
    } catch (error) {
      console.error('Error cargando configuración:', error);
      setMessage('Error al cargar la configuración');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfiguracion();
  }, []);

  const saveSection = async (payload: Record<string, string>, successMessage: string) => {
    try {
      setSaving(true);
      setMessage('');

      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('No se pudo guardar la configuración');
      }

      setMessage(successMessage);
    } catch (error) {
      console.error(error);
      setMessage('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'empresa' as TabId, label: 'Empresa', icon: Building },
    { id: 'facturacion' as TabId, label: 'Facturación', icon: FileText },
    { id: 'certificados' as TabId, label: 'Certificados', icon: Key },
    { id: 'preferencias' as TabId, label: 'Preferencias', icon: Settings },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="text-gray-700 dark:text-gray-200">Cargando configuración...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-6">
          <div
            className="p-3 rounded-full mr-4"
            style={{ backgroundColor: '#6d4c5120' }}
          >
            <Settings className="w-8 h-8" style={{ color: '#6d4c51' }} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Configuración
          </h1>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="flex flex-wrap border-b border-gray-200 dark:border-gray-700">
            {tabs.map((tab) => {
              const Icon = tab.icon;

              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMessage('');
                  }}
                  className={`px-5 py-4 flex items-center gap-2 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-b-2 text-[#6d4c51] border-[#6d4c51] bg-gray-50 dark:bg-gray-700'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {message && (
            <div className="mx-6 mt-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
              {message}
            </div>
          )}

          {activeTab === 'empresa' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
                Datos de la Empresa
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="NIF/CIF"
                  value={empresa.empresa_nif}
                  onChange={(v) => setEmpresa({ ...empresa, empresa_nif: v })}
                />
                <Input
                  label="Nombre o Razón Social"
                  value={empresa.empresa_nombre}
                  onChange={(v) => setEmpresa({ ...empresa, empresa_nombre: v })}
                />
                <Input
                  label="Nombre Comercial"
                  value={empresa.empresa_nombre_comercial}
                  onChange={(v) => setEmpresa({ ...empresa, empresa_nombre_comercial: v })}
                />
                <Input
                  label="Dirección"
                  value={empresa.empresa_direccion}
                  onChange={(v) => setEmpresa({ ...empresa, empresa_direccion: v })}
                />
                <Input
                  label="Código Postal"
                  value={empresa.empresa_codigo_postal}
                  onChange={(v) => setEmpresa({ ...empresa, empresa_codigo_postal: v })}
                />
                <Input
                  label="Ciudad"
                  value={empresa.empresa_ciudad}
                  onChange={(v) => setEmpresa({ ...empresa, empresa_ciudad: v })}
                />
                <Input
                  label="Provincia"
                  value={empresa.empresa_provincia}
                  onChange={(v) => setEmpresa({ ...empresa, empresa_provincia: v })}
                />
                <Input
                  label="País"
                  value={empresa.empresa_pais}
                  onChange={(v) => setEmpresa({ ...empresa, empresa_pais: v })}
                />
                <Input
                  label="Teléfono"
                  value={empresa.empresa_telefono}
                  onChange={(v) => setEmpresa({ ...empresa, empresa_telefono: v })}
                />
                <Input
                  label="Email"
                  value={empresa.empresa_email}
                  onChange={(v) => setEmpresa({ ...empresa, empresa_email: v })}
                />
                <Input
                  label="Web"
                  value={empresa.empresa_web}
                  onChange={(v) => setEmpresa({ ...empresa, empresa_web: v })}
                />
              </div>

              <div className="mt-6">
                <button
                  onClick={() => saveSection(empresa, 'Datos de empresa guardados correctamente')}
                  disabled={saving}
                  className="inline-flex items-center px-5 py-3 rounded-lg text-white font-semibold transition disabled:opacity-50"
                  style={{ backgroundColor: '#6d4c51' }}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Guardando...' : 'Guardar empresa'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'facturacion' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
                Configuración de Facturación
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Serie por defecto"
                  value={facturacion.facturacion_serie_por_defecto}
                  onChange={(v) =>
                    setFacturacion({ ...facturacion, facturacion_serie_por_defecto: v })
                  }
                />
                <Input
                  label="Próximo número"
                  value={facturacion.facturacion_proximo_numero}
                  onChange={(v) =>
                    setFacturacion({ ...facturacion, facturacion_proximo_numero: v })
                  }
                />
                <Input
                  label="Formato número"
                  value={facturacion.facturacion_formato_numero}
                  onChange={(v) =>
                    setFacturacion({ ...facturacion, facturacion_formato_numero: v })
                  }
                />
                <Select
                  label="Incluir IVA"
                  value={facturacion.facturacion_incluir_iva}
                  onChange={(v) =>
                    setFacturacion({ ...facturacion, facturacion_incluir_iva: v })
                  }
                  options={[
                    { value: 'true', label: 'Sí' },
                    { value: 'false', label: 'No' },
                  ]}
                />
                <Select
                  label="Tipo IVA por defecto"
                  value={facturacion.facturacion_tipo_iva_por_defecto}
                  onChange={(v) =>
                    setFacturacion({
                      ...facturacion,
                      facturacion_tipo_iva_por_defecto: v,
                    })
                  }
                  options={[
                    { value: '4', label: '4%' },
                    { value: '10', label: '10%' },
                    { value: '21', label: '21%' },
                  ]}
                />
                <Select
                  label="Mostrar logo"
                  value={facturacion.facturacion_mostrar_logo}
                  onChange={(v) =>
                    setFacturacion({ ...facturacion, facturacion_mostrar_logo: v })
                  }
                  options={[
                    { value: 'true', label: 'Sí' },
                    { value: 'false', label: 'No' },
                  ]}
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Texto pie de factura
                </label>
                <textarea
                  value={facturacion.facturacion_texto_pie_factura}
                  onChange={(e) =>
                    setFacturacion({
                      ...facturacion,
                      facturacion_texto_pie_factura: e.target.value,
                    })
                  }
                  rows={4}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="mt-6">
                <button
                  onClick={() =>
                    saveSection(
                      facturacion,
                      'Configuración de facturación guardada correctamente'
                    )
                  }
                  disabled={saving}
                  className="inline-flex items-center px-5 py-3 rounded-lg text-white font-semibold transition disabled:opacity-50"
                  style={{ backgroundColor: '#6d4c51' }}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Guardando...' : 'Guardar facturación'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'certificados' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
                Certificados Digitales
              </h2>
              <CertificateUpload />
            </div>
          )}

          {activeTab === 'preferencias' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
                Preferencias de Usuario
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Idioma"
                  value={preferencias.usuario_idioma}
                  onChange={(v) => setPreferencias({ ...preferencias, usuario_idioma: v })}
                  options={[
                    { value: 'es', label: 'Español' },
                    { value: 'en', label: 'English' },
                    { value: 'pt', label: 'Português' },
                    { value: 'fr', label: 'Français' },
                    { value: 'de', label: 'Deutsch' },
                  ]}
                />
                <Select
                  label="Tema"
                  value={preferencias.usuario_tema}
                  onChange={(v) => setPreferencias({ ...preferencias, usuario_tema: v })}
                  options={[
                    { value: 'light', label: 'Claro' },
                    { value: 'dark', label: 'Oscuro' },
                  ]}
                />
                <Select
                  label="Notificaciones por email"
                  value={preferencias.usuario_notificaciones_email}
                  onChange={(v) =>
                    setPreferencias({
                      ...preferencias,
                      usuario_notificaciones_email: v,
                    })
                  }
                  options={[
                    { value: 'true', label: 'Sí' },
                    { value: 'false', label: 'No' },
                  ]}
                />
                <Select
                  label="Formato de fecha"
                  value={preferencias.usuario_formato_fecha}
                  onChange={(v) =>
                    setPreferencias({ ...preferencias, usuario_formato_fecha: v })
                  }
                  options={[
                    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
                    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                  ]}
                />
                <Select
                  label="Moneda"
                  value={preferencias.usuario_formato_moneda}
                  onChange={(v) =>
                    setPreferencias({ ...preferencias, usuario_formato_moneda: v })
                  }
                  options={[
                    { value: 'EUR', label: 'EUR (€)' },
                    { value: 'USD', label: 'USD ($)' },
                    { value: 'GBP', label: 'GBP (£)' },
                  ]}
                />
              </div>

              <div className="mt-6">
                <button
                  onClick={() =>
                    saveSection(preferencias, 'Preferencias guardadas correctamente')
                  }
                  disabled={saving}
                  className="inline-flex items-center px-5 py-3 rounded-lg text-white font-semibold transition disabled:opacity-50"
                  style={{ backgroundColor: '#6d4c51' }}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Guardando...' : 'Guardar preferencias'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

type InputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

function Input({ label, value, onChange }: InputProps) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
      />
    </div>
  );
}

type SelectProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
};

function Select({ label, value, onChange, options }: SelectProps) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default Configuracion;