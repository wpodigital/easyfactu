import { useTranslation } from 'react-i18next';
import { Receipt, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const FacturasRecibidas = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div
              className="p-3 rounded-full mr-4"
              style={{ backgroundColor: '#d4a57420' }}
            >
              <Receipt className="w-8 h-8" style={{ color: '#d4a574' }} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('nav.facturasRecibidas')}
            </h1>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
          <Receipt className="w-24 h-24 mx-auto mb-6" style={{ color: '#d4a574', opacity: 0.3 }} />
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            {t('common.underConstruction')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Esta sección estará disponible próximamente.
          </p>
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 rounded-lg text-white font-semibold transition-colors"
            style={{ backgroundColor: '#d4a574' }}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            {t('common.backToDashboard')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FacturasRecibidas;
