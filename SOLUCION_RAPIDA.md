# 🚨 Solución Rápida - Error al Ejecutar npm run dev

## Tu Error

```
PS C:\WINDOWS\system32> npm run dev
npm error code ENOENT
npm error path C:\WINDOWS\system32\package.json
npm error errno -4058
npm error enoent Could not read package.json
```

---

## 🎯 El Problema

**Estás en el directorio equivocado.**

PowerShell está abierto en `C:\WINDOWS\system32` (carpeta del sistema) en lugar de la carpeta de tu proyecto.

npm busca `package.json` en el directorio actual, pero ese archivo está en tu proyecto, no en system32.

---

## ✅ La Solución (3 Pasos)

### Paso 1: Encuentra Tu Proyecto

```powershell
# Si no sabes dónde descargaste el proyecto:
cd C:\Users\HP
dir /s /b easyfactu
```

Esto buscará la carpeta `easyfactu` en tu usuario. Anota la ruta que te muestra.

### Paso 2: Navega al Directorio Correcto

```powershell
# Ejemplo (ajusta según tu ruta):
cd C:\Users\HP\Desktop\easyfactu\scaffold\backend

# O si está en Descargas:
cd C:\Users\HP\Downloads\easyfactu\scaffold\backend

# O si está en Documentos:
cd C:\Users\HP\Documents\easyfactu\scaffold\backend
```

### Paso 3: Verifica y Ejecuta

```powershell
# Verifica que estás en el lugar correcto:
dir package.json

# Deberías ver el archivo listado
# Si ves "No se encuentra el archivo", estás en el lugar equivocado

# Si el archivo existe, AHORA SÍ ejecuta:
npm run dev
```

---

## 📍 Estructura de Directorios

### ❌ INCORRECTO (donde estás ahora):
```
C:\WINDOWS\system32\
```

### ✅ CORRECTO (donde necesitas estar):
```
C:\Users\HP\[Desktop|Downloads|Documents]\
    └── easyfactu\                    ← Tu proyecto
        └── scaffold\
            └── backend\              ← AQUÍ debes estar
                ├── package.json      ← npm busca esto
                ├── src\
                ├── scripts\
                ├── node_modules\
                └── .env
```

---

## 🔍 Cómo Verificar que Estás en el Lugar Correcto

```powershell
# 1. Verifica el directorio actual
pwd
# Debe mostrar: C:\...\easyfactu\scaffold\backend

# 2. Lista los archivos
dir
# Debes ver: package.json, src, scripts, node_modules, etc.

# 3. Verifica específicamente package.json
dir package.json
# Debe mostrar el archivo, no un error
```

---

## 💡 Consejos para No Repetir el Error

### Opción 1: Abrir PowerShell desde el Proyecto
1. Abre el Explorador de Windows
2. Navega a: `easyfactu\scaffold\backend`
3. Mantén presionado `Shift` y haz clic derecho en la carpeta
4. Selecciona "Abrir ventana de PowerShell aquí"

### Opción 2: Usar la Terminal de VS Code
1. Abre VS Code
2. Abre la carpeta del proyecto
3. Usa la terminal integrada (Ctrl + `)
4. Ya estará en el directorio correcto

### Opción 3: Crear un Acceso Directo
1. Crea un archivo `.bat` en el escritorio:
   ```batch
   cd /d C:\Users\HP\Desktop\easyfactu\scaffold\backend
   powershell
   ```
2. Nómbralo "Abrir EasyFactu Backend.bat"
3. Haz doble clic cuando quieras trabajar

---

## 🎯 Resumen

| Problema | Solución |
|----------|----------|
| ❌ Estás en `C:\WINDOWS\system32` | ✅ Ve a `easyfactu\scaffold\backend` |
| ❌ npm no encuentra package.json | ✅ Navega primero con `cd` |
| ❌ Error ENOENT | ✅ Estás en el directorio equivocado |

---

## 🚀 Próximos Pasos

Una vez que estés en el directorio correcto:

```powershell
# 1. Verifica que tienes las dependencias instaladas
npm install

# 2. Verifica que tienes el archivo .env configurado
dir .env
# Si no existe:
copy .env.example .env
notepad .env

# 3. Inicia el servidor
npm run dev

# 4. El servidor debería iniciar en http://localhost:3000
```

---

## 📚 Más Ayuda

Si tienes otros errores, consulta:
- **ERRORES_COMUNES_WINDOWS.md** - Guía completa de errores comunes
- **WINDOWS_SETUP.md** - Guía de instalación completa
- **TESTING_GUIDE.md** - Cómo probar el sistema

---

## ⚠️ Regla de Oro

**SIEMPRE navega primero al directorio del proyecto antes de ejecutar npm:**

```powershell
# CORRECTO ✅
cd C:\ruta\a\tu\easyfactu\scaffold\backend
npm run dev

# INCORRECTO ❌
npm run dev  # (desde cualquier directorio aleatorio)
```

---

**¿Necesitas más ayuda?** Consulta ERRORES_COMUNES_WINDOWS.md para otros problemas.
