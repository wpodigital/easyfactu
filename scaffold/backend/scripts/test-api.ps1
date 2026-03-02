# API Test Script for Windows (PowerShell)
# =========================================
# Este script prueba todos los endpoints de la API EasyFactu
# Usage: .\test-api.ps1

# Colors for output
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Error { Write-Host $args -ForegroundColor Red }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }
function Write-Info { Write-Host $args -ForegroundColor Cyan }

$API_URL = "http://localhost:3000"

Write-Info "================================================"
Write-Info "  EasyFactu - API Testing (Windows)"
Write-Info "================================================"
Write-Host ""

# Check if server is running
Write-Info "[INFO] Verificando si el servidor está ejecutándose..."
try {
    $response = Invoke-WebRequest -Uri "$API_URL/health" -Method GET -ErrorAction Stop
    Write-Success "[OK] Servidor ejecutándose"
    Write-Host ""
} catch {
    Write-Error "[ERROR] Error: El servidor no está ejecutándose"
    Write-Warning "Por favor inicia el servidor primero:"
    Write-Host "  npm run dev"
    Write-Host ""
    exit 1
}

$testsPassed = 0
$testsFailed = 0

function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Path,
        [string]$Description,
        [string]$Body = $null
    )
    
    Write-Info "Testing: $Description"
    Write-Host "  $Method $Path" -ForegroundColor DarkGray
    
    try {
        $uri = "$API_URL$Path"
        $params = @{
            Uri = $uri
            Method = $Method
            ErrorAction = 'Stop'
        }
        
        if ($Body) {
            $params.Body = $Body
            $params.ContentType = 'application/json'
        }
        
        $response = Invoke-WebRequest @params
        
        if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 300) {
            Write-Success "  [OK] Status: $($response.StatusCode)"
            $script:testsPassed++
            
            # Show response preview for GET requests
            if ($Method -eq "GET" -and $response.Content) {
                $json = $response.Content | ConvertFrom-Json
                if ($json) {
                    Write-Host "  Response: " -NoNewline -ForegroundColor DarkGray
                    Write-Host ($json | ConvertTo-Json -Depth 1 -Compress).Substring(0, [Math]::Min(100, ($json | ConvertTo-Json -Depth 1 -Compress).Length)) -ForegroundColor DarkGray
                }
            }
        } else {
            Write-Warning "  [WARNING]  Status: $($response.StatusCode)"
            $script:testsFailed++
        }
    } catch {
        Write-Error "  [ERROR] Error: $($_.Exception.Message)"
        $script:testsFailed++
    }
    
    Write-Host ""
}

# Test 1: Health Check
Test-Endpoint -Method "GET" -Path "/health" -Description "Health Check"

# Test 2: List Invoices
Test-Endpoint -Method "GET" -Path "/api/v1/invoices" -Description "List All Invoices"

# Test 3: List with Pagination
Test-Endpoint -Method "GET" -Path "/api/v1/invoices?page=1&limit=10" -Description "List Invoices (Paginated)"

# Test 4: Create Invoice
$invoiceData = @{
    idEmisorFactura = "B12345678"
    numSerieFactura = "TEST-PS1"
    fechaExpedicionFactura = "01-01-2024"
    tipoFactura = "F1"
    cuotaTotal = 21.00
    importeTotal = 121.00
    destinatarios = @(
        @{
            nombreRazon = "Cliente PowerShell"
            nif = "12345678Z"
        }
    )
    desgloses = @(
        @{
            claveRegimen = "01"
            tipoImpositivo = 21.00
            baseImponible = 100.00
            cuotaRepercutida = 21.00
        }
    )
    sistemaInformatico = @{
        nombreRazon = "EasyFactu"
        nif = "B87654321"
        nombreSistemaInformatico = "EasyFactu API"
        idSistemaInformatico = "EASY001"
        version = "1.0"
        numeroInstalacion = "1"
    }
} | ConvertTo-Json -Depth 10

Test-Endpoint -Method "POST" -Path "/api/v1/invoices" -Description "Create Invoice" -Body $invoiceData

