# Database Reset Script for Windows (PowerShell)
# ================================================
# Este script elimina y recrea la base de datos PostgreSQL
# ADVERTENCIA: Esto eliminará TODOS los datos
# Usage: .\db-reset.ps1

# Colors for output
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Error { Write-Host $args -ForegroundColor Red }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }
function Write-Info { Write-Host $args -ForegroundColor Cyan }

Write-Warning "================================================"
Write-Warning "  [WARNING] ADVERTENCIA: Database Reset"
Write-Warning "================================================"
Write-Host ""
Write-Warning "Este script eliminara TODOS los datos de la base de datos"
Write-Warning "y la recreara desde cero."
Write-Host ""

# Confirmation
$confirmation = Read-Host "Estas seguro que deseas continuar? (escribe 'SI' para confirmar)"
if ($confirmation -ne "SI") {
    Write-Info "Operacion cancelada"
    exit 0
}

Write-Host ""
Write-Info "Procediendo con el reset..."
Write-Host ""

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Error "[ERROR] Archivo .env no encontrado"
    Write-Warning "Por favor copia .env.example a .env y configura tus credenciales"
    exit 1
}

# Load environment variables
Write-Info "[INFO] Cargando configuracion..."
Get-Content .env | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]*)\s*=\s*(.*)$') {
        $name = $matches[1].Trim()
        $value = $matches[2].Trim()
        [Environment]::SetEnvironmentVariable($name, $value, "Process")
    }
}

$DB_HOST = $env:DB_HOST
$DB_PORT = $env:DB_PORT
$DB_NAME = $env:DB_NAME
$DB_USER = $env:DB_USER
$DB_PASSWORD = $env:DB_PASSWORD

if (-not $DB_HOST -or -not $DB_PORT -or -not $DB_NAME -or -not $DB_USER) {
    Write-Error "[ERROR] Variables de entorno no configuradas"
    exit 1
}

Write-Success "[OK] Configuracion cargada"
Write-Host ""

# Set password
$env:PGPASSWORD = $DB_PASSWORD

# Terminate connections
Write-Info "[INFO] Cerrando conexiones existentes..."
$terminateSQL = @"
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = '$DB_NAME'
  AND pid <> pg_backend_pid();
"@

& psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c $terminateSQL 2>&1 | Out-Null
Write-Success "[OK] Conexiones cerradas"
Write-Host ""

# Drop database
Write-Info "[INFO] Eliminando base de datos '$DB_NAME'..."
$dropResult = & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME;" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Error "[ERROR] Error al eliminar la base de datos"
    Write-Host $dropResult
    exit 1
}
Write-Success "[OK] Base de datos eliminada"
Write-Host ""

# Recreate database
Write-Info "[INFO] Recreando base de datos '$DB_NAME'..."
$createResult = & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME;" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Error "[ERROR] Error al crear la base de datos"
    Write-Host $createResult
    exit 1
}
Write-Success "[OK] Base de datos creada"
Write-Host ""

Write-Success "================================================"
Write-Success "  [OK] Reset completado exitosamente"
Write-Success "================================================"
Write-Host ""
Write-Info "Proximos pasos:"
Write-Host "  1. Ejecuta las migraciones: .\scripts\db-setup.ps1"
Write-Host "  2. O con datos de prueba: .\scripts\db-setup.ps1 -Seed"
Write-Host ""
