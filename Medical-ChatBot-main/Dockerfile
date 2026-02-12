# ============================================
# Medical ChatBot Service - Python Flask + LangChain
# RAG-based Medical Assistant using Pinecone & Groq
# ============================================

FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Install the local package
RUN pip install -e .

# Make entrypoint script executable
RUN chmod +x entrypoint.sh

# Expose port
EXPOSE 9090

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV FLASK_ENV=production

# Run entrypoint script (indexes documents, then starts Flask)
ENTRYPOINT ["./entrypoint.sh"]
