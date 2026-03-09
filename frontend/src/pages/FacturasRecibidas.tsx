import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Receipt, Search, Plus, Edit2, Trash2, X, CheckCircle, Clock, Euro } from 'lucide-react';

const COLOR = '#d4a574';

interface Proveedor {
  id: number;
  nombre_razon_social: string;
}

interface FacturaRecibida {
  id: number;
  numero_factura: string;
  proveedor_id: number;
  proveedor_nombre?: string;
  fecha_factura: string;
  fecha_vencimiento?: string;
  base_imponible: number;
  iva_total: number;
  importe_total: number;
  estado: string;
  fecha_pago?: string;
  notas?: string;
}

const emptyForm = {
  numero_factura: '',
  proveedor_id: '',
  fecha_factura: '',
  fecha_vencimiento: '',
  base_imponible: '',
  iva_total: '',
  importe_total: '',
  notas: '',
};

export default function FacturasRecibidas() {
  const { t } = useTranslation();
  const [facturas, setFacturas] = useState<FacturaRecibida[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingFactura, setEditingFactura] = useState<FacturaRecibida | null>(null);
  const [formData, setFormData] = useState({ ...emptyForm });

  useEffect(() => {
    fetchFacturas();
    fetchProveedores();
  }, []);

  const fetchFacturas = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/v1/facturas-recibidas');
      const data = await response.json();
      setFacturas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching facturas recibidas:', error);
      setFacturas([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProveedores = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/proveedores');
      const data = await response.json();
      setProveedores(data.proveedores || []);
    } catch (error) {
      console.error('Error fetching proveedores:', error);
    }
  };

  const handleCreate = () => {
    setEditingFactura(null);
    setFormData({ ...emptyForm });
    setShowModal(true);
  };

  const handleEdit = (factura: FacturaRecibida) => {
    setEditingFactura(factura);
    setFormData({
      numero_factura: factura.numero_factura,
      proveedor_id: String(factura.proveedor_id || ''),
      fecha_factura: factura.fecha_factura ? factura.fecha_factura.slice(0, 10) : '',
      fecha_vencimiento: factura.fecha_vencimiento ? factura.fecha_vencimiento.slice(0, 10) : '',
      base_imponible: String(factura.base_imponible ?? ''),
      iva_total: String(factura.iva_total ?? ''),
      importe_total: String(factura.importe_total ?? ''),
      notas: factura.notas || '',
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingFactura(null);
    setFormData({ ...emptyForm });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        proveedor_id: formData.proveedor_id ? Number(formData.proveedor_id) : null,
        base_imponible: formData.base_imponible ? Number(formData.base_imponible) : null,
        iva_total: formData.iva_total ? Number(formData.iva_total) : null,
        importe_total: formData.importe_total ? Number(formData.importe_total) : null,
        fecha_vencimiento: formData.fecha_vencimiento || null,
        notas: formData.notas || null,
      };

      const url = editingFactura
        ? `http://localhost:3000/api/v1/facturas-recibidas/${editingFactura.id}`
        : 'http://localhost:3000/api/v1/facturas-recibidas';

      const method = editingFactura ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        handleCloseModal();
        fetchFacturas();
      } else {
        const err = await response.json();
        alert(err.error || t('facturasRecibidas.errorSave', 'Error al guardar factura'));
      }
    } catch (error) {
      console.error('Error saving factura:', error);
      alert(t('facturasRecibidas.errorSave', 'Error al guardar factura'));
    }
  };

  const handleMarkAsPaid = async (id: number) => {
    if (!confirm(t('facturasRecibidas.confirmMarkAsPaid', '¿Estás seguro de marcar esta factura como pagada?'))) return;
    try {
      const response = await fetch(
        `http://localhost:3000/api/v1/facturas-recibidas/${id}/pagar`,
        { method: 'POST' }
      );
      if (response.ok) {
        fetchFacturas();
      } else {
        alert(t('facturasRecibidas.errorMarkAsPaid', 'Error al marcar como pagada'));
      }
    } catch (error) {
      console.error('Error marking as paid:', error);
      alert(t('facturasRecibidas.errorMarkAsPaid', 'Error al marcar como pagada'));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('facturasRecibidas.confirmDelete', '¿Estás seguro de eliminar esta factura?'))) return;
    try {
      const response = await fetch(
        `http://localhost:3000/api/v1/facturas-recibidas/${id}`,
        { method: 'DELETE' }
      );
      if (response.ok) {
        fetchFacturas();
      } else {
        alert(t('facturasRecibidas.errorDelete', 'Error al eliminar factura'));
      }
    } catch (error) {
      console.error('Error deleting factura:', error);
      alert(t('facturasRecibidas.errorDelete', 'Error al eliminar factura'));
    }
  };

  const filtered = facturas.filter((f) => {
    const term = searchTerm.toLowerCase();
    return (
      f.numero_factura?.toLowerCase().includes(term) ||
      f.proveedor_nombre?.toLowerCase().includes(term) ||
      f.estado?.toLowerCase().includes(term)
    );
  });

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return dateStr.slice(0, 10);
  };

  const formatCurrency = (amount?: number) => {
    if (amount == null) return '-';
    return `${Number(amount).toFixed(2)} EUR`;
  };

  const StatusBadge = ({ estado }: { estado: string }) => {
    if (estado === 'pagada') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          <CheckCircle className="w-3 h-3" />
          {t('facturasRecibidas.estadoPagada', 'Pagada')}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
        <Clock className="w-3 h-3" />
        {t('facturasRecibidas.estadoPendiente', 'Pendiente')}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${COLOR}20` }}>
              <Receipt className="w-8 h-8 text-white" style={{ color: COLOR }} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {t('facturasRecibidas.title', 'Facturas Recibidas')}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {t('facturasRecibidas.subtitle', 'Gestiona tus facturas recibidas')}
              </p>
            </div>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-semibold transition-colors"
            style={{ backgroundColor: COLOR }}
          >
            <Plus className="w-5 h-5" />
            {t('facturasRecibidas.new', 'Nueva Factura')}
          </button>
        </div>
        </div>
        </div>
        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('facturasRecibidas.search', 'Buscar por número, proveedor o estado...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div
                className="animate-spin rounded-full h-10 w-10 border-b-2 mx-auto mb-4"
                style={{ borderColor: COLOR }}
              />
              <p className="text-gray-500 dark:text-gray-400">{t('facturasRecibidas.loading', 'Cargando facturas...')}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Receipt className="w-12 h-12 mx-auto mb-4" style={{ color: COLOR, opacity: 0.3 }} />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {searchTerm ? t('facturasRecibidas.noResults', 'No se encontraron resultados') : t('facturasRecibidas.empty', 'No hay facturas recibidas')}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm
                  ? t('facturasRecibidas.noResultsHint', 'Prueba con otros términos de búsqueda')
                  : t('facturasRecibidas.emptyHint', 'Crea tu primera factura recibida')}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('facturasRecibidas.colNumero', 'Número')}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('facturasRecibidas.colProveedor', 'Proveedor')}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('facturasRecibidas.colFecha', 'Fecha')}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('facturasRecibidas.colVencimiento', 'Vencimiento')}</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('facturasRecibidas.colBase', 'Base')}</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('facturasRecibidas.colIva', 'IVA')}</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('facturasRecibidas.colTotal', 'Total')}</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('facturasRecibidas.colEstado', 'Estado')}</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('facturasRecibidas.colAcciones', 'Acciones')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filtered.map((factura) => (
                    <tr key={factura.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                        {factura.numero_factura}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {factura.proveedor_nombre || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {formatDate(factura.fecha_factura)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {formatDate(factura.fecha_vencimiento)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-600 dark:text-gray-300">
                        {formatCurrency(factura.base_imponible)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-600 dark:text-gray-300">
                        {formatCurrency(factura.iva_total)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(factura.importe_total)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <StatusBadge estado={factura.estado} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          {factura.estado !== 'pagada' && (
                            <button
                              onClick={() => handleMarkAsPaid(factura.id)}
                              className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                             title={t('facturasRecibidas.markAsPaid', 'Marcar como pagada')}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleEdit(factura)}
                            className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                            title={t('common.edit', 'Editar')}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(factura.id)}
                            className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                            title={t('common.delete', 'Eliminar')}
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
        </div>
        </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {editingFactura ? t('facturasRecibidas.edit', 'Editar Factura Recibida') : t('facturasRecibidas.new', 'Nueva Factura Recibida')}
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
                    {t('facturasRecibidas.numeroFactura', 'Número de Factura')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.numero_factura}
                    onChange={(e) => setFormData({ ...formData, numero_factura: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    placeholder={t('facturasRecibidas.numeroPlaceholder', 'Ej. FAC-2026-001')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('facturasRecibidas.proveedor', 'Proveedor')}
                  </label>
                  <select
                    value={formData.proveedor_id}
                    onChange={(e) => setFormData({ ...formData, proveedor_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">{t('facturasRecibidas.selectProveedor', 'Seleccionar proveedor')}</option>
                    {proveedores.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre_razon_social}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('facturasRecibidas.fechaFactura', 'Fecha Factura')} *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.fecha_factura}
                    onChange={(e) => setFormData({ ...formData, fecha_factura: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('facturasRecibidas.fechaVencimiento', 'Fecha Vencimiento')}
                  </label>
                  <input
                    type="date"
                    value={formData.fecha_vencimiento}
                    onChange={(e) => setFormData({ ...formData, fecha_vencimiento: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('facturasRecibidas.baseImponible', 'Base Imponible (EUR)')}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.base_imponible}
                    onChange={(e) => setFormData({ ...formData, base_imponible: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('facturasRecibidas.iva', 'IVA (EUR)')}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.iva_total}
                    onChange={(e) => setFormData({ ...formData, iva_total: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <span className="flex items-center gap-1">
                      <Euro className="w-4 h-4" />
                      {t('facturasRecibidas.importeTotal', 'Importe Total')} *
                    </span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.importe_total}
                    onChange={(e) => setFormData({ ...formData, importe_total: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    placeholder="0.00"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('facturasRecibidas.notas', 'Notas')}
                  </label>
                  <textarea
                    rows={3}
                    value={formData.notas}
                    onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white resize-none"
                    placeholder={t('facturasRecibidas.notasPlaceholder', 'Observaciones adicionales...')}
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
                  className="px-4 py-2 text-white rounded-lg transition-colors"
                  style={{ backgroundColor: COLOR }}
                >
                  {editingFactura ? t('common.update', 'Actualizar') : t('common.create', 'Crear')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
