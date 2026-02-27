# Guía de Configuración para Windows

## 🪟 EasyFactu - Setup Completo para Windows

Esta guía te ayudará a configurar y probar el sistema EasyFactu en Windows paso a paso.

---

## ⚠️ IMPORTANTE: Directorio Correcto

**ANTES DE HACER NADA**, asegúrate de estar en el directorio correcto del proyecto.

```powershell
# ❌ NUNCA ejecutes npm desde aquí:
C:\WINDOWS\system32>

# ✅ Debes estar aquí (ajusta la ruta según donde descargaste el proyecto):
C:\Users\TU_USUARIO\Desktop\easyfactu\scaffold\backend>
```

**Si ves un error como:**
```
npm error path C:\WINDOWS\system32\package.json
```

**Significa que estás en el directorio equivocado.** Consulta **SOLUCION_RAPIDA.md** para la solución inmediata.

---

## 📋 Prerequisitos

### 1. PostgreSQL

**Descargar e Instalar**:
1. Ve a https://www.postgresql.org/download/windows/
2. Descarga el instalador (versión 12 o superior recomendada)
3. Ejecuta el instalador
4. Durante la instalación:
   - Recuerda la contraseña que configures para el usuario `postgres`
   - Puerto por defecto: `5432` (déjalo así)
   - Instala todos los componentes (incluyendo pgAdmin 4)

**Verificar Instalación**:
```powershell
# Abre PowerShell y ejecuta:
psql --version
# Debe mostrar algo como: psql (PostgreSQL) 15.x
```

**Si no funciona**, añade PostgreSQL al PATH:
1. Busca "Variables de entorno" en Windows
2. Edita las variables de entorno del sistema
3. Añade a PATH: `C:\Program Files\PostgreSQL\15\bin`
4. Reinicia PowerShell

### 2. Node.js

**Descargar e Instalar**:
1. Ve a https://nodejs.org/
2. Descarga la versión LTS (recomendada)
3. Ejecuta el instalador
4. Acepta las opciones por defecto

**Verificar Instalación**:
```powershell
node --version
# Debe mostrar: v16.x.x o superior

npm --version
# Debe mostrar: 8.x.x o superior
```

### 3. Git (Opcional, si clonaste el repositorio)

**Descargar e Instalar**:
1. Ve a https://git-scm.com/download/win
2. Descarga e instala Git para Windows
3. Usa las opciones por defecto

---

## 🚀 Configuración del Proyecto

### Paso 1: Abrir PowerShell

1. Presiona `Windows + X`
2. Selecciona "Windows PowerShell" o "Terminal"
3. Navega a la carpeta del proyecto:

```powershell
cd C:\ruta\a\tu\proyecto\easyfactu
```

### Paso 2: Instalar Dependencias

```powershell
cd scaffold\backend
npm install
```

Esto instalará todas las dependencias necesarias. Puede tardar unos minutos.

### Paso 3: Configurar Variables de Entorno

1. Copia el archivo de ejemplo:
```powershell
copy .env.example .env
```

2. Edita el archivo `.env`:
```powershell
notepad .env
```

