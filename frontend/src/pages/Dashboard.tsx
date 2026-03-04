import React from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardCard } from '../components/DashboardCard';
import { 
  Users, 
  Truck, 
  FileText, 
  Receipt, 
  Calculator, 
  Settings, 
  HelpCircle 
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { t } = useTranslation();

  const sections = [
    {
      key: 'clientes',
      icon: Users,
      color: '#2d3e50',
      onClick: () => console.log('Clientes clicked'),
    },
    {
      key: 'proveedores',
      icon: Truck,
      color: '#3a6a82',
      onClick: () => console.log('Proveedores clicked'),
    },
    {
      key: 'facturas_emitidas',
      icon: FileText,
      color: '#4a8fa0',
      onClick: () => console.log('Facturas emitidas clicked'),
    },
    {
      key: 'facturas_recibidas',
      icon: Receipt,
      color: '#d4a574',
      onClick: () => console.log('Facturas recibidas clicked'),
    },
    {
      key: 'renta',
      icon: Calculator,
      color: '#c4625a',
      onClick: () => console.log('Renta clicked'),
    },
    {
      key: 'config',
      icon: Settings,
      color: '#6d4c51',
      onClick: () => console.log('Configuración clicked'),
    },
    {
      key: 'ayuda',
      icon: HelpCircle,
      color: '#7a5a5a',
      onClick: () => console.log('Ayuda clicked'),
    },
  ];

  return (
    <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto p-8">
        <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
          {t('dashboard.title')}
        </h2>
        
        <div className="grid gap-6">
          {sections.map(({ key, icon, color, onClick }) => (
            <DashboardCard
              key={key}
              title={t(`dashboard.sections.${key}.title`)}
              description={t(`dashboard.sections.${key}.description`)}
              icon={icon}
              color={color}
              onClick={onClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
