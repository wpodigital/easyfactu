# Database Setup Script for Windows (PowerShell)
# ================================================
# Este script configura la base de datos PostgreSQL para EasyFactu
# Usage: .\db-setup.ps1 [-Seed]

param(
    [switch]$Seed = $false
)

# Colors for output
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Error { Write-Host $args -ForegroundColor Red }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }
function Write-Info { Write-Host $args -ForegroundColor Cyan }

Write-Info "================================================"
Write-Info "  EasyFactu - Database Setup (Windows)"
Write-Info "================================================"
Write-Host ""

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Error "❌ Error: Archivo .env no encontrado"
    Write-Warning "Por favor copia .env.example a .env y configura tus credenciales:"
    Write-Host "  copy .env.example .env"
    Write-Host "  notepad .env"
    exit 1
}

# Load environment variables from .env
Write-Info "📄 Cargando configuración desde .env..."
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
    Write-Error "❌ Error: Variables de entorno no configuradas correctamente"
    Write-Warning "Verifica que .env contenga: DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD"
    exit 1
}

Write-Success "✓ Configuración cargada"
Write-Host "  Host: $DB_HOST"
Write-Host "  Port: $DB_PORT"
Write-Host "  Database: $DB_NAME"
Write-Host "  User: $DB_USER"
Write-Host ""

# Check if PostgreSQL is installed
Write-Info "🔍 Verificando instalación de PostgreSQL..."
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psqlPath) {
    Write-Error "❌ Error: PostgreSQL no está instalado o no está en el PATH"
    Write-Warning "Por favor instala PostgreSQL desde: https://www.postgresql.org/download/windows/"
    exit 1
}
Write-Success "✓ PostgreSQL encontrado: $($psqlPath.Source)"
Write-Host ""

# Set PGPASSWORD environment variable
$env:PGPASSWORD = $DB_PASSWORD

# Test connection
Write-Info "🔌 Probando conexión a PostgreSQL..."
$testResult = & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "SELECT 1;" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Error "❌ Error: No se puede conectar a PostgreSQL"
    Write-Warning "Verifica:"
    Write-Host "  - PostgreSQL está ejecutándose"
    Write-Host "  - Las credenciales en .env son correctas"
    Write-Host "  - El usuario tiene permisos adecuados"
    exit 1
}
Write-Success "✓ Conexión exitosa"
Write-Host ""

# Check if database exists
Write-Info "🗄️  Verificando si la base de datos existe..."
$dbExists = & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME';" 2>&1

if ($dbExists -eq "1") {
    Write-Warning "⚠️  La base de datos '$DB_NAME' ya existe"
} else {
    Write-Info "📦 Creando base de datos '$DB_NAME'..."
    $createResult = & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME;" 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Error "❌ Error al crear la base de datos"
        Write-Host $createResult
        exit 1
    }
    Write-Success "✓ Base de datos creada"
}
Write-Host ""

# Run migrations
Write-Info "🔄 Ejecutando migraciones..."
$migrationPath = "..\..\migrations"

if (-not (Test-Path $migrationPath)) {
    Write-Error "❌ Error: Directorio de migraciones no encontrado: $migrationPath"
    exit 1
}

$migrations = Get-ChildItem -Path $migrationPath -Filter "*.sql" | Sort-Object Name

if ($migrations.Count -eq 0) {
    Write-Warning "⚠️  No se encontraron archivos de migración"
} else {
    foreach ($migration in $migrations) {
        Write-Info "  Ejecutando: $($migration.Name)..."
        $result = & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $migration.FullName 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Error "    ❌ Error en migración: $($migration.Name)"
            Write-Host $result
            exit 1
        }
        Write-Success "    ✓ Completada"
    }
    Write-Success "✓ Todas las migraciones ejecutadas exitosamente"
}
Write-Host ""

# Seed data if requested
if ($Seed) {
    Write-Info "🌱 Insertando datos de prueba..."
    $seedFile = ".\scripts\seed-data.sql"
    
    if (Test-Path $seedFile) {
        $result = & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $seedFile 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Warning "⚠️  Error al insertar datos de prueba (puede ser normal si ya existen)"
        } else {
            Write-Success "✓ Datos de prueba insertados"
            Write-Host ""
            Write-Info "📋 Datos de prueba disponibles:"
            Write-Host "  - 3 facturas de ejemplo (TEST-001, TEST-002, TEST-003)"
            Write-Host "  - 2 clientes de ejemplo"
            Write-Host "  - Desgloses de impuestos"
            Write-Host "  - Sistema informático configurado"
        }
    } else {
        Write-Warning "⚠️  Archivo de datos de prueba no encontrado: $seedFile"
    }
    Write-Host ""
}

# Verify tables
Write-Info "✅ Verificando tablas creadas..."
$tableCount = & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -tAc "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Success "✓ Tablas encontradas: $tableCount"
} else {
    Write-Warning "⚠️  No se pudo verificar las tablas"
}

Write-Host ""
Write-Success "================================================"
Write-Success "  ✓ Setup completado exitosamente"
Write-Success "================================================"
Write-Host ""
Write-Info "Próximos pasos:"
Write-Host "  1. Inicia el servidor: npm run dev"
Write-Host "  2. Prueba la API: .\scripts\test-api.ps1"
Write-Host "  3. Verifica el sistema: ..\..\verificar.ps1"
Write-Host ""
