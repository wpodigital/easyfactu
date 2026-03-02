# FAQ - PostgreSQL y EasyFactu

Preguntas frecuentes sobre la configuración de PostgreSQL para el proyecto EasyFactu.

---

## 1. ¿Necesito pgAdmin 4?

**Respuesta: NO, no es necesario.**

- ✅ Los scripts PowerShell se conectan **directamente** a PostgreSQL
- ✅ Todo funciona por **línea de comandos**
- ✅ **No necesitas abrir** pgAdmin 4 para que el proyecto funcione

### ¿Para qué sirve pgAdmin 4 entonces?

pgAdmin 4 es una herramienta **opcional** que te permite:
- Ver los datos de las tablas de forma visual
- Ejecutar consultas SQL manualmente
- Administrar la base de datos con interfaz gráfica

**Conclusión**: Puedes usar pgAdmin 4 si quieres, pero **no es necesario** para este proyecto.

---

## 2. ¿Cómo sé si PostgreSQL está funcionando?

### Verificar si PostgreSQL está instalado:

```powershell
# Opción 1: Ver versión
psql --version

# Opción 2: Buscar el servicio
Get-Service postgresql*

# Opción 3: Intentar conectar
psql -U postgres -h localhost
```

### Verificar si el servicio está corriendo:

```powershell
# Ver estado del servicio
Get-Service postgresql*

# Si muestra "Running" = está funcionando
# Si muestra "Stopped" = está detenido

# Iniciar el servicio (si está detenido)
Start-Service postgresql-x64-16  # ajusta el nombre según tu versión
```

### Si nada funciona:

PostgreSQL probablemente **no está instalado**. Descárgalo desde:
https://www.postgresql.org/download/windows/

---

## 3. ¿Qué contraseña debo usar?

La contraseña que debes usar es la que configuraste cuando **instalaste PostgreSQL**.

### Si no recuerdas la contraseña:

**Opción 1: Reinstalar PostgreSQL** (más fácil)
- Desinstala PostgreSQL
- Instálalo de nuevo
- Elige una contraseña que recuerdes

**Opción 2: Cambiar la contraseña** (avanzado)
1. Edita el archivo `pg_hba.conf`
2. Cambia authentication a `trust` temporalmente
3. Cambia la contraseña con `ALTER USER`
4. Vuelve authentication a `md5`

### Configurar la contraseña en el proyecto:

Edita el archivo `.env`:
```env
DB_PASSWORD=tu_contraseña_aqui
```

---

## 4. ¿Necesito crear la base de datos manualmente?

**Respuesta: NO.**

El script `db-setup.ps1` crea automáticamente:
- ✅ La base de datos `easyfactu`
- ✅ Todas las tablas necesarias
- ✅ Los datos de prueba (si usas `-Seed`)

### ¿Qué hace el script?

```powershell
.\scripts\db-setup.ps1 -Seed
```

Este script:
1. Verifica que PostgreSQL esté instalado
2. Crea la base de datos `easyfactu`
3. Ejecuta las migraciones (crea tablas)
4. Inserta datos de prueba (3 facturas ejemplo)

**No necesitas hacer nada manualmente en pgAdmin o psql.**

---

## 5. Error: "PostgreSQL no está en el PATH"

```
[ERROR] PostgreSQL no esta instalado o no esta en el PATH
```

### Solución Rápida (30 segundos):

```powershell
# Agrega PostgreSQL al PATH temporalmente:
$env:PATH += ";C:\Program Files\PostgreSQL\16\bin"

# Verifica que funciona:
psql --version

# Ejecuta el setup:
.\scripts\db-setup.ps1 -Seed
```

### Solución Permanente:

Lee el archivo `POSTGRESQL_PATH_WINDOWS.md` para instrucciones detalladas.

---

## 6. Error: "could not connect to server"

```
could not connect to database postgres
FATAL: password authentication failed for user "postgres"
```

### Posibles causas y soluciones:

#### Causa 1: Contraseña incorrecta
- **Solución**: Verifica la contraseña en el archivo `.env`
- El archivo debe tener: `DB_PASSWORD=tu_contraseña`

#### Causa 2: PostgreSQL no está corriendo
```powershell
# Verifica el servicio:
Get-Service postgresql*

# Inícialo si está detenido:
Start-Service postgresql-x64-16
```

#### Causa 3: Puerto incorrecto
- PostgreSQL por defecto usa el puerto `5432`
- Verifica en `.env`: `DB_PORT=5432`

#### Causa 4: Host incorrecto
- Usa `localhost` o `127.0.0.1`
- Verifica en `.env`: `DB_HOST=localhost`

---

## 7. ¿Puedo usar otra base de datos en lugar de PostgreSQL?

**Respuesta: Técnicamente sí, pero no se recomienda.**

El proyecto está diseñado específicamente para PostgreSQL:
- Las migraciones usan sintaxis de PostgreSQL
- El código usa características específicas de PostgreSQL
- Los tipos de datos son de PostgreSQL

**Si quieres cambiar de base de datos**:
- Necesitarías reescribir las migraciones
- Modificar el código que usa características específicas de PostgreSQL
- Puede que algunas funciones no trabajen igual

