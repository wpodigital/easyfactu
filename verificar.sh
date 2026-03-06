#!/bin/bash
# Script de Verificación del Proyecto EasyFactu
# Verifica que todos los componentes están en buen estado

echo "=========================================="
echo "VERIFICACIÓN DEL PROYECTO EASYFACTU"
echo "=========================================="
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contadores
TOTAL=0
PASSED=0
FAILED=0
WARNINGS=0

# Función para verificar
check() {
    TOTAL=$((TOTAL + 1))
    echo -n "[$TOTAL] $1... "
    if eval "$2" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PASS${NC}"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

check_warning() {
    TOTAL=$((TOTAL + 1))
    echo -n "[$TOTAL] $1... "
    if eval "$2" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ OK${NC}"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${YELLOW}⚠ WARNING${NC}"
        WARNINGS=$((WARNINGS + 1))
        return 1
    fi
}

echo "1. ESTRUCTURA DEL PROYECTO"
echo "----------------------------"
check "Directorio src existe" "test -d src"
check "Directorio migrations existe" "test -d migrations"
check "Directorio tests existe" "test -d tests"
check "Directorio scaffold/backend existe" "test -d scaffold/backend"
check "README.md existe" "test -f README.md"
check "SECURITY.md existe" "test -f SECURITY.md"
echo ""

echo "2. ARCHIVOS DEL MÓDULO VERIFACTU"
echo "--------------------------------"
check "types.ts existe" "test -f src/backend/verifactu/types.ts"
check "xmlBuilder.ts existe" "test -f src/backend/verifactu/xmlBuilder.ts"
check "hashCalculator.ts existe" "test -f src/backend/verifactu/hashCalculator.ts"
check "validator.ts existe" "test -f src/backend/verifactu/validator.ts"
check "utils.ts existe" "test -f src/backend/verifactu/utils.ts"
check "index.ts existe" "test -f src/backend/verifactu/index.ts"
echo ""

echo "3. MIGRACIONES DE BASE DE DATOS"
echo "--------------------------------"
check "Migración invoice_declarations existe" "test -f migrations/20251122_create_invoice_declarations_queries.sql"
check "Migración verifactu_tables existe" "test -f migrations/20260112_create_verifactu_tables.sql"
echo ""

echo "4. TESTS"
echo "--------"
check "Test xmlBuilder existe" "test -f tests/verifactu/xmlBuilder.test.ts"
check "Test hashCalculator existe" "test -f tests/verifactu/hashCalculator.test.ts"
check "Test aeat validator existe" "test -f tests/aeat/validator.test.ts"
echo ""

echo "5. BACKEND SCAFFOLD"
echo "-------------------"
check "package.json existe" "test -f scaffold/backend/package.json"
check "tsconfig.json existe" "test -f scaffold/backend/tsconfig.json"
check "src/index.ts existe" "test -f scaffold/backend/src/index.ts"
check "node_modules instalado" "test -d scaffold/backend/node_modules"
echo ""

echo "6. BUILD"
echo "--------"
cd scaffold/backend
if npm run build > /tmp/build.log 2>&1; then
    echo -e "[$((TOTAL + 1))] Build de TypeScript... ${GREEN}✓ PASS${NC}"
    TOTAL=$((TOTAL + 1))
    PASSED=$((PASSED + 1))
else
    echo -e "[$((TOTAL + 1))] Build de TypeScript... ${RED}✗ FAIL${NC}"
    TOTAL=$((TOTAL + 1))
    FAILED=$((FAILED + 1))
    echo "Ver /tmp/build.log para detalles"
fi

check "Directorio dist generado" "test -d dist"
cd ../..
echo ""

echo "7. SEGURIDAD"
echo "------------"
cd scaffold/backend
if npm audit --production 2>&1 | grep -q "found 0 vulnerabilities"; then
    echo -e "[$((TOTAL + 1))] Audit de dependencias producción... ${GREEN}✓ OK${NC}"
    TOTAL=$((TOTAL + 1))
    PASSED=$((PASSED + 1))
else
    echo -e "[$((TOTAL + 1))] Audit de dependencias producción... ${YELLOW}⚠ VULNERABILIDADES ENCONTRADAS${NC}"
    TOTAL=$((TOTAL + 1))
    WARNINGS=$((WARNINGS + 1))
fi
cd ../..
echo ""

echo "8. DOCUMENTACIÓN"
echo "----------------"
check "README.md completo" "test $(wc -l < README.md) -gt 100"
check "SECURITY.md completo" "test $(wc -l < SECURITY.md) -gt 50"
check "IMPLEMENTATION_SUMMARY.md existe" "test -f IMPLEMENTATION_SUMMARY.md"
check_warning "ESTADO_PROYECTO.md existe" "test -f ESTADO_PROYECTO.md"
echo ""

echo "=========================================="
echo "RESUMEN"
echo "=========================================="
echo -e "Total de verificaciones: $TOTAL"
echo -e "${GREEN}Pasadas: $PASSED${NC}"
echo -e "${RED}Falladas: $FAILED${NC}"
echo -e "${YELLOW}Advertencias: $WARNINGS${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ PROYECTO EN BUEN ESTADO${NC}"
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠ Hay algunas advertencias que revisar${NC}"
    fi
    exit 0
else
    echo -e "${RED}✗ PROYECTO TIENE PROBLEMAS${NC}"
    echo "Revisa los errores anteriores"
    exit 1
fi
