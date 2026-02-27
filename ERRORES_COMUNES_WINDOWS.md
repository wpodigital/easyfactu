# 🐛 Errores Comunes en Windows - Guía de Soluciones

Guía completa de errores comunes al configurar y ejecutar EasyFactu en Windows, con soluciones paso a paso.

---

## 📑 Índice de Errores

1. [Error #1: Directorio Incorrecto](#error-1-directorio-incorrecto) ⭐ MÁS COMÚN
2. [Error #2: Política de Ejecución de PowerShell](#error-2-política-de-ejecución-de-powershell)
3. [Error #3: PostgreSQL No Encontrado](#error-3-postgresql-no-encontrado)
4. [Error #4: Error de Conexión a la Base de Datos](#error-4-error-de-conexión-a-la-base-de-datos)
5. [Error #5: Puerto 3000 Ya en Uso](#error-5-puerto-3000-ya-en-uso)
6. [Error #6: npm install Falla](#error-6-npm-install-falla)
7. [Error #7: Errores de Compilación TypeScript](#error-7-errores-de-compilación-typescript)
8. [Error #8: Variables de Entorno No Cargadas](#error-8-variables-de-entorno-no-cargadas)
9. [Error #9: Scripts No Encontrados](#error-9-scripts-no-encontrados)
10. [Error #10: Errores de Permisos en Base de Datos](#error-10-errores-de-permisos-en-base-de-datos)
11. [Error #11: Módulo 'pg' No Encontrado](#error-11-módulo-pg-no-encontrado)
12. [Error #12: dotenv No Funciona](#error-12-dotenv-no-funciona)
13. [Consejos Generales](#consejos-generales)

---

## Error #1: Directorio Incorrecto

### 🔴 Síntomas:
```
npm error path C:\WINDOWS\system32\package.json
npm error enoent Could not read package.json
```

### 💡 Causa:
Estás ejecutando `npm` desde un directorio que no es el del proyecto.

### ✅ Solución:

```powershell
# 1. Encuentra tu proyecto
cd C:\Users\TU_USUARIO
dir /s /b easyfactu

# 2. Navega al directorio correcto
cd C:\ruta\a\tu\easyfactu\scaffold\backend

# 3. Verifica que estás en el lugar correcto
dir package.json
# Debe mostrar el archivo

# 4. Ahora sí ejecuta npm
npm run dev
```

### 📌 Prevención:
- Abre PowerShell desde el proyecto (Shift + Clic derecho en carpeta)
- Usa la terminal de VS Code
- Crea un acceso directo

**Ver:** SOLUCION_RAPIDA.md para más detalles

---

## Error #2: Política de Ejecución de PowerShell

### 🔴 Síntomas:
```
.\scripts\db-setup.ps1 : File cannot be loaded because running scripts is disabled
```

### 💡 Causa:
PowerShell bloquea la ejecución de scripts por seguridad.

### ✅ Solución:

```powershell
# Opción 1: Cambiar política para el usuario actual (recomendado)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Opción 2: Ejecutar el script permitiendo su ejecución una vez
PowerShell -ExecutionPolicy Bypass -File .\scripts\db-setup.ps1

# Opción 3: Usar npm scripts (no requiere cambios)
npm run db:setup:seed
```

### 📌 Prevención:
Configura la política de ejecución una sola vez al inicio.

---

## Error #3: PostgreSQL No Encontrado

### 🔴 Síntomas:
```
psql : El término 'psql' no se reconoce como nombre de un cmdlet
```

### 💡 Causa:
PostgreSQL no está instalado o no está en el PATH del sistema.

### ✅ Solución:

**Si no está instalado:**
1. Descarga PostgreSQL: https://www.postgresql.org/download/windows/
2. Instala con las opciones por defecto
3. Anota la contraseña del usuario `postgres`
4. Reinicia PowerShell

**Si está instalado pero no en PATH:**
```powershell
# 1. Encuentra dónde está instalado PostgreSQL
dir /s /b "C:\Program Files\PostgreSQL" psql.exe

# 2. Agrega al PATH temporalmente
$env:Path += ";C:\Program Files\PostgreSQL\15\bin"

# 3. Verifica
psql --version
```

**Para agregar permanentemente al PATH:**
1. Sistema → Configuración avanzada del sistema
2. Variables de entorno
3. En "Variables del sistema", edita "Path"
4. Agrega: `C:\Program Files\PostgreSQL\15\bin`
5. Reinicia PowerShell

---

## Error #4: Error de Conexión a la Base de Datos

### 🔴 Síntomas:
```
Error: connect ECONNREFUSED 127.0.0.1:5432
Error: password authentication failed for user "postgres"
```

### 💡 Causas Posibles:
- PostgreSQL no está ejecutándose
- Contraseña incorrecta en .env
- Puerto incorrecto

### ✅ Solución:

**Verifica que PostgreSQL esté corriendo:**
```powershell
# Ver servicios de PostgreSQL
Get-Service postgresql*

# Iniciar el servicio si está detenido
Start-Service postgresql-x64-15  # Ajusta la versión
```

**Verifica la configuración:**
```powershell
# 1. Abre el archivo .env
notepad .env

# 2. Verifica estos valores:
DB_HOST=localhost
DB_PORT=5432
DB_NAME=easyfactu
DB_USER=postgres
DB_PASSWORD=tu_contraseña_real  # ← Importante
```

**Prueba la conexión manualmente:**
```powershell
psql -h localhost -U postgres -d postgres
# Introduce la contraseña cuando te la pida
```

---

## Error #5: Puerto 3000 Ya en Uso

### 🔴 Síntomas:
```
Error: listen EADDRINUSE: address already in use :::3000
```

### 💡 Causa:
Otro proceso ya está usando el puerto 3000.

### ✅ Solución:

**Opción 1: Terminar el proceso que usa el puerto**
```powershell
# 1. Encuentra qué proceso usa el puerto
netstat -ano | findstr :3000

# 2. Anota el PID (última columna)
# Ejemplo: 12345

# 3. Termina el proceso
taskkill /PID 12345 /F
```

**Opción 2: Usar otro puerto**
```powershell
# Edita scaffold/backend/src/index.ts
# Cambia: const PORT = 3000;
# Por: const PORT = 3001;
```

**Opción 3: Si es una instancia anterior del servidor**
```powershell
# Simplemente presiona Ctrl+C en la terminal anterior
# O cierra esa ventana de PowerShell
```

---

## Error #6: npm install Falla

### 🔴 Síntomas:
```
npm ERR! code ENOENT
npm ERR! network request failed
npm ERR! gyp ERR! stack Error: spawn ENOENT
```

### 💡 Causas Posibles:
- Sin conexión a internet
- npm cache corrupto
- Permisos insuficientes

### ✅ Solución:

```powershell
# 1. Limpia el cache de npm
npm cache clean --force

# 2. Elimina node_modules y package-lock.json
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json

# 3. Reinstala
npm install

# Si sigue fallando, intenta con diferentes registros:
npm install --registry=https://registry.npmjs.org/
```

---

## Error #7: Errores de Compilación TypeScript

### 🔴 Síntomas:
```
error TS2307: Cannot find module 'express'
error TS2304: Cannot find name 'require'
```

### 💡 Causa:
Dependencias o tipos de TypeScript faltantes.

### ✅ Solución:

```powershell
# 1. Instala las dependencias de desarrollo
npm install --save-dev @types/node @types/express

# 2. Reinstala todo
npm install

# 3. Verifica la compilación
npm run build

# 4. Si persiste, limpia y recompila
Remove-Item -Recurse -Force dist
npm run build
```

---

## Error #8: Variables de Entorno No Cargadas

### 🔴 Síntomas:
```
Error: DB_HOST is undefined
Missing environment variables
```

### 💡 Causa:
El archivo `.env` no existe o no se está cargando correctamente.

### ✅ Solución:

```powershell
# 1. Verifica que existe el archivo .env
dir .env

# Si no existe:
copy .env.example .env
notepad .env

# 2. Verifica el contenido
Get-Content .env

# 3. Asegúrate de que no hay espacios extra
# CORRECTO: DB_HOST=localhost
# INCORRECTO: DB_HOST = localhost

# 4. Reinicia el servidor
npm run dev
```

---

## Error #9: Scripts No Encontrados

### 🔴 Síntomas:
```
npm ERR! missing script: dev
npm ERR! missing script: db:setup
```

### 💡 Causa:
Estás en el directorio incorrecto o falta package.json.

### ✅ Solución:

```powershell
# 1. Verifica que package.json existe
dir package.json

# 2. Verifica que estás en scaffold/backend
pwd
# Debe mostrar: ...\easyfactu\scaffold\backend

# 3. Verifica los scripts disponibles
npm run

# 4. Si falta package.json, verifica que clonaste bien el repo
```

---

## Error #10: Errores de Permisos en Base de Datos

### 🔴 Síntomas:
```
ERROR: permission denied for database easyfactu
ERROR: must be owner of database easyfactu
```

### 💡 Causa:
El usuario de la base de datos no tiene permisos suficientes.

### ✅ Solución:

```powershell
# Conectarse como superusuario
psql -U postgres

# Dentro de psql:
# Dar permisos al usuario
GRANT ALL PRIVILEGES ON DATABASE easyfactu TO postgres;

# O crear un usuario nuevo con permisos
CREATE USER easyfactu_user WITH PASSWORD 'tu_contraseña';
GRANT ALL PRIVILEGES ON DATABASE easyfactu TO easyfactu_user;

# Salir
\q
```

Luego actualiza tu `.env`:
```
DB_USER=easyfactu_user
DB_PASSWORD=tu_contraseña
```

---

## Error #11: Módulo 'pg' No Encontrado

### 🔴 Síntomas:
```
Error: Cannot find module 'pg'
Error: Cannot find module 'dotenv'
```

### 💡 Causa:
Las dependencias no están instaladas.

### ✅ Solución:

```powershell
# 1. Verifica que estás en el directorio correcto
pwd
# Debe mostrar: ...\scaffold\backend

# 2. Instala las dependencias
npm install

# 3. Verifica que se instalaron
dir node_modules\pg
dir node_modules\dotenv

# 4. Si persiste, reinstala específicamente
npm install pg dotenv --save
```

---

## Error #12: dotenv No Funciona

### 🔴 Síntomas:
Las variables de entorno no se cargan aunque el archivo .env existe.

### 💡 Causa:
dotenv no se está llamando correctamente o el archivo tiene formato incorrecto.

### ✅ Solución:

```powershell
# 1. Verifica que dotenv está instalado
npm list dotenv

# 2. Verifica el formato del .env (sin comillas, sin espacios extra)
# CORRECTO:
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres

# INCORRECTO:
DB_HOST = "localhost"  # Sin comillas ni espacios
DB_PORT= 5432          # Sin espacio antes del =

# 3. Asegúrate de que se carga al inicio
# En src/index.ts debe estar al principio:
import dotenv from 'dotenv';
dotenv.config();
```

---

## Consejos Generales

### 🎯 Antes de Empezar

```powershell
# 1. Verifica que tienes todo instalado
node --version    # Debe ser v16 o superior
npm --version     # Debe estar disponible
psql --version    # PostgreSQL instalado

# 2. Verifica que estás en el directorio correcto
pwd
dir package.json

# 3. Verifica que las dependencias están instaladas
dir node_modules
```

### 🔧 Debugging General

```powershell
# Ver logs detallados de npm
npm run dev --verbose

# Ver información del sistema
npm run verificar  # Si existe el script

# O usar PowerShell:
.\verificar.ps1
```

### 📝 Orden Recomendado de Operaciones

1. ✅ Instalar Node.js y PostgreSQL
2. ✅ Clonar el repositorio
3. ✅ Navegar a `scaffold/backend`
4. ✅ Copiar `.env.example` a `.env`
5. ✅ Editar `.env` con tus credenciales
6. ✅ Ejecutar `npm install`
7. ✅ Ejecutar `.\scripts\db-setup.ps1 -Seed`
8. ✅ Ejecutar `npm run dev`

### 🆘 Si Todo Falla

```powershell
# Reset completo:
# 1. Elimina node_modules
Remove-Item -Recurse -Force node_modules

# 2. Elimina package-lock.json
Remove-Item package-lock.json

# 3. Limpia cache
npm cache clean --force

# 4. Reinstala desde cero
npm install

# 5. Reconstruye
npm run build

# 6. Intenta de nuevo
npm run dev
```

---

## 📚 Recursos Adicionales

- **WINDOWS_SETUP.md** - Guía completa de instalación
- **SOLUCION_RAPIDA.md** - Solución rápida para errores comunes
- **TESTING_GUIDE.md** - Cómo probar el sistema
- **DATABASE_SETUP.md** - Configuración de base de datos

---

## 💬 ¿Necesitas Más Ayuda?

Si ninguna de estas soluciones funciona:

1. Ejecuta `.\verificar.ps1` y anota los resultados
2. Revisa los logs completos del error
3. Verifica que cumples todos los prerrequisitos
4. Consulta la documentación específica del componente

---

**Última actualización**: 27 de febrero de 2026
