import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Receipt, Search, Plus, Edit2, Trash2, X, CheckCircle, Clock, AlertTriangle, Eye, Filter } from 'lucide-react';

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
  iva_percent: '21',
  iva_total: '',
  importe_total: '',
  notas: '',
};

type EstadoFilter = 'all' | 'pendiente' | 'pagada' | 'vencida';

const TODAY = new Date().toISOString().slice(0, 10);

function isOverdue(factura: FacturaRecibida): boolean {
  if (factura.estado === 'pagada') return false;
  if (!factura.fecha_vencimiento) return false;
  return factura.fecha_vencimiento.slice(0, 10) < TODAY;
}

function getEstadoEfectivo(factura: FacturaRecibida): string {
  if (factura.estado === 'pagada') return 'pagada';
  if (isOverdue(factura)) return 'vencida';
  return 'pendiente';
}

export default function FacturasRecibidas() {
  const { t } = useTranslation();
  const [facturas, setFacturas] = useState<FacturaRecibida[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<EstadoFilter>('all');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingFactura, setEditingFactura] = useState<FacturaRecibida | null>(null);
  const [detailFactura, setDetailFactura] = useState<FacturaRecibida | null>(null);
  const [formData, setFormData] = useState({ ...emptyForm });

  const fetchFacturas = useCallback(async () => {
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
  }, []);

  const fetchProveedores = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/proveedores');
      const data = await response.json();
      setProveedores(data.proveedores || []);
    } catch (error) {
      console.error('Error fetching proveedores:', error);
    }
  }, []);

  useEffect(() => {
    fetchFacturas();
    fetchProveedores();
  }, [fetchFacturas, fetchProveedores]);

  // Auto-calculate IVA and total when base or IVA % changes
  const handleBaseChange = (base: string) => {
    const baseNum = parseFloat(base) || 0;
    const pct = parseFloat(formData.iva_percent) || 0;
    const iva = (baseNum * pct) / 100;
    setFormData((prev) => ({
      ...prev,
      base_imponible: base,
      iva_total: iva.toFixed(2),
      importe_total: (baseNum + iva).toFixed(2),
    }));
  };

  const handleIvaPctChange = (pct: string) => {
    const baseNum = parseFloat(formData.base_imponible) || 0;
    const pctNum = parseFloat(pct) || 0;
    const iva = (baseNum * pctNum) / 100;
    setFormData((prev) => ({
      ...prev,
      iva_percent: pct,
      iva_total: iva.toFixed(2),
      importe_total: (baseNum + iva).toFixed(2),
    }));
  };

  const handleIvaAmountChange = (iva: string) => {
    const baseNum = parseFloat(formData.base_imponible) || 0;
    const ivaNum = parseFloat(iva) || 0;
    setFormData((prev) => ({
      ...prev,
      iva_total: iva,
      importe_total: (baseNum + ivaNum).toFixed(2),
    }));
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
      iva_percent: '21',
      iva_total: String(factura.iva_total ?? ''),
      importe_total: String(factura.importe_total ?? ''),
      notas: factura.notas || '',
    });
    setShowModal(true);
  };

  const handleViewDetail = (factura: FacturaRecibida) => {
    setDetailFactura(factura);
    setShowDetailModal(true);
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
        numero_factura: formData.numero_factura,
        proveedor_id: formData.proveedor_id ? Number(formData.proveedor_id) : null,
        fecha_factura: formData.fecha_factura,
        fecha_vencimiento: formData.fecha_vencimiento || null,
        base_imponible: formData.base_imponible ? Number(formData.base_imponible) : null,
        iva_total: formData.iva_total ? Number(formData.iva_total) : null,
        importe_total: formData.importe_total ? Number(formData.importe_total) : null,
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
        alert(err.error || 'Error al guardar factura');
      }
    } catch (error) {
      console.error('Error saving factura:', error);
      alert('Error al guardar factura');
    }
  };

  const handleMarkAsPaid = async (id: number) => {
    if (!confirm('¿Estás seguro de marcar esta factura como pagada?')) return;
    try {
      const response = await fetch(
        `http://localhost:3000/api/v1/facturas-recibidas/${id}/pagar`,
        { method: 'POST' }
      );
      if (response.ok) {
        fetchFacturas();
      } else {
        alert('Error al marcar como pagada');
      }
    } catch (error) {
      console.error('Error marking as paid:', error);
      alert('Error al marcar como pagada');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta factura?')) return;
    try {
      const response = await fetch(
        `http://localhost:3000/api/v1/facturas-recibidas/${id}`,
        { method: 'DELETE' }
      );
      if (response.ok) {
        fetchFacturas();
      } else {
        alert('Error al eliminar factura');
      }
    } catch (error) {
      console.error('Error deleting factura:', error);
      alert('Error al eliminar factura');
    }
  };

  // --- Stats ---
  const totalPendiente = facturas
    .filter((f) => getEstadoEfectivo(f) === 'pendiente')
    .reduce((s, f) => s + (Number(f.importe_total) || 0), 0);
  const totalVencidas = facturas
    .filter((f) => getEstadoEfectivo(f) === 'vencida')
    .reduce((s, f) => s + (Number(f.importe_total) || 0), 0);
  const totalPagadas = facturas
    .filter((f) => f.estado === 'pagada')
    .reduce((s, f) => s + (Number(f.importe_total) || 0), 0);
  const countVencidas = facturas.filter((f) => getEstadoEfectivo(f) === 'vencida').length;

  // --- Filtering ---
  const filtered = facturas.filter((f) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      f.numero_factura?.toLowerCase().includes(term) ||
      f.proveedor_nombre?.toLowerCase().includes(term) ||
      f.estado?.toLowerCase().includes(term);
    const estado = getEstadoEfectivo(f);
    const matchesEstado =
      estadoFilter === 'all' ||
      estadoFilter === estado;
    return matchesSearch && matchesEstado;
  });

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return dateStr.slice(0, 10);
  };

  const formatCurrency = (amount?: number) => {
    if (amount == null) return '-';
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(Number(amount));
  };

  const StatusBadge = ({ factura }: { factura: FacturaRecibida }) => {
    const estado = getEstadoEfectivo(factura);
    if (estado === 'pagada') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          <CheckCircle className="w-3 h-3" />
          Pagada
        </span>
      );
    }
    if (estado === 'vencida') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
          <AlertTriangle className="w-3 h-3" />
          Vencida
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
        <Clock className="w-3 h-3" />
        Pendiente
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
                <Receipt className="w-8 h-8" style={{ color: COLOR }} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {t('facturasRecibidas.title', 'Facturas Recibidas')}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {t('facturasRecibidas.subtitle', 'Gestiona tus facturas recibidas de proveedores')}
                </p>
              </div>
            </div>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-semibold transition-opacity hover:opacity-90"
              style={{ backgroundColor: COLOR }}
            >
              <Plus className="w-5 h-5" />
              Nueva Factura
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5 flex items-center gap-4">
            <div className="p-3 rounded-full" style={{ backgroundColor: `${COLOR}20` }}>
              <Receipt className="w-6 h-6" style={{ color: COLOR }} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total facturas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{facturas.length}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5 flex items-center gap-4">
            <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900">
              <Clock className="w-6 h-6 text-yellow-700 dark:text-yellow-300" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pendiente de pago</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalPendiente)}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5 flex items-center gap-4">
            <div className="p-3 rounded-full bg-red-100 dark:bg-red-900">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Vencidas ({countVencidas})</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{formatCurrency(totalVencidas)}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5 flex items-center gap-4">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pagadas</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(totalPagadas)}</p>
            </div>
          </div>
        </div>

        {/* Search and filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por número o proveedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': `${COLOR}60` } as React.CSSProperties}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400 shrink-0" />
            <select
              value={estadoFilter}
              onChange={(e) => setEstadoFilter(e.target.value as EstadoFilter)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
            >
              <option value="all">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="vencida">Vencida</option>
              <option value="pagada">Pagada</option>
            </select>
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
              <p className="text-gray-500 dark:text-gray-400">Cargando facturas...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Receipt className="w-12 h-12 mx-auto mb-4" style={{ color: COLOR, opacity: 0.3 }} />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {searchTerm || estadoFilter !== 'all' ? 'No se encontraron resultados' : 'No hay facturas recibidas'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm || estadoFilter !== 'all'
                  ? 'Prueba con otros términos o filtros'
                  : 'Crea tu primera factura recibida'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Número</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Proveedor</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fecha</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Vencimiento</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Base</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">IVA</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Estado</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filtered.map((factura) => (
                    <tr key={factura.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                        <button
                          onClick={() => handleViewDetail(factura)}
                          className="hover:underline text-left"
                          style={{ color: COLOR }}
                        >
                          {factura.numero_factura}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {factura.proveedor_nombre || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {formatDate(factura.fecha_factura)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {isOverdue(factura) ? (
                          <span className="text-red-600 dark:text-red-400 font-medium">
                            {formatDate(factura.fecha_vencimiento)}
                          </span>
                        ) : (
                          formatDate(factura.fecha_vencimiento)
                        )}
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
                        <StatusBadge factura={factura} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleViewDetail(factura)}
                            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {factura.estado !== 'pagada' && (
                            <button
                              onClick={() => handleMarkAsPaid(factura.id)}
                              className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                              title="Marcar como pagada"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleEdit(factura)}
                            className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(factura.id)}
                            className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
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
        </div>
      </div>

      {/* Detail modal */}
      {showDetailModal && detailFactura && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full">
            <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Detalle: {detailFactura.numero_factura}
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Número</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{detailFactura.numero_factura}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Proveedor</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{detailFactura.proveedor_nombre || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Fecha factura</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(detailFactura.fecha_factura)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Fecha vencimiento</span>
                <span className={`text-sm font-medium ${isOverdue(detailFactura) ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                  {formatDate(detailFactura.fecha_vencimiento)}
                </span>
              </div>
              <hr className="border-gray-200 dark:border-gray-700" />
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Base imponible</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(detailFactura.base_imponible)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">IVA</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(detailFactura.iva_total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Importe total</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(detailFactura.importe_total)}</span>
              </div>
              <hr className="border-gray-200 dark:border-gray-700" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">Estado</span>
                <StatusBadge factura={detailFactura} />
              </div>
              {detailFactura.fecha_pago && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Fecha pago</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(detailFactura.fecha_pago)}</span>
                </div>
              )}
              {detailFactura.notas && (
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Notas</span>
                  <p className="text-sm text-gray-900 dark:text-white mt-1 bg-gray-50 dark:bg-gray-700 p-2 rounded">{detailFactura.notas}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 px-6 pb-6">
              {detailFactura.estado !== 'pagada' && (
                <button
                  onClick={() => { setShowDetailModal(false); handleMarkAsPaid(detailFactura.id); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  <CheckCircle className="w-4 h-4" />
                  Marcar pagada
                </button>
              )}
              <button
                onClick={() => { setShowDetailModal(false); handleEdit(detailFactura); }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-opacity hover:opacity-90 text-sm font-medium"
                style={{ backgroundColor: COLOR }}
              >
                <Edit2 className="w-4 h-4" />
                Editar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {editingFactura ? 'Editar Factura Recibida' : 'Nueva Factura Recibida'}
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
                    Número de Factura *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.numero_factura}
                    onChange={(e) => setFormData({ ...formData, numero_factura: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    placeholder="Ej. FAC-2026-001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Proveedor
                  </label>
                  <select
                    value={formData.proveedor_id}
                    onChange={(e) => setFormData({ ...formData, proveedor_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Seleccionar proveedor</option>
                    {proveedores.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre_razon_social}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Fecha Factura *
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
                    Fecha Vencimiento
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
                    Base Imponible (EUR)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.base_imponible}
                    onChange={(e) => handleBaseChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    IVA (%)
                  </label>
                  <select
                    value={formData.iva_percent}
                    onChange={(e) => handleIvaPctChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  >
                    <option value="0">0%</option>
                    <option value="4">4% (superreducido)</option>
                    <option value="10">10% (reducido)</option>
                    <option value="21">21% (general)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    IVA (EUR)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.iva_total}
                    onChange={(e) => handleIvaAmountChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Importe Total *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.importe_total}
                    onChange={(e) => setFormData({ ...formData, importe_total: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white bg-gray-50 dark:bg-gray-600"
                    placeholder="0.00"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Notas
                  </label>
                  <textarea
                    rows={3}
                    value={formData.notas}
                    onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white resize-none"
                    placeholder="Observaciones adicionales..."
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
