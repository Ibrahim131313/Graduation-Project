#!/bin/bash
set -e

TAG=${IMAGE_TAG:-latest}
NAMESPACE="hospital-ns"

echo "🔄 Updating App Images inside YAML files to Tag: $TAG"
# شيلنا k8s/ من أسماء الملفات لأننا شغالين من جوه الفولدر نفسه
sed -i "s|ahmedkabil/hospital-auth-service:latest|ebrahimmohammed/hospital-auth-service:$TAG|g" auth-service.yml
sed -i "s|ahmedkabil/hospital-core-service:latest|ebrahimmohammed/hospital-core-service:$TAG|g" core-service.yml
sed -i "s|ahmedkabil/hospital-iot-service:latest|ebrahimmohammed/hospital-iot-service:$TAG|g" iot-service.yml
sed -i "s|ahmedkabil/hospital-chat-service:latest|ebrahimmohammed/hospital-chat-service:$TAG|g" chat-service.yml
sed -i "s|ahmedkabil/hospital-medical-chatbot:latest|ebrahimmohammed/hospital-medical-chatbot:$TAG|g" chatbot.yml
sed -i "s|ahmedkabil/hospital-frontend:latest|ebrahimmohammed/hospital-frontend:$TAG|g" frontend.yml
sed -i "s|imagePullPolicy: IfNotPresent|imagePullPolicy: Always|g" *.yml

echo "📦 Applying Infrastructure, DBs and Apps (Rolling Update)..."
kubectl apply -f namespace.yml
kubectl apply -f config-map.yml

# شيلنا --ignore-not-found من هنا
kubectl apply -f storage-class.yml 
kubectl apply -f mongodb.yml
kubectl apply -f mongo-init-job.yml 
kubectl apply -f redis.yml

echo "🤖 Executing Rolling Update Deployment for Services..."
kubectl apply -f chatbot.yml
kubectl apply -f auth-service.yml
kubectl apply -f core-service.yml
kubectl apply -f metric-servo-service.yml
kubectl apply -f iot-service.yml
kubectl apply -f chat-service.yml
kubectl apply -f frontend.yml
kubectl apply -f ingress.yml

echo "⏳ Verifying rollout status for ALL services..."
kubectl rollout status -n $NAMESPACE deployment/chatbot-dep --timeout=90s
kubectl rollout status -n $NAMESPACE deployment/auth-service-dep --timeout=90s
kubectl rollout status -n $NAMESPACE deployment/core-service-dep --timeout=90s
kubectl rollout status -n $NAMESPACE deployment/metric-servo-service-dep --timeout=90s
kubectl rollout status -n $NAMESPACE deployment/iot-service-dep --timeout=90s
kubectl rollout status -n $NAMESPACE deployment/chat-service-dep --timeout=90s
kubectl rollout status -n $NAMESPACE deployment/frontend-dep --timeout=90s

echo "✅ All rollouts completed successfully!"
