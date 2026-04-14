#!/bin/sh
set -e

SERVICE=$1

if [ "$SERVICE" = "backend" ]; then
    echo "=== Backend: Running Prisma migrate deploy ==="
    cd /app/apps/backend
    npx prisma migrate deploy

    echo "=== Backend: Starting NestJS ==="
    exec node dist/main.js

elif [ "$SERVICE" = "frontend" ]; then
    echo "=== Frontend: Starting Next.js ==="
    cd /app/apps/frontend
    exec npm run start

else
    echo "=== Unknown service: $SERVICE ==="
    exit 1
fi
