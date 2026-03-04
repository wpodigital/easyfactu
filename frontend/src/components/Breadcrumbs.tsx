import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, ChevronRight } from 'lucide-react';

const Breadcrumbs = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    
    const breadcrumbMap: Record<string, string> = {
      'clientes': t('nav.clientes'),
      'proveedores': t('nav.proveedores'),
      'facturas-emitidas': t('nav.facturasEmitidas'),
      'facturas-recibidas': t('nav.facturasRecibidas'),
      'renta': t('nav.renta'),
      'configuracion': t('nav.configuracion'),
      'ayuda': t('nav.ayuda'),
    };

    return paths.map((path, index) => ({
      name: breadcrumbMap[path] || path,
      path: '/' + paths.slice(0, index + 1).join('/'),
      isLast: index === paths.length - 1,
    }));
  };

  const breadcrumbs = getBreadcrumbs();

  if (location.pathname === '/') {
    return null; // No breadcrumbs on dashboard
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 py-3">
      <Link
        to="/"
        className="flex items-center hover:text-sky-700 dark:hover:text-sky-300 transition-colors"
      >
        <Home className="w-4 h-4" />
        <span className="ml-1">{t('nav.dashboard')}</span>
      </Link>

      {breadcrumbs.map((breadcrumb, index) => (
        <div key={index} className="flex items-center">
          <ChevronRight className="w-4 h-4 mx-2" />
          {breadcrumb.isLast ? (
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {breadcrumb.name}
            </span>
          ) : (
            <Link
              to={breadcrumb.path}
              className="hover:text-sky-700 dark:hover:text-sky-300 transition-colors"
            >
              {breadcrumb.name}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
