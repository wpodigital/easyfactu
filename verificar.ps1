# System Verification Script for Windows (PowerShell)
# ====================================================
# Este script verifica que todo el sistema EasyFactu esté correctamente configurado
# Usage: .\verificar.ps1

# Colors for output
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Error { Write-Host $args -ForegroundColor Red }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }
function Write-Info { Write-Host $args -ForegroundColor Cyan }

$checksTotal = 0
$checksPassed = 0
$checksFailed = 0
$checksWarning = 0

function Check-Item {
    param(
        [string]$Description,
        [scriptblock]$Test,
        [string]$ErrorMessage = "",
        [switch]$Warning = $false
    )
    
    $script:checksTotal++
    Write-Host ""
    Write-Info "[$script:checksTotal] $Description"
    
    try {
        $result = & $Test
        if ($result) {
            Write-Success "  [OK] OK"
            $script:checksPassed++
            return $true
        } else {
            if ($Warning) {
                Write-Warning "  [WARNING]  Warning"
                $script:checksWarning++
            } else {
                Write-Error "  [ERROR] Failed"
                $script:checksFailed++
            }
            if ($ErrorMessage) {
                Write-Host "    $ErrorMessage" -ForegroundColor DarkGray
            }
            return $false
        }
    } catch {
        if ($Warning) {
            Write-Warning "  [WARNING]  Warning: $($_.Exception.Message)"
            $script:checksWarning++
        } else {
            Write-Error "  [ERROR] Error: $($_.Exception.Message)"
            $script:checksFailed++
        }
        if ($ErrorMessage) {
            Write-Host "    $ErrorMessage" -ForegroundColor DarkGray
        }
        return $false
    }
}

Write-Info "================================================"
Write-Info "  EasyFactu - System Verification (Windows)"
Write-Info "================================================"

# 1. Check Git
Check-Item -Description "Git instalado" -Test {
    $null -ne (Get-Command git -ErrorAction SilentlyContinue)
} -ErrorMessage "Instala Git desde: https://git-scm.com/download/win"

# 2. Check Node.js
Check-Item -Description "Node.js instalado" -Test {
    $null -ne (Get-Command node -ErrorAction SilentlyContinue)
} -ErrorMessage "Instala Node.js desde: https://nodejs.org/"

# 3. Check Node version
Check-Item -Description "Node.js version >= 16" -Test {
    $nodeVersion = node --version
    if ($nodeVersion -match 'v(\d+)\.') {
        [int]$matches[1] -ge 16
    } else {
        $false
    }
} -ErrorMessage "Se requiere Node.js 16 o superior"

# 4. Check npm
Check-Item -Description "npm instalado" -Test {
    $null -ne (Get-Command npm -ErrorAction SilentlyContinue)
}

# 5. Check PostgreSQL
Check-Item -Description "PostgreSQL instalado" -Test {
    $null -ne (Get-Command psql -ErrorAction SilentlyContinue)
} -ErrorMessage "Instala PostgreSQL desde: https://www.postgresql.org/download/windows/"

# 6. Check PostgreSQL version
Check-Item -Description "PostgreSQL version >= 12" -Test {
    $psqlVersion = psql --version
    if ($psqlVersion -match '(\d+)\.') {
        [int]$matches[1] -ge 12
    } else {
        $false
    }
} -ErrorMessage "Se requiere PostgreSQL 12 o superior" -Warning

# 7. Check project files exist
Check-Item -Description "Estructura del proyecto" -Test {
    (Test-Path "scaffold") -and (Test-Path "src") -and (Test-Path "migrations")
}

# 8. Check package.json exists
Check-Item -Description "scaffold/backend/package.json existe" -Test {
    Test-Path "scaffold/backend/package.json"
}

# 9. Check node_modules installed
Check-Item -Description "Dependencias instaladas (node_modules)" -Test {
    Test-Path "scaffold/backend/node_modules"
} -ErrorMessage "Ejecuta: cd scaffold\backend && npm install" -Warning

# 10. Check .env file
Check-Item -Description ".env configurado" -Test {
    Test-Path "scaffold/backend/.env"
} -ErrorMessage "Copia .env.example a .env y configura tus credenciales" -Warning

