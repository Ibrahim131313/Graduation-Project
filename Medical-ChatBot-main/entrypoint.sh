#!/bin/bash
set -e

echo "=========================================="
echo "Medical ChatBot Container Starting..."
echo "=========================================="

# Check if data directory has PDF files
if ls /app/data/*.pdf 1> /dev/null 2>&1; then
    echo "📄 Found PDF files in /app/data/"
    echo "🔄 Running document indexing to Pinecone..."
    python store_index.py
    echo "✅ Indexing complete!"
else
    echo "⚠️  No PDF files found in /app/data/ - skipping indexing"
    echo "   (The chatbot will use existing Pinecone index if available)"
fi

echo ""
echo "🚀 Starting Flask application on port 9090..."
echo "=========================================="

# Start the Flask application
exec python app.py
