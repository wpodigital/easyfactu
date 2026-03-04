import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import NavigationMenu from './components/NavigationMenu';
import Breadcrumbs from './components/Breadcrumbs';
import { Dashboard } from './pages/Dashboard';
import { Clientes } from './pages/Clientes';
import Proveedores from './pages/Proveedores';
import FacturasEmitidas from './pages/FacturasEmitidas';
import FacturasRecibidas from './pages/FacturasRecibidas';
import Renta from './pages/Renta';
import Configuracion from './pages/Configuracion';
import Ayuda from './pages/Ayuda';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="flex flex-1">
          {/* Sidebar - hidden on mobile */}
          <div className="hidden md:block">
            <NavigationMenu />
          </div>
          
          {/* Main content area */}
          <div className="flex-1 overflow-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Breadcrumbs />
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/clientes" element={<Clientes />} />
                <Route path="/proveedores" element={<Proveedores />} />
                <Route path="/facturas-emitidas" element={<FacturasEmitidas />} />
                <Route path="/facturas-recibidas" element={<FacturasRecibidas />} />
                <Route path="/renta" element={<Renta />} />
                <Route path="/configuracion" element={<Configuracion />} />
                <Route path="/ayuda" element={<Ayuda />} />
              </Routes>
            </div>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;


