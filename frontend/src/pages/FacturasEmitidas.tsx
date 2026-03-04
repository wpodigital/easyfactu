import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Search, Plus, Eye, Edit2, Trash2, X, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface Factura {
  id: number;
  num_serie_factura: string;
  id_emisor_factura: string;
  nombre_razon_emisor: string;
  fecha_expedicion_factura: string;
  base_imponible_aimporte_total: number;
  cuota_total: number;
  importe_total: number;
  estado_registro?: string;
}

export default function FacturasEmitidas() {
  const { t } = useTranslation();
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedFactura, setSelectedFactura] = useState<Factura | null>(null);

  useEffect(() => {
    fetchFacturas();
  }, []);

  const fetchFacturas = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/v1/invoices');
      const data = await response.json();
      setFacturas(data.invoices || []);
    } catch (error) {
      console.error('Error fetching facturas:', error);
      setFacturas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta factura?')) return;

    try {
      const response = await fetch(`http://localhost:3000/api/v1/invoices/${id}`, {
        method: 'DELETE'
      });

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

  const handleValidate = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:3000/api/v1/invoices/${id}/validate`, {
        method: 'POST'
      });

      if (response.ok) {
        alert('Factura validada correctamente');
        fetchFacturas();
      } else {
        const error = await response.json();
        alert(error.error || 'Error al validar factura');
      }
    } catch (error) {
      console.error('Error validating factura:', error);
      alert('Error al validar factura');
    }
  };

  const handleViewDetails = (factura: Factura) => {
    setSelectedFactura(factura);
    setShowModal(true);
  };

  const getStatusBadge = (estado?: string) => {
    if (!estado || estado === 'Pendiente') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
          <Clock className="h-3 w-3 mr-1" />
          Pendiente
        </span>
      );
    }
    if (estado === 'Validada') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Validada
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
        <AlertCircle className="h-3 w-3 mr-1" />
        Error
      </span>
    );
  };

  const filteredFacturas = facturas.filter(factura =>
    factura.num_serie_factura.toLowerCase().includes(searchTerm.toLowerCase()) ||
    factura.nombre_razon_emisor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-[#4a8fa0] rounded-lg">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {t('facturasEmitidas.title', 'Facturas Emitidas')}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('facturasEmitidas.subtitle', 'Gestiona tus facturas emitidas')}
                </p>
              </div>
            </div>
            <button
              onClick={() => alert('Funcionalidad de crear factura en desarrollo')}
              className="flex items-center space-x-2 px-4 py-2 bg-[#4a8fa0] text-white rounded-lg hover:bg-[#3a7080] transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>{t('facturasEmitidas.new', 'Nueva Factura')}</span>
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
              placeholder={t('facturasEmitidas.search', 'Buscar facturas...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#4a8fa0] focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        {/* Facturas Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#4a8fa0]"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">{t('common.loading', 'Cargando...')}</p>
          </div>
        ) : filteredFacturas.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              {searchTerm ? t('facturasEmitidas.noResults', 'No se encontraron facturas') : t('facturasEmitidas.empty', 'No hay facturas')}
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('facturasEmitidas.number', 'Número')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('facturasEmitidas.client', 'Cliente')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('facturasEmitidas.date', 'Fecha')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('facturasEmitidas.base', 'Base')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('facturasEmitidas.total', 'Total')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('facturasEmitidas.status', 'Estado')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('facturasEmitidas.actions', 'Acciones')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredFacturas.map((factura) => (
                  <tr key={factura.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {factura.num_serie_factura}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {factura.nombre_razon_emisor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(factura.fecha_expedicion_factura).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {factura.base_imponible_aimporte_total?.toFixed(2) || '0.00'}€
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {factura.importe_total?.toFixed(2) || '0.00'}€
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(factura.estado_registro)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleViewDetails(factura)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleValidate(factura.id)}
                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                        title="Validar"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(factura.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showModal && selectedFactura && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('facturasEmitidas.details', 'Detalles de Factura')}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Número de Factura</p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white font-semibold">{selectedFactura.num_serie_factura}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Estado</p>
                  <p className="mt-1">{getStatusBadge(selectedFactura.estado_registro)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Emisor</p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedFactura.nombre_razon_emisor}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">NIF Emisor</p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedFactura.id_emisor_factura}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Fecha de Expedición</p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {new Date(selectedFactura.fecha_expedicion_factura).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Base Imponible</p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedFactura.base_imponible_aimporte_total?.toFixed(2) || '0.00'}€</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">IVA</p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedFactura.cuota_total?.toFixed(2) || '0.00'}€</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total</p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white font-bold text-lg">{selectedFactura.importe_total?.toFixed(2) || '0.00'}€</p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {t('common.close', 'Cerrar')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
