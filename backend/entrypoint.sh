#!/bin/sh
set -e

echo "=== nextSTEM Backend Starting ==="
echo "ENVIRONMENT=$ENVIRONMENT"
echo "PORT=${PORT:-8000}"

echo "Running Alembic migrations..."
alembic upgrade head || echo "WARNING: Alembic migration failed, continuing..."

echo "Starting uvicorn on port ${PORT:-8000}..."
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}" --log-level info