# ============================================
# Medical ChatBot Service - Python Flask + LangChain
# RAG-based Medical Assistant using Pinecone & Groq
# ============================================

FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies (no heavy ML libs, no local inference)
RUN pip install --no-cache-dir --timeout=300 --retries=5 -r requirements.txt

# Copy application code
COPY . .

# Install the local package
RUN pip install --no-cache-dir -e .

# Fix Windows line endings and make entrypoint executable
RUN sed -i 's/\r$//' entrypoint.sh && chmod +x entrypoint.sh

# Expose port
EXPOSE 9090

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV FLASK_ENV=production

# Run entrypoint script (indexes documents, then starts Flask)
ENTRYPOINT ["./entrypoint.sh"]