**Recomendación**: Usa PostgreSQL como está configurado.

---

## 8. ¿Cómo verifico que todo está funcionando correctamente?

### Verificación completa paso a paso:

```powershell
# 1. Verifica PostgreSQL
psql --version
# Debe mostrar: psql (PostgreSQL) 16.x

# 2. Verifica el servicio
Get-Service postgresql*
# Debe mostrar: Running

# 3. Prueba la conexión
psql -U postgres -h localhost
# Escribe tu contraseña
# Deberías entrar a PostgreSQL

# 4. Lista las bases de datos
\l
# Deberías ver 'easyfactu' si ya ejecutaste db-setup

# 5. Sal de psql
\q

# 6. Ejecuta el script de verificación
cd C:\Users\HP\Dev\GitHub\easyfactu
.\verificar.ps1

# 7. Ejecuta el setup (si aún no lo has hecho)
cd scaffold\backend
.\scripts\db-setup.ps1 -Seed

# 8. Inicia el servidor
npm run dev

# 9. Prueba la API (en otra terminal)
.\scripts\test-api.ps1
```

---

## 9. El script db-setup.ps1 falla, ¿qué hago?

### Error común 1: "script cannot be loaded"
```
.\scripts\db-setup.ps1 : File cannot be loaded because running scripts is disabled
```

**Solución**:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Error común 2: "PostgreSQL no está en el PATH"
```
[ERROR] PostgreSQL no esta instalado o no esta en el PATH
```

**Solución**: Ver pregunta #5 arriba

### Error común 3: "password authentication failed"
```
FATAL: password authentication failed
```

**Solución**: Ver pregunta #6 arriba

### Error común 4: "database already exists"
```
ERROR: database "easyfactu" already exists
```

**Solución**: Esto es normal si ya ejecutaste el script antes.
```powershell
# Opción 1: Continuar (la base de datos ya existe, está bien)
# Opción 2: Resetear la base de datos
.\scripts\db-reset.ps1
# Y luego ejecutar de nuevo:
.\scripts\db-setup.ps1 -Seed
```

---

## 10. ¿Puedo usar Docker en lugar de instalar PostgreSQL localmente?

**Respuesta: Sí, pero necesitarás configurarlo tú mismo.**

El proyecto no incluye configuración de Docker, pero puedes:

### Opción 1: Docker Compose (más fácil)

Crea un archivo `docker-compose.yml`:
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: tu_contraseña
      POSTGRES_DB: easyfactu
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Luego:
```powershell
docker-compose up -d
```

### Opción 2: Docker directo

```powershell
docker run --name easyfactu-postgres `
  -e POSTGRES_PASSWORD=tu_contraseña `
  -e POSTGRES_DB=easyfactu `
  -p 5432:5432 `
  -d postgres:16
```

### Configurar el proyecto:

En tu archivo `.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=easyfactu
DB_USER=postgres
DB_PASSWORD=tu_contraseña
```

**Nota**: Si usas Docker, igualmente necesitarás ejecutar las migraciones:
```powershell
.\scripts\db-setup.ps1 -Seed
```

---

## Comandos Útiles de PostgreSQL

### Conectarse a PostgreSQL:
```powershell
psql -U postgres -h localhost
```

### Comandos dentro de psql:
```sql
-- Listar bases de datos
\l

-- Conectar a una base de datos
\c easyfactu

-- Listar tablas
\dt

-- Ver estructura de una tabla
\d facturas

-- Ejecutar una consulta
SELECT * FROM facturas;

-- Salir
\q
```

### Comandos de PowerShell:
```powershell
# Ver versión de PostgreSQL
psql --version

# Ver servicio
Get-Service postgresql*

# Iniciar servicio
Start-Service postgresql-x64-16

# Detener servicio
Stop-Service postgresql-x64-16

# Reiniciar servicio
Restart-Service postgresql-x64-16
```

---

## Recursos Adicionales

### Documentación Oficial:
- PostgreSQL: https://www.postgresql.org/docs/
- pgAdmin: https://www.pgadmin.org/docs/

### Documentación del Proyecto:
- `WINDOWS_SETUP.md` - Guía completa de instalación
- `POSTGRESQL_PATH_WINDOWS.md` - Configurar PATH
- `ERRORES_COMUNES_WINDOWS.md` - Errores comunes
- `SOLUCION_RAPIDA.md` - Soluciones rápidas
- `TESTING_GUIDE.md` - Guía de pruebas

### Scripts Disponibles:
- `db-setup.ps1` - Configurar base de datos
- `db-reset.ps1` - Resetear base de datos
- `test-api.ps1` - Probar la API
- `verificar.ps1` - Verificar el sistema

---

## ¿Más Preguntas?

Si tienes más preguntas:

1. **Revisa la documentación**:
   - `ERRORES_COMUNES_WINDOWS.md`
   - `WINDOWS_SETUP.md`
   - `README.md`

2. **Ejecuta el verificador**:
   ```powershell
   .\verificar.ps1
   ```

3. **Revisa los logs** del servidor cuando ejecutas `npm run dev`

---

**Última actualización**: Marzo 2026
