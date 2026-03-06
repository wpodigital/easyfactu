# Configurar PostgreSQL en el PATH de Windows

## ¿Qué significa este error?

```
[ERROR] PostgreSQL no esta instalado o no esta en el PATH
```

Este error significa que:
- ✅ PostgreSQL **está instalado** en tu computadora
- ❌ Pero Windows **no puede encontrarlo**
- 🔧 Necesitas agregar PostgreSQL al PATH del sistema

## Solución Rápida (30 segundos)

**Opción temporal** (solo para esta sesión de PowerShell):

```powershell
# Agrega PostgreSQL al PATH temporalmente
# Prueba con la versión que tengas instalada:

# Para PostgreSQL 16:
$env:PATH += ";C:\Program Files\PostgreSQL\16\bin"

# Para PostgreSQL 15:
$env:PATH += ";C:\Program Files\PostgreSQL\15\bin"

# Para PostgreSQL 14:
$env:PATH += ";C:\Program Files\PostgreSQL\14\bin"

# Para PostgreSQL 13:
$env:PATH += ";C:\Program Files\PostgreSQL\13\bin"
```

**Verifica que funciona**:
```powershell
psql --version
# Debería mostrar: psql (PostgreSQL) 16.x
```

**Ahora ejecuta el setup**:
```powershell
.\scripts\db-setup.ps1 -Seed
```

---

## Encontrar PostgreSQL en tu Computadora

### Método 1: Buscar con PowerShell
```powershell
# Busca el ejecutable psql.exe
Get-ChildItem -Path "C:\Program Files" -Filter "psql.exe" -Recurse -ErrorAction SilentlyContinue | Select-Object FullName

# Resultado ejemplo:
# C:\Program Files\PostgreSQL\16\bin\psql.exe
```

### Método 2: Buscar con Windows Explorer
1. Abre el Explorador de Windows
2. Ve a `C:\Program Files\`
3. Busca una carpeta llamada `PostgreSQL`
4. Dentro habrá carpetas con números (versiones): 14, 15, 16, etc.
5. Dentro de cada versión hay una carpeta `bin`
6. Esa es la ruta que necesitas

**Ejemplo de ruta completa**:
```
C:\Program Files\PostgreSQL\16\bin
```

---

## Solución Permanente (2 minutos)

Para que PostgreSQL esté siempre disponible:

### Paso 1: Copia la Ruta de PostgreSQL

Encuentra la carpeta `bin` de PostgreSQL (ver sección anterior).

**Ejemplo**: `C:\Program Files\PostgreSQL\16\bin`

### Paso 2: Abre Variables de Entorno

**Opción A - Desde el menú Inicio**:
1. Presiona `Win + S` (búsqueda)
2. Escribe: `variables de entorno`
3. Click en "Editar las variables de entorno del sistema"

**Opción B - Desde Sistema**:
1. Click derecho en "Este equipo" o "Mi PC"
2. Propiedades
3. Configuración avanzada del sistema
4. Botón "Variables de entorno"

### Paso 3: Editar PATH

1. En la ventana "Variables de entorno"
2. En la sección "Variables del sistema" (parte inferior)
3. Busca la variable llamada `Path`
4. Selecciónala y click en "Editar"

### Paso 4: Agregar PostgreSQL

1. En la ventana de edición, click en "Nuevo"
2. Pega la ruta de PostgreSQL: `C:\Program Files\PostgreSQL\16\bin`
   (ajusta el número de versión según lo que tengas)
3. Click en "Aceptar"
4. Click en "Aceptar" de nuevo
5. Click en "Aceptar" para cerrar todo

### Paso 5: Reiniciar PowerShell

1. **Cierra todas las ventanas de PowerShell** que tengas abiertas
2. Abre una nueva ventana de PowerShell
3. Verifica que funciona:

```powershell
psql --version
```

---

## Verificación

Después de agregar al PATH, verifica que todo funciona:

```powershell
# 1. Verifica psql
psql --version
# Debe mostrar: psql (PostgreSQL) 16.x

# 2. Verifica createdb
createdb --version
# Debe mostrar: createdb (PostgreSQL) 16.x

# 3. Prueba la conexión (requiere contraseña)
psql -U postgres -h localhost
# Escribe tu contraseña y deberías entrar a PostgreSQL

# 4. Sal de psql
\q

# 5. Ahora ejecuta el setup del proyecto
cd C:\Users\HP\Dev\GitHub\easyfactu\scaffold\backend
.\scripts\db-setup.ps1 -Seed
```

---

## Solución de Problemas

### Problema: "psql no se reconoce"

**Causa**: La ruta no está bien agregada al PATH

**Solución**:
1. Verifica la ruta exacta de PostgreSQL
2. Asegúrate de haber reiniciado PowerShell
3. Prueba la solución temporal primero

### Problema: "Múltiples versiones de PostgreSQL"

**Causa**: Tienes varias versiones instaladas

**Solución**:
- Usa la versión más reciente
- O desinstala las versiones que no uses

### Problema: "Acceso denegado al editar PATH"

**Causa**: Falta de permisos de administrador

**Solución**:
- Usa la solución temporal (no requiere admin)
- O pide a un administrador que agregue la ruta
- O abre el editor de variables como administrador

---

## Ubicaciones Comunes de PostgreSQL

### Instalador Oficial (EDB):
```
C:\Program Files\PostgreSQL\{versión}\bin
```

Ejemplos:
- `C:\Program Files\PostgreSQL\16\bin`
- `C:\Program Files\PostgreSQL\15\bin`
- `C:\Program Files\PostgreSQL\14\bin`

### Instalador Portable:
```
C:\PostgreSQL\{versión}\bin
```

### Stack Builder o Instaladores Combinados:
```
C:\Program Files\PostgreSQL\{versión}\bin
```

---

## Comandos Útiles

```powershell
# Ver versión de PostgreSQL
psql --version

# Ver servicio de PostgreSQL
Get-Service postgresql*

# Iniciar servicio PostgreSQL (si está detenido)
Start-Service postgresql-x64-16  # ajusta la versión

# Ver todas las variables PATH
$env:PATH -split ';'

# Agregar temporalmente al PATH
$env:PATH += ";C:\Program Files\PostgreSQL\16\bin"

# Verificar que PostgreSQL está en PATH
where.exe psql
```

---

## Resumen

| Situación | Solución |
|-----------|----------|
| **Error de PATH** | Agregar PostgreSQL al PATH |
| **Solución rápida** | `$env:PATH += ";ruta\a\PostgreSQL\bin"` |
| **Solución permanente** | Editar variables de entorno del sistema |
| **Verificación** | `psql --version` |
| **Después** | Ejecutar `.\scripts\db-setup.ps1 -Seed` |

---

## Siguiente Paso

Una vez que `psql --version` funcione correctamente:

```powershell
# Ve a la carpeta del proyecto
cd C:\Users\HP\Dev\GitHub\easyfactu\scaffold\backend

# Ejecuta el setup
.\scripts\db-setup.ps1 -Seed
```

¡Listo! Ahora deberías poder continuar con la configuración del proyecto.
