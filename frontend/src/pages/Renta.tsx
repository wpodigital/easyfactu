import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Calculator,
  TrendingUp,
  TrendingDown,
  Receipt,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  FileText,
} from 'lucide-react';

const API_URL = '/api/v1';
const COLOR = '#c4625a';
const authHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('easyfactu_token') || ''}`,
});

interface Trimestre {
  trimestre: number;
  label: string;
  ingresos: number;
  iva: number;
}

interface RentaData {
  year: number;
  resumen: {
    ingresosBrutos: number;
    gastosBrutos: number;
    resultado: number;
    ivaRepercutido: number;
    ivaSoportado: number;
    ivaLiquidar: number;
    irpfEstimado: number;
  };
  facturas: {
    emitidas: number;
    recibidas: number;
    vencidas: number;
  };
  trimestres: Trimestre[];
}

export default function Renta() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [data, setData] = useState<RentaData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRenta();
  }, [year]);

  const fetchRenta = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/renta/resumen?year=${year}`, { headers: authHeaders() });
      if (res.ok) {
        setData(await res.json());
      }
    } catch (error) {
      console.error('Error fetching renta:', error);
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n: number) =>
    n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

  const hasData = data && (data.facturas.emitidas > 0 || data.facturas.recibidas > 0);

  const maxTrimestral = data
    ? Math.max(...data.trimestres.map(t => t.ingresos + t.iva), 1)
    : 1;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: COLOR }}>
                <Calculator className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {t('renta.title')}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('renta.subtitle')}
                </p>
              </div>
            </div>
            {/* Year selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400 hidden sm:block">
                {t('renta.year')}:
              </span>
              <div className="flex items-center gap-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1">
                <button
                  onClick={() => setYear(y => y - 1)}
                  className="p-1 hover:text-gray-600 dark:hover:text-gray-300 text-gray-400"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="font-bold text-gray-900 dark:text-white w-12 text-center">
                  {year}
                </span>
                <button
                  onClick={() => setYear(y => Math.min(y + 1, currentYear))}
                  disabled={year >= currentYear}
                  className="p-1 hover:text-gray-600 dark:hover:text-gray-300 text-gray-400 disabled:opacity-30"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: COLOR }} />
            <p className="mt-4 text-gray-600 dark:text-gray-400">{t('renta.loading')}</p>
          </div>
        ) : !hasData ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow">
            <Calculator className="mx-auto h-16 w-16 opacity-20" style={{ color: COLOR }} />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              {t('renta.noData')}
            </h3>
            <p className="mt-1 text-gray-500 dark:text-gray-400">{t('renta.noDataHint')}</p>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5" style={{ color: COLOR }} />
                {t('renta.kpiTitle')}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Ingresos */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5 border-l-4 border-green-500">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('renta.ingresos')}</p>
                      <p className="mt-2 text-2xl font-bold text-green-600 dark:text-green-400">
                        {fmt(data!.resumen.ingresosBrutos - data!.resumen.ivaRepercutido)}
                      </p>
                    </div>
                    <TrendingUp className="h-6 w-6 text-green-400" />
                  </div>
                  <p className="mt-1 text-xs text-gray-400">{data!.facturas.emitidas} {t('renta.facturasEmitidas').toLowerCase()}</p>
                </div>

                {/* Gastos */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5 border-l-4 border-red-400">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('renta.gastos')}</p>
                      <p className="mt-2 text-2xl font-bold text-red-500 dark:text-red-400">
                        {fmt(data!.resumen.gastosBrutos - data!.resumen.ivaSoportado)}
                      </p>
                    </div>
                    <TrendingDown className="h-6 w-6 text-red-400" />
                  </div>
                  <p className="mt-1 text-xs text-gray-400">{data!.facturas.recibidas} {t('renta.facturasRecibidas').toLowerCase()}</p>
                </div>

                {/* Resultado */}
                <div
                  className={`bg-white dark:bg-gray-800 rounded-lg shadow p-5 border-l-4 ${
                    data!.resumen.resultado >= 0 ? 'border-blue-500' : 'border-orange-500'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('renta.resultado')}</p>
                      <p className={`mt-2 text-2xl font-bold ${data!.resumen.resultado >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-500'}`}>
                        {fmt(data!.resumen.resultado)}
                      </p>
                    </div>
                    <Calculator className="h-6 w-6 text-blue-400" />
                  </div>
                  <p className="mt-1 text-xs text-gray-400">
                    {data!.resumen.resultado >= 0 ? t('renta.positivo') : t('renta.negativo')}
                  </p>
                </div>

                {/* IVA a liquidar */}
                <div
                  className={`bg-white dark:bg-gray-800 rounded-lg shadow p-5 border-l-4 ${
                    data!.resumen.ivaLiquidar >= 0 ? 'border-yellow-500' : 'border-teal-500'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('renta.ivaLiquidar')}</p>
                      <p className={`mt-2 text-2xl font-bold ${data!.resumen.ivaLiquidar >= 0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-teal-600'}`}>
                        {fmt(Math.abs(data!.resumen.ivaLiquidar))}
                      </p>
                    </div>
                    <Receipt className="h-6 w-6 text-yellow-400" />
                  </div>
                  <p className="mt-1 text-xs text-gray-400">
                    {data!.resumen.ivaLiquidar >= 0 ? t('renta.ivaPositivo') : t('renta.ivaNegativo')}
                  </p>
                </div>
              </div>
            </div>

            {/* Main summary + Quarterly table */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

              {/* Annual summary card */}
              <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5" style={{ color: COLOR }} />
                  {t('renta.resumenTitle')} {year}
                </h2>
                <dl className="space-y-3">
                  {[
                    { key: 'ingresos', val: data!.resumen.ingresosBrutos - data!.resumen.ivaRepercutido, color: 'text-green-600 dark:text-green-400' },
                    { key: 'gastos', val: -(data!.resumen.gastosBrutos - data!.resumen.ivaSoportado), color: 'text-red-500 dark:text-red-400' },
                    null, // divider
                    { key: 'resultado', val: data!.resumen.resultado, color: 'text-blue-600 dark:text-blue-400 font-bold' },
                    null,
                    { key: 'ivaRepercutido', val: data!.resumen.ivaRepercutido, color: 'text-gray-700 dark:text-gray-300' },
                    { key: 'ivaSoportado', val: -data!.resumen.ivaSoportado, color: 'text-gray-700 dark:text-gray-300' },
                    null,
                    { key: 'ivaLiquidar', val: data!.resumen.ivaLiquidar, color: 'text-yellow-600 dark:text-yellow-400 font-bold' },
                    null,
                    { key: 'irpfEstimado', val: data!.resumen.irpfEstimado, color: 'text-orange-500 font-bold' },
                  ].map((item, idx) =>
                    item === null ? (
                      <div key={idx} className="border-t border-gray-100 dark:border-gray-700 pt-1" />
                    ) : (
                      <div key={idx} className="flex justify-between items-center">
                        <dt className="text-sm text-gray-500 dark:text-gray-400">{t(`renta.${item.key}`)}</dt>
                        <dd className={`text-sm ${item.color}`}>{fmt(item.val)}</dd>
                      </div>
                    )
                  )}
                </dl>

                {data!.facturas.vencidas > 0 && (
                  <div className="mt-4 flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm text-red-700 dark:text-red-400">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                    <span>{data!.facturas.vencidas} {t('renta.facturasVencidas').toLowerCase()}</span>
                  </div>
                )}
              </div>

              {/* Quarterly breakdown */}
              <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {t('renta.trimestralTitle')}
                </h2>

                {/* Mini bar chart */}
                <div className="flex items-end gap-3 h-32 mb-4">
                  {data!.trimestres.map(tri => {
                    const total = tri.ingresos + tri.iva;
                    const heightPct = maxTrimestral > 0 ? (total / maxTrimestral) * 100 : 0;
                    return (
                      <div key={tri.trimestre} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">{fmt(tri.ingresos + tri.iva).replace(' €', '')}</span>
                        <div className="w-full rounded-t-sm" style={{ height: `${Math.max(heightPct, 4)}%`, backgroundColor: COLOR, opacity: 0.7 + (tri.trimestre * 0.075) }} />
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{tri.label}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Table */}
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="pb-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('renta.colTrimestre')}</th>
                      <th className="pb-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('renta.colIngresos')}</th>
                      <th className="pb-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('renta.colIva')}</th>
                      <th className="pb-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('renta.colTotal')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {data!.trimestres.map(tri => (
                      <tr key={tri.trimestre} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="py-2 font-medium text-gray-900 dark:text-white">{tri.label}</td>
                        <td className="py-2 text-right text-green-600 dark:text-green-400">{fmt(tri.ingresos)}</td>
                        <td className="py-2 text-right text-gray-500 dark:text-gray-400">{fmt(tri.iva)}</td>
                        <td className="py-2 text-right font-semibold text-gray-900 dark:text-white">{fmt(tri.ingresos + tri.iva)}</td>
                      </tr>
                    ))}
                    <tr className="border-t-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-750">
                      <td className="py-2 font-bold text-gray-900 dark:text-white">Total {year}</td>
                      <td className="py-2 text-right font-bold text-green-600 dark:text-green-400">
                        {fmt(data!.trimestres.reduce((s, t) => s + t.ingresos, 0))}
                      </td>
                      <td className="py-2 text-right font-bold text-gray-600 dark:text-gray-300">
                        {fmt(data!.trimestres.reduce((s, t) => s + t.iva, 0))}
                      </td>
                      <td className="py-2 text-right font-bold text-gray-900 dark:text-white">
                        {fmt(data!.trimestres.reduce((s, t) => s + t.ingresos + t.iva, 0))}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-sm text-yellow-800 dark:text-yellow-300">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <p>{t('renta.disclaimer')}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

