#!/bin/bash

# EasyFactu API Test Examples
# Quick commands to test the API

BASE_URL="http://localhost:3000"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}=== EasyFactu API Test Examples ===${NC}"
echo ""

# Health Check
echo -e "${YELLOW}1. Health Check${NC}"
echo "curl $BASE_URL/health"
curl -s $BASE_URL/health | jq '.' || curl -s $BASE_URL/health
echo ""
echo ""

# Create Invoice
echo -e "${YELLOW}2. Create Invoice${NC}"
echo 'curl -X POST $BASE_URL/api/v1/invoices -H "Content-Type: application/json" -d ...'
curl -X POST $BASE_URL/api/v1/invoices \
  -H "Content-Type: application/json" \
  -d '{
    "idVersion": "1.0",
    "nombreRazonEmisor": "Test Company S.L.",
    "nifEmisor": "B99999999",
    "numSerieFactura": "API-TEST-001",
    "fechaExpedicionFactura": "2024-02-27",
    "tipoFactura": "F1",
    "cuotaTotal": 21.00,
    "importeTotal": 121.00,
    "descripcionOperacion": "API Test Invoice",
    "tipoDesglose": "S",
    "claveRegimen": "01",
    "tipoImpositivo": 21.00,
    "baseImponible": 100.00,
    "cuotaRepercutida": 21.00
  }' | jq '.' || echo "Error creating invoice"
echo ""
echo ""

# Get Invoice (assuming ID 1 exists)
echo -e "${YELLOW}3. Get Invoice by ID${NC}"
echo "curl $BASE_URL/api/v1/invoices/1"
curl -s $BASE_URL/api/v1/invoices/1 | jq '.' || curl -s $BASE_URL/api/v1/invoices/1
echo ""
echo ""

# List Invoices
echo -e "${YELLOW}4. List All Invoices${NC}"
echo "curl $BASE_URL/api/v1/invoices"
curl -s $BASE_URL/api/v1/invoices | jq '.' || curl -s $BASE_URL/api/v1/invoices
echo ""
echo ""

# Validate Invoice
echo -e "${YELLOW}5. Validate Invoice${NC}"
echo "curl -X POST $BASE_URL/api/v1/invoices/1/validate"
curl -s -X POST $BASE_URL/api/v1/invoices/1/validate | jq '.' || curl -s -X POST $BASE_URL/api/v1/invoices/1/validate
echo ""
echo ""

# Get Status
echo -e "${YELLOW}6. Get Invoice Status${NC}"
echo "curl $BASE_URL/api/v1/invoices/1/status"
curl -s $BASE_URL/api/v1/invoices/1/status | jq '.' || curl -s $BASE_URL/api/v1/invoices/1/status
echo ""
echo ""

# Get XML
echo -e "${YELLOW}7. Get Invoice XML${NC}"
echo "curl $BASE_URL/api/v1/invoices/1/xml"
curl -s $BASE_URL/api/v1/invoices/1/xml
echo ""
echo ""

echo -e "${GREEN}=== Tests Complete ===${NC}"
echo ""
echo "Note: Install 'jq' for prettier JSON output: sudo apt-get install jq"
echo ""
