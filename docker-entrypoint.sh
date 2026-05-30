#!/bin/sh

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL environment variable is not set"
  exit 1
fi

# Apply database migrations
echo "Running Prisma migrations..."

npx prisma migrate deploy

# Check if migrations succeeded
if [ $? -ne 0 ]; then
  echo "Error: Prisma migrations failed"
  exit 1
fi

echo "Migrations completed successfully"

# Start the application
echo "Starting application..."
exec "$@"