3. Configura tus credenciales de PostgreSQL:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=easyfactu
DB_USER=postgres
DB_PASSWORD=tu_contraseña_aqui
NODE_ENV=development
PORT=3000
```

**Importante**: Reemplaza `tu_contraseña_aqui` con la contraseña que configuraste al instalar PostgreSQL.

4. Guarda y cierra el archivo.

### Paso 4: Configurar la Base de Datos

**Opción A: Con datos de prueba (Recomendado)**
```powershell
.\scripts\db-setup.ps1 -Seed
```

**Opción B: Sin datos de prueba**
```powershell
.\scripts\db-setup.ps1
```

**¿Qué hace este script?**
- ✅ Crea la base de datos `easyfactu`
- ✅ Ejecuta todas las migraciones
- ✅ Crea las tablas necesarias
- ✅ (Con -Seed) Inserta 3 facturas de prueba

**Si obtienes error de ejecución de scripts**, ejecuta primero:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Paso 5: Compilar el Proyecto

```powershell
npm run build
```

Esto compila el código TypeScript a JavaScript.

---

## ✅ Verificar la Instalación

Desde la raíz del proyecto:

```powershell
cd ..\..
.\verificar.ps1
```

Este script verifica:
- ✅ Que todos los prerrequisitos estén instalados
- ✅ Que la estructura del proyecto sea correcta
- ✅ Que la base de datos esté configurada
- ✅ Que el código compile sin errores
- ✅ 28 checks en total

**Si todos los checks pasan**, ¡estás listo para empezar!

---

## 🎯 Probar el Sistema

### 1. Iniciar el Servidor

En una terminal PowerShell:

```powershell
cd scaffold\backend
npm run dev
```

Deberías ver:
```
Server running on port 3000
Database connected
```

**Mantén esta terminal abierta**.

### 2. Probar la API

En **otra terminal PowerShell**:

```powershell
cd scaffold\backend
.\scripts\test-api.ps1
```

Este script prueba todos los endpoints de la API:
- ✅ Health check
- ✅ List invoices
- ✅ Get invoice
- ✅ Create invoice
- ✅ Validate invoice
- ✅ Y más...

### 3. Probar con Postman (Opcional)

1. Instala Postman: https://www.postman.com/downloads/
2. Abre Postman
3. Importa la colección: `File > Import`
4. Selecciona: `scaffold/backend/postman_collection.json`
5. ¡Ya puedes probar todos los endpoints!

### 4. Probar con el Navegador

Abre tu navegador y ve a:
- http://localhost:3000/health - Verifica que el servidor esté funcionando
- http://localhost:3000/api/v1/invoices - Lista de facturas

---

## 📚 Comandos Útiles

### Gestión de Base de Datos

```powershell
# Setup con datos de prueba
cd scaffold\backend
.\scripts\db-setup.ps1 -Seed

# Reset completo (¡ELIMINA TODOS LOS DATOS!)
.\scripts\db-reset.ps1

# Conectar a PostgreSQL manualmente
psql -h localhost -U postgres -d easyfactu
```

### Desarrollo

```powershell
cd scaffold\backend

# Iniciar servidor en modo desarrollo (auto-reload)
npm run dev

# Compilar TypeScript
npm run build

# Verificar tipos
npm run type-check

# Ejecutar tests
npm test
```

### Testing

```powershell
cd scaffold\backend

# Probar todos los endpoints
.\scripts\test-api.ps1

# Verificar sistema completo
cd ..\..
.\verificar.ps1
```

---

## 🐛 Solución de Problemas

### Error: "cannot be loaded because running scripts is disabled"

**Solución**:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Error: "psql: command not found" o "psql: no se reconoce como comando"

**Solución**:
1. Verifica que PostgreSQL esté instalado
2. Añade PostgreSQL al PATH:
   - Abre "Variables de entorno" en Windows
   - Edita PATH y añade: `C:\Program Files\PostgreSQL\15\bin`
   - Reinicia PowerShell

### Error: "ECONNREFUSED" al conectar a la base de datos

**Causas posibles**:
1. PostgreSQL no está ejecutándose
2. Credenciales incorrectas en `.env`
3. Puerto incorrecto

**Solución**:
```powershell
# Verificar servicio PostgreSQL
Get-Service postgresql*

# Si no está ejecutándose, iniciarlo
Start-Service postgresql-x64-15  # ajusta el nombre según tu versión
```

### Error: "database does not exist"

**Solución**:
```powershell
cd scaffold\backend
.\scripts\db-setup.ps1
```

### Error: "npm ERR! code ENOENT"

**Solución**:
```powershell
# Asegúrate de estar en la carpeta correcta
cd scaffold\backend

# Reinstala dependencias
Remove-Item node_modules -Recurse -Force
Remove-Item package-lock.json
npm install
```

### El servidor no inicia en el puerto 3000

**Solución**:
```powershell
# Verifica qué proceso está usando el puerto
netstat -ano | findstr :3000

