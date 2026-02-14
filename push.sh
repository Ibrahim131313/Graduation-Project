#!/bin/bash

# ==========================================
# 🛑 إعدادات الحساب والإصدار 🛑
# ==========================================
DOCKER_USER="monabawi" 
VERSION="v3"
SERVICE_NAME="hospital-medical-chatbot"
CONTEXT_DIR="./Medical-ChatBot-main"

echo "🚀 Preparing to push $SERVICE_NAME version $VERSION..."

# 1. بناء الـ Image محلياً
# تأكد أنك تقف في المسار ~/Graduation-Project
echo "--------------------------------------"
echo "📦 Building $SERVICE_NAME..."
docker build -t $DOCKER_USER/$SERVICE_NAME:$VERSION $CONTEXT_DIR

# 2. الرفع إلى Docker Hub
echo "--------------------------------------"
echo "⬆️ Pushing to Docker Hub..."
docker push $DOCKER_USER/$SERVICE_NAME:$VERSION

echo "--------------------------------------"
echo "✅ Success! Image is now available as: $DOCKER_USER/$SERVICE_NAME:$VERSION"