# If you see "bad interpreter" or CRLF errors on Windows, run first: dos2unix scripts/*.sh
# Or: pnpm fix-scripts

#!/bin/bash
# Radar Installation Script
# Requires Docker to be installed and running

echo "🔍 Installing Radar by Auditware..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker."
    exit 1
fi

# Install Radar
curl -L https://raw.githubusercontent.com/auditware/radar/main/install-radar.sh | bash

echo "✅ Radar installed successfully!"
echo ""
echo "⚠️  IMPORTANT: Restart your terminal or run:"
echo "   source ~/.bashrc"
echo ""
echo "Then run: pnpm security:analyze"