# Mata el proceso (reemplaza PID con el número que aparece)
taskkill /PID <PID> /F

# O cambia el puerto en .env
# PORT=3001
```

### Error: "relation does not exist"

**Solución**: Las tablas no están creadas
```powershell
cd scaffold\backend
.\scripts\db-setup.ps1
```

---

## 📖 Datos de Prueba

Si ejecutaste el setup con `-Seed`, tienes estos datos disponibles:

### Facturas de Prueba:
- **TEST-001**: Servicios de consultoría (€121.00)
- **TEST-002**: Venta de productos (€242.00)
- **TEST-003**: Punto de venta (€60.50)

### Clientes de Ejemplo:
- Cliente Ejemplo S.A. (B12345678)
- Cliente Internacional Ltd. (X1234567Y)

### Probar con estos datos:

```powershell
# Obtener factura TEST-001
Invoke-WebRequest http://localhost:3000/api/v1/invoices/TEST-001 | Select-Object -Expand Content

# O con curl (si lo tienes instalado)
curl http://localhost:3000/api/v1/invoices/TEST-001
```

---

## 🎓 Próximos Pasos

Una vez que todo funcione:

1. **Lee la documentación completa**:
   - `README.md` - Información general del proyecto
   - `TESTING_GUIDE.md` - Guía completa de testing
   - `scaffold/backend/README.md` - Documentación de la API

2. **Explora la API**:
   - Usa Postman con la colección incluida
   - Lee los ejemplos en `TESTING_GUIDE.md`

3. **Experimenta**:
   - Crea tus propias facturas
   - Prueba diferentes tipos de factura (F1-F4, R1-R5)
   - Explora la validación con AEAT

4. **Desarrollo**:
   - Modifica el código en `scaffold/backend/src/`
   - El servidor se recargará automáticamente con `npm run dev`

---

## 💡 Tips para Windows

### Usar VS Code

1. Instala VS Code: https://code.visualstudio.com/
2. Abre la carpeta del proyecto: `File > Open Folder`
3. Instala las extensiones recomendadas:
   - ESLint
   - Prettier
   - PostgreSQL
   - Thunder Client (alternativa a Postman)

### Terminal Integrada en VS Code

1. Presiona `` Ctrl + ` `` para abrir la terminal
2. Selecciona PowerShell en el dropdown
3. Ejecuta comandos directamente desde VS Code

### Accesos Directos

Crea un archivo `start.ps1` en la raíz del proyecto:

```powershell
# start.ps1
Write-Host "Iniciando EasyFactu..." -ForegroundColor Green
cd scaffold\backend
npm run dev
```

Luego ejecútalo con: `.\start.ps1`

---

## 📞 Soporte

Si tienes problemas:

1. Revisa la sección de **Solución de Problemas** arriba
2. Ejecuta `.\verificar.ps1` para diagnosticar el problema
3. Lee los logs de error cuidadosamente
4. Consulta la documentación adicional:
   - `LISTO_PARA_PROBAR.md`
   - `QUICK_START.md`
   - `TESTING_GUIDE.md`

---

## ✅ Checklist Final

- [ ] PostgreSQL instalado y funcionando
- [ ] Node.js instalado (versión 16+)
- [ ] Dependencias instaladas (`npm install`)
- [ ] Archivo `.env` configurado
- [ ] Base de datos creada (`.\scripts\db-setup.ps1 -Seed`)
- [ ] Código compilado (`npm run build`)
- [ ] Verificación exitosa (`.\verificar.ps1`)
- [ ] Servidor iniciado (`npm run dev`)
- [ ] API probada (`.\scripts\test-api.ps1`)
- [ ] Todo funcionando ✅

---

**¡Listo para usar EasyFactu en Windows!** 🎉

Si tienes alguna pregunta o encuentras algún problema, consulta la documentación adicional o revisa los logs para más detalles.
