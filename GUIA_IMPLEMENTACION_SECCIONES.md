# 📚 Guía de Implementación - Secciones EasyFactu

## Índice
1. [Proveedores](#proveedores)
2. [Facturas Emitidas](#facturas-emitidas)
3. [Facturas Recibidas](#facturas-recibidas)
4. [Configuración](#configuración)
5. [Ayuda](#ayuda)

---

## 🚀 Antes de Empezar

### Requisitos Previos
- Node.js 16+ instalado
- PostgreSQL 13+ instalado y configurado
- Git instalado
- Editor de código (VS Code recomendado)

### Estructura del Proyecto
```
easyfactu/
├── frontend/              # Aplicación React
│   ├── src/
│   │   ├── pages/        # Páginas de la aplicación
│   │   ├── components/   # Componentes reutilizables
│   │   └── i18n/         # Traducciones
├── scaffold/backend/      # API Node.js
│   ├── src/
│   │   ├── repositories/ # Acceso a datos
│   │   └── index.ts      # Endpoints API
└── migrations/           # Migraciones de BD
```

### Configuración Inicial

1. **Clonar el repositorio**
```bash
git clone https://github.com/wpodigital/easyfactu.git
cd easyfactu
```

2. **Instalar dependencias del Backend**
```bash
cd scaffold/backend
npm install
```

3. **Instalar dependencias del Frontend**
```bash
cd ../../frontend
npm install
```

4. **Configurar Base de Datos**
```powershell
# En Windows
cd scaffold\backend
.\scripts\db-setup.ps1 -Seed
```

---

## 1. Proveedores

### ✅ Estado: IMPLEMENTADO COMPLETAMENTE

### Ubicación de Archivos
- **Frontend**: `frontend/src/pages/Proveedores.tsx` (446 líneas)
- **Backend Repository**: `scaffold/backend/src/repositories/proveedores.repository.ts` (208 líneas)
- **Migración**: `migrations/20260304_create_proveedores_table.sql`
- **API Endpoints**: `scaffold/backend/src/index.ts` (líneas 400-570)

### Características Implementadas
- ✅ Lista de proveedores en grid de tarjetas
- ✅ Búsqueda por nombre, NIF, email
- ✅ Crear nuevo proveedor (modal con 12+ campos)
- ✅ Editar proveedor existente
- ✅ Eliminar proveedor con confirmación
- ✅ Diseño responsive
- ✅ Tema claro/oscuro
- ✅ Color de marca: #3a6a82 (azul)

### Cómo Usar

#### Verificar que esté funcionando:
```bash
# 1. Iniciar backend
cd scaffold/backend
npm run dev
# Backend en http://localhost:3000

# 2. Iniciar frontend (nueva terminal)
cd frontend
npm run dev
# Frontend en http://localhost:5173
```

#### Navegar a Proveedores:
- Abrir http://localhost:5173/proveedores
- O desde Dashboard → Click en tarjeta "Proveedores"

#### Crear un Proveedor:
1. Click en botón "Nuevo Proveedor"
2. Llenar formulario:
   - **NIF/CIF** (requerido): Ej. B12345678
   - **Razón Social** (requerido): Ej. Proveedor S.L.
   - **Nombre Comercial**: Ej. Proveedor
   - **Email**: proveedor@ejemplo.com
   - **Teléfono**: 912345678
   - **Dirección, CP, Ciudad, Provincia, País**
3. Click "Guardar"
4. El proveedor aparece en el grid

### API Endpoints Disponibles

```typescript
// Listar proveedores con búsqueda
GET /api/v1/proveedores?search=término&page=1&limit=20

// Obtener un proveedor por ID
GET /api/v1/proveedores/:id

// Obtener proveedor por NIF
GET /api/v1/proveedores/nif/:nif

// Crear nuevo proveedor
POST /api/v1/proveedores
Body: {
  nif: "B12345678",
  nombre_razon_social: "Proveedor S.L.",
  email: "info@proveedor.com",
  telefono: "912345678",
  // ... más campos
}

// Actualizar proveedor
PUT /api/v1/proveedores/:id
Body: { campos a actualizar }

// Eliminar proveedor (soft delete)
DELETE /api/v1/proveedores/:id

// Estadísticas
GET /api/v1/proveedores/stats
```

### Solución de Problemas

**Error: "proveedores.repository.ts no compila"**
```typescript
// Verificar que el import sea correcto:
import { pool } from '../config/database'; // ✅ Correcto
// NO usar: import pool from '../config/database'; ❌
```

**Error: "Tabla proveedores no existe"**
```bash
# Ejecutar la migración
cd scaffold/backend
.\scripts\db-setup.ps1
```

---

## 2. Facturas Emitidas

### ✅ Estado: IMPLEMENTADO COMPLETAMENTE

### Ubicación de Archivos
- **Frontend**: `frontend/src/pages/FacturasEmitidas.tsx` (323 líneas)
- **Backend Repository**: `scaffold/backend/src/repositories/facturas.repository.ts` (ya existente)
- **Migración**: `migrations/20260112_create_verifactu_tables.sql`
- **API Endpoints**: `scaffold/backend/src/index.ts` (endpoints de invoices)

### Características Implementadas
- ✅ Tabla de facturas emitidas
- ✅ Búsqueda por número de factura o cliente
- ✅ Ver detalles de factura (modal)
- ✅ Validar factura con AEAT (simulado)
- ✅ Eliminar factura con confirmación
- ✅ Badges de estado (Pendiente, Validada, Error)
- ✅ Color de marca: #4a8fa0 (verde azulado)

### Cómo Usar

#### Ver Facturas Existentes:
1. Navegar a http://localhost:5173/facturas-emitidas
2. Verás las facturas de prueba: TEST-001, TEST-002, TEST-003

#### Ver Detalles de una Factura:
1. Click en el icono de ojo (👁️) en cualquier factura
2. Se abre modal con:
   - Número de factura
   - Cliente
   - Fecha de expedición
   - Líneas de factura
   - Base imponible
   - IVA
   - Total

#### Validar Factura:
1. Click en icono de check (✓) 
2. Sistema simula validación con AEAT
3. Estado cambia a "Validada" con badge verde

#### Eliminar Factura:
1. Click en icono de papelera (🗑️)
2. Confirmar eliminación
3. Factura se elimina de la lista

### Crear Nueva Factura (Funcionalidad Futura)

**Nota**: El botón "Nueva Factura" actualmente muestra un mensaje informativo.

Para implementar creación completa de facturas, necesitarías:

1. **Backend**: Endpoint POST ya existe
```typescript
POST /api/v1/invoices
Body: {
  id_emisor_factura: "B12345678",
  nombre_razon_emisor: "Mi Empresa S.L.",
  num_serie_factura: "A-001",
  fecha_expedicion_factura: "2024-03-04",
  // ... más campos VeriFactu
}
```

2. **Frontend**: Crear formulario modal con:
   - Selector de cliente
   - Fecha de expedición
   - Líneas de factura (tabla editable)
   - Cálculo automático de totales
   - Validación de campos

### API Endpoints Disponibles

```typescript
// Listar facturas
GET /api/v1/invoices

// Obtener factura por ID o número
GET /api/v1/invoices/:id

// Crear factura
POST /api/v1/invoices

// Actualizar factura
PUT /api/v1/invoices/:id

// Eliminar factura
DELETE /api/v1/invoices/:id

// Validar con AEAT
POST /api/v1/invoices/:id/validate

// Obtener XML VeriFactu
GET /api/v1/invoices/:id/xml

// Estado de validación
GET /api/v1/invoices/:id/status
```

---

## 3. Facturas Recibidas

### ⏳ Estado: PLACEHOLDER (Por Implementar)

### Objetivo
Gestionar facturas que la empresa recibe de sus proveedores.

### Características a Implementar

#### Frontend (FacturasRecibidas.tsx)
```typescript
// Estructura sugerida:
import React, { useState, useEffect } from 'react';
import { FileDown, Eye, Trash2, CheckCircle, Upload } from 'lucide-react';

export default function FacturasRecibidas() {
  const [facturas, setFacturas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Funcionalidades:
  // 1. Lista de facturas recibidas (tabla)
  // 2. Upload de factura (PDF/XML)
  // 3. Asociar a proveedor
  // 4. Estado: Pendiente, Pagada, Vencida
  // 5. Marcar como pagada
  // 6. Ver detalles
  // 7. Eliminar
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 style={{ color: '#d4a574' }}>Facturas Recibidas</h1>
        <button className="btn-primary">
          <Upload className="w-4 h-4 mr-2" />
          Subir Factura
        </button>
      </div>
      
      {/* Tabla de facturas */}
      <table>
        <thead>
          <tr>
            <th>Número</th>
            <th>Proveedor</th>
            <th>Fecha</th>
            <th>Importe</th>
            <th>Vencimiento</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {/* Filas de facturas */}
        </tbody>
      </table>
    </div>
  );
}
```

#### Backend (facturas_recibidas)

**Tabla necesaria** (crear migración):
```sql
CREATE TABLE facturas_recibidas (
  id BIGSERIAL PRIMARY KEY,
  numero_factura VARCHAR(100) NOT NULL,
  proveedor_id BIGINT REFERENCES proveedores(id),
  fecha_factura DATE NOT NULL,
  fecha_vencimiento DATE,
  base_imponible DECIMAL(10,2) NOT NULL,
  iva_total DECIMAL(10,2) NOT NULL,
  importe_total DECIMAL(10,2) NOT NULL,
  estado VARCHAR(50) DEFAULT 'pendiente', -- pendiente, pagada, vencida
  fecha_pago DATE,
  archivo_pdf BYTEA, -- Almacenar PDF
  archivo_xml TEXT, -- Almacenar XML
  notas TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Repository** (crear archivo):
```typescript
// scaffold/backend/src/repositories/facturas_recibidas.repository.ts
import { pool } from '../config/database';

export const facturasRecibidasRepository = {
  async create(factura: any) {
    const query = `
      INSERT INTO facturas_recibidas (...)
      VALUES (...)
      RETURNING *
    `;
    const result = await pool.query(query, [valores]);
    return result.rows[0];
  },
  
  async findAll(filters: any) {
    // Implementar búsqueda y filtros
  },
  
  async markAsPaid(id: number, fechaPago: Date) {
    const query = `
      UPDATE facturas_recibidas
      SET estado = 'pagada', fecha_pago = $1
      WHERE id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [fechaPago, id]);
    return result.rows[0];
  }
};
```

**Endpoints API**:
```typescript
// En scaffold/backend/src/index.ts

// Listar facturas recibidas
app.get('/api/v1/facturas-recibidas', async (req, res) => {
  const { proveedor, estado, desde, hasta } = req.query;
  const facturas = await facturasRecibidasRepository.findAll({
    proveedor, estado, desde, hasta
  });
  res.json(facturas);
});

// Subir factura
app.post('/api/v1/facturas-recibidas/upload', upload.single('file'), async (req, res) => {
  const file = req.file;
  const { proveedorId, numeroFactura, fecha, importe } = req.body;
  // Procesar y guardar
});

// Marcar como pagada
app.post('/api/v1/facturas-recibidas/:id/marcar-pagada', async (req, res) => {
  const { id } = req.params;
  const { fechaPago } = req.body;
  const factura = await facturasRecibidasRepository.markAsPaid(id, fechaPago);
  res.json(factura);
});
```

### Pasos de Implementación

1. **Crear migración**:
```bash
# Crear archivo: migrations/20260306_create_facturas_recibidas.sql
# Copiar el SQL de arriba
```

2. **Ejecutar migración**:
```powershell
cd scaffold\backend
.\scripts\db-setup.ps1
```

3. **Crear repository**:
```bash
# Crear: scaffold/backend/src/repositories/facturas_recibidas.repository.ts
```

4. **Añadir endpoints API**:
```typescript
// Editar: scaffold/backend/src/index.ts
// Añadir endpoints después de los de facturas emitidas
```

5. **Implementar frontend**:
```bash
# Editar: frontend/src/pages/FacturasRecibidas.tsx
# Reemplazar placeholder con código funcional
```

6. **Probar**:
```bash
# Iniciar backend y frontend
# Navegar a /facturas-recibidas
# Probar upload, listar, marcar como pagada
```

---

## 4. Configuración

### ✅ Estado: PARCIALMENTE IMPLEMENTADO

### Ubicación de Archivos
- **Frontend**: `frontend/src/pages/Configuracion.tsx`
- **Component**: `frontend/src/components/CertificateUpload.tsx`
- **Backend**: `scaffold/backend/src/repositories/certificados.repository.ts`
- **Migración**: `migrations/20260304_create_certificados_table.sql`

### Características Actuales
- ✅ Gestión de certificados digitales (.p12)
- ✅ Upload de certificado con password
- ✅ Activar/desactivar certificado
- ✅ Eliminar certificado
- ⏳ Configuración de empresa (por añadir)
- ⏳ Configuración de facturación (por añadir)
- ⏳ Preferencias de usuario (por añadir)

### Características a Añadir

#### Configuración de Empresa
```typescript
// Añadir al frontend/src/pages/Configuracion.tsx

const [empresa, setEmpresa] = useState({
  nif: '',
  nombre: '',
  nombre_comercial: '',
  direccion: '',
  codigo_postal: '',
  ciudad: '',
  provincia: '',
  pais: 'España',
  telefono: '',
  email: '',
  web: ''
});

// Formulario para editar datos de la empresa
<div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
  <h2 className="text-xl font-semibold mb-4">Datos de la Empresa</h2>
  <form onSubmit={handleGuardarEmpresa}>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label>NIF/CIF</label>
        <input
          type="text"
          value={empresa.nif}
          onChange={(e) => setEmpresa({...empresa, nif: e.target.value})}
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label>Nombre o Razón Social</label>
        <input
          type="text"
          value={empresa.nombre}
          onChange={(e) => setEmpresa({...empresa, nombre: e.target.value})}
          className="w-full p-2 border rounded"
        />
      </div>
      {/* Más campos... */}
    </div>
    <button type="submit" className="btn-primary mt-4">
      Guardar Configuración
    </button>
  </form>
</div>
```

#### Configuración de Facturación
```typescript
const [facturacion, setFacturacion] = useState({
  serie_por_defecto: 'A',
  proximo_numero: 1,
  formato_numero: 'A-{NUMERO}', // A-001, A-002, etc.
  incluir_iva: true,
  tipo_iva_por_defecto: 21,
  texto_pie_factura: '',
  mostrar_logo: true
});

// Formulario similar al de empresa
```

#### Preferencias de Usuario
```typescript
const [preferencias, setPreferencias] = useState({
  idioma: 'es',
  tema: 'light', // o 'dark'
  notificaciones_email: true,
  formato_fecha: 'DD/MM/YYYY',
  formato_moneda: 'EUR'
});
```

#### Backend - Tabla de Configuración

**Migración necesaria**:
```sql
CREATE TABLE configuracion (
  id BIGSERIAL PRIMARY KEY,
  clave VARCHAR(100) UNIQUE NOT NULL,
  valor TEXT,
  tipo VARCHAR(50), -- 'empresa', 'facturacion', 'usuario'
  descripcion TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Valores por defecto
INSERT INTO configuracion (clave, valor, tipo) VALUES
('empresa_nif', '', 'empresa'),
('empresa_nombre', '', 'empresa'),
('facturacion_serie', 'A', 'facturacion'),
('facturacion_numero', '1', 'facturacion'),
('usuario_idioma', 'es', 'usuario'),
('usuario_tema', 'light', 'usuario');
```

**Repository**:
```typescript
// scaffold/backend/src/repositories/configuracion.repository.ts
export const configuracionRepository = {
  async get(clave: string) {
    const query = 'SELECT valor FROM configuracion WHERE clave = $1';
    const result = await pool.query(query, [clave]);
    return result.rows[0]?.valor;
  },
  
  async set(clave: string, valor: string) {
    const query = `
      INSERT INTO configuracion (clave, valor)
      VALUES ($1, $2)
      ON CONFLICT (clave) 
      DO UPDATE SET valor = $2, updated_at = NOW()
      RETURNING *
    `;
    const result = await pool.query(query, [clave, valor]);
    return result.rows[0];
  },
  
  async getAll(tipo?: string) {
    let query = 'SELECT * FROM configuracion';
    const params = [];
    if (tipo) {
      query += ' WHERE tipo = $1';
      params.push(tipo);
    }
    const result = await pool.query(query, params);
    return result.rows;
  }
};
```

**Endpoints**:
```typescript
// Obtener configuración
app.get('/api/v1/configuracion', async (req, res) => {
  const { tipo } = req.query;
  const config = await configuracionRepository.getAll(tipo);
  res.json(config);
});

// Actualizar configuración
app.put('/api/v1/configuracion', async (req, res) => {
  const configuraciones = req.body; // { clave: valor, ... }
  const promises = Object.entries(configuraciones).map(([clave, valor]) =>
    configuracionRepository.set(clave, valor as string)
  );
  await Promise.all(promises);
  res.json({ success: true });
});
```

### Organización con Tabs

```typescript
// En frontend/src/pages/Configuracion.tsx

const [activeTab, setActiveTab] = useState('empresa');

const tabs = [
  { id: 'empresa', label: 'Empresa', icon: Building },
  { id: 'facturacion', label: 'Facturación', icon: FileText },
  { id: 'certificados', label: 'Certificados', icon: Key },
  { id: 'preferencias', label: 'Preferencias', icon: Settings }
];

return (
  <div className="p-6">
    {/* Tabs */}
    <div className="flex border-b mb-6">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`px-4 py-2 ${
            activeTab === tab.id 
              ? 'border-b-2 border-blue-500 text-blue-600' 
              : 'text-gray-600'
          }`}
        >
          <tab.icon className="w-4 h-4 inline mr-2" />
          {tab.label}
        </button>
      ))}
    </div>
    
    {/* Contenido de tab activo */}
    {activeTab === 'empresa' && <ConfiguracionEmpresa />}
    {activeTab === 'facturacion' && <ConfiguracionFacturacion />}
    {activeTab === 'certificados' && <CertificateUpload />}
    {activeTab === 'preferencias' && <ConfiguracionPreferencias />}
  </div>
);
```

---

## 5. Ayuda

### ⏳ Estado: PLACEHOLDER (Por Implementar)

### Objetivo
Proporcionar soporte, documentación y guías a los usuarios.

### Características a Implementar

#### Frontend (Ayuda.tsx)

```typescript
import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Mail, Phone, Book, MessageCircle } from 'lucide-react';

export default function Ayuda() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  
  // FAQ
  const faqs = [
    {
      pregunta: "¿Cómo creo una factura?",
      respuesta: "Para crear una factura, ve a la sección 'Facturas Emitidas' y haz click en el botón 'Nueva Factura'. Completa los datos del cliente, añade las líneas de productos o servicios, y el sistema calculará automáticamente los totales."
    },
    {
      pregunta: "¿Cómo añado un cliente?",
      respuesta: "Ve a la sección 'Clientes' y haz click en 'Nuevo Cliente'. Completa el formulario con los datos del cliente (NIF, nombre, dirección, etc.) y guarda."
    },
    {
      pregunta: "¿Cómo gestiono los certificados digitales?",
      respuesta: "En la sección 'Configuración', pestaña 'Certificados', puedes subir tu certificado digital .p12. Necesitarás la contraseña del certificado para importarlo. El certificado se utilizará para validar facturas con AEAT."
    },
    {
      pregunta: "¿Qué es VeriFactu?",
      respuesta: "VeriFactu es el sistema de la AEAT para verificar la integridad de las facturas. Genera un código único (huella) para cada factura que garantiza que no ha sido modificada."
    },
    {
      pregunta: "¿Cómo valido una factura con AEAT?",
      respuesta: "En la lista de facturas emitidas, haz click en el icono de validación (✓) junto a la factura que quieres validar. El sistema se comunicará con AEAT usando tu certificado digital."
    },
    {
      pregunta: "¿Puedo exportar mis datos?",
      respuesta: "Sí, puedes exportar facturas en formato PDF o XML desde la vista de detalles de cada factura. También puedes generar informes fiscales desde la sección 'Renta'."
    },
    {
      pregunta: "¿Cómo cambio el idioma?",
      respuesta: "En la esquina superior derecha encontrarás el selector de idioma. EasyFactu está disponible en Español, Inglés, Portugués, Francés y Alemán."
    },
    {
      pregunta: "¿Cómo contacto con soporte?",
      respuesta: "Puedes contactarnos por email a soporte@easyfactu.com o por teléfono al +34 900 123 456 de Lunes a Viernes de 9:00 a 18:00."
    }
  ];
  
  // Guías rápidas
  const guias = [
    {
      titulo: "Primeros Pasos",
      descripcion: "Aprende a configurar tu empresa y crear tu primera factura",
      url: "/docs/primeros-pasos"
    },
    {
      titulo: "Configurar Certificado Digital",
      descripcion: "Guía paso a paso para importar tu certificado .p12",
      url: "/docs/certificado-digital"
    },
    {
      titulo: "Gestión de Clientes",
      descripcion: "Cómo añadir, editar y organizar tus clientes",
      url: "/docs/clientes"
    },
    {
      titulo: "Facturación VeriFactu",
      descripcion: "Todo sobre el cumplimiento con VeriFactu de AEAT",
      url: "/docs/verifactu"
    }
  ];
  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <HelpCircle className="w-8 h-8" style={{ color: '#7a5a5a' }} />
          <h1 className="text-3xl font-bold" style={{ color: '#7a5a5a' }}>
            Ayuda y Soporte
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Encuentra respuestas a tus preguntas y aprende a usar EasyFactu
        </p>
      </div>
      
      {/* Sección de contacto rápido */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <Mail className="w-8 h-8 mb-3 text-blue-500" />
          <h3 className="font-semibold mb-2">Email</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            soporte@easyfactu.com
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <Phone className="w-8 h-8 mb-3 text-green-500" />
          <h3 className="font-semibold mb-2">Teléfono</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            +34 900 123 456<br />
            L-V 9:00-18:00
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <MessageCircle className="w-8 h-8 mb-3 text-purple-500" />
          <h3 className="font-semibold mb-2">Chat en Vivo</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Disponible L-V<br />
            9:00-18:00
          </p>
        </div>
      </div>
      
      {/* FAQ */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-8">
        <h2 className="text-2xl font-bold mb-6">Preguntas Frecuentes</h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b pb-4">
              <button
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                className="w-full flex justify-between items-center text-left font-medium"
              >
                <span>{faq.pregunta}</span>
                {expandedFaq === index ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>
              {expandedFaq === index && (
                <p className="mt-3 text-gray-600 dark:text-gray-400">
                  {faq.respuesta}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Guías rápidas */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Book className="w-6 h-6" />
          Guías Rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {guias.map((guia, index) => (
            <a
              key={index}
              href={guia.url}
              className="p-4 border rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700 transition"
            >
              <h3 className="font-semibold mb-2">{guia.titulo}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {guia.descripcion}
              </p>
            </a>
          ))}
        </div>
      </div>
      
      {/* Información de versión */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Información del Sistema</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600 dark:text-gray-400">Versión:</span>
            <span className="ml-2 font-mono">1.0.0</span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Última actualización:</span>
            <span className="ml-2">Marzo 2024</span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Licencia:</span>
            <span className="ml-2">Comercial</span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Soporte VeriFactu:</span>
            <span className="ml-2 text-green-600">✓ Activo</span>
          </div>
        </div>
      </div>
      
      {/* Enlaces adicionales */}
      <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
        <a href="/docs" className="hover:text-blue-500 mr-4">Documentación Completa</a>
        <a href="/changelog" className="hover:text-blue-500 mr-4">Registro de Cambios</a>
        <a href="/privacy" className="hover:text-blue-500 mr-4">Política de Privacidad</a>
        <a href="/terms" className="hover:text-blue-500">Términos de Uso</a>
      </div>
    </div>
  );
}
```

### Implementación

1. **Reemplazar el archivo**:
```bash
# Copiar el código de arriba a:
frontend/src/pages/Ayuda.tsx
```

2. **Añadir traducciones**:
```typescript
// En frontend/src/i18n/locales/es.json
{
  "help": {
    "title": "Ayuda y Soporte",
    "subtitle": "Encuentra respuestas a tus preguntas",
    "faq": "Preguntas Frecuentes",
    "quickGuides": "Guías Rápidas",
    "contact": "Contacto",
    "email": "Email",
    "phone": "Teléfono",
    "chat": "Chat en Vivo"
  }
}
```

3. **Probar**:
```bash
# Navegar a http://localhost:5173/ayuda
```

---

## 📝 Checklist de Implementación

### Proveedores ✅
- [x] Migración creada
- [x] Repository implementado
- [x] API endpoints funcionando
- [x] Frontend completo
- [x] CRUD funcional
- [x] Navegación correcta

### Facturas Emitidas ✅
- [x] Tabla de facturas
- [x] Ver detalles
- [x] Validar factura
- [x] Eliminar factura
- [ ] Crear factura (pendiente)
- [ ] Editar factura (pendiente)

### Facturas Recibidas ⏳
- [ ] Crear migración
- [ ] Crear repository
- [ ] Implementar endpoints API
- [ ] Implementar frontend
- [ ] Upload de archivos
- [ ] Marcar como pagada

### Configuración ⏳
- [x] Certificados digitales
- [ ] Datos de empresa
- [ ] Configuración de facturación
- [ ] Preferencias de usuario
- [ ] Organización con tabs

### Ayuda ⏳
- [ ] FAQ implementado
- [ ] Guías rápidas
- [ ] Información de contacto
- [ ] Enlaces a documentación
- [ ] Información de versión

---

## 🆘 Solución de Problemas Comunes

### Backend no inicia
```bash
# Verificar PostgreSQL está corriendo
# Verificar variables de entorno en .env
# Verificar dependencias instaladas
npm install
```

### Frontend muestra error de compilación
```bash
# Limpiar y reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Error de CORS
```typescript
// En scaffold/backend/src/index.ts
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

### Tabla no existe
```powershell
# Ejecutar migraciones
cd scaffold\backend
.\scripts\db-setup.ps1
```

---

## 📚 Recursos Adicionales

- **Documentación VeriFactu**: https://www.agenciatributaria.es/
- **React Documentation**: https://react.dev/
- **TypeScript**: https://www.typescriptlang.org/
- **Tailwind CSS**: https://tailwindcss.com/
- **PostgreSQL**: https://www.postgresql.org/docs/

---

## 🎯 Siguiente Pasos Sugeridos

1. **Completar Facturas Recibidas** (alta prioridad)
2. **Expandir Configuración** (alta prioridad)
3. **Implementar Ayuda** (media prioridad)
4. **Añadir creación de Facturas Emitidas** (alta prioridad)
5. **Mejorar reportes en Renta** (media prioridad)

---

**Última actualización**: Marzo 2024  
**Versión de la guía**: 1.0  
**Autor**: EasyFactu Development Team
