#!/bin/bash

# Database Setup Script for EasyFactu
# Creates database, runs migrations, and seeds test data

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== EasyFactu Database Setup ===${NC}"

# Load environment variables
if [ -f .env ]; then
    echo -e "${GREEN}Loading environment variables from .env${NC}"
    export $(cat .env | grep -v '^#' | xargs)
else
    echo -e "${YELLOW}No .env file found, using defaults${NC}"
    DB_HOST=${DB_HOST:-localhost}
    DB_PORT=${DB_PORT:-5432}
    DB_NAME=${DB_NAME:-easyfactu}
    DB_USER=${DB_USER:-postgres}
fi

echo "Database: $DB_NAME"
echo "Host: $DB_HOST:$DB_PORT"
echo "User: $DB_USER"
echo ""

# Check if PostgreSQL is available
if ! command -v psql &> /dev/null; then
    echo -e "${RED}Error: psql command not found. Please install PostgreSQL client.${NC}"
    exit 1
fi

# Test connection
echo -e "${GREEN}Testing database connection...${NC}"
if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c '\q' 2>/dev/null; then
    echo -e "${GREEN}✓ Connection successful${NC}"
else
    echo -e "${RED}✗ Could not connect to PostgreSQL${NC}"
    echo "Please check your connection settings and ensure PostgreSQL is running"
    exit 1
fi

# Create database if it doesn't exist
echo -e "${GREEN}Creating database if not exists...${NC}"
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || \
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME"

echo -e "${GREEN}✓ Database ready${NC}"

# Run migrations
echo -e "${GREEN}Running migrations...${NC}"
cd ../..
for migration in migrations/*.sql; do
    if [ -f "$migration" ]; then
        echo "  - Running $(basename $migration)..."
        PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$migration" 2>&1 | grep -v "NOTICE" | grep -v "already exists" || true
    fi
done
echo -e "${GREEN}✓ Migrations complete${NC}"

# Seed test data if requested
if [ "$1" = "--seed" ] || [ "$1" = "-s" ]; then
    echo -e "${GREEN}Seeding test data...${NC}"
    if [ -f "scaffold/backend/scripts/seed-data.sql" ]; then
        PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f scaffold/backend/scripts/seed-data.sql
        echo -e "${GREEN}✓ Test data seeded${NC}"
    else
        echo -e "${YELLOW}No seed data file found${NC}"
    fi
fi

echo ""
echo -e "${GREEN}=== Setup Complete! ===${NC}"
echo ""
echo "You can now:"
echo "  1. Start the API: cd scaffold/backend && npm run dev"
echo "  2. Test the connection: npm run test:db"
echo "  3. Reset the database: ./scripts/db-reset.sh"
echo ""
