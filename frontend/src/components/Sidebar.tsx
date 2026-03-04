import React from 'react';
import { useTranslation } from 'react-i18next';

export const Sidebar: React.FC = () => {
  const { t } = useTranslation();

  return (
    <aside className="hidden md:flex w-32 bg-sidebar-light dark:bg-sidebar-dark text-white flex-col items-center py-8">
      <div className="flex-1 flex items-center">
        <div className="writing-mode-vertical transform -rotate-180">
          <h1 className="text-4xl font-bold tracking-wider whitespace-nowrap">
            {t('app.name').toUpperCase()}
          </h1>
        </div>
      </div>
    </aside>
  );
};
