#!/bin/bash

# ==========================================
# 🛑 إعدادات الحساب والإصدار 🛑
# ==========================================
DOCKER_USER="monabawi" 
VERSION="v3"

echo "🚀 Starting deployment process for user: $DOCKER_USER (Version: $VERSION)..."

# ==========================================
# 1. API Gateway (Nginx)
# Local Image: graduation-project-nginx
# ==========================================
echo "--------------------------------------"
echo "📦 Building Gateway (Nginx)..."
docker build -t $DOCKER_USER/hospital-gateway:$VERSION ./nginx
echo "⬆️ Pushing Gateway..."
docker push $DOCKER_USER/hospital-gateway:$VERSION


# ==========================================
# 2. Frontend (React)
# Local Image: graduation-project-frontend
# ==========================================
echo "--------------------------------------"
echo "📦 Building Frontend..."
# تأكدنا من استخدام Dockerfile.microservices كما هو في جهازك
docker build -t $DOCKER_USER/hospital-frontend:$VERSION -f ./frontend/Dockerfile.microservices ./frontend
echo "⬆️ Pushing Frontend..."
docker push $DOCKER_USER/hospital-frontend:$VERSION


# ==========================================
# 3. Medical ChatBot
# Local Image: graduation-project-medical-chatbot
# ==========================================
echo "--------------------------------------"
echo "📦 Building Medical ChatBot..."
docker build -t $DOCKER_USER/hospital-medical-chatbot:$VERSION ./Medical-ChatBot-main
echo "⬆️ Pushing Medical ChatBot..."
docker push $DOCKER_USER/hospital-medical-chatbot:$VERSION


# ==========================================
# 4. Auth Service
# Local Image: graduation-project-auth-service
# ==========================================
echo "--------------------------------------"
echo "📦 Building Auth Service..."
docker build -t $DOCKER_USER/hospital-auth-service:$VERSION ./services/auth-service
echo "⬆️ Pushing Auth Service..."
docker push $DOCKER_USER/hospital-auth-service:$VERSION


# ==========================================
# 5. Core Service
# Local Image: graduation-project-core-service
# ==========================================
echo "--------------------------------------"
echo "📦 Building Core Service..."
docker build -t $DOCKER_USER/hospital-core-service:$VERSION ./services/core-service
echo "⬆️ Pushing Core Service..."
docker push $DOCKER_USER/hospital-core-service:$VERSION


# ==========================================
# 6. IoT Service
# Local Image: graduation-project-iot-service
# ==========================================
echo "--------------------------------------"
echo "📦 Building IoT Service..."
docker build -t $DOCKER_USER/hospital-iot-service:$VERSION ./services/iot-service
echo "⬆️ Pushing IoT Service..."
docker push $DOCKER_USER/hospital-iot-service:$VERSION


# ==========================================
# 7. Chat Service
# Local Image: graduation-project-chat-service
# ==========================================
echo "--------------------------------------"
echo "📦 Building Chat Service..."
docker build -t $DOCKER_USER/hospital-chat-service:$VERSION ./services/chat-service
echo "⬆️ Pushing Chat Service..."
docker push $DOCKER_USER/hospital-chat-service:$VERSION

echo "--------------------------------------"
echo "✅ DONE! All customized images are pushed to Docker Hub as $VERSION"
echo "⚠️  Note: MongoDB was skipped as it is an official image."