# 🚀 Guía de Inicio Rápido - EasyFactu

**Esta guía te llevará de 0 a tener el sistema funcionando en 5 minutos.**

---

## Prerrequisitos

Antes de empezar, asegúrate de tener:
- ✅ Node.js 18+ instalado (`node --version`)
- ✅ PostgreSQL 13+ instalado y corriendo
- ✅ Git instalado

---

## Paso 1: Configurar Base de Datos (2 minutos)

```bash
# Navegar al directorio del proyecto
cd scaffold/backend

# Copiar archivo de configuración
cp .env.example .env

# Editar con tus credenciales de PostgreSQL
# (Cambiar password y otros valores si es necesario)
nano .env
```

En el archivo `.env`, verifica/edita:
```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=easyfactu
DB_USER=postgres
DB_PASSWORD=TU_PASSWORD_AQUI  # ⚠️ CAMBIAR ESTO
```

Guarda el archivo (Ctrl+O, Enter, Ctrl+X en nano).

```bash
# Ejecutar setup de base de datos con datos de prueba
npm run db:setup:seed
```

Deberías ver:
```
✓ Connection successful
✓ Database ready
✓ Migrations complete
✓ Test data seeded
```

---

## Paso 2: Instalar Dependencias (1 minuto)

```bash
# Si aún no lo has hecho
npm install
```

---

## Paso 3: Iniciar el Servidor (30 segundos)

```bash
# Modo desarrollo (con auto-reload)
npm run dev
```

Deberías ver:
```
🚀 Server started on port 3000
Database connected successfully
```

⚠️ **Deja esta terminal abierta** - el servidor estará corriendo aquí.

---

## Paso 4: Probar que Funciona (1 minuto)

**Abre una NUEVA terminal** y ejecuta:

```bash
# Ir al directorio backend
cd scaffold/backend

# Health check
curl http://localhost:3000/health
```

Deberías ver:
```json
{"status":"ok","database":"connected",...}
```

✅ **¡Funciona!** El sistema está listo.

---

## 🎉 ¿Qué Puedo Hacer Ahora?

### Opción 1: Probar con Datos de Ejemplo

```bash
# Ver facturas de prueba
curl http://localhost:3000/api/v1/invoices
```

Hay 3 facturas de ejemplo: TEST-001, TEST-002, TEST-003

### Opción 2: Crear Tu Primera Factura

```bash
curl -X POST http://localhost:3000/api/v1/invoices \
  -H "Content-Type: application/json" \
  -d '{
    "idVersion": "1.0",
    "nombreRazonEmisor": "Mi Empresa",
    "nifEmisor": "B12345678",
    "numSerieFactura": "MIF-001",
    "fechaExpedicionFactura": "2024-02-27",
    "tipoFactura": "F1",
    "cuotaTotal": 21.00,
    "importeTotal": 121.00,
    "descripcionOperacion": "Mi primera factura",
    "tipoDesglose": "S",
    "claveRegimen": "01",
    "tipoImpositivo": 21.00,
    "baseImponible": 100.00,
    "cuotaRepercutida": 21.00
  }'
```

### Opción 3: Usar Postman/Insomnia

1. Importa el archivo: `postman_collection.json`
2. Prueba los endpoints desde la interfaz gráfica

### Opción 4: Ejecutar Tests Automáticos

```bash
# Ejecutar script de testing
npm run test:api
```

---

## 📚 Siguiente Paso: Guías Detalladas

Ya tienes el sistema funcionando. Ahora puedes:

1. **Testing Completo**: Lee [TESTING_GUIDE.md](TESTING_GUIDE.md)
2. **Configuración Avanzada**: Lee [DATABASE_SETUP.md](scaffold/backend/DATABASE_SETUP.md)
3. **Documentación API**: Lee [scaffold/backend/README.md](scaffold/backend/README.md)
4. **Estado del Proyecto**: Lee [ESTADO_PROYECTO.md](ESTADO_PROYECTO.md)

---

## 🐛 Problemas Comunes

### "Cannot connect to database"

```bash
# Verificar que PostgreSQL está corriendo
sudo systemctl status postgresql
# o en macOS:
brew services list | grep postgres

# Verificar credenciales en .env
cat .env
```

### "Port 3000 already in use"

```bash
# Encontrar y matar el proceso
lsof -ti:3000 | xargs kill -9
```

### "Table does not exist"

```bash
# Ejecutar migraciones
npm run db:setup
```

### "npm: command not found"

```bash
# Instalar Node.js primero
# Ubuntu/Debian:
sudo apt install nodejs npm

# macOS:
brew install node
```

---

## ✅ Checklist de Verificación

- [ ] PostgreSQL instalado y corriendo
- [ ] Archivo .env configurado con credenciales correctas
- [ ] `npm run db:setup:seed` ejecutado exitosamente
- [ ] `npm install` ejecutado sin errores
- [ ] `npm run dev` inicia el servidor
- [ ] `curl http://localhost:3000/health` retorna OK
- [ ] Puedes crear y ver facturas

---

## 💡 Consejos

1. **Usa dos terminales**: Una para el servidor (`npm run dev`) y otra para pruebas
2. **Revisa los logs**: El servidor muestra información útil en tiempo real
3. **Datos de prueba**: Usa `npm run db:setup:seed` para reiniciar con datos limpios
4. **Postman/Insomnia**: Más fácil que curl para testing interactivo
5. **Documentación**: Todo está documentado en los archivos .md del proyecto

---

## 🆘 ¿Necesitas Ayuda?

- Revisa [ESTADO_PROYECTO.md](ESTADO_PROYECTO.md) para ver qué funciona
- Lee [TESTING_GUIDE.md](TESTING_GUIDE.md) para ejemplos detallados
- Verifica los logs del servidor (`npm run dev`) para errores específicos

---

**¡Listo para usar EasyFactu! 🎉**