# 11. Check migrations directory
Check-Item -Description "Archivos de migración presentes" -Test {
    $migrations = Get-ChildItem -Path "migrations" -Filter "*.sql" -ErrorAction SilentlyContinue
    $migrations.Count -gt 0
}

# 12. Check VeriFactu module
Check-Item -Description "Módulo VeriFactu existe" -Test {
    Test-Path "src/backend/verifactu"
}

# 13. Check TypeScript files
Check-Item -Description "Archivos TypeScript del módulo VeriFactu" -Test {
    (Test-Path "src/backend/verifactu/types.ts") -and
    (Test-Path "src/backend/verifactu/xmlBuilder.ts") -and
    (Test-Path "src/backend/verifactu/hashCalculator.ts")
}

# 14. Check API implementation
Check-Item -Description "API implementation exists" -Test {
    Test-Path "scaffold/backend/src/index.ts"
}

# 15. Check database config
Check-Item -Description "Database config exists" -Test {
    Test-Path "scaffold/backend/src/config/database.ts"
}

# 16. Check repositories
Check-Item -Description "Repositories implementation exists" -Test {
    Test-Path "scaffold/backend/src/repositories/facturas.repository.ts"
}

# 17. Check scripts
Check-Item -Description "PowerShell scripts exist" -Test {
    (Test-Path "scaffold/backend/scripts/db-setup.ps1") -and
    (Test-Path "scaffold/backend/scripts/db-reset.ps1") -and
    (Test-Path "scaffold/backend/scripts/test-api.ps1")
}

# 18. Check documentation
Check-Item -Description "Documentation files" -Test {
    (Test-Path "README.md") -and
    (Test-Path "QUICK_START.md") -and
    (Test-Path "TESTING_GUIDE.md") -and
    (Test-Path "WINDOWS_SETUP.md")
}

# 19. Check TypeScript compilation (if node_modules exists)
if (Test-Path "scaffold/backend/node_modules") {
    Check-Item -Description "TypeScript compilation" -Test {
        Push-Location "scaffold/backend"
        $result = & npm run build 2>&1
        Pop-Location
        $LASTEXITCODE -eq 0
    } -ErrorMessage "Errores de compilación TypeScript" -Warning
}

# 20. Check database connection (if .env exists)
if (Test-Path "scaffold/backend/.env") {
    Check-Item -Description "Database connection" -Test {
        # Load .env
        Get-Content "scaffold/backend/.env" | ForEach-Object {
            if ($_ -match '^\s*([^#][^=]*)\s*=\s*(.*)$') {
                $name = $matches[1].Trim()
                $value = $matches[2].Trim()
                [Environment]::SetEnvironmentVariable($name, $value, "Process")
            }
        }
        
        $env:PGPASSWORD = $env:DB_PASSWORD
        $result = & psql -h $env:DB_HOST -p $env:DB_PORT -U $env:DB_USER -d postgres -c "SELECT 1;" 2>&1
        $LASTEXITCODE -eq 0
    } -ErrorMessage "No se puede conectar a PostgreSQL. Verifica credenciales en .env" -Warning
}

# 21. Check database exists (if connection works)
if ($checksPassed -gt 15 -and (Test-Path "scaffold/backend/.env")) {
    Check-Item -Description "Database '$env:DB_NAME' exists" -Test {
        Get-Content "scaffold/backend/.env" | ForEach-Object {
            if ($_ -match '^\s*([^#][^=]*)\s*=\s*(.*)$') {
                $name = $matches[1].Trim()
                $value = $matches[2].Trim()
                [Environment]::SetEnvironmentVariable($name, $value, "Process")
            }
        }
        
        $env:PGPASSWORD = $env:DB_PASSWORD
        $result = & psql -h $env:DB_HOST -p $env:DB_PORT -U $env:DB_USER -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$env:DB_NAME';" 2>&1
        $result -eq "1"
    } -ErrorMessage "Ejecuta: cd scaffold\backend && .\scripts\db-setup.ps1" -Warning
}

