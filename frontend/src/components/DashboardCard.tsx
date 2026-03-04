import React from 'react';
import { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  onClick?: () => void;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  description,
  icon: Icon,
  color,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className="group w-full flex items-center space-x-4 p-6 rounded-2xl border-2 border-gray-200 dark:border-gray-700 
                 hover:shadow-lg transition-all duration-200 hover:scale-[1.02] bg-white dark:bg-gray-800"
      style={{ borderColor: color + '40' }}
    >
      {/* Icon Circle */}
      <div
        className="flex-shrink-0 w-20 h-20 rounded-full flex items-center justify-center"
        style={{ backgroundColor: color }}
      >
        <Icon className="h-10 w-10 text-white" />
      </div>

      {/* Content */}
      <div className="flex-1 text-left">
        <h3
          className="text-xl font-bold mb-2"
          style={{ color }}
        >
          {title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          • {description}
        </p>
      </div>
    </button>
  );
};