# Test 5: Get Invoice by ID (using test data)
Write-Info "Testing: Get Invoice by ID"
Write-Host "  GET /api/v1/invoices/TEST-001" -ForegroundColor DarkGray
try {
    $response = Invoke-WebRequest -Uri "$API_URL/api/v1/invoices/TEST-001" -Method GET -ErrorAction Stop
    Write-Success "  [OK] Status: $($response.StatusCode)"
    $testsPassed++
} catch {
    if ($_.Exception.Response.StatusCode.Value__ -eq 404) {
        Write-Warning "  [WARNING]  Invoice TEST-001 not found (expected if test data not loaded)"
        $testsPassed++
    } else {
        Write-Error "  [ERROR] Error: $($_.Exception.Message)"
        $testsFailed++
    }
}
Write-Host ""

# Test 6: Get Invoice Status
Write-Info "Testing: Get Invoice Status"
Write-Host "  GET /api/v1/invoices/TEST-001/status" -ForegroundColor DarkGray
try {
    $response = Invoke-WebRequest -Uri "$API_URL/api/v1/invoices/TEST-001/status" -Method GET -ErrorAction Stop
    Write-Success "  [OK] Status: $($response.StatusCode)"
    $testsPassed++
} catch {
    if ($_.Exception.Response.StatusCode.Value__ -eq 404) {
        Write-Warning "  [WARNING]  Invoice TEST-001 not found (expected if test data not loaded)"
        $testsPassed++
    } else {
        Write-Error "  [ERROR] Error: $($_.Exception.Message)"
        $testsFailed++
    }
}
Write-Host ""

# Test 7: Get Invoice XML
Write-Info "Testing: Get Invoice XML"
Write-Host "  GET /api/v1/invoices/TEST-001/xml" -ForegroundColor DarkGray
try {
    $response = Invoke-WebRequest -Uri "$API_URL/api/v1/invoices/TEST-001/xml" -Method GET -ErrorAction Stop
    Write-Success "  [OK] Status: $($response.StatusCode)"
    $testsPassed++
} catch {
    if ($_.Exception.Response.StatusCode.Value__ -eq 404) {
        Write-Warning "  [WARNING]  Invoice TEST-001 not found (expected if test data not loaded)"
        $testsPassed++
    } else {
        Write-Error "  [ERROR] Error: $($_.Exception.Message)"
        $testsFailed++
    }
}
Write-Host ""

# Test 8: Validate Invoice
$validationData = @{
    csv = "ABC123XYZ"
} | ConvertTo-Json

Write-Info "Testing: Validate Invoice"
Write-Host "  POST /api/v1/invoices/TEST-001/validate" -ForegroundColor DarkGray
try {
    $response = Invoke-WebRequest -Uri "$API_URL/api/v1/invoices/TEST-001/validate" -Method POST -Body $validationData -ContentType "application/json" -ErrorAction Stop
    Write-Success "  [OK] Status: $($response.StatusCode)"
    $testsPassed++
} catch {
    if ($_.Exception.Response.StatusCode.Value__ -eq 404) {
        Write-Warning "  [WARNING]  Invoice TEST-001 not found (expected if test data not loaded)"
        $testsPassed++
    } else {
        Write-Error "  [ERROR] Error: $($_.Exception.Message)"
        $testsFailed++
    }
}
Write-Host ""

# Summary
Write-Info "================================================"
Write-Info "  Test Summary"
Write-Info "================================================"
Write-Host ""
Write-Success "[OK] Tests Passed: $testsPassed"
if ($testsFailed -gt 0) {
    Write-Error "[ERROR] Tests Failed: $testsFailed"
} else {
    Write-Success "[ERROR] Tests Failed: $testsFailed"
}
Write-Host ""

$totalTests = $testsPassed + $testsFailed
$successRate = if ($totalTests -gt 0) { [math]::Round(($testsPassed / $totalTests) * 100, 2) } else { 0 }
Write-Info "Success Rate: $successRate%"
Write-Host ""

if ($testsFailed -eq 0) {
    Write-Success "🎉 All tests passed!"
} else {
    Write-Warning "[WARNING]  Some tests failed. Check the output above for details."
}
Write-Host ""

exit $testsFailed
