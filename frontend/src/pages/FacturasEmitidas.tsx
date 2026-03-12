import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Search, Plus, Eye, Trash2, X, CheckCircle, Clock, AlertCircle, XCircle, Send, Download } from 'lucide-react';

const API_URL = '/api/v1';
const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('easyfactu_token') || ''}`,
});

interface Factura {
  id: number;
  numSerie: string;
  idEmisor: string;
  nombreEmisor: string;
  fecha: string;
  tipoFactura: string;
  importeTotal: number;
  cuotaTotal: number;
  status: string;
  validationStatus?: string;
  validationCSV?: string;
}

interface Stats {
  total: number;
  pendientes: number;
  validadas: number;
  importeTotal: number;
}

interface ClienteOption {
  id: number;
  nif: string;
  nombre_razon_social: string;
}

interface NuevaFacturaForm {
  numSerie: string;
  nif: string;
  nombreRazon: string;
  fecha: string;
  tipoFactura: string;
  baseImponible: string;
  tipoIva: string;
  // Receptor (destinatario)
  receptorClienteId: string;   // selected from dropdown ('' = manual)
  nifReceptor: string;
  nombreReceptor: string;
}

const DEFAULT_FORM: NuevaFacturaForm = {
  numSerie: '',
  nif: '',
  nombreRazon: '',
  fecha: new Date().toISOString().split('T')[0],
  tipoFactura: 'F1',
  baseImponible: '',
  tipoIva: '21',
  receptorClienteId: '',
  nifReceptor: '',
  nombreReceptor: '',
};

export default function FacturasEmitidas() {
  const { t } = useTranslation();
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, pendientes: 0, validadas: 0, importeTotal: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedFactura, setSelectedFactura] = useState<Factura | null>(null);
  const [form, setForm] = useState<NuevaFacturaForm>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [clientes, setClientes] = useState<ClienteOption[]>([]);

  useEffect(() => {
    fetchFacturas();
    fetchStats();
  }, []);

  const fetchFacturas = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/invoices`, { headers: authHeaders() });
      const data = await response.json();
      setFacturas(data.invoices || []);
    } catch (error) {
      console.error('Error fetching facturas:', error);
      setFacturas([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/invoices/stats`, { headers: authHeaders() });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('facturasEmitidas.confirmDelete'))) return;
    try {
      const response = await fetch(`${API_URL}/invoices/${id}`, { method: 'DELETE', headers: authHeaders() });
      if (response.ok) {
        fetchFacturas();
        fetchStats();
      } else {
        alert(t('facturasEmitidas.errorDelete'));
      }
    } catch {
      alert(t('facturasEmitidas.errorDelete'));
    }
  };

  const handleValidate = async (id: number) => {
    if (!confirm(t('facturasEmitidas.validateConfirm'))) return;
    try {
      const response = await fetch(`${API_URL}/invoices/${id}/validate`, { method: 'POST', headers: authHeaders() });
      if (response.ok) {
        alert(t('facturasEmitidas.validateSuccess'));
        fetchFacturas();
        fetchStats();
      } else {
        const err = await response.json();
        alert(err.error || t('facturasEmitidas.validateError'));
      }
    } catch {
      alert(t('facturasEmitidas.validateError'));
    }
  };

  const handleViewDetails = (factura: Factura) => {
    setSelectedFactura(factura);
    setShowDetailModal(true);
  };

  const handleDownloadPdf = async (id: number, numSerie: string) => {
    try {
      const response = await fetch(`${API_URL}/invoices/${id}/pdf`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('easyfactu_token') || ''}` },
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        alert(err.message || 'Error al generar el PDF');
        return;
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `factura-${numSerie.replace(/[^a-zA-Z0-9-_]/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert('Error al descargar el PDF');
    }
  };

  const handleOpenCreate = async () => {
    // Reset to defaults first (today's date, empty fields)
    const baseForm = { ...DEFAULT_FORM, fecha: new Date().toISOString().split('T')[0] };
    setForm(baseForm);
    setErrorMsg('');

    // Load emisor data from configuración and client list in parallel
    try {
      const [configRes, clientesRes] = await Promise.all([
        fetch(`${API_URL}/configuracion?tipo=empresa`, { headers: authHeaders() }),
        fetch(`${API_URL}/clientes?limit=200`, { headers: authHeaders() }),
      ]);
      if (configRes.ok) {
        const configData = await configRes.json();
        // configData is an array of { clave, valor } objects
        const cfg: Record<string, string> = {};
        if (Array.isArray(configData)) {
          configData.forEach((item: { clave: string; valor: string }) => { cfg[item.clave] = item.valor; });
        } else if (configData && typeof configData === 'object') {
          // getGrouped returns { empresa: [...], ... }
          const arr = configData.empresa || [];
          arr.forEach((item: { clave: string; valor: string }) => { cfg[item.clave] = item.valor; });
        }
        setForm(f => ({
          ...f,
          nif: cfg['empresa_nif'] || '',
          nombreRazon: cfg['empresa_nombre'] || '',
        }));
      }
      if (clientesRes.ok) {
        const clientesData = await clientesRes.json();
        const lista: ClienteOption[] = (clientesData.clientes || []).map((c: { id: number; nif: string; nombre_razon_social: string }) => ({
          id: c.id,
          nif: c.nif,
          nombre_razon_social: c.nombre_razon_social,
        }));
        setClientes(lista);
      }
    } catch {
      // Non-critical: proceed with empty defaults
    }

    setShowCreateModal(true);
  };

  const cuotaIva = () => {
    const base = parseFloat(form.baseImponible) || 0;
    const pct = parseFloat(form.tipoIva) || 0;
    return (base * pct) / 100;
  };

  const importeTotal = () => {
    const base = parseFloat(form.baseImponible) || 0;
    return base + cuotaIva();
  };

  const handleSave = async () => {
    if (!form.numSerie.trim() || !form.nif.trim() || !form.nombreRazon.trim() || !form.baseImponible) {
      setErrorMsg(t('facturasEmitidas.requiredFields'));
      return;
    }
    setSaving(true);
    setErrorMsg('');
    try {
      const body: Record<string, unknown> = {
        NumeroSerie: form.numSerie.trim(),
        NIF: form.nif.trim(),
        NombreRazon: form.nombreRazon.trim(),
        FechaExpedicion: form.fecha,
        TipoFactura: form.tipoFactura,
        ImporteTotal: importeTotal(),
        CuotaTotal: cuotaIva(),
        Operacion: 'A0',
      };
      // Add receptor if provided
      const nifRec = form.nifReceptor.trim();
      const nombreRec = form.nombreReceptor.trim();
      if (nombreRec) {
        body.NombreReceptor = nombreRec;
        if (nifRec) body.NifReceptor = nifRec;
      }
      const response = await fetch(`${API_URL}/invoices`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
      if (response.ok) {
        setShowCreateModal(false);
        fetchFacturas();
        fetchStats();
      } else {
        const err = await response.json();
        setErrorMsg(err.message || t('facturasEmitidas.errorSave'));
      }
    } catch {
      setErrorMsg(t('facturasEmitidas.errorSave'));
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (factura: Factura) => {
    const validated = factura.validationStatus === 'Correcto';
    const anulada = factura.status === 'Anulada';
    if (anulada) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
          <XCircle className="h-3 w-3 mr-1" />
          {t('facturasEmitidas.estadoAnulada')}
        </span>
      );
    }
    if (validated) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          {t('facturasEmitidas.estadoValidada')}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
        <Clock className="h-3 w-3 mr-1" />
        {t('facturasEmitidas.estadoPendiente')}
      </span>
    );
  };

  const matchesFilter = (f: Factura) => {
    if (!statusFilter) return true;
    if (statusFilter === 'Validada') return f.validationStatus === 'Correcto';
    if (statusFilter === 'Anulada') return f.status === 'Anulada';
    if (statusFilter === 'Pendiente') return f.validationStatus !== 'Correcto' && f.status !== 'Anulada';
    return true;
  };

  const filteredFacturas = facturas.filter(f => {
    const term = searchTerm.toLowerCase();
    const matchSearch =
      !term ||
      f.numSerie.toLowerCase().includes(term) ||
      (f.nombreEmisor || '').toLowerCase().includes(term) ||
      (f.idEmisor || '').toLowerCase().includes(term);
    return matchSearch && matchesFilter(f);
  });

  const formatCurrency = (n?: number) =>
    (n ?? 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

  // Parse date without timezone shifting: split YYYY-MM-DD manually so the
  // date is not treated as UTC midnight (which would shift by 1 day in UTC+N).
  const formatDate = (d?: string): string => {
    if (!d) return '-';
    const s = d.split('T')[0];
    const parts = s.split('-');
    if (parts.length === 3 && parts[0].length === 4) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return d;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#4a8fa0' }}>
                <FileText className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {t('facturasEmitidas.title')}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('facturasEmitidas.subtitle')}
                </p>
              </div>
            </div>
            <button
              onClick={handleOpenCreate}
              className="flex items-center space-x-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#4a8fa0' }}
            >
              <Plus className="h-5 w-5" />
              <span>{t('facturasEmitidas.new')}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4" style={{ borderColor: '#4a8fa0' }}>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('facturasEmitidas.statsTotal')}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-yellow-400">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('facturasEmitidas.statsPendientes')}</p>
            <p className="mt-2 text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pendientes}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-green-500">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('facturasEmitidas.statsValidadas')}</p>
            <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">{stats.validadas}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4" style={{ borderColor: '#4a8fa0' }}>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('facturasEmitidas.statsImporte')}</p>
            <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.importeTotal)}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('facturasEmitidas.search')}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#4a8fa0] dark:bg-gray-700 dark:text-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2"
          >
            <option value="">{t('facturasEmitidas.filterAll')}</option>
            <option value="Pendiente">{t('facturasEmitidas.filterPendiente')}</option>
            <option value="Validada">{t('facturasEmitidas.filterValidada')}</option>
            <option value="Anulada">{t('facturasEmitidas.filterAnulada')}</option>
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#4a8fa0' }}></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">{t('facturasEmitidas.loading')}</p>
          </div>
        ) : filteredFacturas.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              {searchTerm || statusFilter ? t('facturasEmitidas.noResults') : t('facturasEmitidas.empty')}
            </h3>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              {searchTerm || statusFilter ? t('facturasEmitidas.noResultsHint') : t('facturasEmitidas.emptyHint')}
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    {['colNumero', 'colCliente', 'colFecha', 'colBase', 'colIva', 'colTotal', 'colEstado', 'colAcciones'].map(col => (
                      <th key={col} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t(`facturasEmitidas.${col}`)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredFacturas.map(factura => (
                    <tr key={factura.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {factura.numSerie}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        <div className="font-medium">{factura.nombreEmisor || '-'}</div>
                        <div className="text-xs text-gray-400">{factura.idEmisor}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(factura.fecha)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {formatCurrency((factura.importeTotal || 0) - (factura.cuotaTotal || 0))}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {formatCurrency(factura.cuotaTotal)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(factura.importeTotal)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {getStatusBadge(factura)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewDetails(factura)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title={t('facturasEmitidas.details')}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDownloadPdf(factura.id, factura.numSerie)}
                            className="text-[#6d4c51] hover:opacity-70"
                            title="Descargar PDF"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          {factura.validationStatus !== 'Correcto' && factura.status !== 'Anulada' && (
                            <button
                              onClick={() => handleValidate(factura.id)}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                              title={t('facturasEmitidas.validate')}
                            >
                              <Send className="h-4 w-4" />
                            </button>
                          )}
                          {factura.status !== 'Anulada' && (
                            <button
                              onClick={() => handleDelete(factura.id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              title={t('common.delete')}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('facturasEmitidas.new')}
              </h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {errorMsg && (
                <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 dark:text-red-300">{errorMsg}</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('facturasEmitidas.numeroFactura')} *
                  </label>
                  <input
                    type="text"
                    value={form.numSerie}
                    onChange={e => setForm(f => ({ ...f, numSerie: e.target.value }))}
                    placeholder={t('facturasEmitidas.numeroPlaceholder')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('facturasEmitidas.fechaExpedicion')} *
                  </label>
                  <input
                    type="date"
                    value={form.fecha}
                    onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('facturasEmitidas.nifEmisor')} *
                  </label>
                  <input
                    type="text"
                    value={form.nif}
                    onChange={e => setForm(f => ({ ...f, nif: e.target.value }))}
                    placeholder={t('facturasEmitidas.nifEmisorPlaceholder')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('facturasEmitidas.nombreEmisor')} *
                  </label>
                  <input
                    type="text"
                    value={form.nombreRazon}
                    onChange={e => setForm(f => ({ ...f, nombreRazon: e.target.value }))}
                    placeholder={t('facturasEmitidas.nombreEmisorPlaceholder')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('facturasEmitidas.tipoFactura')}
                  </label>
                  <select
                    value={form.tipoFactura}
                    onChange={e => setForm(f => ({ ...f, tipoFactura: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  >
                    {['F1','F2','R1','R2','R3','R4','R5'].map(tipo => (
                      <option key={tipo} value={tipo}>{t(`facturasEmitidas.tipo${tipo}`)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('facturasEmitidas.tipoIva')}
                  </label>
                  <select
                    value={form.tipoIva}
                    onChange={e => setForm(f => ({ ...f, tipoIva: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  >
                    <option value="0">{t('facturasEmitidas.iva0')}</option>
                    <option value="4">{t('facturasEmitidas.iva4')}</option>
                    <option value="10">{t('facturasEmitidas.iva10')}</option>
                    <option value="21">{t('facturasEmitidas.iva21')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('facturasEmitidas.baseImponible')} *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.baseImponible}
                    onChange={e => setForm(f => ({ ...f, baseImponible: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('facturasEmitidas.cuotaIva')}
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={cuotaIva().toFixed(2)}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 dark:text-gray-300 text-gray-500"
                  />
                </div>
              </div>

              {/* Receptor / Destinatario */}
              <div className="border-t dark:border-gray-700 pt-4">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{t('facturasEmitidas.sectionReceptor')}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('facturasEmitidas.selectCliente')}
                    </label>
                    <select
                      value={form.receptorClienteId}
                      onChange={e => {
                        const val = e.target.value;
                        if (val === '') {
                          setForm(f => ({ ...f, receptorClienteId: '', nifReceptor: '', nombreReceptor: '' }));
                        } else {
                          const found = clientes.find(c => String(c.id) === val);
                          setForm(f => ({
                            ...f,
                            receptorClienteId: val,
                            nifReceptor: found?.nif || '',
                            nombreReceptor: found?.nombre_razon_social || '',
                          }));
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">{t('facturasEmitidas.selectClientePlaceholder')}</option>
                      {clientes.map(c => (
                        <option key={c.id} value={String(c.id)}>{c.nombre_razon_social} ({c.nif})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('facturasEmitidas.nifReceptor')}
                    </label>
                    <input
                      type="text"
                      value={form.nifReceptor}
                      onChange={e => setForm(f => ({ ...f, receptorClienteId: '', nifReceptor: e.target.value }))}
                      placeholder={t('facturasEmitidas.nifReceptorPlaceholder')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('facturasEmitidas.nombreReceptor')}
                    </label>
                    <input
                      type="text"
                      value={form.nombreReceptor}
                      onChange={e => setForm(f => ({ ...f, receptorClienteId: '', nombreReceptor: e.target.value }))}
                      placeholder={t('facturasEmitidas.nombreReceptorPlaceholder')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Total */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('facturasEmitidas.importeTotal')}</span>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(importeTotal())}</span>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                  style={{ backgroundColor: '#4a8fa0' }}
                >
                  {saving && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />}
                  {t('common.create')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailModal && selectedFactura && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('facturasEmitidas.details')}
              </h2>
              <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('facturasEmitidas.numeroFactura')}</p>
                  <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{selectedFactura.numSerie}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('facturasEmitidas.colEstado')}</p>
                  <p className="mt-1">{getStatusBadge(selectedFactura)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('facturasEmitidas.nombreEmisor')}</p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedFactura.nombreEmisor || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('facturasEmitidas.nifEmisor')}</p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedFactura.idEmisor || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('facturasEmitidas.fechaExpedicion')}</p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">{formatDate(selectedFactura.fecha)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('facturasEmitidas.tipoFactura')}</p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedFactura.tipoFactura}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('facturasEmitidas.baseImponible')}</p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">{formatCurrency((selectedFactura.importeTotal || 0) - (selectedFactura.cuotaTotal || 0))}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('facturasEmitidas.cuotaIva')}</p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">{formatCurrency(selectedFactura.cuotaTotal)}</p>
                </div>
                <div className="col-span-2 bg-gray-50 dark:bg-gray-700 rounded-lg p-3 flex justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('facturasEmitidas.importeTotal')}</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(selectedFactura.importeTotal)}</span>
                </div>
                {selectedFactura.validationCSV && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('facturasEmitidas.csvLabel')}</p>
                    <p className="mt-1 text-sm font-mono text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">{selectedFactura.validationCSV}</p>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3 pt-2">
                {selectedFactura.validationStatus !== 'Correcto' && selectedFactura.status !== 'Anulada' && (
                  <button
                    onClick={() => { setShowDetailModal(false); handleValidate(selectedFactura.id); }}
                    className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90"
                    style={{ backgroundColor: '#4a8fa0' }}
                  >
                    <Send className="h-4 w-4" />
                    {t('facturasEmitidas.validate')}
                  </button>
                )}
                <button
                  onClick={() => handleDownloadPdf(selectedFactura.id, selectedFactura.numSerie)}
                  className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90"
                  style={{ backgroundColor: '#6d4c51' }}
                >
                  <Download className="h-4 w-4" />
                  Descargar PDF
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {t('facturasEmitidas.close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

