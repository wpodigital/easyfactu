import { useEffect, useState } from 'react';
import { Building, FileText, Settings, Save, Key, Users, Plus, Pencil, Trash2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import CertificateUpload from '../components/CertificateUpload';
import { useTranslation } from 'react-i18next';

type TabId = 'empresa' | 'facturacion' | 'certificados' | 'preferencias' | 'usuarios';

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
const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

type UsuarioRow = {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  activo: boolean;
  ultimo_acceso: string | null;
  created_at: string;
};

type UsuarioFormData = {
  nombre: string;
  email: string;
  password: string;
  rol: string;
  activo: boolean;
};

const EMPTY_FORM: UsuarioFormData = { nombre: '', email: '', password: '', rol: 'admin', activo: true };

const Configuracion = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabId>('empresa');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // ── Usuarios state ──
  const [usuarios, setUsuarios] = useState<UsuarioRow[]>([]);
  const [usuariosLoading, setUsuariosLoading] = useState(false);
  const [usuariosError, setUsuariosError] = useState('');
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UsuarioRow | null>(null);
  const [userForm, setUserForm] = useState<UsuarioFormData>(EMPTY_FORM);
  const [userFormError, setUserFormError] = useState('');
  const [userFormSaving, setUserFormSaving] = useState(false);
  const [showUserPassword, setShowUserPassword] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);

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
    { id: 'usuarios' as TabId, label: 'Usuarios', icon: Users },
  ];

  // ── User management helpers ──
  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('easyfactu_token') || ''}`,
  });

  const loadUsuarios = async () => {
    setUsuariosLoading(true);
    setUsuariosError('');
    try {
      const res = await fetch(`${API_BASE}/api/v1/usuarios`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al cargar usuarios');
      setUsuarios(data.users || []);
    } catch (e: any) {
      setUsuariosError(e.message);
    } finally {
      setUsuariosLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'usuarios') loadUsuarios();
  }, [activeTab]);

  const openCreateUser = () => {
    setEditingUser(null);
    setUserForm(EMPTY_FORM);
    setUserFormError('');
    setShowUserPassword(false);
    setShowUserModal(true);
  };

  const openEditUser = (u: UsuarioRow) => {
    setEditingUser(u);
    setUserForm({ nombre: u.nombre, email: u.email, password: '', rol: u.rol, activo: u.activo });
    setUserFormError('');
    setShowUserPassword(false);
    setShowUserModal(true);
  };

  const saveUser = async () => {
    setUserFormError('');
    if (!userForm.nombre.trim() || !userForm.email.trim()) {
      setUserFormError('Nombre y email son obligatorios.');
      return;
    }
    if (!editingUser && userForm.password.length < 8) {
      setUserFormError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (editingUser && userForm.password && userForm.password.length < 8) {
      setUserFormError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    setUserFormSaving(true);
    try {
      const body: Record<string, unknown> = {
        nombre: userForm.nombre,
        email: userForm.email,
        rol: userForm.rol,
        activo: userForm.activo,
      };
      if (!editingUser || userForm.password) body.password = userForm.password;

      const url = editingUser
        ? `${API_BASE}/api/v1/usuarios/${editingUser.id}`
        : `${API_BASE}/api/v1/usuarios`;
      const method = editingUser ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: getAuthHeaders(), body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al guardar usuario');
      setShowUserModal(false);
      loadUsuarios();
    } catch (e: any) {
      setUserFormError(e.message);
    } finally {
      setUserFormSaving(false);
    }
  };

  const confirmDeleteUser = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/usuarios/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al eliminar usuario');
      setDeletingUserId(null);
      loadUsuarios();
    } catch (e: any) {
      alert(e.message);
      setDeletingUserId(null);
    }
  };

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

          {activeTab === 'usuarios' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {t('usuarios.title')}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {t('usuarios.subtitle')}
                  </p>
                </div>
                <button
                  onClick={openCreateUser}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium transition"
                  style={{ backgroundColor: '#6d4c51' }}
                >
                  <Plus className="w-4 h-4" />
                  {t('usuarios.createBtn')}
                </button>
              </div>

              {usuariosLoading && (
                <div className="text-gray-500 dark:text-gray-400 text-sm py-8 text-center">
                  {t('usuarios.loading')}
                </div>
              )}

              {usuariosError && (
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm py-4">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {usuariosError}
                </div>
              )}

              {!usuariosLoading && !usuariosError && (
                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        {(['nombre','email','rol','activo','ultimoAcceso','acciones'] as const).map((col) => (
                          <th key={col} className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">
                            {t(`usuarios.table.${col}`)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {usuarios.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                            {t('usuarios.noUsers')}
                          </td>
                        </tr>
                      ) : usuarios.map((u) => (
                        <tr key={u.id} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{u.nombre}</td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{u.email}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              u.rol === 'admin'
                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                              {u.rol === 'admin' ? t('usuarios.modal.rolAdmin') : t('usuarios.modal.rolViewer')}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              u.activo
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                                : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                            }`}>
                              {u.activo ? '✓' : '✗'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                            {u.ultimo_acceso
                              ? new Date(u.ultimo_acceso).toLocaleString()
                              : t('usuarios.neverAccessed')}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openEditUser(u)}
                                className="p-1.5 text-gray-500 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/30 rounded transition"
                                title="Editar"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeletingUserId(u.id)}
                                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition"
                                title="Eliminar"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Delete confirmation */}
              {deletingUserId !== null && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm p-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t('usuarios.deleteTitle')}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                      {t('usuarios.deleteConfirm', {
                        name: usuarios.find((u) => u.id === deletingUserId)?.nombre || '',
                      })}
                    </p>
                    <div className="flex gap-3 justify-end">
                      <button
                        onClick={() => setDeletingUserId(null)}
                        className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        {t('usuarios.cancel')}
                      </button>
                      <button
                        onClick={() => confirmDeleteUser(deletingUserId)}
                        className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700"
                      >
                        {t('usuarios.delete')}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Create / Edit modal */}
              {showUserModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-5">
                      {editingUser ? t('usuarios.modal.editTitle') : t('usuarios.modal.createTitle')}
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('usuarios.modal.nombre')}
                        </label>
                        <input
                          type="text"
                          value={userForm.nombre}
                          onChange={(e) => setUserForm({ ...userForm, nombre: e.target.value })}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6d4c51]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('usuarios.modal.email')}
                        </label>
                        <input
                          type="email"
                          value={userForm.email}
                          onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6d4c51]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {editingUser ? t('usuarios.modal.passwordEdit') : t('usuarios.modal.password')}
                        </label>
                        <div className="relative">
                          <input
                            type={showUserPassword ? 'text' : 'password'}
                            value={userForm.password}
                            onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                            placeholder={editingUser ? '••••••••' : ''}
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 pr-10 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6d4c51]"
                          />
                          <button
                            type="button"
                            onClick={() => setShowUserPassword((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                            tabIndex={-1}
                          >
                            {showUserPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{t('usuarios.modal.passwordHint')}</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('usuarios.modal.rol')}
                        </label>
                        <select
                          value={userForm.rol}
                          onChange={(e) => setUserForm({ ...userForm, rol: e.target.value })}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6d4c51]"
                        >
                          <option value="admin">{t('usuarios.modal.rolAdmin')}</option>
                          <option value="viewer">{t('usuarios.modal.rolViewer')}</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          id="user-activo"
                          type="checkbox"
                          checked={userForm.activo}
                          onChange={(e) => setUserForm({ ...userForm, activo: e.target.checked })}
                          className="w-4 h-4 rounded"
                        />
                        <label htmlFor="user-activo" className="text-sm text-gray-700 dark:text-gray-300">
                          {t('usuarios.modal.activo')}
                        </label>
                      </div>

                      {userFormError && (
                        <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg px-3 py-2 text-sm text-red-700 dark:text-red-300">
                          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          {userFormError}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 justify-end mt-6">
                      <button
                        onClick={() => setShowUserModal(false)}
                        className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        {t('usuarios.cancel')}
                      </button>
                      <button
                        onClick={saveUser}
                        disabled={userFormSaving}
                        className="px-4 py-2 text-sm rounded-lg text-white font-medium disabled:opacity-60 transition"
                        style={{ backgroundColor: '#6d4c51' }}
                      >
                        {userFormSaving ? t('usuarios.saving') : (editingUser ? t('usuarios.saveChanges') : t('usuarios.createBtn'))}
                      </button>
                    </div>
                  </div>
                </div>
              )}
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