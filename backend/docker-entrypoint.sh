#!/bin/sh
set -e
echo "Running seed..."
node src/seed.js
echo "Starting server..."
exec node src/index.js
