# If you see "bad interpreter" or CRLF errors on Windows, run first: dos2unix scripts/*.sh
# Or: pnpm fix-scripts

#!/bin/bash
# Radar Security Analysis Script

echo "🔍 Running Radar security analysis..."
echo ""

# Check if radar is installed
if ! command -v radar &> /dev/null; then
    echo "❌ Radar is not installed. Run: pnpm security:install"
    exit 1
fi

# Run analysis
radar -p .

echo ""
echo "✅ Analysis complete!"
echo ""
echo "📄 Check output.json for detailed results."
