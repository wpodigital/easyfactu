#!/bin/bash

# Database Reset Script for EasyFactu
# Drops and recreates the database with fresh migrations

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}=== EasyFactu Database Reset ===${NC}"
echo -e "${RED}WARNING: This will delete all data in the database!${NC}"
echo ""

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    DB_HOST=${DB_HOST:-localhost}
    DB_PORT=${DB_PORT:-5432}
    DB_NAME=${DB_NAME:-easyfactu}
    DB_USER=${DB_USER:-postgres}
fi

# Confirm
read -p "Are you sure you want to reset database '$DB_NAME'? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Reset cancelled"
    exit 0
fi

echo -e "${GREEN}Dropping database...${NC}"
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME"

echo -e "${GREEN}Recreating database...${NC}"
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME"

echo -e "${GREEN}Running migrations...${NC}"
cd ../..
for migration in migrations/*.sql; do
    if [ -f "$migration" ]; then
        echo "  - Running $(basename $migration)..."
        PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$migration" 2>&1 | grep -v "NOTICE" || true
    fi
done

echo ""
echo -e "${GREEN}=== Reset Complete! ===${NC}"
echo "Database '$DB_NAME' has been reset to a clean state"
echo ""
