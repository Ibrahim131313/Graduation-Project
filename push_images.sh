#!/bin/bash

# ==========================================
# 🛑 إعدادات الحساب والمفاتيح 🛑
# ==========================================

# 1. اسم المستخدم الصحيح (من الصورة التي أرسلتها)
DOCKER_USER="monabawi" 

VERSION="v1.0.1"

echo "🚀 Starting deployment process for user: $DOCKER_USER..."

# --- 1. Auth Service ---
echo "📦 Building Auth Service..."
# نستخدم الاسم الكامل hospital-auth-service ليطابق نظام التسمية عندك
docker build -t $DOCKER_USER/hospital-auth-service:$VERSION ./services/auth-service
echo "⬆️ Pushing Auth Service..."
docker push $DOCKER_USER/hospital-auth-service:$VERSION

# --- 2. Core Service ---
echo "📦 Building Core Service..."
docker build -t $DOCKER_USER/hospital-core-service:$VERSION ./services/core-service
echo "⬆️ Pushing Core Service..."
docker push $DOCKER_USER/hospital-core-service:$VERSION

# --- 3. IoT Service ---
echo "📦 Building IoT Service..."
docker build -t $DOCKER_USER/hospital-iot-service:$VERSION ./services/iot-service
echo "⬆️ Pushing IoT Service..."
docker push $DOCKER_USER/hospital-iot-service:$VERSION

# --- 4. Chat Service ---
echo "📦 Building Chat Service..."
docker build -t $DOCKER_USER/hospital-chat-service:$VERSION ./services/chat-service
echo "⬆️ Pushing Chat Service..."
docker push $DOCKER_USER/hospital-chat-service:$VERSION

# --- 5. Frontend (React) ---
echo "📦 Building Frontend..."
docker build -t $DOCKER_USER/hospital-frontend:$VERSION -f ./frontend/Dockerfile.microservices ./frontend
echo "⬆️ Pushing Frontend..."
docker push $DOCKER_USER/hospital-frontend:$VERSION

# --- 6. Medical ChatBot Service (Python/LangChain) ---
echo "📦 Building Medical ChatBot..."
docker build -t $DOCKER_USER/hospital-medical-chatbot:$VERSION ./Medical-ChatBot-main
echo "⬆️ Pushing Medical ChatBot..."
docker push $DOCKER_USER/hospital-medical-chatbot:$VERSION

# --- 7. Nginx Gateway ---
echo "📦 Building Gateway..."
docker build -t $DOCKER_USER/hospital-gateway:$VERSION ./nginx
echo "⬆️ Pushing Gateway..."
docker push $DOCKER_USER/hospital-gateway:$VERSION

echo "✅ DONE! All images are successfully pushed to Docker Hub account: $DOCKER_USER"