# 22. Check tables exist (if database exists)
if ($checksPassed -gt 16 -and (Test-Path "scaffold/backend/.env")) {
    Check-Item -Description "Database tables created" -Test {
        Get-Content "scaffold/backend/.env" | ForEach-Object {
            if ($_ -match '^\s*([^#][^=]*)\s*=\s*(.*)$') {
                $name = $matches[1].Trim()
                $value = $matches[2].Trim()
                [Environment]::SetEnvironmentVariable($name, $value, "Process")
            }
        }
        
        $env:PGPASSWORD = $env:DB_PASSWORD
        $result = & psql -h $env:DB_HOST -p $env:DB_PORT -U $env:DB_USER -d $env:DB_NAME -tAc "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';" 2>&1
        if ($LASTEXITCODE -eq 0 -and $result) {
            [int]$result -gt 0
        } else {
            $false
        }
    } -ErrorMessage "Ejecuta: cd scaffold\backend && .\scripts\db-setup.ps1" -Warning
}

# 23. Check test files
Check-Item -Description "Test files exist" -Test {
    (Test-Path "tests/verifactu/xmlBuilder.test.ts") -and
    (Test-Path "tests/verifactu/hashCalculator.test.ts")
}

# 24. Check Postman collection
Check-Item -Description "Postman collection exists" -Test {
    Test-Path "scaffold/backend/postman_collection.json"
}

# 25. Check seed data
Check-Item -Description "Seed data script exists" -Test {
    Test-Path "scaffold/backend/scripts/seed-data.sql"
}

# 26. Check security
Check-Item -Description "No vulnerabilities (npm audit)" -Test {
    if (Test-Path "scaffold/backend/node_modules") {
        Push-Location "scaffold/backend"
        $auditResult = & npm audit --json 2>&1 | ConvertFrom-Json
        Pop-Location
        $auditResult.metadata.vulnerabilities.total -eq 0
    } else {
        $true
    }
} -Warning

# 27. Check build output
Check-Item -Description "Build output exists" -Test {
    Test-Path "scaffold/backend/dist"
} -Warning

# 28. Check Windows-specific documentation
Check-Item -Description "Windows setup guide exists" -Test {
    Test-Path "WINDOWS_SETUP.md"
}

# Summary
Write-Host ""
Write-Info "================================================"
Write-Info "  Verification Summary"
Write-Info "================================================"
Write-Host ""

Write-Info "Total Checks: $checksTotal"
Write-Success "Passed: $checksPassed"
if ($checksFailed -gt 0) {
    Write-Error "Failed: $checksFailed"
} else {
    Write-Success "Failed: $checksFailed"
}
if ($checksWarning -gt 0) {
    Write-Warning "Warnings: $checksWarning"
}
Write-Host ""

$successRate = if ($checksTotal -gt 0) { [math]::Round(($checksPassed / $checksTotal) * 100, 2) } else { 0 }
Write-Info "Success Rate: $successRate%"
Write-Host ""

if ($checksFailed -eq 0 -and $checksWarning -eq 0) {
    Write-Success "🎉 ¡Sistema completamente verificado! Todo está en orden."
} elseif ($checksFailed -eq 0) {
    Write-Success "[OK] Sistema verificado con algunas advertencias"
    Write-Warning "Revisa las advertencias arriba para optimizar tu configuración"
} else {
    Write-Error "[ERROR] Algunos checks fallaron"
    Write-Warning "Por favor resuelve los errores arriba antes de continuar"
}

Write-Host ""
Write-Info "Próximos pasos:"
if ($checksFailed -gt 0) {
    Write-Host "  1. Resuelve los errores indicados arriba"
    Write-Host "  2. Ejecuta este script nuevamente: .\verificar.ps1"
} elseif ($checksWarning -gt 0) {
    Write-Host "  1. (Opcional) Resuelve las advertencias"
    Write-Host "  2. Lee WINDOWS_SETUP.md para más información"
} else {
    Write-Host "  1. Inicia el servidor: cd scaffold\backend && npm run dev"
    Write-Host "  2. Prueba la API: cd scaffold\backend && .\scripts\test-api.ps1"
}
Write-Host ""

exit $checksFailed
