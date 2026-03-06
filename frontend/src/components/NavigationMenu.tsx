import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Home,
  Users,
  Truck,
  FileText,
  Receipt,
  Calculator,
  Settings,
  HelpCircle,
} from 'lucide-react';

const NavigationMenu = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const menuItems = [
    { path: '/', icon: Home, label: t('nav.dashboard'), color: '#0c4a6e' },
    { path: '/clientes', icon: Users, label: t('nav.clientes'), color: '#2d3e50' },
    { path: '/proveedores', icon: Truck, label: t('nav.proveedores'), color: '#3a6a82' },
    { path: '/facturas-emitidas', icon: FileText, label: t('nav.facturasEmitidas'), color: '#4a8fa0' },
    { path: '/facturas-recibidas', icon: Receipt, label: t('nav.facturasRecibidas'), color: '#d4a574' },
    { path: '/renta', icon: Calculator, label: t('nav.renta'), color: '#c4625a' },
    { path: '/configuracion', icon: Settings, label: t('nav.configuracion'), color: '#6d4c51' },
    { path: '/ayuda', icon: HelpCircle, label: t('nav.ayuda'), color: '#7a5a5a' },
  ];

  return (
    <nav className="w-60 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-screen sticky top-0">
      <div className="p-4">
        <h2 className="text-xl font-bold text-sky-900 dark:text-sky-100 mb-6">
          EasyFactu
        </h2>
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-sky-100 dark:bg-sky-900 text-sky-900 dark:text-sky-100 font-semibold'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  style={
                    isActive
                      ? {
                          backgroundColor: `${item.color}15`,
                          borderLeft: `4px solid ${item.color}`,
                        }
                      : {}
                  }
                >
                  <Icon
                    className="w-5 h-5 mr-3"
                    style={isActive ? { color: item.color } : {}}
                  />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};

export default NavigationMenu;
