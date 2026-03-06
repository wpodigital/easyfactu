import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Truck, Search, Plus, Edit2, Trash2, X } from 'lucide-react';

interface Proveedor {
  id: number;
  nif: string;
  nombre_razon_social: string;
  nombre_comercial?: string;
  email?: string;
  telefono?: string;
  movil?: string;
  direccion?: string;
  codigo_postal?: string;
  ciudad?: string;
  provincia?: string;
  pais?: string;
  activo: boolean;
}

export default function Proveedores() {
  const { t } = useTranslation();
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProveedor, setEditingProveedor] = useState<Proveedor | null>(null);
  const [formData, setFormData] = useState({
    nif: '',
    nombre_razon_social: '',
    nombre_comercial: '',
    email: '',
    telefono: '',
    movil: '',
    fax: '',
    web: '',
    direccion: '',
    codigo_postal: '',
    ciudad: '',
    provincia: '',
    pais: 'España'
  });

  useEffect(() => {
    fetchProveedores();
  }, []);

  const fetchProveedores = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/v1/proveedores');
      const data = await response.json();
      setProveedores(data.proveedores || []);
    } catch (error) {
      console.error('Error fetching proveedores:', error);
      setProveedores([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingProveedor
        ? `http://localhost:3000/api/v1/proveedores/${editingProveedor.id}`
        : 'http://localhost:3000/api/v1/proveedores';
      
      const method = editingProveedor ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        fetchProveedores();
        handleCloseModal();
      } else {
        const error = await response.json();
        alert(error.error || 'Error al guardar proveedor');
      }
    } catch (error) {
      console.error('Error saving proveedor:', error);
      alert('Error al guardar proveedor');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este proveedor?')) return;

    try {
      const response = await fetch(`http://localhost:3000/api/v1/proveedores/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchProveedores();
      } else {
        alert('Error al eliminar proveedor');
      }
    } catch (error) {
      console.error('Error deleting proveedor:', error);
      alert('Error al eliminar proveedor');
    }
  };

  const handleEdit = (proveedor: Proveedor) => {
    setEditingProveedor(proveedor);
    setFormData({
      nif: proveedor.nif,
      nombre_razon_social: proveedor.nombre_razon_social,
      nombre_comercial: proveedor.nombre_comercial || '',
      email: proveedor.email || '',
      telefono: proveedor.telefono || '',
      movil: proveedor.movil || '',
      fax: '',
      web: '',
      direccion: proveedor.direccion || '',
      codigo_postal: proveedor.codigo_postal || '',
      ciudad: proveedor.ciudad || '',
      provincia: proveedor.provincia || '',
      pais: proveedor.pais || 'España'
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProveedor(null);
    setFormData({
      nif: '',
      nombre_razon_social: '',
      nombre_comercial: '',
      email: '',
      telefono: '',
      movil: '',
      fax: '',
      web: '',
      direccion: '',
      codigo_postal: '',
      ciudad: '',
      provincia: '',
      pais: 'España'
    });
  };

  const filteredProveedores = proveedores.filter(proveedor =>
    proveedor.nombre_razon_social.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proveedor.nif.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (proveedor.email && proveedor.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-[#3a6a82] rounded-lg">
                <Truck className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {t('proveedores.title', 'Proveedores')}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('proveedores.subtitle', 'Gestiona tus proveedores')}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-[#3a6a82] text-white rounded-lg hover:bg-[#2d5366] transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>{t('proveedores.new', 'Nuevo Proveedor')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('proveedores.search', 'Buscar proveedores...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#3a6a82] focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        {/* Proveedores Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#3a6a82]"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">{t('common.loading', 'Cargando...')}</p>
          </div>
        ) : filteredProveedores.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
            <Truck className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              {searchTerm ? t('proveedores.noResults', 'No se encontraron proveedores') : t('proveedores.empty', 'No hay proveedores')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProveedores.map((proveedor) => (
              <div
                key={proveedor.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-[#3a6a82] bg-opacity-10 rounded-lg">
                      <Truck className="h-6 w-6 text-[#3a6a82]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {proveedor.nombre_razon_social}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{proveedor.nif}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  {proveedor.email && (
                    <p className="text-gray-600 dark:text-gray-400">📧 {proveedor.email}</p>
                  )}
                  {proveedor.telefono && (
                    <p className="text-gray-600 dark:text-gray-400">📞 {proveedor.telefono}</p>
                  )}
                  {proveedor.ciudad && (
                    <p className="text-gray-600 dark:text-gray-400">
                      📍 {proveedor.ciudad}{proveedor.provincia && `, ${proveedor.provincia}`}
                    </p>
                  )}
                </div>

                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => handleEdit(proveedor)}
                    className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                    <span>{t('common.edit', 'Editar')}</span>
                  </button>
                  <button
                    onClick={() => handleDelete(proveedor.id)}
                    className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>{t('common.delete', 'Eliminar')}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {editingProveedor ? t('proveedores.edit', 'Editar Proveedor') : t('proveedores.new', 'Nuevo Proveedor')}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('proveedores.nif', 'NIF/CIF')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nif}
                    onChange={(e) => setFormData({ ...formData, nif: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#3a6a82] dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('proveedores.razonSocial', 'Razón Social')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nombre_razon_social}
                    onChange={(e) => setFormData({ ...formData, nombre_razon_social: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#3a6a82] dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('proveedores.nombreComercial', 'Nombre Comercial')}
                  </label>
                  <input
                    type="text"
                    value={formData.nombre_comercial}
                    onChange={(e) => setFormData({ ...formData, nombre_comercial: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#3a6a82] dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('proveedores.email', 'Email')}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#3a6a82] dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('proveedores.telefono', 'Teléfono')}
                  </label>
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#3a6a82] dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('proveedores.movil', 'Móvil')}
                  </label>
                  <input
                    type="tel"
                    value={formData.movil}
                    onChange={(e) => setFormData({ ...formData, movil: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#3a6a82] dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('proveedores.direccion', 'Dirección')}
                  </label>
                  <input
                    type="text"
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#3a6a82] dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('proveedores.codigoPostal', 'Código Postal')}
                  </label>
                  <input
                    type="text"
                    value={formData.codigo_postal}
                    onChange={(e) => setFormData({ ...formData, codigo_postal: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#3a6a82] dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('proveedores.ciudad', 'Ciudad')}
                  </label>
                  <input
                    type="text"
                    value={formData.ciudad}
                    onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#3a6a82] dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('proveedores.provincia', 'Provincia')}
                  </label>
                  <input
                    type="text"
                    value={formData.provincia}
                    onChange={(e) => setFormData({ ...formData, provincia: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#3a6a82] dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('proveedores.pais', 'País')}
                  </label>
                  <input
                    type="text"
                    value={formData.pais}
                    onChange={(e) => setFormData({ ...formData, pais: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#3a6a82] dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {t('common.cancel', 'Cancelar')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#3a6a82] text-white rounded-lg hover:bg-[#2d5366] transition-colors"
                >
                  {editingProveedor ? t('common.update', 'Actualizar') : t('common.create', 'Crear')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
