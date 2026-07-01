#!/bin/bash
set -e

# استقبال التاج من جينكينز، لو مش مبعوت ياخد latest كاحتياطي
TAG=${IMAGE_TAG:-latest}
NAMESPACE="hospital-ns"

echo "🔄 Updating App Images inside YAML files to Tag: $TAG"
sed -i "s|ahmedkabil/hospital-auth-service:latest|ebrahimmohammed/hospital-auth-service:$TAG|g" k8s/auth-service.yml
sed -i "s|ahmedkabil/hospital-core-service:latest|ebrahimmohammed/hospital-core-service:$TAG|g" k8s/core-service.yml
sed -i "s|ahmedkabil/hospital-iot-service:latest|ebrahimmohammed/hospital-iot-service:$TAG|g" k8s/iot-service.yml
sed -i "s|ahmedkabil/hospital-chat-service:latest|ebrahimmohammed/hospital-chat-service:$TAG|g" k8s/chat-service.yml
sed -i "s|ahmedkabil/hospital-medical-chatbot:latest|ebrahimmohammed/hospital-medical-chatbot:$TAG|g" k8s/chatbot.yml
sed -i "s|ahmedkabil/hospital-frontend:latest|ebrahimmohammed/hospital-frontend:$TAG|g" k8s/frontend.yml
sed -i "s|imagePullPolicy: IfNotPresent|imagePullPolicy: Always|g" k8s/*.yml

echo "📦 Applying Infrastructure, DBs and Apps (Rolling Update)..."
kubectl apply -f k8s/namespace.yml
kubectl apply -f k8s/config-map.yml
kubectl apply -f k8s/storage-class.yml --ignore-not-found=true
kubectl apply -f k8s/mongodb.yml
kubectl apply -f k8s/mongo-init-job.yml --ignore-not-found=true
kubectl apply -f k8s/redis.yml

echo "🤖 Executing Rolling Update Deployment for Services..."
kubectl apply -f k8s/chatbot.yml
kubectl apply -f k8s/auth-service.yml
kubectl apply -f k8s/core-service.yml
kubectl apply -f k8s/metric-servo-service.yml
kubectl apply -f k8s/iot-service.yml
kubectl apply -f k8s/chat-service.yml
kubectl apply -f k8s/frontend.yml
kubectl apply -f k8s/ingress.yml

echo "⏳ Verifying rollout status for ALL services..."
# شيلنا الـ || true عشان جينكينز يفرمل ويديك أحمر فوراً لو خدمة واحدة وقعت
kubectl rollout status -n $NAMESPACE deployment/chatbot-dep --timeout=90s
kubectl rollout status -n $NAMESPACE deployment/auth-service-dep --timeout=90s
kubectl rollout status -n $NAMESPACE deployment/core-service-dep --timeout=90s
kubectl rollout status -n $NAMESPACE deployment/metric-servo-service-dep --timeout=90s
kubectl rollout status -n $NAMESPACE deployment/iot-service-dep --timeout=90s
kubectl rollout status -n $NAMESPACE deployment/chat-service-dep --timeout=90s
kubectl rollout status -n $NAMESPACE deployment/frontend-dep --timeout=90s

echo "✅ All rollouts completed successfully!"
